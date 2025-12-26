'use server';

import connectDB from '@/lib/mongodb';
import { getConnectionPoolStats } from '@/lib/mongodb';

interface CachedData {
  timestamp: number;
  data: unknown;
  ttl: number; // Time to live in milliseconds
}

interface FallbackCache {
  [key: string]: CachedData;
}

const fallbackCache: FallbackCache = {};
const FALLBACK_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

/**
 * Check if MongoDB connection is healthy
 * @returns boolean indicating if connection is healthy
 */
export async function isConnectionHealthy(): Promise<boolean> {
  try {
    // Check if we have a healthy connection
    const stats = getConnectionPoolStats();
    if (!stats) return false;

    // Connection is considered healthy if:
    // 1. Health score is above 70
    // 2. No pending connections
    // 3. Connection attempts are reasonable
    return stats.healthScore > 70 &&
           stats.pendingConnections === 0 &&
           stats.availableConnections > 0;
  } catch (error) {
    console.error('Error checking connection health:', error);
    return false;
  }
}

/**
 * Execute database operation with fallback support
 * @param operationName Name of the operation for caching
 * @param operation Function that performs the database operation
 * @param fallbackData Optional fallback data to use if operation fails
 * @returns Result of the operation or cached data
 */
export async function executeWithFallback<T>(
  operationName: string,
  operation: () => Promise<T>,
  fallbackData?: T
): Promise<T> {
  try {
    // Check if connection is healthy before attempting operation
    const isHealthy = await isConnectionHealthy();

    if (!isHealthy) {
      console.warn(`💾 Using cached data for ${operationName} - MongoDB connection unstable`);

      // Check if we have cached data
      if (fallbackCache[operationName]) {
        const cachedData = fallbackCache[operationName];

        // Check if cached data is still valid
        if (Date.now() - cachedData.timestamp < cachedData.ttl) {
          console.log(`📦 Returning cached data for ${operationName}`);
          return cachedData.data as T;
        } else {
          console.log(`🗑️ Cache expired for ${operationName} - removing stale data`);
          delete fallbackCache[operationName];
        }
      }

      // If we have fallback data, use it
      if (fallbackData) {
        console.log(`📦 Using provided fallback data for ${operationName}`);
        return fallbackData;
      }

      // If no cached data and no fallback, throw error
      throw new Error(`No cached data available for ${operationName} and MongoDB connection is unstable`);
    }

    // Execute the operation if connection is healthy
    const result = await operation();

    // Cache the result for future use
    fallbackCache[operationName] = {
      timestamp: Date.now(),
      data: result,
      ttl: FALLBACK_TTL
    };

    console.log(`💾 Cached result for ${operationName}`);
    return result;

  } catch (error) {
    console.error(`❌ Operation ${operationName} failed:`, error);

    // Try to return cached data if available
    if (fallbackCache[operationName]) {
      const cachedData = fallbackCache[operationName];
      console.warn(`💾 Fallback: Returning cached data for ${operationName}`);
      return cachedData.data as T;
    }

    // If we have fallback data, use it
    if (fallbackData) {
      console.warn(`💾 Fallback: Using provided fallback data for ${operationName}`);
      return fallbackData;
    }

    // If no fallback available, rethrow the error
    throw error;
  }
}

/**
 * Clear cached data for a specific operation
 * @param operationName Name of the operation to clear cache for
 */
export function clearOperationCache(operationName: string): void {
  if (fallbackCache[operationName]) {
    delete fallbackCache[operationName];
    console.log(`🧹 Cleared cache for ${operationName}`);
  }
}

/**
 * Clear all cached data
 */
export function clearAllCache(): void {
  Object.keys(fallbackCache).forEach(key => {
    delete fallbackCache[key];
  });
  console.log('🧹 Cleared all cached data');
}

/**
 * Get cache statistics
 * @returns Object with cache statistics
 */
export function getCacheStats(): { operations: number; oldestCacheAge: number; averageCacheAge: number } {
  const now = Date.now();
  const operations = Object.keys(fallbackCache).length;

  if (operations === 0) {
    return { operations: 0, oldestCacheAge: 0, averageCacheAge: 0 };
  }

  const ages = Object.values(fallbackCache).map(item => now - item.timestamp);
  const oldestCacheAge = Math.max(...ages);
  const averageCacheAge = ages.reduce((sum, age) => sum + age, 0) / operations;

  return {
    operations,
    oldestCacheAge,
    averageCacheAge
  };
}

/**
 * Check if we're in fallback mode
 * @returns boolean indicating if we're using fallback data
 */
export async function isInFallbackMode(): Promise<boolean> {
  const isHealthy = await isConnectionHealthy();
  return !isHealthy;
}

/**
 * Get connection status information
 * @returns Object with connection status information
 */
export async function getConnectionStatus(): Promise<{
  isHealthy: boolean;
  isInFallback: boolean;
  cacheStats: { operations: number; oldestCacheAge: number; averageCacheAge: number };
  message: string;
}> {
  const isHealthy = await isConnectionHealthy();
  const isInFallback = !isHealthy;
  const cacheStats = getCacheStats();

  let message = '✅ Database connection healthy';
  if (isInFallback) {
    message = '⚠️ Using fallback mode - MongoDB connection unstable';
  }

  return {
    isHealthy,
    isInFallback,
    cacheStats,
    message
  };
}