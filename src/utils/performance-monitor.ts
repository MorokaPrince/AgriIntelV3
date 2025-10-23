/**
 * Performance Monitoring Utility
 * Provides performance tracking and monitoring for production deployments
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import React, { type ComponentType } from 'react';
import { envConfig } from './env-config';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

interface DatabaseQueryMetric {
  query: string;
  duration: number;
  collection: string;
  success: boolean;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private queryMetrics: DatabaseQueryMetric[] = [];
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = envConfig.enablePerformanceMonitoring && envConfig.isProduction;
  }

  /**
   * Records a performance metric
   */
  recordMetric(name: string, value: number, tags?: Record<string, string>) {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      tags,
    };

    this.metrics.push(metric);

    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Log slow operations
    if (value > 1000) {
      console.warn(`Slow operation detected: ${name} took ${value}ms`);
    }
  }

  /**
   * Records database query performance
   */
  recordQueryPerformance(query: string, duration: number, collection: string, success: boolean = true) {
    if (!this.isEnabled) return;

    const metric: DatabaseQueryMetric = {
      query: query.length > 100 ? query.substring(0, 100) + '...' : query,
      duration,
      collection,
      success,
      timestamp: Date.now(),
    };

    this.queryMetrics.push(metric);

    // Keep only last 500 query metrics
    if (this.queryMetrics.length > 500) {
      this.queryMetrics = this.queryMetrics.slice(-500);
    }

    // Log slow queries
    if (duration > 100) {
      console.warn(`Slow database query in ${collection}: ${duration}ms`);
    }
  }

  /**
   * Records API route performance
   */
  recordApiPerformance(route: string, method: string, duration: number, statusCode: number) {
    this.recordMetric('api_request_duration', duration, {
      route,
      method,
      status_code: statusCode.toString(),
    });
  }

  /**
   * Records page load performance
   */
  recordPageLoad(url: string, duration: number, userAgent?: string) {
    this.recordMetric('page_load_time', duration, {
      url,
      user_agent: userAgent || 'unknown',
    });
  }

  /**
   * Records memory usage
   */
  recordMemoryUsage() {
    if (!this.isEnabled || typeof process === 'undefined') return;

    const usage = process.memoryUsage();
    this.recordMetric('memory_usage_heap_used', usage.heapUsed);
    this.recordMetric('memory_usage_heap_total', usage.heapTotal);
    this.recordMetric('memory_usage_external', usage.external);
  }

  /**
   * Gets performance summary
   */
  getPerformanceSummary() {
    if (!this.isEnabled) {
      return { message: 'Performance monitoring is disabled' };
    }

    const now = Date.now();
    const lastHour = now - (60 * 60 * 1000);

    const recentMetrics = this.metrics.filter(m => m.timestamp > lastHour);
    const recentQueries = this.queryMetrics.filter(q => q.timestamp > lastHour);

    const summary = {
      totalMetrics: this.metrics.length,
      totalQueries: this.queryMetrics.length,
      recentMetrics: recentMetrics.length,
      recentQueries: recentQueries.length,
      averageApiResponseTime: this.getAverageMetricValue(recentMetrics, 'api_request_duration'),
      averagePageLoadTime: this.getAverageMetricValue(recentMetrics, 'page_load_time'),
      slowQueries: recentQueries.filter(q => q.duration > 100).length,
      errorCount: recentMetrics.filter(m => m.tags?.status_code?.startsWith('5')).length,
      memoryUsage: this.getLatestMetricValue('memory_usage_heap_used'),
    };

    return summary;
  }

  /**
   * Gets average value for a specific metric
   */
  private getAverageMetricValue(metrics: PerformanceMetric[], metricName: string): number {
    const relevantMetrics = metrics.filter(m => m.name === metricName);
    if (relevantMetrics.length === 0) return 0;

    const sum = relevantMetrics.reduce((acc, m) => acc + m.value, 0);
    return Math.round(sum / relevantMetrics.length);
  }

  /**
   * Gets latest value for a specific metric
   */
  private getLatestMetricValue(metricName: string): number {
    const metric = this.metrics
      .filter(m => m.name === metricName)
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    return metric ? metric.value : 0;
  }

  /**
   * Exports metrics for external monitoring systems
   */
  exportMetrics() {
    if (!this.isEnabled) return null;

    return {
      timestamp: new Date().toISOString(),
      environment: envConfig.nodeEnv,
      metrics: this.metrics.slice(-100), // Last 100 metrics
      queryMetrics: this.queryMetrics.slice(-50), // Last 50 queries
      summary: this.getPerformanceSummary(),
    };
  }

  /**
   * Clears old metrics (useful for memory management)
   */
  clearOldMetrics(maxAge: number = 60 * 60 * 1000) { // Default: 1 hour
    const cutoff = Date.now() - maxAge;

    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
    this.queryMetrics = this.queryMetrics.filter(q => q.timestamp > cutoff);
  }
}

/**
 * Middleware function to track API performance
 */
export function withPerformanceMonitoring(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (!envConfig.enablePerformanceMonitoring) {
      return handler(req, res);
    }

    const startTime = Date.now();
    const monitor = new PerformanceMonitor();

    // Track memory before request
    monitor.recordMemoryUsage();

    try {
      await handler(req, res);
      const duration = Date.now() - startTime;

      // Record successful API call
      monitor.recordApiPerformance(req.url || '', req.method || '', duration, res.statusCode);

    } catch (error) {
      const duration = Date.now() - startTime;

      // Record failed API call
      monitor.recordApiPerformance(req.url || '', req.method || '', duration, 500);

      throw error;
    }
  };
}

/**
 * Higher-order component for page performance tracking
 */
export function withPagePerformanceTracking<P extends object>(
  Component: ComponentType<P>
) {
  const TrackedComponent = (props: P) => {
    const monitor = new PerformanceMonitor();

    if (typeof window !== 'undefined') {
      // Client-side performance tracking
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          monitor.recordPageLoad(window.location.href, navigation.loadEventEnd - navigation.loadEventStart);
        }
      });
    }

    return React.createElement(Component, props);
  };

  TrackedComponent.displayName = `withPagePerformanceTracking(${Component.displayName || Component.name})`;

  return TrackedComponent;
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Periodic cleanup of old metrics (every 30 minutes)
if (typeof window === 'undefined' && envConfig.enablePerformanceMonitoring) {
  setInterval(() => {
    performanceMonitor.clearOldMetrics();
  }, 30 * 60 * 1000);
}

export default performanceMonitor;