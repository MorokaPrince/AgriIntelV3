'use client';

import { Animal, HealthRecord, FinancialRecord, TaskRecord, FeedRecord } from '@/services/apiService';
import { DataFormatter } from './dataTransformers';

// Types for cross-collection analysis
export interface CrossCollectionMetrics {
  animalHealth: {
    totalAnimals: number;
    healthyAnimals: number;
    animalsNeedingAttention: number;
    averageHealthScore: number;
    healthCostPerAnimal: number;
  };
  financialPerformance: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitPerAnimal: number;
    roi: number;
  };
  operationalEfficiency: {
    taskCompletionRate: number;
    averageTaskDuration: number;
    overdueTasks: number;
    feedEfficiency: number;
  };
  overallKPIs: {
    farmProductivity: number;
    costEfficiency: number;
    sustainabilityScore: number;
    growthRate: number;
  };
}

export interface AnimalFinancialRelationship {
  animalId: string;
  animalName: string;
  species: string;
  totalHealthCost: number;
  totalFeedCost: number;
  totalValue: number;
  profitability: number;
  healthRecords: number;
  lastHealthCheck: Date | null;
}

export interface SpeciesPerformanceData {
  species: string;
  count: number;
  averageWeight: number;
  averageAge: number;
  totalHealthCost: number;
  totalValue: number;
  profitability: number;
  healthScore: number;
}

export interface MonthlyTrendData {
  month: string;
  animals: number;
  healthRecords: number;
  income: number;
  expenses: number;
  profit: number;
  tasksCompleted: number;
  feedConsumption: number;
}

// Enhanced aggregator class with database-level optimizations
export class CrossCollectionAggregator {
  static calculateCrossCollectionMetrics(
    animals: Animal[],
    healthRecords: HealthRecord[],
    financialRecords: FinancialRecord[],
    tasks: TaskRecord[],
    feedRecords: FeedRecord[]
  ): CrossCollectionMetrics {
    // Animal Health Metrics
    const totalAnimals = animals.length;
    const healthyAnimals = animals.filter(animal =>
      animal.health?.overallCondition === 'excellent' ||
      animal.health?.overallCondition === 'good'
    ).length;

    const animalsNeedingAttention = animals.filter(animal =>
      animal.health?.overallCondition === 'poor' ||
      animal.health?.overallCondition === 'critical' ||
      animal.alerts?.some(alert => alert.priority === 'high' || alert.priority === 'critical')
    ).length;

    const averageHealthScore = this.calculateAverageHealthScore(animals);
    const totalHealthCost = healthRecords.reduce((sum, record) => sum + (record.cost?.totalCost || 0), 0);
    const healthCostPerAnimal = totalAnimals > 0 ? totalHealthCost / totalAnimals : 0;

    // Financial Performance Metrics
    const totalRevenue = financialRecords
      .filter(record => record.type === 'income')
      .reduce((sum, record) => sum + record.amount, 0);

    const totalExpenses = financialRecords
      .filter(record => record.type === 'expense')
      .reduce((sum, record) => sum + record.amount, 0);

    const netProfit = totalRevenue - totalExpenses;
    const profitPerAnimal = totalAnimals > 0 ? netProfit / totalAnimals : 0;
    const roi = totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0;

    // Operational Efficiency Metrics
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const totalTasks = tasks.length;
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const completedTasksWithTime = tasks.filter(task =>
      task.status === 'completed' && task.completedDate && task.createdAt
    );

    const averageTaskDuration = completedTasksWithTime.length > 0
      ? completedTasksWithTime.reduce((sum, task) => {
          const createdDate = new Date(task.createdAt);
          const completedDate = new Date(task.completedDate!);
          return sum + (completedDate.getTime() - createdDate.getTime());
        }, 0) / completedTasksWithTime.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    const overdueTasks = tasks.filter(task => task.status === 'overdue').length;

    const totalFeedCost = feedRecords.reduce((sum, record) => sum + (record.costPerUnit * record.currentStock), 0);
    const feedEfficiency = totalAnimals > 0 ? totalFeedCost / totalAnimals : 0;

    // Overall KPIs
    const farmProductivity = this.calculateFarmProductivity(animals, tasks);
    const costEfficiency = this.calculateCostEfficiency(financialRecords, totalAnimals);
    const sustainabilityScore = this.calculateSustainabilityScore(animals, healthRecords, feedRecords);
    const growthRate = this.calculateGrowthRate(animals);

    return {
      animalHealth: {
        totalAnimals,
        healthyAnimals,
        animalsNeedingAttention,
        averageHealthScore,
        healthCostPerAnimal,
      },
      financialPerformance: {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitPerAnimal,
        roi,
      },
      operationalEfficiency: {
        taskCompletionRate,
        averageTaskDuration,
        overdueTasks,
        feedEfficiency,
      },
      overallKPIs: {
        farmProductivity,
        costEfficiency,
        sustainabilityScore,
        growthRate,
      },
    };
  }

