'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiService, Animal, HealthRecord, FinancialRecord, TaskRecord } from '@/services/apiService';
import { useAuthStore } from '@/stores/auth-store';

// Types for data integration
export interface DataIntegrationOptions {
  tenantId?: string;
  refreshInterval?: number;
  enabled?: boolean;
  cacheTimeout?: number;
}

export interface DataIntegrationResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
  isStale: boolean;
}

export interface AggregatedAnimalData {
  total: number;
  bySpecies: Record<string, number>;
  byHealthStatus: Record<string, number>;
  averageWeight: number;
  averageAge: number;
  healthyPercentage: number;
  recentActivities: number;
  alerts: number;
}

export interface AggregatedFinancialData {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  monthlyTrends: Array<{
    month: string;
    income: number;
    expenses: number;
    profit: number;
  }>;
  categoryBreakdown: Record<string, number>;
}

export interface AggregatedHealthData {
  totalRecords: number;
  bySeverity: Record<string, number>;
  byCondition: Record<string, number>;
  averageCost: number;
  resolvedCases: number;
  pendingFollowUps: number;
}

export interface AggregatedTaskData {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
  completionRate: number;
  overdueCount: number;
  averageCompletionTime: number;
}

// Enhanced animal data integration hook
export function useAnimalDataIntegration(options: DataIntegrationOptions = {}) {
  const { user } = useAuthStore();
  const tenantId = options.tenantId || user?._id || 'demo-farm';

  const [data, setData] = useState<Animal[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAnimals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getAnimals({
        limit: 1000,
        // Add tenant filtering if needed
      });

      if (response.success) {
        setData(response.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(response.error || 'Failed to fetch animals');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch animals';
      setError(errorMessage);
      console.error('Animal data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (options.enabled !== false) {
      fetchAnimals();
    }
  }, [fetchAnimals, options.enabled, tenantId]);

  // Set up refresh interval
  useEffect(() => {
    if (!options.refreshInterval || options.enabled === false) return;

    const interval = setInterval(fetchAnimals, options.refreshInterval);
    return () => clearInterval(interval);
  }, [options.refreshInterval, fetchAnimals, options.enabled]);

  // Calculate aggregated data
  const aggregatedData = useMemo((): AggregatedAnimalData | null => {
    if (!data) return null;

    const bySpecies: Record<string, number> = {};
    const byHealthStatus: Record<string, number> = {};
    let totalWeight = 0;
    let totalAge = 0;
    let healthyCount = 0;

    data.forEach(animal => {
      // Count by species
      bySpecies[animal.species] = (bySpecies[animal.species] || 0) + 1;

      // Count by health status
      const healthStatus = animal.health?.overallCondition || 'unknown';
      byHealthStatus[healthStatus] = (byHealthStatus[healthStatus] || 0) + 1;

      // Calculate totals for averages
      totalWeight += animal.weight || 0;

      // Calculate age (simplified)
      const birthDate = new Date(animal.dateOfBirth);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      totalAge += age;

      // Count healthy animals
      if (healthStatus === 'excellent' || healthStatus === 'good') {
        healthyCount++;
      }
    });

    const total = data.length;
    const averageWeight = total > 0 ? totalWeight / total : 0;
    const averageAge = total > 0 ? totalAge / total : 0;
    const healthyPercentage = total > 0 ? (healthyCount / total) * 100 : 0;

    return {
      total,
      bySpecies,
      byHealthStatus,
      averageWeight,
      averageAge,
      healthyPercentage,
      recentActivities: data.filter(a => {
        const createdAt = new Date(a.createdAt);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return createdAt >= weekAgo;
      }).length,
      alerts: data.reduce((sum, a) => sum + (a.alerts?.length || 0), 0),
    };
  }, [data]);

  return {
    data,
    aggregatedData,
    loading,
    error,
    refetch: fetchAnimals,
    lastUpdated,
    isStale: lastUpdated ? Date.now() - lastUpdated.getTime() > (options.cacheTimeout || 300000) : true,
  };
}

// Enhanced financial data integration hook
export function useFinancialDataIntegration(options: DataIntegrationOptions = {}) {
  const [data, setData] = useState<FinancialRecord[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchFinancial = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getFinancialRecords({
        limit: 1000,
      });

      if (response.success) {
        setData(response.data as FinancialRecord[]);
        setLastUpdated(new Date());
      } else {
        throw new Error(response.error || 'Failed to fetch financial records');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch financial data';
      setError(errorMessage);
      console.error('Financial data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (options.enabled !== false) {
      fetchFinancial();
    }
  }, [fetchFinancial, options.enabled]);

  // Set up refresh interval
  useEffect(() => {
    if (!options.refreshInterval || options.enabled === false) return;

    const interval = setInterval(fetchFinancial, options.refreshInterval);
    return () => clearInterval(interval);
  }, [options.refreshInterval, fetchFinancial, options.enabled]);

  // Calculate aggregated financial data
  const aggregatedData = useMemo((): AggregatedFinancialData | null => {
    if (!data) return null;

    const totalIncome = data
      .filter(record => record.type === 'income')
      .reduce((sum, record) => sum + record.amount, 0);

    const totalExpenses = data
      .filter(record => record.type === 'expense')
      .reduce((sum, record) => sum + record.amount, 0);

    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    // Group by category
    const categoryBreakdown: Record<string, number> = {};
    data.forEach(record => {
      categoryBreakdown[record.category] = (categoryBreakdown[record.category] || 0) + record.amount;
    });

    // Calculate monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      const monthData = data.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === date.getMonth() &&
               recordDate.getFullYear() === date.getFullYear();
      });

      const income = monthData
        .filter(r => r.type === 'income')
        .reduce((sum, r) => sum + r.amount, 0);

      const expenses = monthData
        .filter(r => r.type === 'expense')
        .reduce((sum, r) => sum + r.amount, 0);

      monthlyTrends.push({
        month: monthName,
        income,
        expenses,
        profit: income - expenses,
      });
    }

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      monthlyTrends,
      categoryBreakdown,
    };
  }, [data]);

  return {
    data,
    aggregatedData,
    loading,
    error,
    refetch: fetchFinancial,
    lastUpdated,
    isStale: lastUpdated ? Date.now() - lastUpdated.getTime() > (options.cacheTimeout || 600000) : true,
  };
}

