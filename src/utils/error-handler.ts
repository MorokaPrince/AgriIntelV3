/**
 * Centralized Error Handling Utilities
 * Provides structured error handling, logging, and recovery mechanisms
 */

import { ZodError, ZodIssue } from 'zod';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATABASE = 'database',
  NETWORK = 'network',
  EXTERNAL_API = 'external_api',
  BUSINESS_LOGIC = 'business_logic',
  SYSTEM = 'system',
  UNKNOWN = 'unknown'
}

export interface ErrorContext {
  userId?: string;
  tenantId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  userAgent?: string;
  ip?: string;
  timestamp: number;
  additionalData?: Record<string, unknown>;
}

export interface StructuredError {
  id: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  context: ErrorContext;
  originalError?: Error;
  stack?: string;
  timestamp: number;
  handled: boolean;
  recovery?: {
    strategy: string;
    success: boolean;
    attempts: number;
  };
}

class ErrorHandler {
  private errorLog: StructuredError[] = [];
  private maxLogSize: number = 1000;

  /**
   * Creates a structured error from various error types
   */
  createStructuredError(
    error: unknown,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context: Partial<ErrorContext> = {}
  ): StructuredError {
    const structuredError: StructuredError = {
      id: this.generateErrorId(),
      message: this.extractErrorMessage(error),
      category,
      severity,
      context: {
        timestamp: Date.now(),
        ...context
      },
      originalError: error instanceof Error ? error : undefined,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: Date.now(),
      handled: false
    };

    return structuredError;
  }

  /**
   * Logs an error with full context
   */
  logError(
    error: unknown,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context: Partial<ErrorContext> = {}
  ): StructuredError {
    const structuredError = this.createStructuredError(error, category, severity, context);

    // Add to internal log
    this.errorLog.push(structuredError);

    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // Console logging based on severity
    this.logToConsole(structuredError);

    // In production, you might want to send to external logging service
    if (process.env.NODE_ENV === 'production' && severity === ErrorSeverity.CRITICAL) {
      this.logToExternalService(structuredError);
    }

    return structuredError;
  }

  /**
   * Handles API errors with appropriate responses
   */
  handleApiError(
    error: unknown,
    context: Partial<ErrorContext> = {}
  ): { statusCode: number; response: { error: string; details?: string; errorId?: string } } {
    let category = ErrorCategory.UNKNOWN;
    let severity = ErrorSeverity.MEDIUM;
    let statusCode = 500;
    let userMessage = 'An unexpected error occurred';

    if (error instanceof ZodError) {
      category = ErrorCategory.VALIDATION;
      severity = ErrorSeverity.LOW;
      statusCode = 400;
      userMessage = 'Invalid input data';
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      const errorMessage = (error as Error).message;

      if (errorMessage.includes('Authentication required') || errorMessage.includes('Unauthorized')) {
        category = ErrorCategory.AUTHENTICATION;
        severity = ErrorSeverity.HIGH;
        statusCode = 401;
        userMessage = 'Authentication required';
      } else if (errorMessage.includes('Access forbidden') || errorMessage.includes('Forbidden')) {
        category = ErrorCategory.AUTHORIZATION;
        severity = ErrorSeverity.HIGH;
        statusCode = 403;
        userMessage = 'Access denied';
      } else if (errorMessage.includes('Rate limit exceeded')) {
        category = ErrorCategory.NETWORK;
        severity = ErrorSeverity.MEDIUM;
        statusCode = 429;
        userMessage = 'Too many requests. Please try again later.';
      } else if (errorMessage.includes('Server error') || errorMessage.includes('Internal server error')) {
        category = ErrorCategory.SYSTEM;
        severity = ErrorSeverity.CRITICAL;
        statusCode = 500;
        userMessage = 'Server error. Please try again later.';
      } else if (errorMessage.includes('NetworkError') || errorMessage.includes('fetch')) {
        category = ErrorCategory.NETWORK;
        severity = ErrorSeverity.MEDIUM;
        statusCode = 503;
        userMessage = 'Network error. Please check your connection and try again.';
      }
    }

    const structuredError = this.logError(error, category, severity, context);

    return {
      statusCode,
      response: {
        error: userMessage,
        ...(process.env.NODE_ENV === 'development' && {
          details: structuredError.message,
          errorId: structuredError.id
        })
      }
    };
  }

  /**
   * Gets error statistics for monitoring
   */
  getErrorStats(timeWindow: number = 60 * 60 * 1000): {
    total: number;
    byCategory: Record<ErrorCategory, number>;
    bySeverity: Record<ErrorSeverity, number>;
    recentErrors: StructuredError[];
  } {
    const cutoff = Date.now() - timeWindow;
    const recentErrors = this.errorLog.filter(error => error.timestamp > cutoff);

    const byCategory = recentErrors.reduce((acc, error) => {
      acc[error.category] = (acc[error.category] || 0) + 1;
      return acc;
    }, {} as Record<ErrorCategory, number>);

    const bySeverity = recentErrors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<ErrorSeverity, number>);

    return {
      total: recentErrors.length,
      byCategory,
      bySeverity,
      recentErrors: recentErrors.slice(-10) // Last 10 errors
    };
  }

  /**
   * Marks an error as handled
   */
  markErrorHandled(errorId: string): void {
    const error = this.errorLog.find(e => e.id === errorId);
    if (error) {
      error.handled = true;
    }
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof ZodError) {
      return `Validation error: ${error.issues.map((e: ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
    } else if (error instanceof Error) {
      return error.message;
    } else if (typeof error === 'string') {
      return error;
    } else if (typeof error === 'object' && error !== null) {
      return JSON.stringify(error);
    } else {
      return 'Unknown error';
    }
  }

  private logToConsole(error: StructuredError): void {
    const logData = {
      id: error.id,
      category: error.category,
      severity: error.severity,
      message: error.message,
      context: error.context
    };

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        console.error('🚨 CRITICAL ERROR:', logData);
        break;
      case ErrorSeverity.HIGH:
        console.error('❌ HIGH SEVERITY ERROR:', logData);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn('⚠️ MEDIUM SEVERITY ERROR:', logData);
        break;
      case ErrorSeverity.LOW:
        console.info('ℹ️ LOW SEVERITY ERROR:', logData);
        break;
    }
  }

  private logToExternalService(error: StructuredError): void {
    // In production, you would send this to services like Sentry, LogRocket, etc.
    // For now, we'll just log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 External logging (development mode):', error);
    }

    // Example external logging service integration:
    // await fetch('https://your-logging-service.com/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(error)
    // });
  }
}

/**
 * Retry configuration for error recovery
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableErrors: string[];
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryableErrors: [
    'NetworkError',
    'TimeoutError',
    'ECONNRESET',
    'ENOTFOUND',
    'Server error',
    'Service temporarily unavailable'
  ]
};

/**
 * Executes a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  context: Partial<ErrorContext> = {}
): Promise<T> {
  const errorHandler = new ErrorHandler();
  let lastError: unknown;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if error is retryable
      const isRetryable = config.retryableErrors.some(retryableError =>
        error instanceof Error && error.message.includes(retryableError)
      );

      if (!isRetryable || attempt === config.maxAttempts) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffFactor, attempt - 1),
        config.maxDelay
      );

      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`, {
        error: error instanceof Error ? error.message : error,
        context
      });

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Create singleton instance
export const errorHandler = new ErrorHandler();

/**
 * Express-style error handling middleware for API routes
 */
export function handleApiErrors(context: Partial<ErrorContext> = {}) {
  return (error: unknown) => {
    return errorHandler.handleApiError(error, context);
  };
}