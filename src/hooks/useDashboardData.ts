'use client';

import { useMemo } from 'react';
import { useAnimalDataIntegration, useFinancialDataIntegration, useHealthDataIntegration, useTaskDataIntegration, useWeatherDataIntegration, useCrossCollectionData } from './useDataIntegration';
import { AnimalDataTransformer, FinancialDataTransformer, HealthDataTransformer, TaskDataTransformer, CrossCollectionTransformer, DataFormatter } from '@/utils/dataTransformers';
import { CrossCollectionAggregator } from '@/utils/crossCollectionAggregator';
import { useAuthStore } from '@/stores/auth-store';
import { Animal, HealthRecord, FinancialRecord } from '@/services/apiService';

// Main dashboard overview hook
export function useDashboardOverview(options?: { refreshInterval?: number; enabled?: boolean }) {
  const { user } = useAuthStore();
  const tenantId = user?._id || 'demo-farm';

  const crossCollection = useCrossCollectionData({
    tenantId,
    refreshInterval: options?.refreshInterval || 30000,
    enabled: options?.enabled,
  });

  const weather = useWeatherDataIntegration(
    user?.location?.city ? `${user.location.city}, South Africa` : 'Johannesburg, South Africa',
    {
      refreshInterval: options?.refreshInterval || 1800000, // 30 minutes for weather
      enabled: options?.enabled,
    }
  );

  // Transform data for dashboard consumption
  const dashboardData = useMemo(() => {
    if (!crossCollection.animals.data || !crossCollection.financial.data || !crossCollection.health.data || !crossCollection.tasks.data) {
      return null;
    }

    const { animals, financial, health, tasks } = crossCollection.combinedData;

    // Use cross-collection aggregator for comprehensive metrics
    const metrics = CrossCollectionAggregator.calculateCrossCollectionMetrics(
      animals || [],
      health || [],
      financial || [],
      tasks || [],
      [] // feed records would come from another hook
    );

    // Transform data for charts using transformers
    const speciesDistribution = AnimalDataTransformer.toSpeciesDistribution(animals || []);
    const healthStatusDistribution = AnimalDataTransformer.toHealthStatusDistribution(animals || []);
    const monthlyTrends = FinancialDataTransformer.toMonthlyTrends(financial || []);
    const healthSeverityDistribution = HealthDataTransformer.toSeverityDistribution(health || []);
    const taskStatusDistribution = TaskDataTransformer.toStatusDistribution(tasks || []);

    // Calculate key performance indicators
    const kpis = {
      totalAnimals: metrics.animalHealth.totalAnimals,
      healthyAnimals: metrics.animalHealth.healthyAnimals,
      animalsNeedingAttention: metrics.animalHealth.animalsNeedingAttention,
      totalRevenue: metrics.financialPerformance.totalRevenue,
      totalExpenses: metrics.financialPerformance.totalExpenses,
      netProfit: metrics.financialPerformance.netProfit,
      taskCompletionRate: metrics.operationalEfficiency.taskCompletionRate,
      overdueTasks: metrics.operationalEfficiency.overdueTasks,
      farmProductivity: metrics.overallKPIs.farmProductivity,
      sustainabilityScore: metrics.overallKPIs.sustainabilityScore,
    };

    // Generate insights and recommendations
    const insights = generateDashboardInsights(metrics, animals || [], health || [], financial || []);

    return {
      metrics,
      kpis,
      charts: {
        speciesDistribution,
        healthStatusDistribution,
        monthlyTrends,
        healthSeverityDistribution,
        taskStatusDistribution,
      },
      insights,
      lastUpdated: new Date(),
    };
  }, [crossCollection.animals.data, crossCollection.financial.data, crossCollection.health.data, crossCollection.tasks.data, crossCollection.combinedData]);

  return {
    data: dashboardData,
    loading: crossCollection.loading,
    error: crossCollection.error,
    refetch: crossCollection.refetch,
    weather: weather.data,
    weatherLoading: weather.loading,
    weatherError: weather.error,
  };
}

