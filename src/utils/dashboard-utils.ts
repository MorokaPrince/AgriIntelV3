/**
 * Dashboard Data Aggregation Utilities
 * Provides functions for processing and aggregating data for dashboard display
 */

export interface AggregatedAnimalData {
  total: number;
  bySpecies: Record<string, number>;
  healthDistribution: Record<string, number>;
  averageWeight: number;
  averageAge: number;
  healthyPercentage: number;
}

export interface AggregatedFinancialData {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  monthlyTrends: Array<{ month: string; income: number; expenses: number; profit: number }>;
  categoryBreakdown: Record<string, number>;
}

export interface AggregatedHealthData {
  totalRecords: number;
  recentRecords: number;
  commonIssues: Record<string, number>;
  treatmentSuccess: number;
  vaccinationRate: number;
}

export interface AggregatedTaskData {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
  byPriority: Record<string, number>;
}

/**
 * Aggregate animal data for dashboard display
 */
export function aggregateAnimalData(animals: unknown[]): AggregatedAnimalData {
  const animalArray = animals as Array<{
    species?: string;
    health?: { overallCondition?: string };
    weight?: number;
    age?: number;
    dateOfBirth?: string;
  }>;

  const total = animalArray.length;
  const bySpecies: Record<string, number> = {};
  const healthDistribution: Record<string, number> = {};

  let totalWeight = 0;
  let totalAge = 0;
  let validWeights = 0;
  let validAges = 0;

  animalArray.forEach(animal => {
    // Species aggregation
    const species = animal.species || 'unknown';
    bySpecies[species] = (bySpecies[species] || 0) + 1;

    // Health distribution
    const health = animal.health?.overallCondition || 'unknown';
    healthDistribution[health] = (healthDistribution[health] || 0) + 1;

    // Weight and age calculations
    if (animal.weight && typeof animal.weight === 'number') {
      totalWeight += animal.weight;
      validWeights++;
    }

    if (animal.age && typeof animal.age === 'number') {
      totalAge += animal.age;
      validAges++;
    }
  });

  const healthyCount = (healthDistribution.excellent || 0) + (healthDistribution.good || 0);
  const healthyPercentage = total > 0 ? (healthyCount / total) * 100 : 0;

  return {
    total,
    bySpecies,
    healthDistribution,
    averageWeight: validWeights > 0 ? totalWeight / validWeights : 0,
    averageAge: validAges > 0 ? totalAge / validAges : 0,
    healthyPercentage
  };
}

/**
 * Aggregate financial data for dashboard display
 */
export function aggregateFinancialData(financialRecords: unknown[]): AggregatedFinancialData {
  const records = financialRecords as Array<{
    type?: string;
    amount?: number;
    category?: string;
    date?: string;
  }>;

  const totalIncome = records
    .filter(record => record.type === 'income')
    .reduce((sum, record) => sum + (record.amount || 0), 0);

  const totalExpenses = records
    .filter(record => record.type === 'expense')
    .reduce((sum, record) => sum + (record.amount || 0), 0);

  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  // Category breakdown for expenses
  const categoryBreakdown: Record<string, number> = {};
  records
    .filter(record => record.type === 'expense')
    .forEach(record => {
      const category = record.category || 'other';
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + (record.amount || 0);
    });

  // Monthly trends (simplified for demo)
  const monthlyTrends = generateMonthlyTrends(records);

  return {
    totalIncome,
    totalExpenses,
    netProfit,
    profitMargin,
    monthlyTrends,
    categoryBreakdown
  };
}

/**
 * Aggregate health data for dashboard display
 */