// Enhanced health data integration hook
export function useHealthDataIntegration(options: DataIntegrationOptions = {}) {
  const [data, setData] = useState<HealthRecord[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getHealthRecords({
        limit: 1000,
      });

      if (response.success) {
        setData(response.data as HealthRecord[]);
        setLastUpdated(new Date());
      } else {
        throw new Error(response.error || 'Failed to fetch health records');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch health data';
      setError(errorMessage);
      console.error('Health data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (options.enabled !== false) {
      fetchHealth();
    }
  }, [fetchHealth, options.enabled]);

  // Set up refresh interval
  useEffect(() => {
    if (!options.refreshInterval || options.enabled === false) return;

    const interval = setInterval(fetchHealth, options.refreshInterval);
    return () => clearInterval(interval);
  }, [options.refreshInterval, fetchHealth, options.enabled]);

  // Calculate aggregated health data
  const aggregatedData = useMemo((): AggregatedHealthData | null => {
    if (!data) return null;

    const bySeverity: Record<string, number> = {};
    const byCondition: Record<string, number> = {};
    let totalCost = 0;
    let resolvedCases = 0;
    let pendingFollowUps = 0;

    data.forEach(record => {
      // Count by severity
      bySeverity[record.severity] = (bySeverity[record.severity] || 0) + 1;

      // Count by condition
      byCondition[record.diagnosis] = (byCondition[record.diagnosis] || 0) + 1;

      // Calculate total cost
      totalCost += record.cost?.totalCost || 0;

      // Count resolved cases
      if (record.status === 'resolved') {
        resolvedCases++;
      }

      // Count pending follow-ups
      if (record.followUp?.required && !record.followUp.date) {
        pendingFollowUps++;
      }
    });

    return {
      totalRecords: data.length,
      bySeverity,
      byCondition,
      averageCost: data.length > 0 ? totalCost / data.length : 0,
      resolvedCases,
      pendingFollowUps,
    };
  }, [data]);

  return {
    data,
    aggregatedData,
    loading,
    error,
    refetch: fetchHealth,
    lastUpdated,
    isStale: lastUpdated ? Date.now() - lastUpdated.getTime() > (options.cacheTimeout || 300000) : true,
  };
}

