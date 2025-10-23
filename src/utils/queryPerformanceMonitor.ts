'use client';

import mongoose from 'mongoose';

// Query performance monitoring interfaces
export interface QueryPerformanceMetrics {
  query: string;
  collection: string;
  executionTime: number;
  timestamp: Date;
  tenantId?: string;
  slowQuery: boolean;
  plan?: Record<string, unknown>;
}

export interface PerformanceStats {
  totalQueries: number;
  slowQueries: number;
  averageExecutionTime: number;
  slowestQueries: QueryPerformanceMetrics[];
  queriesByCollection: Record<string, number>;
}

// Query performance monitor class
export class QueryPerformanceMonitor {
  private static metrics: QueryPerformanceMetrics[] = [];
  private static readonly MAX_METRICS = 1000;
  private static readonly SLOW_QUERY_THRESHOLD = 100; // milliseconds

  // Middleware to track query performance
  static trackQuery<T>(collectionName: string, tenantId?: string) {
    return {
      pre: function (this: mongoose.Query<T, mongoose.Document>) {
        (this as mongoose.Query<T, mongoose.Document> & { _startTime?: number })._startTime = Date.now();
      },
      post: function (this: mongoose.Query<T, mongoose.Document>) {
        const startTime = (this as mongoose.Query<T, mongoose.Document> & { _startTime?: number })._startTime;
        if (!startTime) return;
        const executionTime = Date.now() - startTime;

        const metric: QueryPerformanceMetrics = {
          query: this.getQuery().toString(),
          collection: collectionName,
          executionTime,
          timestamp: new Date(),
          tenantId,
          slowQuery: executionTime > QueryPerformanceMonitor.SLOW_QUERY_THRESHOLD,
        };

        QueryPerformanceMonitor.addMetric(metric);

        // Log slow queries
        if (metric.slowQuery) {
          console.warn(`🐌 Slow query detected in ${collectionName}:`, {
            executionTime: `${executionTime}ms`,
            query: metric.query.substring(0, 200) + '...',
            tenantId,
          });
        }
      },
    };
  }

  // Add performance metric
  static addMetric(metric: QueryPerformanceMetrics): void {
    this.metrics.push(metric);

    // Keep only recent metrics to prevent memory issues
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }

  // Get performance statistics
  static getPerformanceStats(timeRange?: number): PerformanceStats {
    const cutoffTime = timeRange ? Date.now() - timeRange : 0;
    const recentMetrics = this.metrics.filter(m => m.timestamp.getTime() > cutoffTime);

    const slowQueries = recentMetrics.filter(m => m.slowQuery);
    const totalExecutionTime = recentMetrics.reduce((sum, m) => sum + m.executionTime, 0);
    const averageExecutionTime = recentMetrics.length > 0 ? totalExecutionTime / recentMetrics.length : 0;

    // Group by collection
    const queriesByCollection: Record<string, number> = {};
    recentMetrics.forEach(metric => {
      queriesByCollection[metric.collection] = (queriesByCollection[metric.collection] || 0) + 1;
    });

    // Get slowest queries
    const slowestQueries = recentMetrics
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 10);

    return {
      totalQueries: recentMetrics.length,
      slowQueries: slowQueries.length,
      averageExecutionTime,
      slowestQueries,
      queriesByCollection,
    };
  }

  // Get slow queries for a specific collection
  static getSlowQueries(collectionName?: string, limit: number = 20): QueryPerformanceMetrics[] {
    let queries = this.metrics.filter(m => m.slowQuery);

    if (collectionName) {
      queries = queries.filter(m => m.collection === collectionName);
    }

    return queries
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, limit);
  }

  // Get performance recommendations
  static getPerformanceRecommendations(): string[] {
    const stats = this.getPerformanceStats();
    const recommendations: string[] = [];

    if (stats.slowQueries / Math.max(stats.totalQueries, 1) > 0.1) {
      recommendations.push('High percentage of slow queries detected. Consider adding indexes for frequently queried fields.');
    }

    if (stats.averageExecutionTime > 50) {
      recommendations.push('Average query execution time is high. Review query patterns and consider query optimization.');
    }

    // Check for collections with many queries
    Object.entries(stats.queriesByCollection).forEach(([collection, count]) => {
      if (count > 100 && stats.totalQueries > 0) {
        const percentage = (count / stats.totalQueries) * 100;
        if (percentage > 30) {
          recommendations.push(`Collection '${collection}' is heavily queried (${percentage.toFixed(1)}% of queries). Consider caching or query optimization.`);
        }
      }
    });

    return recommendations;
  }

  // Clear old metrics
  static clearMetrics(olderThanHours: number = 24): number {
    const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);
    const initialCount = this.metrics.length;
    this.metrics = this.metrics.filter(m => m.timestamp.getTime() > cutoffTime);
    return initialCount - this.metrics.length;
  }

  // Export metrics for analysis
  static exportMetrics(): QueryPerformanceMetrics[] {
    return [...this.metrics];
  }
}