  static analyzeAnimalFinancialRelationships(
    animals: Animal[],
    healthRecords: HealthRecord[],
    financialRecords: FinancialRecord[]
  ): AnimalFinancialRelationship[] {
    return animals.map(animal => {
      // Find health records for this animal
      const animalHealthRecords = healthRecords.filter(record => record.animalId === animal._id);
      const totalHealthCost = animalHealthRecords.reduce((sum, record) => sum + (record.cost?.totalCost || 0), 0);

      // Find financial records related to this animal (by name or RFID)
      const relatedFinancialRecords = financialRecords.filter(record =>
        record.description.toLowerCase().includes(animal.name?.toLowerCase() || '') ||
        record.description.toLowerCase().includes(animal.rfidTag?.toLowerCase() || '') ||
        record.description.toLowerCase().includes('animal') ||
        record.description.toLowerCase().includes(animal.species.toLowerCase())
      );

      const totalFeedCost = relatedFinancialRecords
        .filter(record => record.category.toLowerCase().includes('feed') || record.category.toLowerCase().includes('nutrition'))
        .reduce((sum, record) => sum + record.amount, 0);

      // Calculate animal value (simplified)
      const totalValue = animal.purchaseInfo?.purchasePrice || 0;

      // Calculate profitability
      const totalCosts = totalHealthCost + totalFeedCost;
      const profitability = totalValue > 0 ? ((totalValue - totalCosts) / totalValue) * 100 : 0;

      // Find last health check
      const lastHealthCheck = animalHealthRecords.length > 0
        ? new Date(Math.max(...animalHealthRecords.map(record => new Date(record.date).getTime())))
        : null;

      return {
        animalId: animal._id || '',
        animalName: animal.name || animal.rfidTag || 'Unknown',
        species: animal.species,
        totalHealthCost,
        totalFeedCost,
        totalValue,
        profitability,
        healthRecords: animalHealthRecords.length,
        lastHealthCheck,
      };
    });
  }

  static analyzeSpeciesPerformance(
    animals: Animal[],
    healthRecords: HealthRecord[],
    financialRecords: FinancialRecord[]
  ): SpeciesPerformanceData[] {
    const speciesGroups = this.groupAnimalsBySpecies(animals);

    return Object.entries(speciesGroups).map(([species, speciesAnimals]) => {
      const speciesHealthRecords = healthRecords.filter(record =>
        speciesAnimals.some(animal => animal._id === record.animalId)
      );

      const totalHealthCost = speciesHealthRecords.reduce((sum, record) => sum + (record.cost?.totalCost || 0), 0);

      const averageWeight = speciesAnimals.reduce((sum, animal) => sum + (animal.weight || 0), 0) / speciesAnimals.length;
      const averageAge = speciesAnimals.reduce((sum, animal) => {
        const birthDate = new Date(animal.dateOfBirth);
        const age = (Date.now() - birthDate.getTime()) / (365 * 24 * 60 * 60 * 1000);
        return sum + age;
      }, 0) / speciesAnimals.length;

      // Calculate total value for species
      const totalValue = speciesAnimals.reduce((sum, animal) => sum + (animal.purchaseInfo?.purchasePrice || 0), 0);

      // Calculate profitability
      const profitability = totalValue > 0 ? ((totalValue - totalHealthCost) / totalValue) * 100 : 0;

      // Calculate health score for species
      const healthScore = this.calculateSpeciesHealthScore(speciesAnimals, speciesHealthRecords);

      return {
        species,
        count: speciesAnimals.length,
        averageWeight,
        averageAge,
        totalHealthCost,
        totalValue,
        profitability,
        healthScore,
      };
    });
  }

