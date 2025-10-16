'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiService, Animal, HealthRecord, FinancialRecord, FeedRecord, TaskRecord } from '@/services/apiService';

interface DataCache {
  [key: string]: {
    data: unknown;
    timestamp: number;
    expiresAt: number;
  };
}

interface UseRealTimeDataOptions {
  endpoint: string;
  params?: Record<string, unknown>;
  refreshInterval?: number; // in milliseconds
  enabled?: boolean;
}

interface UseRealTimeDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

// Global cache to ensure data consistency across components
const globalCache: DataCache = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const REFRESH_INTERVAL = 30 * 1000; // 30 seconds

export function useRealTimeData<T = unknown>({
  endpoint,
  params = {},
  refreshInterval = REFRESH_INTERVAL,
  enabled = true,
}: UseRealTimeDataOptions): UseRealTimeDataReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async (showLoading = true) => {
    if (!enabled) return;

    // Create cache key inside the function to avoid dependency issues
    const currentCacheKey = `${endpoint}:${JSON.stringify(params)}`;

    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      // Check cache first
      const cached = globalCache[currentCacheKey];
      if (cached && Date.now() < cached.expiresAt) {
        setData(cached.data as T);
        setLastUpdated(new Date(cached.timestamp));
        setLoading(false);
        return;
      }

      // Fetch fresh data based on endpoint
      let result;
      switch (endpoint) {
        case 'animals':
          result = await apiService.getAnimals(params);
          break;
        case 'health':
          result = await apiService.getHealthRecords(params);
          break;
        case 'financial':
          result = await apiService.getFinancialRecords(params);
          break;
        case 'feeding':
          result = await apiService.getFeedRecords(params);
          break;
        case 'breeding':
          result = await apiService.getBreedingRecords(params);
          break;
        case 'rfid':
          result = await apiService.getRFIDRecords(params);
          break;
        case 'tasks':
          result = await apiService.getTasks(params);
          break;
        default:
          throw new Error(`Unknown endpoint: ${endpoint}`);
      }

      if (result.success) {
        const fetchedData = result.data;

        // Update global cache
        globalCache[currentCacheKey] = {
          data: fetchedData,
          timestamp: Date.now(),
          expiresAt: Date.now() + CACHE_DURATION,
        };

        setData(fetchedData as T);
        setLastUpdated(new Date());
      } else {
        throw new Error(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error(`Error fetching ${endpoint}:`, err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, params, enabled]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  // Initial fetch and periodic refresh combined
  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up periodic refresh
    if (!enabled || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      fetchData(false); // Silent refresh
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [endpoint, params, enabled, refreshInterval]);

  return {
    data,
    loading,
    error,
    refetch,
    lastUpdated,
  };
}

// Hook for getting dashboard summary data
export function useDashboardData(tenantId: string) {
  const animals = useRealTimeData({
    endpoint: 'animals',
    params: { limit: 1000 },
    refreshInterval: 30000,
  });

  const health = useRealTimeData({
    endpoint: 'health',
    params: { limit: 1000 },
    refreshInterval: 30000,
  });

  const financial = useRealTimeData({
    endpoint: 'financial',
    params: { limit: 1000 },
    refreshInterval: 60000, // Financial data updates less frequently
  });

  const feeding = useRealTimeData({
    endpoint: 'feeding',
    params: { limit: 1000 },
    refreshInterval: 30000,
  });

  const tasks = useRealTimeData({
    endpoint: 'tasks',
    params: { limit: 1000 },
    refreshInterval: 15000, // Tasks update more frequently
  });

  // Calculate summary statistics
  const animalsData = animals.data as Animal[] | null;
  const healthData = health.data as HealthRecord[] | null;
  const financialData = financial.data as FinancialRecord[] | null;
  const feedingData = feeding.data as FeedRecord[] | null;
  const tasksData = tasks.data as TaskRecord[] | null;

  const summary = {
    totalAnimals: animalsData?.length || 0,
    healthyAnimals: animalsData?.filter((animal) =>
      animal.health?.overallCondition === 'excellent' ||
      animal.health?.overallCondition === 'good'
    ).length || 0,
    totalHealthRecords: healthData?.length || 0,
    totalIncome: financialData?.filter((record) => record.type === 'income')
      .reduce((sum: number, record) => sum + record.amount, 0) || 0,
    totalExpenses: financialData?.filter((record) => record.type === 'expense')
      .reduce((sum: number, record) => sum + record.amount, 0) || 0,
    lowStockItems: feedingData?.filter((item) => item.currentStock <= item.minStock).length || 0,
    overdueTasks: tasksData?.filter((task) => task.status === 'overdue').length || 0,
    pendingTasks: tasksData?.filter((task) => task.status === 'pending').length || 0,
  };

  return {
    animals,
    health,
    financial,
    feeding,
    tasks,
    summary,
    loading: animals.loading || health.loading || financial.loading || feeding.loading || tasks.loading,
    error: animals.error || health.error || financial.error || feeding.error || tasks.error,
    refetch: () => {
      animals.refetch();
      health.refetch();
      financial.refetch();
      feeding.refetch();
      tasks.refetch();
    },
  };
}

// Hook for getting task statistics with KPIs
export function useTaskStats(tenantId: string) {
  const tasks = useRealTimeData({
    endpoint: 'tasks',
    params: { limit: 1000 },
    refreshInterval: 15000,
  });

  const tasksData = tasks.data as TaskRecord[] | null;

  const stats = {
    total: tasksData?.length || 0,
    pending: tasksData?.filter((task) => task.status === 'pending').length || 0,
    inProgress: tasksData?.filter((task) => task.status === 'in_progress').length || 0,
    completed: tasksData?.filter((task) => task.status === 'completed').length || 0,
    overdue: tasksData?.filter((task) => task.status === 'overdue').length || 0,
    completionRate: 0,
    averageKPI: 0,
  };

  if (tasksData && tasksData.length > 0) {
    stats.completionRate = (stats.completed / stats.total) * 100;

    // Calculate average KPI across all tasks
    const tasksWithKPI = tasksData.filter((task) => task.kpi);
    if (tasksWithKPI.length > 0) {
      const totalKPI = tasksWithKPI.reduce((sum: number, task) => {
        const kpiValues = Object.values(task.kpi || {}).filter(val => typeof val === 'number');
        const avgKPI = kpiValues.length > 0 ? kpiValues.reduce((a: number, b: number) => a + b, 0) / kpiValues.length : 0;
        return sum + avgKPI;
      }, 0);
      stats.averageKPI = totalKPI / tasksWithKPI.length;
    }
  }

  return {
    data: tasks.data,
    stats,
    loading: tasks.loading,
    error: tasks.error,
    refetch: tasks.refetch,
  };
}

// Utility function to clear cache for specific endpoint
export function clearCache(endpoint?: string, params?: Record<string, unknown>) {
  if (endpoint) {
    const cacheKey = params ? `${endpoint}:${JSON.stringify(params)}` : endpoint;
    delete globalCache[cacheKey];

    // Also clear related caches
    Object.keys(globalCache).forEach(key => {
      if (key.startsWith(endpoint)) {
        delete globalCache[key];
      }
    });
  } else {
    // Clear all cache
    Object.keys(globalCache).forEach(key => {
      delete globalCache[key];
    });
  }
}

// Utility function to get cache info
export function getCacheInfo() {
  return {
    totalEntries: Object.keys(globalCache).length,
    entries: Object.entries(globalCache).map(([key, value]) => ({
      key,
      age: Date.now() - value.timestamp,
      expiresIn: value.expiresAt - Date.now(),
    })),
  };
}