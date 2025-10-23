// Service layer type definitions and interfaces

// Base response interface
export interface ServiceResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
  message?: string;
  metadata?: {
    timestamp: Date;
    requestId: string;
    duration?: number;
    cached?: boolean;
    cacheAge?: number;
  };
}

// Pagination interface
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ServiceResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Service configuration
export interface ServiceConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cache?: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
  };
  rateLimit?: {
    requests: number;
    window: number;
  };
}

// Error types
export class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export class NetworkError extends ServiceError {
  constructor(message: string, public originalError?: Error) {
    super(message, 'NETWORK_ERROR', undefined, true);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends ServiceError {
  constructor(message: string = 'Request timeout') {
    super(message, 'TIMEOUT_ERROR', 408, true);
    this.name = 'TimeoutError';
  }
}

export class RateLimitError extends ServiceError {
  constructor(message: string = 'Rate limit exceeded', public retryAfter?: number) {
    super(message, 'RATE_LIMIT_ERROR', 429, true);
    this.name = 'RateLimitError';
  }
}

export class AuthenticationError extends ServiceError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTH_ERROR', 401, false);
    this.name = 'AuthenticationError';
  }
}

// Cache interface
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  accessCount: number;
}

export interface Cache<T> {
  get(key: string): T | null;
  set(key: string, data: T, ttl: number): void;
  delete(key: string): void;
  clear(): void;
  size(): number;
  getStats(): { size: number; maxSize: number; hitRate: number };
}

// Request deduplication
export interface PendingRequest {
  promise: Promise<unknown>;
  timestamp: number;
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
}

// Service interface for better testability
export interface BaseService {
  healthCheck(): Promise<ServiceResponse<{ status: string; services: Record<string, boolean> }>>;
  getConfig(): ServiceConfig;
  clearCache(): void;
}

// HTTP methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Request options
export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean>;
  config?: Partial<ServiceConfig>;
}

// Retry configuration
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableErrors: string[];
}

// Rate limiting
export interface RateLimitEntry {
  requests: number;
  windowStart: number;
  windowSize: number;
}

// Service health status
export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: Record<string, {
    status: 'up' | 'down' | 'degraded';
    responseTime?: number;
    lastCheck: Date;
    error?: string;
  }>;
  overall: {
    uptime: number;
    totalRequests: number;
    failedRequests: number;
    averageResponseTime: number;
  };
}