// Query optimization utilities
export class QueryOptimizer {
  // Suggest indexes based on query patterns
  static suggestIndexes(collectionName: string, queries: QueryPerformanceMetrics[]): Array<{
    fields: Record<string, number>;
    reason: string;
  }> {
    const suggestions: Array<{ fields: Record<string, number>; reason: string }> = [];

    // Analyze query patterns
    const fieldFrequency: Record<string, number> = {};

    queries.forEach(query => {
      // Extract fields from query string (simplified)
      const queryStr = query.query.toLowerCase();

      // Look for common field patterns
      const fieldPatterns = [
        'species', 'status', 'weight', 'dateofbirth', 'createdat',
        'health.overallcondition', 'location.farmsection', 'gender'
      ];

      fieldPatterns.forEach(field => {
        if (queryStr.includes(field)) {
          fieldFrequency[field] = (fieldFrequency[field] || 0) + 1;
        }
      });
    });

    // Suggest indexes for frequently queried fields
    Object.entries(fieldFrequency).forEach(([field, frequency]) => {
      if (frequency > 5) { // Threshold for suggesting index
        suggestions.push({
          fields: { [field]: 1 },
          reason: `Field '${field}' appears in ${frequency} queries, suggesting an index would improve performance`,
        });
      }
    });

    return suggestions;
  }

  // Optimize aggregation pipelines
  static optimizeAggregationPipeline(pipeline: Record<string, unknown>[]): Record<string, unknown>[] {
    const optimized = [...pipeline];

    // Add $match stages early for better performance
    const matchStages = optimized.filter(stage => stage.$match);
    const otherStages = optimized.filter(stage => !stage.$match);

    return [...matchStages, ...otherStages];
  }

  // Cache query results for frequently executed queries
  private static queryCache = new Map<string, { result: unknown; timestamp: number; ttl: number }>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static getCachedQuery<T>(cacheKey: string): T | null {
    const cached = this.queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.result as T;
    }
    return null;
  }

  static setCachedQuery<T>(cacheKey: string, result: T, ttl: number = this.CACHE_TTL): void {
    this.queryCache.set(cacheKey, {
      result,
      timestamp: Date.now(),
      ttl,
    });

    // Clean up old cache entries
    if (this.queryCache.size > 100) {
      const oldestKeys = Array.from(this.queryCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, 20)
        .map(([key]) => key);

      oldestKeys.forEach(key => this.queryCache.delete(key));
    }
  }

  static generateCacheKey(tenantId: string, collection: string, query: Record<string, unknown>): string {
    return `${tenantId}:${collection}:${JSON.stringify(query)}`;
  }
}

// Database performance utilities
export class DatabasePerformanceUtils {
  // Get collection statistics
  static async getCollectionStats(db: mongoose.Connection['db'], collectionName: string) {
    if (!db) return null;

    try {
      const collection = db.collection(collectionName);
      const stats = await collection.aggregate([
        { $collStats: { storageStats: {} } }
      ]).toArray();

      if (stats.length > 0) {
        const stat = stats[0];
        return {
          name: collectionName,
          count: stat.count || 0,
          size: stat.size || 0,
          storageSize: stat.storageStats?.size || 0,
          totalIndexSize: stat.storageStats?.totalIndexSize || 0,
          indexes: stat.nindexes || 0,
        };
      }

      return {
        name: collectionName,
        count: 0,
        size: 0,
        storageSize: 0,
        totalIndexSize: 0,
        indexes: 0,
      };
    } catch (error) {
      console.error(`Failed to get stats for collection ${collectionName}:`, error);
      return null;
    }
  }

  // Monitor index usage
  static async getIndexUsageStats(db: mongoose.Connection['db']) {
    if (!db) return [];

    try {
      const collections = ['animals', 'healthrecords', 'financialrecords', 'tasks', 'feedrecords'];
      const indexStats = [];

      for (const collectionName of collections) {
        try {
          const collection = db.collection(collectionName);
          const indexInfo = await collection.indexes();

          indexStats.push({
            collection: collectionName,
            indexes: indexInfo.map((idx) => ({
              name: idx.name || 'unnamed',
              keys: idx.key || {},
              unique: idx.unique || false,
            })),
          });
        } catch (collectionError) {
          console.warn(`Failed to get index info for ${collectionName}:`, collectionError);
          indexStats.push({
            collection: collectionName,
            indexes: [],
          });
        }
      }

      return indexStats;
    } catch (error) {
      console.error('Failed to get index usage stats:', error);
      return [];
    }
  }

  // Performance monitoring middleware for models
  static createPerformanceMiddleware(collectionName: string, tenantId?: string) {
    return QueryPerformanceMonitor.trackQuery(collectionName, tenantId);
  }
}