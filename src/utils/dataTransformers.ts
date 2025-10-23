'use client';

import { Animal, HealthRecord, FinancialRecord, TaskRecord, FeedRecord } from '@/services/apiService';

// Chart data interfaces
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, unknown>;
}

export interface TimeSeriesPoint {
  timestamp: string | Date;
  value: number;
  label?: string;
  metadata?: Record<string, unknown>;
}

export interface RadarDataPoint {
  label: string;
  values: number[];
  metadata?: Record<string, unknown>;
}

export interface ScatterPlotPoint {
  x: number;
  y: number;
  label?: string;
  color?: string;
  size?: number;
  metadata?: Record<string, unknown>;
}

// Animal data transformers
export class AnimalDataTransformer {
  static toSpeciesDistribution(animals: Animal[]): ChartDataPoint[] {
    const speciesCount: Record<string, number> = {};

    animals.forEach(animal => {
      speciesCount[animal.species] = (speciesCount[animal.species] || 0) + 1;
    });

    const speciesColors: Record<string, string> = {
      cattle: '#10B981',
      sheep: '#3B82F6',
      goats: '#8B5CF6',
      poultry: '#F59E0B',
      pigs: '#EF4444',
      other: '#6B7280',
    };

    return Object.entries(speciesCount).map(([species, count]) => ({
      label: species.charAt(0).toUpperCase() + species.slice(1),
      value: count,
      color: speciesColors[species] || '#6B7280',
      metadata: {
        species,
        percentage: animals.length > 0 ? (count / animals.length) * 100 : 0,
      },
    }));
  }

  static toHealthStatusDistribution(animals: Animal[]): ChartDataPoint[] {
    const healthCount: Record<string, number> = {};

    animals.forEach(animal => {
      const status = animal.health?.overallCondition || 'unknown';
      healthCount[status] = (healthCount[status] || 0) + 1;
    });

    const healthColors: Record<string, string> = {
      excellent: '#10B981',
      good: '#3B82F6',
      fair: '#F59E0B',
      poor: '#EF4444',
      critical: '#DC2626',
      unknown: '#6B7280',
    };

    return Object.entries(healthCount).map(([status, count]) => ({
      label: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: healthColors[status] || '#6B7280',
      metadata: {
        status,
        percentage: animals.length > 0 ? (count / animals.length) * 100 : 0,
      },
    }));
  }

  static toWeightDistribution(animals: Animal[]): ChartDataPoint[] {
    const weightRanges = [
      { range: '0-100kg', min: 0, max: 100 },
      { range: '100-200kg', min: 100, max: 200 },
      { range: '200-300kg', min: 200, max: 300 },
      { range: '300-400kg', min: 300, max: 400 },
      { range: '400-500kg', min: 400, max: 500 },
      { range: '500kg+', min: 500, max: Infinity },
    ];

    const distribution: Record<string, number> = {};

    weightRanges.forEach(({ range }) => {
      distribution[range] = 0;
    });

    animals.forEach(animal => {
      const weight = animal.weight || 0;
      const range = weightRanges.find(r => weight >= r.min && weight < r.max);
      if (range) {
        distribution[range.range]++;
      }
    });

    return Object.entries(distribution).map(([range, count]) => ({
      label: range,
      value: count,
      color: '#3B82F6',
      metadata: {
        range,
        percentage: animals.length > 0 ? (count / animals.length) * 100 : 0,
      },
    }));
  }

