/**
 * Comprehensive logging utility for AgriIntel V3
 * Provides structured logging with different levels and contexts
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogContext {
  userId?: string;
  tenantId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  userAgent?: string;
  ip?: string;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: Record<string, any>;
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;
  private isDevelopment = process.env.NODE_ENV === 'development';

  private constructor() {
    // Set log level from environment
    const envLogLevel = process.env.LOG_LEVEL?.toLowerCase();
    if (envLogLevel) {
      switch (envLogLevel) {
        case 'debug':
          this.logLevel = LogLevel.DEBUG;
          break;
        case 'info':
          this.logLevel = LogLevel.INFO;
          break;
        case 'warn':
          this.logLevel = LogLevel.WARN;
          break;
        case 'error':
          this.logLevel = LogLevel.ERROR;
          break;
      }
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatMessage(entry: LogEntry): string {
    const { timestamp, level, message, context, error, metadata } = entry;
    const levelName = LogLevel[level];
    
    let formattedMessage = `[${timestamp}] ${levelName}: ${message}`;
    
    if (context) {
      formattedMessage += ` | Context: ${JSON.stringify(context)}`;
    }
    
    if (error) {
      formattedMessage += ` | Error: ${error.message}`;
      if (error.stack && this.isDevelopment) {
        formattedMessage += ` | Stack: ${error.stack}`;
      }
    }
    
    if (metadata && Object.keys(metadata).length > 0) {
      formattedMessage += ` | Metadata: ${JSON.stringify(metadata)}`;
    }
    
    return formattedMessage;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error,
    metadata?: Record<string, any>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined,
      metadata
    };
  }

  public debug(message: string, context?: LogContext, metadata?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context, undefined, metadata);
    console.debug(this.formatMessage(entry));
  }

  public info(message: string, context?: LogContext, metadata?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    const entry = this.createLogEntry(LogLevel.INFO, message, context, undefined, metadata);
    console.info(this.formatMessage(entry));
  }

  public warn(message: string, context?: LogContext, error?: Error, metadata?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    const entry = this.createLogEntry(LogLevel.WARN, message, context, error, metadata);
    console.warn(this.formatMessage(entry));
  }

  public error(message: string, context?: LogContext, error?: Error, metadata?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    const entry = this.createLogEntry(LogLevel.ERROR, message, context, error, metadata);
    console.error(this.formatMessage(entry));
    
    // In production, you might want to send errors to an external service
    if (!this.isDevelopment) {
      this.sendToErrorService(entry);
    }
  }

  // HTTP request logging
  public logRequest(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    context?: LogContext
  ): void {
    const message = `${method} ${url} - ${statusCode} (${responseTime}ms)`;
    const metadata = {
      method,
      url,
      statusCode,
      responseTime,
      category: 'http_request'
    };
    
    if (statusCode >= 500) {
      this.error(message, context, undefined, metadata);
    } else if (statusCode >= 400) {
      this.warn(message, context, undefined, metadata);
    } else {
      this.info(message, context, metadata);
    }
  }

  // Database operation logging
  public logDatabaseOperation(
    operation: string,
    collection: string,
    success: boolean,
    duration: number,
    context?: LogContext,
    error?: Error
  ): void {
    const message = `DB ${operation} on ${collection} - ${success ? 'success' : 'failed'} (${duration}ms)`;
    const metadata = {
      operation,
      collection,
      success,
      duration,
      category: 'database'
    };
    
    if (success) {
      this.debug(message, context, metadata);
    } else {
      this.error(message, context, error, metadata);
    }
  }

  // Authentication logging
  public logAuth(
    action: string,
    success: boolean,
    userId?: string,
    context?: LogContext,
    error?: Error
  ): void {
    const message = `Auth ${action} - ${success ? 'success' : 'failed'}`;
    const metadata = {
      action,
      success,
      category: 'authentication'
    };
    
    if (success) {
      this.info(message, { ...context, userId }, metadata);
    } else {
      this.warn(message, { ...context, userId }, error, metadata);
    }
  }

  // Business logic logging
  public logBusinessEvent(
    event: string,
    data: Record<string, any>,
    context?: LogContext
  ): void {
    const message = `Business Event: ${event}`;
    const metadata = {
      event,
      data,
      category: 'business'
    };
    
    this.info(message, context, metadata);
  }

  private async sendToErrorService(entry: LogEntry): Promise<void> {
    // This is where you would integrate with an external error service
    // like Sentry, LogRocket, or similar
    try {
      // Example: Send to external service
      // await fetch('https://your-error-service.com/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry)
      // });
    } catch (error) {
      // Avoid infinite loops
      console.error('Failed to send error to external service:', error);
    }
  }

  // Performance monitoring
  public startTimer(label: string): () => void {
    const startTime = Date.now();
    return () => {
      const duration = Date.now() - startTime;
      this.debug(`Timer ${label} completed`, { duration }, { category: 'performance' });
    };
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience functions
export const log = {
  debug: (message: string, context?: LogContext, metadata?: Record<string, any>) => 
    logger.debug(message, context, metadata),
  info: (message: string, context?: LogContext, metadata?: Record<string, any>) => 
    logger.info(message, context, metadata),
  warn: (message: string, context?: LogContext, error?: Error, metadata?: Record<string, any>) => 
    logger.warn(message, context, error, metadata),
  error: (message: string, context?: LogContext, error?: Error, metadata?: Record<string, any>) => 
    logger.error(message, context, error, metadata),
  request: (method: string, url: string, statusCode: number, responseTime: number, context?: LogContext) => 
    logger.logRequest(method, url, statusCode, responseTime, context),
  db: (operation: string, collection: string, success: boolean, duration: number, context?: LogContext, error?: Error) => 
    logger.logDatabaseOperation(operation, collection, success, duration, context, error),
  auth: (action: string, success: boolean, userId?: string, context?: LogContext, error?: Error) => 
    logger.logAuth(action, success, userId, context, error),
  business: (event: string, data: Record<string, any>, context?: LogContext) => 
    logger.logBusinessEvent(event, data, context),
  timer: (label: string) => logger.startTimer(label)
};