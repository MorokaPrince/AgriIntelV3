'use client';

import { apiService, Animal, HealthRecord, FinancialRecord, FeedRecord, TaskRecord, BreedingRecord, RFIDRecord } from './apiService';

// Enhanced API response interface
export interface EnhancedApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  metadata?: {
    timestamp: Date;
    requestId: string;
    cache?: {
      used: boolean;
      age: number;
      expiresAt: Date;
    };
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

// Cache configuration
interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number;
  keyGenerator?: (params: Record<string, unknown>) => string;
}

// Request configuration
interface RequestConfig {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  cache?: boolean | CacheConfig;
  tenantId?: string;
}

// Global cache store
class ApiCache {
  private cache = new Map<string, { data: unknown; timestamp: number; expiresAt: number }>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  set(key: string, data: unknown, ttl: number): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    });
  }

  get(key: string): unknown | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  getStats(): { size: number; maxSize: number; hitRate?: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }
}

// Global cache instance
const globalCache = new ApiCache(200);

// Enhanced API service class
export class EnhancedApiService {
  private baseUrl: string;
  private defaultConfig: RequestConfig;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || '/api';
    this.defaultConfig = {
      retries: 3,
      retryDelay: 1000,
      timeout: 10000,
      cache: {
        ttl: 5 * 60 * 1000, // 5 minutes default
        maxSize: 100,
      },
    };
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCacheKey(endpoint: string, params: Record<string, unknown> = {}): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, unknown>);

    return `${endpoint}:${JSON.stringify(sortedParams)}`;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    config: RequestConfig = {}
  ): Promise<EnhancedApiResponse<T>> {
    const requestId = this.generateRequestId();
    const mergedConfig = { ...this.defaultConfig, ...config };

    // Check cache first if enabled
    if (mergedConfig.cache && typeof mergedConfig.cache === 'object') {
      const cacheKey = this.generateCacheKey(endpoint, options.body ? JSON.parse(options.body as string) : {});
      const cachedData = globalCache.get(cacheKey) as T;

      if (cachedData) {
        return {
          success: true,
          data: cachedData,
          metadata: {
            timestamp: new Date(),
            requestId,
            cache: {
              used: true,
              age: Date.now() - (globalCache.get(`${cacheKey}_timestamp`) as number || Date.now()),
              expiresAt: new Date(Date.now() + mergedConfig.cache.ttl),
            },
          },
        };
      }
    }

    const url = `${this.baseUrl}${endpoint}`;

    // Merge headers with tenant isolation
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
      ...options.headers as Record<string, string>,
    };

    if (mergedConfig.tenantId) {
      headers['X-Tenant-ID'] = mergedConfig.tenantId;
    }

    const requestConfig: RequestInit = {
      ...options,
      headers,
    };

    // Add timeout if specified
    let timeoutId: NodeJS.Timeout | undefined;
    if (mergedConfig.timeout) {
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), mergedConfig.timeout);
      requestConfig.signal = controller.signal;
    }

    try {
      let lastError: Error;

      // Retry logic
      for (let attempt = 0; attempt <= (mergedConfig.retries || 0); attempt++) {
        try {
          const response = await fetch(url, requestConfig);

          if (timeoutId) {
            clearTimeout(timeoutId);
          }

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          // Cache the response if enabled
          if (mergedConfig.cache && typeof mergedConfig.cache === 'object') {
            const cacheKey = this.generateCacheKey(endpoint, options.body ? JSON.parse(options.body as string) : {});
            globalCache.set(cacheKey, data, mergedConfig.cache.ttl);
          }

          return {
            success: true,
            data,
            metadata: {
              timestamp: new Date(),
              requestId,
              cache: mergedConfig.cache && typeof mergedConfig.cache === 'object' ? {
                used: false,
                age: 0,
                expiresAt: new Date(Date.now() + mergedConfig.cache.ttl),
              } : undefined,
            },
          };
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Unknown error');

          // Don't retry on client errors (4xx)
          if (error instanceof Error && error.message.includes('4')) {
            break;
          }

          // Wait before retrying (exponential backoff)
          if (attempt < (mergedConfig.retries || 0)) {
            await new Promise(resolve =>
              setTimeout(resolve, mergedConfig.retryDelay! * Math.pow(2, attempt))
            );
          }
        }
      }

      throw lastError!;
    } catch (error) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const errorMessage = error instanceof Error ? error.message : 'An error occurred while making the request';

      return {
        success: false,
        data: null as T,
        error: errorMessage,
        metadata: {
          timestamp: new Date(),
          requestId,
        },
      };
    }
  }

  // Enhanced animal methods with better error handling and caching
  async getAnimals(params?: {
    page?: number;
    limit?: number;
    species?: string;
    status?: string;
    search?: string;
  }, config?: RequestConfig): Promise<EnhancedApiResponse<Animal[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.species) searchParams.append('species', params.species);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);

    const query = searchParams.toString();
    const endpoint = `/animals${query ? `?${query}` : ''}`;

    return this.makeRequest<Animal[]>(endpoint, {}, {
      cache: { ttl: 2 * 60 * 1000, maxSize: 50 }, // 2 minutes cache for animals
      ...config,
    });
  }

  async getAnimal(id: string, config?: RequestConfig): Promise<EnhancedApiResponse<Animal>> {
    return this.makeRequest<Animal>(`/animals/${id}`, {}, {
      cache: { ttl: 5 * 60 * 1000, maxSize: 100 }, // 5 minutes cache for individual animals
      ...config,
    });
  }

  async createAnimal(
    animalData: Omit<Animal, '_id' | 'createdAt' | 'updatedAt'>,
    config?: RequestConfig
  ): Promise<EnhancedApiResponse<Animal>> {
    // Clear related caches after creating
    this.clearCaches(['animals']);

    return this.makeRequest<Animal>('/animals', {
      method: 'POST',
      body: JSON.stringify(animalData),
    }, {
      cache: false, // Don't cache POST requests
      ...config,
    });
  }

  async updateAnimal(
    id: string,
    animalData: Partial<Omit<Animal, '_id' | 'createdAt' | 'updatedAt'>>,
    config?: RequestConfig
  ): Promise<EnhancedApiResponse<Animal>> {
    // Clear related caches after updating
    this.clearCaches(['animals', `animals/${id}`]);

    return this.makeRequest<Animal>(`/animals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(animalData),
    }, {
      cache: false, // Don't cache PUT requests
      ...config,
    });
  }

  async deleteAnimal(id: string, config?: RequestConfig): Promise<EnhancedApiResponse<{ message: string }>> {
    // Clear related caches after deleting
    this.clearCaches(['animals', `animals/${id}`]);

    return this.makeRequest<{ message: string }>(`/animals/${id}`, {
      method: 'DELETE',
    }, {
      cache: false, // Don't cache DELETE requests
      ...config,
    });
  }

  // Enhanced health methods
  async getHealthRecords(params?: {
    page?: number;
    limit?: number;
    animalId?: string;
    severity?: string;
    status?: string;
  }, config?: RequestConfig): Promise<EnhancedApiResponse<HealthRecord[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.animalId) searchParams.append('animalId', params.animalId);
    if (params?.severity) searchParams.append('severity', params.severity);
    if (params?.status) searchParams.append('status', params.status);

    const query = searchParams.toString();
    const endpoint = `/health${query ? `?${query}` : ''}`;

    return this.makeRequest<HealthRecord[]>(endpoint, {}, {
      cache: { ttl: 1 * 60 * 1000, maxSize: 50 }, // 1 minute cache for health records
      ...config,
    });
  }

  async createHealthRecord(
    healthData: Omit<HealthRecord, '_id' | 'createdAt' | 'updatedAt'>,
    config?: RequestConfig
  ): Promise<EnhancedApiResponse<HealthRecord>> {
    this.clearCaches(['health']);

    return this.makeRequest<HealthRecord>('/health', {
      method: 'POST',
      body: JSON.stringify(healthData),
    }, {
      cache: false,
      ...config,
    });
  }

  // Enhanced financial methods
  async getFinancialRecords(params?: {
    page?: number;
    limit?: number;
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }, config?: RequestConfig): Promise<EnhancedApiResponse<FinancialRecord[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.type) searchParams.append('type', params.type);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);

    const query = searchParams.toString();
    const endpoint = `/financial${query ? `?${query}` : ''}`;

    return this.makeRequest<FinancialRecord[]>(endpoint, {}, {
      cache: { ttl: 10 * 60 * 1000, maxSize: 50 }, // 10 minutes cache for financial data
      ...config,
    });
  }

  async createFinancialRecord(
    financialData: Omit<FinancialRecord, '_id' | 'createdAt' | 'updatedAt'>,
    config?: RequestConfig
  ): Promise<EnhancedApiResponse<FinancialRecord>> {
    this.clearCaches(['financial']);

    return this.makeRequest<FinancialRecord>('/financial', {
      method: 'POST',
      body: JSON.stringify(financialData),
    }, {
      cache: false,
      ...config,
    });
  }

  // Enhanced task methods
  async getTasks(params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    category?: string;
    assignedTo?: string;
  }, config?: RequestConfig): Promise<EnhancedApiResponse<TaskRecord[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.priority) searchParams.append('priority', params.priority);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.assignedTo) searchParams.append('assignedTo', params.assignedTo);

    const query = searchParams.toString();
    const endpoint = `/tasks${query ? `?${query}` : ''}`;

    return this.makeRequest<TaskRecord[]>(endpoint, {}, {
      cache: { ttl: 30 * 1000, maxSize: 50 }, // 30 seconds cache for tasks (more dynamic)
      ...config,
    });
  }

  async createTask(
    taskData: Omit<TaskRecord, '_id' | 'createdAt' | 'updatedAt'>,
    config?: RequestConfig
  ): Promise<EnhancedApiResponse<TaskRecord>> {
    this.clearCaches(['tasks']);

    return this.makeRequest<TaskRecord>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    }, {
      cache: false,
      ...config,
    });
  }

  // Enhanced weather method
  async getWeather(location: string, config?: RequestConfig): Promise<EnhancedApiResponse<unknown>> {
    return this.makeRequest<unknown>(`/weather/${encodeURIComponent(location)}`, {}, {
      cache: { ttl: 30 * 60 * 1000, maxSize: 20 }, // 30 minutes cache for weather
      ...config,
    });
  }

  // Cache management methods
  clearCaches(patterns?: string[]): void {
    if (!patterns || patterns.length === 0) {
      globalCache.clear();
      return;
    }

    // For now, just clear all cache since we don't have pattern matching
    // In a real implementation, you'd want to clear only matching patterns
    globalCache.clear();
  }

  getCacheStats(): { size: number; maxSize: number } {
    return globalCache.getStats();
  }

  // Batch operations for better performance
  async batchGetAnimals(ids: string[], config?: RequestConfig): Promise<EnhancedApiResponse<Animal[]>> {
    const promises = ids.map(id => this.getAnimal(id, { ...config, cache: false }));
    const results = await Promise.allSettled(promises);

    const successful: Animal[] = [];
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        successful.push(result.value.data);
      } else {
        errors.push(`Failed to fetch animal ${ids[index]}: ${result.status === 'rejected' ? result.reason : result.value.error}`);
      }
    });

    return {
      success: errors.length === 0,
      data: successful,
      error: errors.length > 0 ? errors.join('; ') : undefined,
      metadata: {
        timestamp: new Date(),
        requestId: this.generateRequestId(),
      },
    };
  }

  // Health check method
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; services: Record<string, boolean> }> {
    const services = {
      animals: false,
      health: false,
      financial: false,
      tasks: false,
    };

    try {
      // Test each service with a lightweight request
      const animalResponse = await this.getAnimals({ limit: 1 }, { cache: false, timeout: 5000 });
      services.animals = animalResponse.success;
    } catch {
      services.animals = false;
    }

    try {
      const healthResponse = await this.getHealthRecords({ limit: 1 }, { cache: false, timeout: 5000 });
      services.health = healthResponse.success;
    } catch {
      services.health = false;
    }

    try {
      const financialResponse = await this.getFinancialRecords({ limit: 1 }, { cache: false, timeout: 5000 });
      services.financial = financialResponse.success;
    } catch {
      services.financial = false;
    }

    try {
      const taskResponse = await this.getTasks({ limit: 1 }, { cache: false, timeout: 5000 });
      services.tasks = taskResponse.success;
    } catch {
      services.tasks = false;
    }

    const allHealthy = Object.values(services).every(status => status);

    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      services,
    };
  }
}

// Export singleton instance
export const enhancedApiService = new EnhancedApiService();

// Utility functions for working with the enhanced API
export class ApiUtils {
  static isRateLimited(error: string): boolean {
    return error.toLowerCase().includes('rate limit') ||
           error.toLowerCase().includes('too many requests');
  }

  static isNetworkError(error: string): boolean {
    return error.toLowerCase().includes('network') ||
           error.toLowerCase().includes('fetch') ||
           error.toLowerCase().includes('connection');
  }

  static isServerError(error: string): boolean {
    return error.includes('5') || error.toLowerCase().includes('server error');
  }

  static getRetryDelay(attempt: number, baseDelay: number = 1000): number {
    return baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
  }

  static formatApiError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    return 'An unknown error occurred';
  }
}