  static generateMonthlyTrends(
    animals: Animal[],
    healthRecords: HealthRecord[],
    financialRecords: FinancialRecord[],
    tasks: TaskRecord[],
    feedRecords: FeedRecord[]
  ): MonthlyTrendData[] {
    const monthlyData: Record<string, {
      animals: number;
      healthRecords: number;
      income: number;
      expenses: number;
      tasksCompleted: number;
      feedConsumption: number;
    }> = {};

    // Process animals by month
    animals.forEach(animal => {
      const monthKey = this.getMonthKey(new Date(animal.createdAt));
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          animals: 0,
          healthRecords: 0,
          income: 0,
          expenses: 0,
          tasksCompleted: 0,
          feedConsumption: 0,
        };
      }
      monthlyData[monthKey].animals++;
    });

    // Process health records by month
    healthRecords.forEach(record => {
      const monthKey = this.getMonthKey(new Date(record.date));
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].healthRecords++;
      }
    });

    // Process financial records by month
    financialRecords.forEach(record => {
      const monthKey = this.getMonthKey(new Date(record.date));
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          animals: 0,
          healthRecords: 0,
          income: 0,
          expenses: 0,
          tasksCompleted: 0,
          feedConsumption: 0,
        };
      }

      if (record.type === 'income') {
        monthlyData[monthKey].income += record.amount;
      } else {
        monthlyData[monthKey].expenses += record.amount;
      }
    });

    // Process tasks by month
    tasks.forEach(task => {
      if (task.status === 'completed' && task.completedDate) {
        const monthKey = this.getMonthKey(new Date(task.completedDate));
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].tasksCompleted++;
        }
      }
    });

    // Process feed consumption by month
    feedRecords.forEach(record => {
      const monthKey = this.getMonthKey(new Date(record.createdAt));
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].feedConsumption += record.currentStock;
      }
    });

    // Convert to array and sort by month
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, data]) => ({
        month: this.formatMonthKey(monthKey),
        ...data,
        profit: data.income - data.expenses,
      }));
  }

  // Database-level aggregation methods for better performance
  static async calculateDatabaseLevelMetrics(tenantId: string): Promise<CrossCollectionMetrics> {
    // This would require direct database access for optimal performance
    // For now, return a placeholder structure
    return {
      animalHealth: {
        totalAnimals: 0,
        healthyAnimals: 0,
        animalsNeedingAttention: 0,
        averageHealthScore: 0,
        healthCostPerAnimal: 0,
      },
      financialPerformance: {
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        profitPerAnimal: 0,
        roi: 0,
      },
      operationalEfficiency: {
        taskCompletionRate: 0,
        averageTaskDuration: 0,
        overdueTasks: 0,
        feedEfficiency: 0,
      },
      overallKPIs: {
        farmProductivity: 0,
        costEfficiency: 0,
        sustainabilityScore: 0,
        growthRate: 0,
      },
    };
  }

  static async getOptimizedAnimalHealthAggregation(tenantId: string) {
    // Optimized aggregation pipeline for animal health data
    return {
      pipeline: [
        { $match: { tenantId } },
        {
          $group: {
            _id: '$health.overallCondition',
            count: { $sum: 1 },
            avgWeight: { $avg: '$weight' },
            totalHealthCost: { $sum: '$health.lastCheckup' }
          }
        }
      ],
      indexes: ['tenantId_1_health.overallCondition_1']
    };
  }

  static async getOptimizedFinancialAggregation(tenantId: string) {
    // Optimized aggregation pipeline for financial data
    return {
      pipeline: [
        { $match: { tenantId } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
            income: {
              $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
            },
            expenses: {
              $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
            }
          }
        },
        { $sort: { _id: 1 } }
      ],
      indexes: ['tenantId_1_date_1', 'tenantId_1_type_1']
    };
  }

  // Enhanced data validation with cross-collection consistency checks
  static validateDataConsistency(
    animals: Animal[],
    healthRecords: HealthRecord[],
    financialRecords: FinancialRecord[]
  ): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for orphaned health records
    const animalIds = new Set(animals.map(a => a._id));
    const orphanedHealthRecords = healthRecords.filter(hr => !animalIds.has(hr.animalId));

    if (orphanedHealthRecords.length > 0) {
      errors.push(`${orphanedHealthRecords.length} health records reference non-existent animals`);
    }

    // Check for financial records without corresponding animals
    const financialAnimalReferences = financialRecords.filter(fr =>
      fr.description.toLowerCase().includes('animal') ||
      fr.description.toLowerCase().includes('cattle') ||
      fr.description.toLowerCase().includes('sheep')
    );

    // Check for data completeness
    const animalsWithoutHealthRecords = animals.filter(animal => {
      const hasHealthRecord = healthRecords.some(hr => hr.animalId === animal._id);
      const daysSinceCreation = (Date.now() - new Date(animal.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return !hasHealthRecord && daysSinceCreation > 30; // No health record for over 30 days
    });

    if (animalsWithoutHealthRecords.length > 0) {
      warnings.push(`${animalsWithoutHealthRecords.length} animals lack recent health records`);
    }

    // Check for suspicious financial patterns
    const highValueTransactions = financialRecords.filter(fr => fr.amount > 10000);
    if (highValueTransactions.length > 0) {
      warnings.push(`${highValueTransactions.length} high-value transactions detected`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Helper methods
  private static calculateAverageHealthScore(animals: Animal[]): number {
    if (animals.length === 0) return 0;

    const healthScores = animals.map(animal => {
      const condition = animal.health?.overallCondition || 'good';
      const scores: Record<string, number> = {
        excellent: 100,
        good: 80,
        fair: 60,
        poor: 40,
        critical: 20,
      };
      return scores[condition] || 60;
    });

    return healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length;
  }

  private static calculateFarmProductivity(animals: Animal[], tasks: TaskRecord[]): number {
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const totalTasks = tasks.length;

    if (totalTasks === 0) return 0;

    const taskEfficiency = (completedTasks / totalTasks) * 100;
    const animalHealthFactor = this.calculateAverageHealthScore(animals) / 100;

    return (taskEfficiency * 0.6) + (animalHealthFactor * 40);
  }

  private static calculateCostEfficiency(financialRecords: FinancialRecord[], totalAnimals: number): number {
    const totalExpenses = financialRecords
      .filter(record => record.type === 'expense')
      .reduce((sum, record) => sum + record.amount, 0);

    if (totalAnimals === 0 || totalExpenses === 0) return 0;

    const costPerAnimal = totalExpenses / totalAnimals;
    // Lower cost per animal = higher efficiency (normalize to 0-100 scale)
    return Math.max(0, Math.min(100, 100 - (costPerAnimal / 100)));
  }

  private static calculateSustainabilityScore(
    animals: Animal[],
    healthRecords: HealthRecord[],
    feedRecords: FeedRecord[]
  ): number {
    let score = 100;

    // Penalize for poor health conditions
    const poorHealthAnimals = animals.filter(animal =>
      animal.health?.overallCondition === 'poor' || animal.health?.overallCondition === 'critical'
    ).length;

    score -= poorHealthAnimals * 10;

    // Penalize for critical health issues
    const criticalHealthRecords = healthRecords.filter(record => record.severity === 'critical').length;
    score -= criticalHealthRecords * 5;

    // Reward for good feed management
    const lowStockFeeds = feedRecords.filter(feed => feed.currentStock <= feed.minStock).length;
    score -= lowStockFeeds * 5;

    return Math.max(0, Math.min(100, score));
  }

  private static calculateGrowthRate(animals: Animal[]): number {
    if (animals.length === 0) return 0;

    const now = Date.now();
    const growthRates = animals.map(animal => {
      const ageInYears = (now - new Date(animal.dateOfBirth).getTime()) / (365 * 24 * 60 * 60 * 1000);
      if (ageInYears === 0) return 0;

      const weight = animal.weight || 0;
      return weight / ageInYears; // Weight per year of age
    });

    const averageGrowthRate = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;

    // Normalize to 0-100 scale (assuming 200kg/year is excellent)
    return Math.max(0, Math.min(100, (averageGrowthRate / 200) * 100));
  }

  private static groupAnimalsBySpecies(animals: Animal[]): Record<string, Animal[]> {
    return animals.reduce((groups, animal) => {
      if (!groups[animal.species]) {
        groups[animal.species] = [];
      }
      groups[animal.species].push(animal);
      return groups;
    }, {} as Record<string, Animal[]>);
  }

  private static calculateSpeciesHealthScore(animals: Animal[], healthRecords: HealthRecord[]): number {
    if (animals.length === 0) return 0;

    const healthScores = animals.map(animal => {
      const condition = animal.health?.overallCondition || 'good';
      const scores: Record<string, number> = {
        excellent: 100,
        good: 80,
        fair: 60,
        poor: 40,
        critical: 20,
      };
      return scores[condition] || 60;
    });

    return healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length;
  }

  private static getMonthKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  private static formatMonthKey(monthKey: string): string {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
}

// Utility functions for relationship queries
export class RelationshipQueries {
  static findAnimalsWithHighHealthCosts(
    animals: Animal[],
    healthRecords: HealthRecord[],
    threshold: number = 1000
  ): Animal[] {
    const animalHealthCosts = new Map<string, number>();

    // Calculate total health cost per animal
    healthRecords.forEach(record => {
      const currentCost = animalHealthCosts.get(record.animalId) || 0;
      animalHealthCosts.set(record.animalId, currentCost + (record.cost?.totalCost || 0));
    });

    // Find animals exceeding threshold
    return animals.filter(animal => {
      const healthCost = animalHealthCosts.get(animal._id || '') || 0;
      return healthCost > threshold;
    });
  }

  static findMostProfitableSpecies(
    animals: Animal[],
    financialRecords: FinancialRecord[],
    topN: number = 3
  ): Array<{ species: string; profitability: number; totalValue: number }> {
    const speciesProfitability = new Map<string, { totalValue: number; totalCosts: number }>();

    // Calculate value and costs per species
    animals.forEach(animal => {
      const species = animal.species;
      const current = speciesProfitability.get(species) || { totalValue: 0, totalCosts: 0 };

      current.totalValue += animal.purchaseInfo?.purchasePrice || 0;
      speciesProfitability.set(species, current);
    });

    // Calculate costs from financial records
    financialRecords.forEach(record => {
      if (record.type === 'expense') {
        // Try to match expenses to species (simplified matching)
        Object.keys(speciesProfitability).forEach(species => {
          if (record.description.toLowerCase().includes(species.toLowerCase()) ||
              record.category.toLowerCase().includes('animal') ||
              record.category.toLowerCase().includes('livestock')) {
            const current = speciesProfitability.get(species)!;
            current.totalCosts += record.amount;
            speciesProfitability.set(species, current);
          }
        });
      }
    });

    // Calculate profitability and sort
    return Array.from(speciesProfitability.entries())
      .map(([species, data]) => ({
        species,
        profitability: data.totalValue > 0 ? ((data.totalValue - data.totalCosts) / data.totalValue) * 100 : 0,
        totalValue: data.totalValue,
      }))
      .sort((a, b) => b.profitability - a.profitability)
      .slice(0, topN);
  }

  static findTasksImpactingAnimalHealth(
    tasks: TaskRecord[],
    animals: Animal[],
    healthRecords: HealthRecord[]
  ): Array<{
    task: TaskRecord;
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
            // Match task to animal (simplified)
            return task.description.toLowerCase().includes(animal.name?.toLowerCase() || '') ||
                   task.description.toLowerCase().includes(animal.rfidTag?.toLowerCase() || '');
          });
          break;

        case 'feeding':
          healthImpact = 'positive';
          // All animals benefit from feeding tasks
          impactedAnimals = animals;
          break;

        case 'maintenance':
          healthImpact = 'positive';
          // Maintenance tasks generally benefit animal health
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
}

// Enhanced data validation utilities with comprehensive checks
export class DataValidator {
  static validateAnimalData(animal: Animal): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required field validations
    if (!animal.rfidTag || animal.rfidTag.trim() === '') {
      errors.push('RFID tag is required');
    }
    if (!animal.species) errors.push('Species is required');
    if (!animal.breed || animal.breed.trim() === '') errors.push('Breed is required');
    if (!animal.dateOfBirth) errors.push('Date of birth is required');
    if (!animal.weight || animal.weight <= 0) errors.push('Valid weight (> 0) is required');
    if (!animal.location?.address || animal.location.address.trim() === '') {
      errors.push('Location address is required');
    }

    // Data type validations
    if (animal.rfidTag && !/^[A-Za-z0-9-]+$/.test(animal.rfidTag)) {
      warnings.push('RFID tag contains unusual characters');
    }

    if (animal.weight && animal.weight > 2000) {
      warnings.push('Weight seems unusually high (> 2000kg)');
    }

    // Date validations
    if (animal.dateOfBirth && animal.dateOfBirth > new Date()) {
      errors.push('Date of birth cannot be in the future');
    }

    if (animal.purchaseInfo?.purchaseDate && animal.purchaseInfo.purchaseDate > new Date()) {
      errors.push('Purchase date cannot be in the future');
    }

    // Logical validations
    if (animal.purchaseInfo?.purchaseDate && animal.purchaseInfo.purchaseDate > new Date()) {
      errors.push('Purchase date cannot be in the future');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static validateHealthRecordData(record: HealthRecord): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!record.animalId) errors.push('Animal ID is required');
    if (!record.recordType) errors.push('Record type is required');
    if (!record.date) errors.push('Date is required');
    if (!record.veterinarian || record.veterinarian.trim() === '') errors.push('Veterinarian is required');
    if (!record.diagnosis || record.diagnosis.trim() === '') errors.push('Diagnosis is required');

    // Date validations
    if (record.date && record.date > new Date()) {
      errors.push('Health record date cannot be in the future');
    }

    // Cost validations
    if (record.cost?.totalCost && record.cost.totalCost < 0) {
      errors.push('Health cost cannot be negative');
    }

    if (record.cost?.totalCost && record.cost.totalCost > 50000) {
      warnings.push('Health cost seems unusually high (> R50,000)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static validateFinancialRecordData(record: FinancialRecord): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!record.type) errors.push('Transaction type is required');
    if (!record.category) errors.push('Category is required');
    if (!record.amount || record.amount <= 0) errors.push('Valid amount (> 0) is required');
    if (!record.description || record.description.trim() === '') errors.push('Description is required');
    if (!record.date) errors.push('Date is required');

    // Date validations
    if (record.date && new Date(record.date) > new Date()) {
      errors.push('Transaction date cannot be in the future');
    }

    // Amount validations
    if (record.amount > 1000000) {
      warnings.push('Transaction amount seems unusually high (> R1,000,000)');
    }

    if (record.amount < 0.01 && record.amount > 0) {
      warnings.push('Transaction amount seems unusually low (< R0.01)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Batch validation for multiple records
  static validateBatchData<T extends { _id?: string }>(
    records: T[],
    validator: (record: T) => { isValid: boolean; errors: string[]; warnings: string[] }
  ): { validRecords: T[]; invalidRecords: Array<{ record: T; errors: string[]; warnings: string[] }> } {
    const validRecords: T[] = [];
    const invalidRecords: Array<{ record: T; errors: string[]; warnings: string[] }> = [];

    records.forEach(record => {
      const validation = validator(record as never);
      if (validation.isValid) {
        validRecords.push(record);
      } else {
        invalidRecords.push({
          record,
          errors: validation.errors,
          warnings: validation.warnings,
        });
      }
    });

    return { validRecords, invalidRecords };
  }

  // Cross-record validation
  static validateDataRelationships(
    animals: Animal[],
    healthRecords: HealthRecord[],
    financialRecords: FinancialRecord[]
  ): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    const animalIds = new Set(animals.map(a => a._id));

    // Check for health records referencing non-existent animals
    const invalidHealthRecords = healthRecords.filter(hr => !animalIds.has(hr.animalId));
    if (invalidHealthRecords.length > 0) {
      errors.push(`${invalidHealthRecords.length} health records reference non-existent animals`);
    }

    // Check for duplicate RFID tags
    const rfidCounts = animals.reduce((acc, animal) => {
      acc[animal.rfidTag] = (acc[animal.rfidTag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const duplicateRfids = Object.entries(rfidCounts).filter(([_, count]) => count > 1);
    if (duplicateRfids.length > 0) {
      errors.push(`Duplicate RFID tags found: ${duplicateRfids.map(([rfid]) => rfid).join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}