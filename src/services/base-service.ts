import {
  ServiceResponse,
  ServiceConfig,
  ServiceError,
  NetworkError,
  TimeoutError,
  RateLimitError,
  AuthenticationError,
  Cache,
  CacheEntry,
  PendingRequest,
  RequestOptions,
  HttpMethod,
  RetryConfig,
  RateLimitEntry,
  ServiceHealth,
  BaseService,
} from './types';

// Default configurations
const DEFAULT_CONFIG: ServiceConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 100,
  },
  rateLimit: {
    requests: 100,
    window: 900000, // 15 minutes
  },
};

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryableErrors: ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'RATE_LIMIT_ERROR', 'SERVER_ERROR'],
};

// In-memory cache implementation
class MemoryCache<T> implements Cache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private hits = 0;
  private misses = 0;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    entry.accessCount++;
    this.hits++;
    return entry.data;
  }

  set(key: string, data: T, ttl: number): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
      accessCount: 0,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  getStats(): { size: number; maxSize: number; hitRate: number } {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: total > 0 ? this.hits / total : 0,
    };
  }
}

// Base service class with common functionality
export abstract class BaseServiceClass implements BaseService {
  protected config: ServiceConfig;
  protected cache: Cache<unknown>;
  protected pendingRequests = new Map<string, PendingRequest>();
  protected rateLimitMap = new Map<string, RateLimitEntry>();
  protected requestCount = 0;
  protected errorCount = 0;
  protected totalResponseTime = 0;
  protected startTime = Date.now();

  constructor(config: Partial<ServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cache = new MemoryCache(this.config.cache?.maxSize || 100);
  }