// Enhanced task data integration hook
export function useTaskDataIntegration(options: DataIntegrationOptions = {}) {
  const [data, setData] = useState<TaskRecord[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getTasks({
        limit: 1000,
      });

      if (response.success) {
        setData(response.data as TaskRecord[]);
        setLastUpdated(new Date());
      } else {
        throw new Error(response.error || 'Failed to fetch tasks');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks';
      setError(errorMessage);
      console.error('Task data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (options.enabled !== false) {
      fetchTasks();
    }
  }, [fetchTasks, options.enabled]);

  // Set up refresh interval
  useEffect(() => {
    if (!options.refreshInterval || options.enabled === false) return;

    const interval = setInterval(fetchTasks, options.refreshInterval);
    return () => clearInterval(interval);
  }, [options.refreshInterval, fetchTasks, options.enabled]);

  // Calculate aggregated task data
  const aggregatedData = useMemo((): AggregatedTaskData | null => {
    if (!data) return null;

    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    let completedCount = 0;
    let overdueCount = 0;
    let totalCompletionTime = 0;
    let completedWithTime = 0;

    data.forEach(task => {
      // Count by status
      byStatus[task.status] = (byStatus[task.status] || 0) + 1;

      // Count by priority
      byPriority[task.priority] = (byPriority[task.priority] || 0) + 1;

      // Count by category
      byCategory[task.category] = (byCategory[task.category] || 0) + 1;

      // Count completed tasks
      if (task.status === 'completed') {
        completedCount++;

        // Calculate completion time if available
        if (task.completedDate && task.createdAt) {
          const createdDate = new Date(task.createdAt);
          const completedDate = new Date(task.completedDate);
          const completionTime = completedDate.getTime() - createdDate.getTime();
          totalCompletionTime += completionTime;
          completedWithTime++;
        }
      }

      // Count overdue tasks
      if (task.status === 'overdue') {
        overdueCount++;
      }
    });

    const total = data.length;
    const completionRate = total > 0 ? (completedCount / total) * 100 : 0;
    const averageCompletionTime = completedWithTime > 0 ? totalCompletionTime / completedWithTime : 0;

    return {
      total,
      byStatus,
      byPriority,
      byCategory,
      completionRate,
      overdueCount,
      averageCompletionTime,
    };
  }, [data]);

  return {
    data,
    aggregatedData,
    loading,
    error,
    refetch: fetchTasks,
    lastUpdated,
    isStale: lastUpdated ? Date.now() - lastUpdated.getTime() > (options.cacheTimeout || 150000) : true,
  };
}

// Weather data integration hook
export interface WeatherData {
  location: {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    condition: string;
    icon: string;
  };
}

export function useWeatherDataIntegration(location?: string, options: DataIntegrationOptions = {}) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchWeather = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const locationToUse = location || 'Johannesburg,South Africa';
      const response = await apiService.getWeather(locationToUse);

      if (response.success) {
        setData(response.data as WeatherData);
        setLastUpdated(new Date());
      } else {
        throw new Error(response.error || 'Failed to fetch weather data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setError(errorMessage);
      console.error('Weather data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    if (options.enabled !== false) {
      fetchWeather();
    }
  }, [fetchWeather, options.enabled]);

  // Set up refresh interval (weather doesn't change as frequently)
  useEffect(() => {
    if (!options.refreshInterval || options.enabled === false) return;

    const interval = setInterval(fetchWeather, options.refreshInterval);
    return () => clearInterval(interval);
  }, [options.refreshInterval, fetchWeather, options.enabled]);

  return {
    data,
    loading,
    error,
    refetch: fetchWeather,
    lastUpdated,
    isStale: lastUpdated ? Date.now() - lastUpdated.getTime() > (options.cacheTimeout || 1800000) : true, // 30 minutes for weather
  };
}

// Cross-collection data integration hook
export function useCrossCollectionData(options: DataIntegrationOptions = {}) {
  const animals = useAnimalDataIntegration(options);
  const financial = useFinancialDataIntegration(options);
  const health = useHealthDataIntegration(options);
  const tasks = useTaskDataIntegration(options);

  // Combine all data for cross-collection analysis
  const combinedData = useMemo(() => {
    return {
      animals: animals.data,
      financial: financial.data,
      health: health.data,
      tasks: tasks.data,
    };
  }, [animals.data, financial.data, health.data, tasks.data]);

  // Calculate cross-collection KPIs
  const crossCollectionKPIs = useMemo(() => {
    if (!combinedData.animals || !combinedData.financial || !combinedData.health) {
      return null;
    }

    const totalAnimals = combinedData.animals.length;
    const totalIncome = combinedData.financial
      .filter(r => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = combinedData.financial
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0);
    const totalHealthCost = combinedData.health
      .reduce((sum, r) => sum + (r.cost?.totalCost || 0), 0);

    return {
      revenuePerAnimal: totalAnimals > 0 ? totalIncome / totalAnimals : 0,
      healthCostPerAnimal: totalAnimals > 0 ? totalHealthCost / totalAnimals : 0,
      profitPerAnimal: totalAnimals > 0 ? (totalIncome - totalExpenses) / totalAnimals : 0,
      healthToRevenueRatio: totalIncome > 0 ? (totalHealthCost / totalIncome) * 100 : 0,
    };
  }, [combinedData]);

  return {
    animals,
    financial,
    health,
    tasks,
    combinedData,
    crossCollectionKPIs,
    loading: animals.loading || financial.loading || health.loading || tasks.loading,
    error: animals.error || financial.error || health.error || tasks.error,
    refetch: () => {
      animals.refetch();
      financial.refetch();
      health.refetch();
      tasks.refetch();
    },
    lastUpdated: animals.lastUpdated || financial.lastUpdated || health.lastUpdated || tasks.lastUpdated,
  };
}