// Animal analytics hook for animal-specific dashboard
export function useAnimalAnalytics(options?: { refreshInterval?: number; enabled?: boolean }) {
  const { user } = useAuthStore();
  const tenantId = user?._id || 'demo-farm';

  const animals = useAnimalDataIntegration({
    tenantId,
    refreshInterval: options?.refreshInterval || 30000,
    enabled: options?.enabled,
  });

  const health = useHealthDataIntegration({
    refreshInterval: options?.refreshInterval || 30000,
    enabled: options?.enabled,
  });

  const financial = useFinancialDataIntegration({
    refreshInterval: options?.refreshInterval || 60000,
    enabled: options?.enabled,
  });

  const analyticsData = useMemo(() => {
    if (!animals.data) return null;

    // Species analysis
    const speciesDistribution = AnimalDataTransformer.toSpeciesDistribution(animals.data);
    const healthStatusDistribution = AnimalDataTransformer.toHealthStatusDistribution(animals.data);
    const weightDistribution = AnimalDataTransformer.toWeightDistribution(animals.data);
    const growthTrend = AnimalDataTransformer.toGrowthTrend(animals.data);
    const radarData = AnimalDataTransformer.toRadarChartData(animals.data);

    // Cross-collection analysis if health and financial data is available
    let relationships = null;
    let speciesPerformance = null;

    if (health.data && financial.data) {
      relationships = CrossCollectionAggregator.analyzeAnimalFinancialRelationships(
        animals.data,
        health.data,
        financial.data
      );

      speciesPerformance = CrossCollectionAggregator.analyzeSpeciesPerformance(
        animals.data,
        health.data,
        financial.data
      );
    }

    // Generate alerts and notifications
    const alerts = generateAnimalAlerts(animals.data, health.data || []);

    return {
      species: {
        distribution: speciesDistribution,
        performance: speciesPerformance,
      },
      health: {
        statusDistribution: healthStatusDistribution,
        alerts,
      },
      physical: {
        weightDistribution,
        growthTrend,
        radarData,
      },
      relationships,
      summary: animals.aggregatedData,
    };
  }, [animals.data, animals.aggregatedData, health.data, financial.data]);

  return {
    data: analyticsData,
    loading: animals.loading,
    error: animals.error,
    refetch: animals.refetch,
    lastUpdated: animals.lastUpdated,
  };
}

// Financial analytics hook for financial dashboard
export function useFinancialAnalytics(options?: { refreshInterval?: number; enabled?: boolean }) {

  const financial = useFinancialDataIntegration({
    refreshInterval: options?.refreshInterval || 60000,
    enabled: options?.enabled,
  });

  const animals = useAnimalDataIntegration({
    refreshInterval: options?.refreshInterval || 30000,
    enabled: options?.enabled,
  });

  const analyticsData = useMemo(() => {
    if (!financial.data) return null;

    // Financial charts data
    const monthlyTrends = FinancialDataTransformer.toMonthlyTrends(financial.data);
    const categoryBreakdown = FinancialDataTransformer.toCategoryBreakdown(financial.data);
    const incomeVsExpenses = FinancialDataTransformer.toIncomeVsExpenses(financial.data);

    // Cross-collection analysis if animals data is available
    let profitabilityAnalysis = null;
    if (animals.data) {
      profitabilityAnalysis = CrossCollectionAggregator.analyzeAnimalFinancialRelationships(
        animals.data,
        [], // health records not needed for this analysis
        financial.data
      );
    }

    // Financial insights
    const insights = generateFinancialInsights(financial.aggregatedData, animals.data || []);

    return {
      trends: {
        monthly: monthlyTrends,
        categories: categoryBreakdown,
        incomeVsExpenses,
      },
      analysis: {
        profitability: profitabilityAnalysis,
        insights,
      },
      summary: financial.aggregatedData,
    };
  }, [financial.data, financial.aggregatedData, animals.data]);

  return {
    data: analyticsData,
    loading: financial.loading,
    error: financial.error,
    refetch: financial.refetch,
    lastUpdated: financial.lastUpdated,
  };
}