  // Generate unique request ID
  protected generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate cache key
  protected generateCacheKey(endpoint: string, params: Record<string, unknown> = {}): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, unknown>);

    return `${endpoint}:${JSON.stringify(sortedParams)}`;
  }

  // Check rate limiting
  protected checkRateLimit(key: string): boolean {
    if (!this.config.rateLimit) return true;

    const now = Date.now();
    const entry = this.rateLimitMap.get(key);

    if (!entry) {
      this.rateLimitMap.set(key, {
        requests: 1,
        windowStart: now,
        windowSize: this.config.rateLimit.window,
      });
      return true;
    }

    // Reset window if expired
    if (now - entry.windowStart > entry.windowSize) {
      entry.requests = 1;
      entry.windowStart = now;
      return true;
    }

    // Check if under limit
    if (entry.requests < this.config.rateLimit.requests) {
      entry.requests++;
      return true;
    }

    return false;
  }

  // Request deduplication
  protected async dedupeRequest<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    // Check if request is already pending
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending.promise as Promise<T>;
    }

    // Create new pending request
    const promise = requestFn();
    const pendingRequest: PendingRequest = {
      promise,
      timestamp: Date.now(),
      resolve: () => {},
      reject: () => {},
    };

    this.pendingRequests.set(key, pendingRequest);

    try {
      const result = await promise;
      return result;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  // Enhanced fetch with timeout, retries, and error handling
  protected async makeRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ServiceResponse<T>> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    try {
      // Check cache first if GET request and caching enabled
      if (options.method === 'GET' && this.config.cache?.enabled) {
        const cacheKey = this.generateCacheKey(endpoint, options.params || {});
        const cachedData = this.cache.get(cacheKey) as T;

        if (cachedData) {
          return {
            success: true,
            data: cachedData,
            metadata: {
              timestamp: new Date(),
              requestId,
              duration: Date.now() - startTime,
              cached: true,
              cacheAge: Date.now() - (this.cache.get(`${cacheKey}_timestamp`) as number || startTime),
            },
          };
        }
      }

      // Check rate limiting
      const rateLimitKey = `${options.method || 'GET'}:${endpoint}`;
      if (!this.checkRateLimit(rateLimitKey)) {
        throw new RateLimitError('Rate limit exceeded');
      }

      // Build URL with query parameters
      const url = new URL(endpoint, this.config.baseUrl);
      if (options.params) {
        Object.entries(options.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        });
      }

      // Prepare request configuration
      const fetchOptions: RequestInit = {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
          ...options.headers,
        },
        signal: options.signal,
      };

      // Add body for non-GET requests
      if (options.body && options.method !== 'GET') {
        fetchOptions.body = JSON.stringify(options.body);
      }

      // Add timeout if configured
      let timeoutId: NodeJS.Timeout | undefined;
      if (this.config.timeout) {
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
        fetchOptions.signal = controller.signal;
      }

      // Execute request with retries
      const response = await this.executeWithRetry(async () => {
        const response = await fetch(url.toString(), fetchOptions);

        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        return response;
      });

      this.requestCount++;
      const responseTime = Date.now() - startTime;
      this.totalResponseTime += responseTime;

      // Handle HTTP errors
      if (!response.ok) {
        await this.handleHttpError(response);
      }

      // Parse response
      const data = await response.json();

      // Cache successful GET requests
      if (options.method === 'GET' && this.config.cache?.enabled) {
        const cacheKey = this.generateCacheKey(endpoint, options.params || {});
        this.cache.set(cacheKey, data, this.config.cache.ttl);
      }

      return {
        success: true,
        data,
        metadata: {
          timestamp: new Date(),
          requestId,
          duration: responseTime,
          cached: false,
        },
      };

    } catch (error) {
      this.errorCount++;
      return this.handleError(error, requestId, startTime);
    }
  }

  // Execute request with retry logic
  private async executeWithRetry<T>(requestFn: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= (this.config.retries || 0); attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        // Don't retry on client errors (4xx) unless it's rate limiting
        if (error instanceof RateLimitError) {
          // Wait for rate limit reset
          const retryAfter = error.retryAfter || DEFAULT_RETRY_CONFIG.baseDelay;
          await new Promise(resolve => setTimeout(resolve, retryAfter));
          continue;
        }

        if (error instanceof ServiceError && !error.isRetryable) {
          throw error;
        }

        // Wait before retrying with exponential backoff
        if (attempt < (this.config.retries || 0)) {
          const delay = Math.min(
            DEFAULT_RETRY_CONFIG.baseDelay * Math.pow(DEFAULT_RETRY_CONFIG.backoffFactor, attempt),
            DEFAULT_RETRY_CONFIG.maxDelay
          );
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  // Handle HTTP errors
  private async handleHttpError(response: Response): Promise<never> {
    let errorMessage: string;
    let errorCode: string;

    switch (response.status) {
      case 400:
        errorCode = 'BAD_REQUEST';
        errorMessage = 'Bad request';
        break;
      case 401:
        errorCode = 'AUTH_ERROR';
        errorMessage = 'Authentication required';
        break;
      case 403:
        errorCode = 'FORBIDDEN';
        errorMessage = 'Access forbidden';
        break;
      case 404:
        errorCode = 'NOT_FOUND';
        errorMessage = 'Resource not found';
        break;
      case 429:
        errorCode = 'RATE_LIMIT_ERROR';
        const retryAfter = response.headers.get('Retry-After');
        throw new RateLimitError('Rate limit exceeded', retryAfter ? parseInt(retryAfter) * 1000 : undefined);
      case 500:
      case 502:
      case 503:
      case 504:
        errorCode = 'SERVER_ERROR';
        errorMessage = 'Server error';
        break;
      default:
        errorCode = 'HTTP_ERROR';
        errorMessage = `HTTP ${response.status}`;
    }

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // Use default error message if response is not JSON
    }

    throw new ServiceError(errorMessage, errorCode, response.status, response.status >= 500);
  }

  // Handle errors and return consistent response format
  private handleError<T>(error: unknown, requestId: string, startTime: number): ServiceResponse<T> {
    let serviceError: ServiceError;

    if (error instanceof ServiceError) {
      serviceError = error;
    } else if (error instanceof Error) {
      if (error.name === 'AbortError') {
        serviceError = new TimeoutError();
      } else if (error.message.includes('fetch') || error.message.includes('network')) {
        serviceError = new NetworkError(error.message, error);
      } else {
        serviceError = new ServiceError(error.message, 'UNKNOWN_ERROR');
      }
    } else {
      serviceError = new ServiceError('An unknown error occurred', 'UNKNOWN_ERROR');
    }

    return {
      success: false,
      data: null as T,
      error: serviceError.message,
      metadata: {
        timestamp: new Date(),
        requestId,
        duration: Date.now() - startTime,
      },
    };
  }

  // Get authentication headers (to be implemented by subclasses)
  protected abstract getAuthHeaders(): Record<string, string>;

  // Health check implementation
  async healthCheck(): Promise<ServiceResponse<{ status: string; services: Record<string, boolean> }>> {
    const health: Record<string, boolean> = {};
    const startTime = Date.now();

    try {
      // Test basic connectivity
      const response = await fetch(`${this.config.baseUrl}/health`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        signal: AbortSignal.timeout(5000),
      });

      health.api = response.ok;

      return {
        success: true,
        data: {
          status: response.ok ? 'healthy' : 'unhealthy',
          services: health,
        },
        metadata: {
          timestamp: new Date(),
          requestId: this.generateRequestId(),
          duration: Date.now() - startTime,
        },
      };
    } catch (error) {
      health.api = false;

      return {
        success: false,
        data: {
          status: 'unhealthy',
          services: health,
        },
        error: error instanceof Error ? error.message : 'Health check failed',
        metadata: {
          timestamp: new Date(),
          requestId: this.generateRequestId(),
          duration: Date.now() - startTime,
        },
      };
    }
  }

  // Get service configuration
  getConfig(): ServiceConfig {
    return { ...this.config };
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    return this.cache.getStats();
  }

  // Get service health metrics
  getHealthMetrics(): ServiceHealth {
    const uptime = Date.now() - this.startTime;
    const averageResponseTime = this.requestCount > 0 ? this.totalResponseTime / this.requestCount : 0;

    return {
      status: this.errorCount / Math.max(this.requestCount, 1) < 0.1 ? 'healthy' : 'degraded',
      services: {
        cache: {
          status: 'up',
          lastCheck: new Date(),
        },
        rateLimit: {
          status: 'up',
          lastCheck: new Date(),
        },
      },
      overall: {
        uptime,
        totalRequests: this.requestCount,
        failedRequests: this.errorCount,
        averageResponseTime,
      },
    };
  }
}