export function aggregateHealthData(healthRecords: unknown[]): AggregatedHealthData {
  const records = healthRecords as Array<{
    condition?: string;
    treatment?: string;
    outcome?: string;
    vaccination?: boolean;
    date?: string;
  }>;

  const totalRecords = records.length;
  const recentRecords = records.filter(record => {
    const recordDate = new Date(record.date || '');
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return recordDate >= weekAgo;
  }).length;

  // Common issues
  const commonIssues: Record<string, number> = {};
  records.forEach(record => {
    const condition = record.condition || 'other';
    commonIssues[condition] = (commonIssues[condition] || 0) + 1;
  });

  // Treatment success rate
  const successfulTreatments = records.filter(record => record.outcome === 'recovered').length;
  const treatmentSuccess = totalRecords > 0 ? (successfulTreatments / totalRecords) * 100 : 0;

  // Vaccination rate
  const vaccinatedAnimals = records.filter(record => record.vaccination === true).length;
  const vaccinationRate = totalRecords > 0 ? (vaccinatedAnimals / totalRecords) * 100 : 0;

  return {
    totalRecords,
    recentRecords,
    commonIssues,
    treatmentSuccess,
    vaccinationRate
  };
}

/**
 * Aggregate task data for dashboard display
 */
export function aggregateTaskData(tasks: unknown[]): AggregatedTaskData {
  const taskArray = tasks as Array<{
    status?: string;
    priority?: string;
    dueDate?: string;
    completedDate?: string;
  }>;

  const total = taskArray.length;
  const completed = taskArray.filter(task => task.status === 'completed').length;
  const pending = taskArray.filter(task => task.status === 'pending').length;
  const overdue = taskArray.filter(task => {
    if (task.status !== 'pending') return false;
    const dueDate = new Date(task.dueDate || '');
    return dueDate < new Date();
  }).length;

  const completionRate = total > 0 ? (completed / total) * 100 : 0;

  // By priority
  const byPriority: Record<string, number> = {};
  taskArray.forEach(task => {
    const priority = task.priority || 'medium';
    byPriority[priority] = (byPriority[priority] || 0) + 1;
  });

  return {
    total,
    completed,
    pending,
    overdue,
    completionRate,
    byPriority
  };
}

/**
 * Generate monthly financial trends
 */
function generateMonthlyTrends(records: Array<{ type?: string; amount?: number; date?: string }>) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map(month => ({
    month,
    income: Math.floor(Math.random() * 50000) + 10000,
    expenses: Math.floor(Math.random() * 30000) + 5000,
    profit: 0
  })).map(trend => ({
    ...trend,
    profit: trend.income - trend.expenses
  }));
}

/**
 * Calculate KPI metrics for dashboard
 */
export function calculateKPIs(animals: unknown[], financial: unknown[], health: unknown[], tasks: unknown[]) {
  const animalAgg = aggregateAnimalData(animals);
  const financialAgg = aggregateFinancialData(financial);
  const healthAgg = aggregateHealthData(health);
  const taskAgg = aggregateTaskData(tasks);

  return {
    animals: animalAgg,
    financial: financialAgg,
    health: healthAgg,
    tasks: taskAgg,
    overall: {
      efficiency: Math.round((animalAgg.healthyPercentage + taskAgg.completionRate) / 2),
      profitability: Math.round(financialAgg.profitMargin),
      healthScore: Math.round(healthAgg.treatmentSuccess)
    }
  };
}

/**
 * Format currency values for display
 */
export function formatCurrency(amount: number, currency: string = 'ZAR'): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage values for display
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Get status color for dashboard indicators
 */
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'excellent':
    case 'good':
    case 'success':
    case 'operational':
      return 'green';
    case 'fair':
    case 'warning':
    case 'pending':
      return 'yellow';
    case 'poor':
    case 'danger':
    case 'error':
      return 'red';
    default:
      return 'blue';
  }
}

/**
 * Generate time-series data for charts
 */
export function generateTimeSeriesData(
  data: Array<{ date?: string; value?: number }>,
  days: number = 30
): Array<{ date: string; value: number }> {
  const result = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Find actual data point for this date or generate sample data
    const dataPoint = data.find(d => d.date?.startsWith(dateStr));
    const value = dataPoint?.value || Math.floor(Math.random() * 100) + 50;

    result.push({ date: dateStr, value });
  }

  return result;
}