// Health analytics hook for health dashboard
export function useHealthAnalytics(options?: { refreshInterval?: number; enabled?: boolean }) {

  const health = useHealthDataIntegration({
    refreshInterval: options?.refreshInterval || 30000,
    enabled: options?.enabled,
  });

  const animals = useAnimalDataIntegration({
    refreshInterval: options?.refreshInterval || 30000,
    enabled: options?.enabled,
  });

  const analyticsData = useMemo(() => {
    if (!health.data) return null;

    // Health charts data
    const severityDistribution = HealthDataTransformer.toSeverityDistribution(health.data);
    const costAnalysis = HealthDataTransformer.toCostAnalysis(health.data);
    const treatmentEffectiveness = HealthDataTransformer.toTreatmentEffectiveness(health.data);

    // Animal health correlation if animals data is available
    let animalHealthCorrelation = null;
    if (animals.data) {
      animalHealthCorrelation = CrossCollectionTransformer.animalsToHealthCorrelation(
        animals.data,
        health.data
      );
    }

    // Health insights and recommendations
    const insights = generateHealthInsights(health.aggregatedData, animals.data || []);

    return {
      distribution: {
        severity: severityDistribution,
        treatments: treatmentEffectiveness,
      },
      costs: {
        analysis: costAnalysis,
      },
      correlations: {
        animalHealth: animalHealthCorrelation,
      },
      insights,
      summary: health.aggregatedData,
    };
  }, [health.data, health.aggregatedData, animals.data]);

  return {
    data: analyticsData,
    loading: health.loading,
    error: health.error,
    refetch: health.refetch,
    lastUpdated: health.lastUpdated,
  };
}

// Task analytics hook for task management dashboard
export function useTaskAnalytics(options?: { refreshInterval?: number; enabled?: boolean }) {

  const tasks = useTaskDataIntegration({
    refreshInterval: options?.refreshInterval || 15000,
    enabled: options?.enabled,
  });

  const animals = useAnimalDataIntegration({
    refreshInterval: options?.refreshInterval || 30000,
    enabled: options?.enabled,
  });

  const analyticsData = useMemo(() => {
    if (!tasks.data) return null;

    // Task charts data
    const statusDistribution = TaskDataTransformer.toStatusDistribution(tasks.data);
    const priorityDistribution = TaskDataTransformer.toPriorityDistribution(tasks.data);
    const completionTrend = TaskDataTransformer.toCompletionTrend(tasks.data);

    // Task impact analysis if animals data is available
    let taskImpactAnalysis = null;
    if (animals.data) {
      taskImpactAnalysis = generateTaskImpactAnalysis(tasks.data, animals.data);
    }

    // Task insights
    const insights = generateTaskInsights(tasks.aggregatedData);

    return {
      distribution: {
        status: statusDistribution,
        priority: priorityDistribution,
        completion: completionTrend,
      },
      impact: taskImpactAnalysis,
      insights,
      summary: tasks.aggregatedData,
    };
  }, [tasks.data, tasks.aggregatedData, animals.data]);

  return {
    data: analyticsData,
    loading: tasks.loading,
    error: tasks.error,
    refetch: tasks.refetch,
    lastUpdated: tasks.lastUpdated,
  };
}