  static toGrowthTrend(animals: Animal[]): TimeSeriesPoint[] {
    // Group animals by age and calculate average weight
    const ageGroups: Record<number, { totalWeight: number; count: number }> = {};

    animals.forEach(animal => {
      const birthDate = new Date(animal.dateOfBirth);
      const ageInMonths = Math.floor((Date.now() - birthDate.getTime()) / (30 * 24 * 60 * 60 * 1000));

      if (!ageGroups[ageInMonths]) {
        ageGroups[ageInMonths] = { totalWeight: 0, count: 0 };
      }

      ageGroups[ageInMonths].totalWeight += animal.weight || 0;
      ageGroups[ageInMonths].count++;
    });

    return Object.entries(ageGroups)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([age, data]) => ({
        timestamp: new Date(Date.now() - parseInt(age) * 30 * 24 * 60 * 60 * 1000),
        value: data.count > 0 ? data.totalWeight / data.count : 0,
        label: `${age} months`,
        metadata: {
          ageInMonths: parseInt(age),
          sampleSize: data.count,
        },
      }));
  }

  static toRadarChartData(animals: Animal[]): RadarDataPoint[] {
    // Group by species for radar chart
    const speciesData: Record<string, { weights: number[]; ages: number[]; healthScores: number[] }> = {};

    animals.forEach(animal => {
      if (!speciesData[animal.species]) {
        speciesData[animal.species] = { weights: [], ages: [], healthScores: [] };
      }

      speciesData[animal.species].weights.push(animal.weight || 0);

      const age = Math.floor((Date.now() - new Date(animal.dateOfBirth).getTime()) / (365 * 24 * 60 * 60 * 1000));
      speciesData[animal.species].ages.push(age);

      // Convert health status to score
      const healthScore = this.healthStatusToScore(animal.health?.overallCondition || 'unknown');
      speciesData[animal.species].healthScores.push(healthScore);
    });

    return Object.entries(speciesData).map(([species, data]) => ({
      label: species.charAt(0).toUpperCase() + species.slice(1),
      values: [
        data.weights.length > 0 ? data.weights.reduce((a, b) => a + b, 0) / data.weights.length : 0,
        data.ages.length > 0 ? data.ages.reduce((a, b) => a + b, 0) / data.ages.length : 0,
        data.healthScores.length > 0 ? data.healthScores.reduce((a, b) => a + b, 0) / data.healthScores.length : 0,
      ],
      metadata: {
        species,
        count: animals.filter(a => a.species === species).length,
      },
    }));
  }

  private static healthStatusToScore(status: string): number {
    const scores: Record<string, number> = {
      excellent: 100,
      good: 80,
      fair: 60,
      poor: 40,
      critical: 20,
      unknown: 50,
    };
    return scores[status] || 50;
  }
}

// Financial data transformers
export class FinancialDataTransformer {
  static toMonthlyTrends(financialRecords: FinancialRecord[]): TimeSeriesPoint[] {
    const monthlyData: Record<string, { income: number; expenses: number }> = {};

    financialRecords.forEach(record => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }

      if (record.type === 'income') {
        monthlyData[monthKey].income += record.amount;
      } else {
        monthlyData[monthKey].expenses += record.amount;
      }
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, data]) => ({
        timestamp: new Date(monthKey + '-01'),
        value: data.income - data.expenses,
        label: new Date(monthKey + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        metadata: {
          income: data.income,
          expenses: data.expenses,
          profit: data.income - data.expenses,
        },
      }));
  }

  static toCategoryBreakdown(financialRecords: FinancialRecord[]): ChartDataPoint[] {
    const categoryTotals: Record<string, { income: number; expenses: number }> = {};

    financialRecords.forEach(record => {
      if (!categoryTotals[record.category]) {
        categoryTotals[record.category] = { income: 0, expenses: 0 };
      }

      if (record.type === 'income') {
        categoryTotals[record.category].income += record.amount;
      } else {
        categoryTotals[record.category].expenses += record.amount;
      }
    });

    return Object.entries(categoryTotals).map(([category, data]) => ({
      label: category.charAt(0).toUpperCase() + category.slice(1),
      value: Math.abs(data.income - data.expenses),
      color: data.income > data.expenses ? '#10B981' : '#EF4444',
      metadata: {
        category,
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses,
      },
    }));
  }

  static toIncomeVsExpenses(financialRecords: FinancialRecord[]): ChartDataPoint[] {
    const totalIncome = financialRecords
      .filter(r => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0);

    const totalExpenses = financialRecords
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0);

    return [
      {
        label: 'Income',
        value: totalIncome,
        color: '#10B981',
        metadata: { type: 'income', amount: totalIncome },
      },
      {
        label: 'Expenses',
        value: totalExpenses,
        color: '#EF4444',
        metadata: { type: 'expense', amount: totalExpenses },
      },
    ];
  }
}

// Health data transformers
export class HealthDataTransformer {
  static toSeverityDistribution(healthRecords: HealthRecord[]): ChartDataPoint[] {
    const severityCount: Record<string, number> = {};

    healthRecords.forEach(record => {
      severityCount[record.severity] = (severityCount[record.severity] || 0) + 1;
    });

    const severityColors: Record<string, string> = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
      critical: '#DC2626',
    };

    return Object.entries(severityCount).map(([severity, count]) => ({
      label: severity.charAt(0).toUpperCase() + severity.slice(1),
      value: count,
      color: severityColors[severity] || '#6B7280',
      metadata: {
        severity,
        percentage: healthRecords.length > 0 ? (count / healthRecords.length) * 100 : 0,
      },
    }));
  }

  static toCostAnalysis(healthRecords: HealthRecord[]): TimeSeriesPoint[] {
    const monthlyCosts: Record<string, number> = {};

    healthRecords.forEach(record => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      monthlyCosts[monthKey] = (monthlyCosts[monthKey] || 0) + (record.cost?.totalCost || 0);
    });

    return Object.entries(monthlyCosts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, cost]) => ({
        timestamp: new Date(monthKey + '-01'),
        value: cost,
        label: new Date(monthKey + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        metadata: { month: monthKey, cost },
      }));
  }

  static toTreatmentEffectiveness(healthRecords: HealthRecord[]): ChartDataPoint[] {
    const treatmentOutcomes: Record<string, { total: number; resolved: number }> = {};

    healthRecords.forEach(record => {
      if (!treatmentOutcomes[record.treatment]) {
        treatmentOutcomes[record.treatment] = { total: 0, resolved: 0 };
      }

      treatmentOutcomes[record.treatment].total++;
      if (record.status === 'resolved') {
        treatmentOutcomes[record.treatment].resolved++;
      }
    });

    return Object.entries(treatmentOutcomes).map(([treatment, data]) => ({
      label: treatment.length > 20 ? treatment.substring(0, 20) + '...' : treatment,
      value: data.total > 0 ? (data.resolved / data.total) * 100 : 0,
      color: data.resolved / data.total > 0.7 ? '#10B981' : data.resolved / data.total > 0.4 ? '#F59E0B' : '#EF4444',
      metadata: {
        treatment,
        totalCases: data.total,
        resolvedCases: data.resolved,
        successRate: data.total > 0 ? (data.resolved / data.total) * 100 : 0,
      },
    }));
  }
}

// Task data transformers
export class TaskDataTransformer {
  static toStatusDistribution(tasks: TaskRecord[]): ChartDataPoint[] {
    const statusCount: Record<string, number> = {};

    tasks.forEach(task => {
      statusCount[task.status] = (statusCount[task.status] || 0) + 1;
    });

    const statusColors: Record<string, string> = {
      pending: '#F59E0B',
      in_progress: '#3B82F6',
      completed: '#10B981',
      cancelled: '#6B7280',
      overdue: '#EF4444',
    };

    return Object.entries(statusCount).map(([status, count]) => ({
      label: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: count,
      color: statusColors[status] || '#6B7280',
      metadata: {
        status,
        percentage: tasks.length > 0 ? (count / tasks.length) * 100 : 0,
      },
    }));
  }

  static toPriorityDistribution(tasks: TaskRecord[]): ChartDataPoint[] {
    const priorityCount: Record<string, number> = {};

    tasks.forEach(task => {
      priorityCount[task.priority] = (priorityCount[task.priority] || 0) + 1;
    });

    const priorityColors: Record<string, string> = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
      critical: '#DC2626',
    };

    return Object.entries(priorityCount).map(([priority, count]) => ({
      label: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: count,
      color: priorityColors[priority] || '#6B7280',
      metadata: {
        priority,
        percentage: tasks.length > 0 ? (count / tasks.length) * 100 : 0,
      },
    }));
  }

  static toCompletionTrend(tasks: TaskRecord[]): TimeSeriesPoint[] {
    const dailyCompletions: Record<string, number> = {};

    tasks.forEach(task => {
      if (task.status === 'completed' && task.completedDate) {
        const date = new Date(task.completedDate).toDateString();
        dailyCompletions[date] = (dailyCompletions[date] || 0) + 1;
      }
    });

    return Object.entries(dailyCompletions)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        timestamp: new Date(date),
        value: count,
        label: new Date(date).toLocaleDateString(),
        metadata: { date, completedTasks: count },
      }));
  }
}

// Feed data transformers
export class FeedDataTransformer {
  static toStockLevels(feedRecords: FeedRecord[]): ChartDataPoint[] {
    return feedRecords.map(feed => ({
      label: feed.feedName,
      value: feed.currentStock,
      color: feed.currentStock <= feed.minStock ? '#EF4444' : '#10B981',
      metadata: {
        feedName: feed.feedName,
        currentStock: feed.currentStock,
        minStock: feed.minStock,
        unit: feed.unit,
        status: feed.currentStock <= feed.minStock ? 'low' : 'optimal',
      },
    }));
  }