// Breeding analytics hook
export function useBreedingAnalytics(options?: { refreshInterval?: number; enabled?: boolean }) {

  const animals = useAnimalDataIntegration({
    refreshInterval: options?.refreshInterval || 30000,
    enabled: options?.enabled,
  });

  const breedingData = useMemo(() => {
    if (!animals.data) return null;

    // Filter breeding stock
    const breedingAnimals = animals.data.filter(animal => animal.breeding?.isBreedingStock);

    // Calculate breeding metrics
    const breedingMetrics = {
      totalBreedingStock: breedingAnimals.length,
      fertileAnimals: breedingAnimals.filter(a => a.breeding?.fertilityStatus === 'fertile').length,
      infertileAnimals: breedingAnimals.filter(a => a.breeding?.fertilityStatus === 'infertile').length,
      bySpecies: breedingAnimals.reduce((acc, animal) => {
        acc[animal.species] = (acc[animal.species] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    // Generate breeding insights
    const insights = generateBreedingInsights(breedingMetrics, breedingAnimals);

    return {
      metrics: breedingMetrics,
      animals: breedingAnimals,
      insights,
      summary: {
        total: breedingAnimals.length,
        fertilityRate: breedingAnimals.length > 0 ?
          (breedingMetrics.fertileAnimals / breedingAnimals.length) * 100 : 0,
      },
    };
  }, [animals.data]);

  return {
    data: breedingData,
    loading: animals.loading,
    error: animals.error,
    refetch: animals.refetch,
    lastUpdated: animals.lastUpdated,
  };
}

// Feed analytics hook
export function useFeedAnalytics(options?: { refreshInterval?: number; enabled?: boolean }) {

  // For now, we'll simulate feed data since we don't have a feed integration hook
  // In a real implementation, this would use useFeedDataIntegration

  const animals = useAnimalDataIntegration({
    refreshInterval: options?.refreshInterval || 30000,
    enabled: options?.enabled,
  });

  const feedData = useMemo(() => {
    if (!animals.data) return null;

    // Calculate feed requirements based on animals
    const feedRequirements = calculateFeedRequirements(animals.data);

    // Generate feed alerts
    const alerts = generateFeedAlerts(feedRequirements);

    return {
      requirements: feedRequirements,
      alerts,
      summary: {
        totalDailyRequirement: feedRequirements.reduce((sum, req) => sum + req.dailyRequirement, 0),
        lowStockItems: feedRequirements.filter(req => req.status === 'low').length,
        totalCost: feedRequirements.reduce((sum, req) => sum + req.estimatedCost, 0),
      },
    };
  }, [animals.data]);

  return {
    data: feedData,
    loading: animals.loading,
    error: animals.error,
    refetch: animals.refetch,
    lastUpdated: animals.lastUpdated,
  };
}

// Utility functions for generating insights
interface DashboardMetrics {
  animalHealth: {
    totalAnimals: number;
    healthyAnimals: number;
    animalsNeedingAttention: number;
  };
  financialPerformance: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
  };
  operationalEfficiency: {
    taskCompletionRate: number;
    overdueTasks: number;
  };
  overallKPIs: {
    farmProductivity: number;
    sustainabilityScore: number;
  };
}

function generateDashboardInsights(
  metrics: DashboardMetrics,
  animals: Animal[],
  health: HealthRecord[],
  financial: FinancialRecord[]
): Array<{ type: 'info' | 'warning' | 'success'; title: string; description: string }> {
  const insights = [];

  // Animal health insights
  if (metrics.animalHealth.animalsNeedingAttention > 0) {
    insights.push({
      type: 'warning' as const,
      title: 'Animals Need Attention',
      description: `${metrics.animalHealth.animalsNeedingAttention} animals require immediate attention for health issues.`,
    });
  }

  if (metrics.animalHealth.healthyAnimals / metrics.animalHealth.totalAnimals > 0.8) {
    insights.push({
      type: 'success' as const,
      title: 'Excellent Herd Health',
      description: `Over 80% of your animals are in good or excellent health condition.`,
    });
  }

  // Financial insights
  if (metrics.financialPerformance.netProfit > 0) {
    insights.push({
      type: 'success' as const,
      title: 'Profitable Month',
      description: `Your farm generated R${DataFormatter.formatCurrency(metrics.financialPerformance.netProfit)} in profit this month.`,
    });
  } else {
    insights.push({
      type: 'warning' as const,
      title: 'Negative Cash Flow',
      description: `Review expenses to improve profitability.`,
    });
  }

  // Operational insights
  if (metrics.operationalEfficiency.taskCompletionRate < 70) {
    insights.push({
      type: 'warning' as const,
      title: 'Low Task Completion',
      description: `Only ${metrics.operationalEfficiency.taskCompletionRate.toFixed(1)}% of tasks are being completed on time.`,
    });
  }

  return insights;
}

function generateAnimalAlerts(animals: Animal[], healthRecords: HealthRecord[]): Array<{ type: 'warning' | 'error' | 'info'; message: string; animalId?: string }> {
  const alerts: Array<{ type: 'warning' | 'error' | 'info'; message: string; animalId?: string }> = [];

  // Check for animals needing health checkups
  animals.forEach(animal => {
    if (animal.health?.nextCheckup) {
      const nextCheckup = new Date(animal.health.nextCheckup);
      const now = new Date();
      const daysUntilCheckup = Math.ceil((nextCheckup.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilCheckup <= 7) {
        alerts.push({
          type: daysUntilCheckup <= 0 ? 'error' : 'warning',
          message: `${animal.name || animal.rfidTag} ${daysUntilCheckup <= 0 ? 'is overdue' : 'is due'} for a health checkup ${daysUntilCheckup <= 0 ? Math.abs(daysUntilCheckup) + ' days ago' : 'in ' + daysUntilCheckup + ' days'}.`,
          animalId: animal._id,
        });
      }
    }
  });

  // Check for critical health issues
  healthRecords.forEach(record => {
    if (record.severity === 'critical' && record.status !== 'resolved') {
      alerts.push({
        type: 'error',
        message: `Critical health issue: ${record.diagnosis} for animal ${record.animalRfid}`,
        animalId: record.animalId,
      });
    }
  });

  return alerts;
}

interface FinancialAggregatedData {
  profitMargin?: number;
  netProfit?: number;
}

function generateFinancialInsights(aggregatedData: FinancialAggregatedData | null, animals: Animal[]): Array<{ type: 'info' | 'warning' | 'success'; title: string; description: string }> {
  const insights: Array<{ type: 'info' | 'warning' | 'success'; title: string; description: string }> = [];

  if (aggregatedData) {
    if (aggregatedData.profitMargin && aggregatedData.profitMargin > 20) {
      insights.push({
        type: 'success',
        title: 'Strong Profit Margin',
        description: `Your farm has a healthy ${aggregatedData.profitMargin.toFixed(1)}% profit margin.`,
      });
    }

    if (aggregatedData.netProfit && aggregatedData.netProfit > 0) {
      insights.push({
        type: 'success',
        title: 'Positive Cash Flow',
        description: `Monthly profit of R${DataFormatter.formatCurrency(aggregatedData.netProfit)} indicates good financial health.`,
      });
    }
  }

  return insights;
}

interface HealthAggregatedData {
  resolvedCases?: number;
  totalRecords?: number;
  pendingFollowUps?: number;
}

function generateHealthInsights(aggregatedData: HealthAggregatedData | null, animals: Animal[]): Array<{ type: 'info' | 'warning' | 'success'; title: string; description: string }> {
  const insights: Array<{ type: 'info' | 'warning' | 'success'; title: string; description: string }> = [];

  if (aggregatedData) {
    if (aggregatedData.resolvedCases && aggregatedData.totalRecords &&
        aggregatedData.resolvedCases / Math.max(aggregatedData.totalRecords, 1) > 0.8) {
      insights.push({
        type: 'success',
        title: 'Effective Treatment',
        description: `${((aggregatedData.resolvedCases / aggregatedData.totalRecords) * 100).toFixed(1)}% of health issues are being resolved successfully.`,
      });
    }

    if (aggregatedData.pendingFollowUps && aggregatedData.pendingFollowUps > 0) {
      insights.push({
        type: 'warning',
        title: 'Pending Follow-ups',
        description: `${aggregatedData.pendingFollowUps} health records require follow-up attention.`,
      });
    }
  }

  return insights;
}

interface TaskAggregatedData {
  completionRate?: number;
  overdueCount?: number;
}

function generateTaskInsights(aggregatedData: TaskAggregatedData | null): Array<{ type: 'info' | 'warning' | 'success'; title: string; description: string }> {
  const insights: Array<{ type: 'info' | 'warning' | 'success'; title: string; description: string }> = [];

  if (aggregatedData) {
    if (aggregatedData.completionRate && aggregatedData.completionRate > 80) {
      insights.push({
        type: 'success',
        title: 'High Task Completion',
        description: `${aggregatedData.completionRate.toFixed(1)}% of tasks are completed successfully.`,
      });
    }

    if (aggregatedData.overdueCount && aggregatedData.overdueCount > 0) {
      insights.push({
        type: 'warning',
        title: 'Overdue Tasks',
        description: `${aggregatedData.overdueCount} tasks are overdue and need immediate attention.`,
      });
    }
  }

  return insights;
}

interface BreedingMetrics {
  fertilityRate?: number;
  infertileAnimals?: number;
}

function generateBreedingInsights(metrics: BreedingMetrics | null, animals: Animal[]): Array<{ type: 'info' | 'warning' | 'success'; title: string; description: string }> {
  const insights: Array<{ type: 'info' | 'warning' | 'success'; title: string; description: string }> = [];

  if (metrics && metrics.fertilityRate && metrics.fertilityRate > 80) {
    insights.push({
      type: 'success',
      title: 'High Fertility Rate',
      description: `${metrics.fertilityRate.toFixed(1)}% of breeding stock is fertile.`,
    });
  }

  if (metrics && metrics.infertileAnimals && metrics.infertileAnimals > 0) {
    insights.push({
      type: 'warning',
      title: 'Infertile Animals',
      description: `${metrics.infertileAnimals} breeding animals are marked as infertile and may need veterinary attention.`,
    });
  }

  return insights;
}

function calculateFeedRequirements(animals: Animal[]): Array<{
  species: string;
  dailyRequirement: number;
  estimatedCost: number;
  status: 'optimal' | 'low' | 'critical';
}> {
  const speciesRequirements: Record<string, { count: number; dailyPerAnimal: number; costPerKg: number }> = {
    cattle: { count: 0, dailyPerAnimal: 15, costPerKg: 8 },
    sheep: { count: 0, dailyPerAnimal: 2, costPerKg: 12 },
    goats: { count: 0, dailyPerAnimal: 3, costPerKg: 10 },
    poultry: { count: 0, dailyPerAnimal: 0.15, costPerKg: 15 },
    pigs: { count: 0, dailyPerAnimal: 4, costPerKg: 9 },
    other: { count: 0, dailyPerAnimal: 5, costPerKg: 10 },
  };

  animals.forEach(animal => {
    if (speciesRequirements[animal.species]) {
      speciesRequirements[animal.species].count++;
    }
  });

  return Object.entries(speciesRequirements).map(([species, data]) => {
    const dailyRequirement = data.count * data.dailyPerAnimal;
    const estimatedCost = dailyRequirement * data.costPerKg;

    // Simulate stock status (in real implementation, this would check actual feed inventory)
    const status = Math.random() > 0.8 ? 'low' : Math.random() > 0.95 ? 'critical' : 'optimal';

    return {
      species,
      dailyRequirement,
      estimatedCost,
      status,
    };
  });
}

function generateFeedAlerts(requirements: Array<{
  species: string;
  dailyRequirement: number;
  estimatedCost: number;
  status: 'optimal' | 'low' | 'critical';
}>): Array<{ type: 'warning' | 'error'; message: string }> {
  return requirements
    .filter(req => req.status === 'low' || req.status === 'critical')
    .map(req => ({
      type: req.status === 'critical' ? 'error' as const : 'warning' as const,
      message: `${req.species} feed is running ${req.status} - daily requirement: ${req.dailyRequirement.toFixed(1)}kg`,
    }));
}

interface Task {
  _id?: string;
  category?: string;
  description?: string;
  name?: string;
  rfidTag?: string;
}

function generateTaskImpactAnalysis(tasks: Task[], animals: Animal[]): Array<{
  task: Task;
  impactedAnimals: Animal[];
  healthImpact: 'positive' | 'negative' | 'neutral';
}> {
  return tasks.map(task => {
    let impactedAnimals: Animal[] = [];
    let healthImpact: 'positive' | 'negative' | 'neutral' = 'neutral';

    // Determine impact based on task category
    switch (task.category) {
      case 'health':
        healthImpact = 'positive';
        impactedAnimals = animals.filter(animal => {
          return task.description?.toLowerCase().includes(animal.name?.toLowerCase() || '') ||
                 task.description?.toLowerCase().includes(animal.rfidTag?.toLowerCase() || '');
        });
        break;

      case 'feeding':
        healthImpact = 'positive';
        impactedAnimals = animals;
        break;

      case 'maintenance':
        healthImpact = 'positive';
        impactedAnimals = animals;
        break;

      default:
        healthImpact = 'neutral';
    }

    return {
      task,
      impactedAnimals,
      healthImpact,
    };
  }).filter(result => result.impactedAnimals.length > 0);
}