  static toCostAnalysis(feedRecords: FeedRecord[]): ChartDataPoint[] {
    return feedRecords.map(feed => ({
      label: feed.feedName,
      value: feed.costPerUnit * feed.currentStock,
      color: '#3B82F6',
      metadata: {
        feedName: feed.feedName,
        costPerUnit: feed.costPerUnit,
        currentStock: feed.currentStock,
        totalValue: feed.costPerUnit * feed.currentStock,
        supplier: feed.supplier,
      },
    }));
  }
}

// Cross-collection data transformers
export class CrossCollectionTransformer {
  static animalsToHealthCorrelation(animals: Animal[], healthRecords: HealthRecord[]): ScatterPlotPoint[] {
    return animals.map(animal => {
      const relatedHealthRecords = healthRecords.filter(hr => hr.animalId === animal._id);
      const healthScore = this.calculateAnimalHealthScore(animal, relatedHealthRecords);

      return {
        x: animal.weight || 0,
        y: healthScore,
        label: animal.name || animal.rfidTag,
        color: healthScore > 80 ? '#10B981' : healthScore > 60 ? '#F59E0B' : '#EF4444',
        size: Math.max(5, Math.min(15, relatedHealthRecords.length)),
        metadata: {
          animalId: animal._id,
          name: animal.name,
          species: animal.species,
          weight: animal.weight,
          healthRecords: relatedHealthRecords.length,
        },
      };
    });
  }

  static financialToAnimalValue(animals: Animal[], financialRecords: FinancialRecord[]): ScatterPlotPoint[] {
    const animalValues = animals.map(animal => {
      const relatedCosts = financialRecords.filter(fr =>
        fr.description.toLowerCase().includes(animal.name?.toLowerCase() || '') ||
        fr.description.toLowerCase().includes(animal.rfidTag?.toLowerCase() || '')
      );

      const totalCost = relatedCosts.reduce((sum, fr) => sum + fr.amount, 0);

      return {
        x: animal.weight || 0,
        y: totalCost,
        label: animal.name || animal.rfidTag,
        color: totalCost > 1000 ? '#EF4444' : totalCost > 500 ? '#F59E0B' : '#10B981',
        size: Math.max(5, Math.min(15, this.calculateAnimalAge(animal))),
        metadata: {
          animalId: animal._id,
          name: animal.name,
          species: animal.species,
          weight: animal.weight,
          totalCost,
          relatedTransactions: relatedCosts.length,
        },
      };
    });

    return animalValues;
  }

  private static calculateAnimalAge(animal: Animal): number {
    const birthDate = new Date(animal.dateOfBirth);
    const ageInYears = (Date.now() - birthDate.getTime()) / (365 * 24 * 60 * 60 * 1000);
    return Math.floor(ageInYears) || 1;
  }

  private static calculateAnimalHealthScore(animal: Animal, healthRecords: HealthRecord[]): number {
    if (healthRecords.length === 0) {
      // Base score on animal's health condition
      const conditionScores: Record<string, number> = {
        excellent: 100,
        good: 80,
        fair: 60,
        poor: 40,
        critical: 20,
      };
      return conditionScores[animal.health?.overallCondition || 'good'] || 60;
    }

    // Calculate based on recent health records
    const recentRecords = healthRecords.filter(hr => {
      const recordDate = new Date(hr.date);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return recordDate >= thirtyDaysAgo;
    });

    if (recentRecords.length === 0) {
      return 70; // Default score for animals with old records
    }

    const resolvedCount = recentRecords.filter(hr => hr.status === 'resolved').length;
    const criticalCount = recentRecords.filter(hr => hr.severity === 'critical').length;

    let score = 100;
    score -= criticalCount * 20; // Deduct for critical issues
    score -= (recentRecords.length - resolvedCount) * 10; // Deduct for unresolved issues

    return Math.max(0, Math.min(100, score));
  }
}

// Utility functions for data formatting
export class DataFormatter {
  static formatCurrency(value: number, currency: string = 'ZAR'): string {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  static formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
  }

  static formatNumber(value: number, decimals: number = 0): string {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  static formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  static formatDateTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}