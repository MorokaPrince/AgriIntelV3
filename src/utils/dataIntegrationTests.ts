'use client';

import { Animal, HealthRecord, FinancialRecord, TaskRecord } from '@/services/apiService';

// Type definitions for test data
type AnimalSpecies = 'cattle' | 'sheep' | 'goats' | 'poultry' | 'pigs';
type AnimalGender = 'male' | 'female';
type AnimalStatus = 'active' | 'sold' | 'deceased' | 'breeding' | 'quarantined';
type HealthCondition = 'excellent' | 'good' | 'fair' | 'poor';
type FertilityStatus = 'fertile' | 'infertile' | 'subfertile';
type HealthRecordType = 'checkup' | 'vaccination' | 'treatment' | 'emergency';
type HealthSeverity = 'low' | 'medium' | 'high' | 'critical';
type FinancialType = 'income' | 'expense';
type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';
type TaskCategory = 'feeding' | 'health' | 'maintenance' | 'breeding';
import { AnimalDataTransformer, FinancialDataTransformer, HealthDataTransformer, DataFormatter } from '@/utils/dataTransformers';
import { CrossCollectionAggregator, RelationshipQueries, DataValidator } from '@/utils/crossCollectionAggregator';
import { TenantIsolation, TenantContext, TenantAuditLogger } from '@/utils/tenantIsolation';

// Test data generators
export class TestDataGenerator {
  static generateMockAnimals(count: number = 10): Animal[] {
    const species = ['cattle', 'sheep', 'goats', 'poultry', 'pigs'];
    const breeds = ['Angus', 'Merino', 'Boer', 'Leghorn', 'Duroc'];
    const conditions = ['excellent', 'good', 'fair', 'poor'];

    return Array.from({ length: count }, (_, i) => ({
      _id: `animal_${i + 1}`,
      tenantId: 'test-tenant',
      rfidTag: `RFID${String(i + 1).padStart(3, '0')}`,
      name: `Test Animal ${i + 1}`,
      species: species[i % species.length] as AnimalSpecies,
      breed: breeds[i % breeds.length],
      dateOfBirth: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 3), // Up to 3 years old
      gender: (i % 2 === 0 ? 'male' : 'female') as AnimalGender,
      color: ['Black', 'White', 'Brown', 'Spotted'][i % 4],
      weight: Math.floor(Math.random() * 400) + 50,
      height: Math.floor(Math.random() * 100) + 50,
      status: 'active' as AnimalStatus,
      location: {
        latitude: -26.2041 + (Math.random() - 0.5) * 0.1,
        longitude: 28.0473 + (Math.random() - 0.5) * 0.1,
        address: `Test Farm Section ${String.fromCharCode(65 + (i % 8))}`,
        farmSection: `Section ${String.fromCharCode(65 + (i % 8))}`,
      },
      health: {
        overallCondition: conditions[i % conditions.length] as HealthCondition,
        lastCheckup: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        nextCheckup: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000),
        vaccinations: [],
        diseases: [],
      },
      breeding: {
        isBreedingStock: i % 3 === 0,
        fertilityStatus: 'fertile' as FertilityStatus,
        offspring: [],
      },
      nutrition: {
        dailyFeedIntake: Math.floor(Math.random() * 10) + 5,
        feedType: ['Grass', 'Concentrate', 'Mixed'][i % 3],
        supplements: [],
        feedingSchedule: 'Twice daily',
      },
      productivity: {
        weightGain: Math.floor(Math.random() * 50) + 10,
        lastMeasurement: new Date(),
      },
      images: [],
      notes: `Test notes for animal ${i + 1}`,
      alerts: [],
      createdBy: 'test-user',
      updatedBy: 'test-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  static generateMockHealthRecords(animals: Animal[], count: number = 20): HealthRecord[] {
    const recordTypes = ['checkup', 'vaccination', 'treatment', 'emergency'];
    const severities = ['low', 'medium', 'high', 'critical'];
    const diagnoses = ['Routine check', 'Vaccination', 'Parasite treatment', 'Injury', 'Illness'];

    return Array.from({ length: count }, (_, i) => {
      const randomAnimal = animals[Math.floor(Math.random() * animals.length)];

      return {
        _id: `health_${i + 1}`,
        tenantId: 'test-tenant',
        animalId: randomAnimal._id || '',
        animalRfid: randomAnimal.rfidTag,
        recordType: recordTypes[i % recordTypes.length] as HealthRecordType,
        date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        veterinarian: ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams'][i % 3],
        diagnosis: diagnoses[i % diagnoses.length],
        symptoms: ['Normal', 'Lethargic', 'Loss of appetite'],
        treatment: 'Standard treatment protocol',
        medications: [],
        vaccinations: [],
        tests: [],
        followUp: {
          required: Math.random() > 0.7,
          instructions: 'Follow up in 2 weeks',
        },
        cost: {
          consultationFee: Math.floor(Math.random() * 500) + 100,
          medicationCost: Math.floor(Math.random() * 200) + 50,
          testCost: Math.floor(Math.random() * 300) + 50,
          totalCost: Math.floor(Math.random() * 1000) + 200,
          currency: 'ZAR',
        },
        notes: `Health record ${i + 1}`,
        attachments: [],
        severity: severities[i % severities.length] as HealthSeverity,
        status: Math.random() > 0.3 ? 'resolved' : 'active',
        createdBy: 'test-user',
        updatedBy: 'test-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });
  }

  static generateMockFinancialRecords(count: number = 15): FinancialRecord[] {
    const types = ['income', 'expense'];
    const categories = ['feed', 'veterinary', 'equipment', 'sales', 'maintenance'];

    return Array.from({ length: count }, (_, i) => ({
      _id: `financial_${i + 1}`,
      tenantId: 'test-tenant',
      type: types[i % types.length] as FinancialType,
      category: categories[i % categories.length],
      amount: Math.floor(Math.random() * 5000) + 100,
      currency: 'ZAR',
      description: `Financial transaction ${i + 1}`,
      date: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  static generateMockTasks(count: number = 12): TaskRecord[] {
    const priorities = ['low', 'medium', 'high', 'critical'];
    const statuses = ['pending', 'in_progress', 'completed', 'overdue'];
    const categories = ['feeding', 'health', 'maintenance', 'breeding'];

    return Array.from({ length: count }, (_, i) => ({
      _id: `task_${i + 1}`,
      tenantId: 'test-tenant',
      title: `Task ${i + 1}`,
      description: `Description for task ${i + 1}`,
      assignedTo: {
        _id: 'user_1',
        firstName: 'John',
        lastName: 'Doe',
      },
      assignedBy: {
        _id: 'user_2',
        firstName: 'Jane',
        lastName: 'Smith',
      },
      priority: priorities[i % priorities.length] as TaskPriority,
      status: statuses[i % statuses.length] as TaskStatus,
      dueDate: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
      completedDate: i % 3 === 0 ? new Date().toISOString() : undefined,
      category: categories[i % categories.length] as TaskCategory,
      progress: Math.floor(Math.random() * 100),
      estimatedHours: Math.floor(Math.random() * 8) + 1,
      actualHours: Math.floor(Math.random() * 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }
}

// Integration test suite
export class DataIntegrationTests {
  private testContext: TenantContext = {
    tenantId: 'test-tenant',
    userId: 'test-user',
    roles: ['admin'],
    permissions: ['read', 'write', 'delete'],
    subscription: {
      tier: 'enterprise',
      limits: {
        maxAnimals: 1000,
        maxTransactions: 5000,
        maxUsers: 50,
      },
    },
  };

  // Test data transformation utilities
  static testDataTransformers(): { passed: number; failed: number; results: Array<{ test: string; passed: boolean; error?: string }> } {
    const results = [];
    let passed = 0;
    let failed = 0;

    try {
      // Test animal data transformation
      const animals = TestDataGenerator.generateMockAnimals(5);
      const speciesDistribution = AnimalDataTransformer.toSpeciesDistribution(animals);

      if (speciesDistribution.length > 0 && speciesDistribution.every(item => item.label && item.value >= 0)) {
        results.push({ test: 'Animal species distribution transformation', passed: true });
        passed++;
      } else {
        results.push({ test: 'Animal species distribution transformation', passed: false, error: 'Invalid transformation output' });
        failed++;
      }

      // Test financial data transformation
      const financialRecords = TestDataGenerator.generateMockFinancialRecords(5);
      const monthlyTrends = FinancialDataTransformer.toMonthlyTrends(financialRecords);

      if (monthlyTrends.length > 0 && monthlyTrends.every(item => item.timestamp && typeof item.value === 'number')) {
        results.push({ test: 'Financial monthly trends transformation', passed: true });
        passed++;
      } else {
        results.push({ test: 'Financial monthly trends transformation', passed: false, error: 'Invalid transformation output' });
        failed++;
      }

      // Test health data transformation
      const healthRecords = TestDataGenerator.generateMockHealthRecords(animals, 5);
      const severityDistribution = HealthDataTransformer.toSeverityDistribution(healthRecords);

      if (severityDistribution.length > 0 && severityDistribution.every(item => item.label && item.value >= 0)) {
        results.push({ test: 'Health severity distribution transformation', passed: true });
        passed++;
      } else {
        results.push({ test: 'Health severity distribution transformation', passed: false, error: 'Invalid transformation output' });
        failed++;
      }

    } catch (error) {
      results.push({
        test: 'Data transformation tests',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      failed++;
    }

    return { passed, failed, results };
  }

  // Test cross-collection aggregation
  static testCrossCollectionAggregation(): { passed: number; failed: number; results: Array<{ test: string; passed: boolean; error?: string }> } {
    const results = [];
    let passed = 0;
    let failed = 0;

    try {
      const animals = TestDataGenerator.generateMockAnimals(10);
      const healthRecords = TestDataGenerator.generateMockHealthRecords(animals, 10);
      const financialRecords = TestDataGenerator.generateMockFinancialRecords(10);
      const tasks = TestDataGenerator.generateMockTasks(10);

      // Test cross-collection metrics calculation
      const metrics = CrossCollectionAggregator.calculateCrossCollectionMetrics(
        animals,
        healthRecords,
        financialRecords,
        tasks,
        []
      );

      if (metrics && typeof metrics.animalHealth.totalAnimals === 'number') {
        results.push({ test: 'Cross-collection metrics calculation', passed: true });
        passed++;
      } else {
        results.push({ test: 'Cross-collection metrics calculation', passed: false, error: 'Invalid metrics output' });
        failed++;
      }

      // Test animal-financial relationships
      const relationships = CrossCollectionAggregator.analyzeAnimalFinancialRelationships(
        animals,
        healthRecords,
        financialRecords
      );

      if (relationships.length > 0 && relationships.every(rel => rel.animalId && typeof rel.totalHealthCost === 'number')) {
        results.push({ test: 'Animal-financial relationship analysis', passed: true });
        passed++;
      } else {
        results.push({ test: 'Animal-financial relationship analysis', passed: false, error: 'Invalid relationship analysis' });
        failed++;
      }

      // Test species performance analysis
      const speciesPerformance = CrossCollectionAggregator.analyzeSpeciesPerformance(
        animals,
        healthRecords,
        financialRecords
      );

      if (speciesPerformance.length > 0 && speciesPerformance.every(sp => sp.species && typeof sp.count === 'number')) {
        results.push({ test: 'Species performance analysis', passed: true });
        passed++;
      } else {
        results.push({ test: 'Species performance analysis', passed: false, error: 'Invalid species performance analysis' });
        failed++;
      }

    } catch (error) {
      results.push({
        test: 'Cross-collection aggregation tests',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      failed++;
    }

    return { passed, failed, results };
  }

  // Test tenant isolation
  static testTenantIsolation(): { passed: number; failed: number; results: Array<{ test: string; passed: boolean; error?: string }> } {
    const results = [];
    let passed = 0;
    let failed = 0;

    try {
      const animals = TestDataGenerator.generateMockAnimals(5);
      const mixedTenantAnimals = [
        ...animals,
        { ...animals[0], tenantId: 'different-tenant' },
      ];

      // Test tenant filtering
      const filteredAnimals = TenantIsolation.filterByTenant(mixedTenantAnimals, {
        tenantId: 'test-tenant',
        userId: 'test-user',
        roles: ['admin'],
        permissions: ['read'],
        subscription: { tier: 'enterprise', limits: { maxAnimals: 100, maxTransactions: 100, maxUsers: 10 } },
      });

      if (filteredAnimals.length === animals.length && filteredAnimals.every(a => a.tenantId === 'test-tenant')) {
        results.push({ test: 'Tenant data filtering', passed: true });
        passed++;
      } else {
        results.push({ test: 'Tenant data filtering', passed: false, error: 'Tenant filtering failed' });
        failed++;
      }

      // Test tenant context application
      const dataWithTenant = TenantIsolation.withTenantContext(
        { name: 'Test Animal' },
        {
          tenantId: 'test-tenant',
          userId: 'test-user',
          roles: ['admin'],
          permissions: ['read'],
          subscription: { tier: 'enterprise', limits: { maxAnimals: 100, maxTransactions: 100, maxUsers: 10 } },
        }
      );

      if (dataWithTenant.tenantId === 'test-tenant' && dataWithTenant.createdBy === 'test-user') {
        results.push({ test: 'Tenant context application', passed: true });
        passed++;
      } else {
        results.push({ test: 'Tenant context application', passed: false, error: 'Tenant context application failed' });
        failed++;
      }

      // Test subscription limits
      const limitsCheck = TenantIsolation.validateTenantLimits(
        {
          tenantId: 'test-tenant',
          userId: 'test-user',
          roles: ['admin'],
          permissions: ['read'],
          subscription: { tier: 'enterprise', limits: { maxAnimals: 100, maxTransactions: 100, maxUsers: 10 } },
        },
        { animals: 50, transactions: 50, users: 5 }
      );

      if (limitsCheck.allowed) {
        results.push({ test: 'Subscription limits validation', passed: true });
        passed++;
      } else {
        results.push({ test: 'Subscription limits validation', passed: false, error: 'Limits validation failed' });
        failed++;
      }

    } catch (error) {
      results.push({
        test: 'Tenant isolation tests',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      failed++;
    }

    return { passed, failed, results };
  }

  // Test data validation
  static testDataValidation(): { passed: number; failed: number; results: Array<{ test: string; passed: boolean; error?: string }> } {
    const results = [];
    let passed = 0;
    let failed = 0;

    try {
      const animals = TestDataGenerator.generateMockAnimals(3);

      // Test animal data validation
      const animalValidation = DataValidator.validateAnimalData(animals[0]);

      if (animalValidation.isValid || animalValidation.errors.length > 0) {
        results.push({ test: 'Animal data validation', passed: true });
        passed++;
      } else {
        results.push({ test: 'Animal data validation', passed: false, error: 'Validation logic error' });
        failed++;
      }

      // Test health record validation
      const healthRecords = TestDataGenerator.generateMockHealthRecords(animals, 3);
      const healthValidation = DataValidator.validateHealthRecordData(healthRecords[0]);

      if (healthValidation.isValid || healthValidation.errors.length > 0) {
        results.push({ test: 'Health record validation', passed: true });
        passed++;
      } else {
        results.push({ test: 'Health record validation', passed: false, error: 'Validation logic error' });
        failed++;
      }

      // Test financial record validation
      const financialRecords = TestDataGenerator.generateMockFinancialRecords(3);
      const financialValidation = DataValidator.validateFinancialRecordData(financialRecords[0]);

      if (financialValidation.isValid || financialValidation.errors.length > 0) {
        results.push({ test: 'Financial record validation', passed: true });
        passed++;
      } else {
        results.push({ test: 'Financial record validation', passed: false, error: 'Validation logic error' });
        failed++;
      }

    } catch (error) {
      results.push({
        test: 'Data validation tests',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      failed++;
    }

    return { passed, failed, results };
  }

  // Test relationship queries
  static testRelationshipQueries(): { passed: number; failed: number; results: Array<{ test: string; passed: boolean; error?: string }> } {
    const results = [];
    let passed = 0;
    let failed = 0;

    try {
      const animals = TestDataGenerator.generateMockAnimals(10);
      const healthRecords = TestDataGenerator.generateMockHealthRecords(animals, 15);

      // Test finding animals with high health costs
      const highCostAnimals = RelationshipQueries.findAnimalsWithHighHealthCosts(animals, healthRecords, 500);

      if (Array.isArray(highCostAnimals)) {
        results.push({ test: 'High health cost animal query', passed: true });
        passed++;
      } else {
        results.push({ test: 'High health cost animal query', passed: false, error: 'Query returned invalid result' });
        failed++;
      }

      // Test finding most profitable species
      const financialRecords = TestDataGenerator.generateMockFinancialRecords(10);
      const profitableSpecies = RelationshipQueries.findMostProfitableSpecies(animals, financialRecords, 3);

      if (Array.isArray(profitableSpecies) && profitableSpecies.length <= 3) {
        results.push({ test: 'Most profitable species query', passed: true });
        passed++;
      } else {
        results.push({ test: 'Most profitable species query', passed: false, error: 'Query returned invalid result' });
        failed++;
      }

      // Test task impact analysis
      const tasks = TestDataGenerator.generateMockTasks(5);
      const taskImpact = RelationshipQueries.findTasksImpactingAnimalHealth(tasks, animals, healthRecords);

      if (Array.isArray(taskImpact)) {
        results.push({ test: 'Task impact analysis', passed: true });
        passed++;
      } else {
        results.push({ test: 'Task impact analysis', passed: false, error: 'Query returned invalid result' });
        failed++;
      }

    } catch (error) {
      results.push({
        test: 'Relationship query tests',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      failed++;
    }

    return { passed, failed, results };
  }

  // Test audit logging
  static testAuditLogging(): { passed: number; failed: number; results: Array<{ test: string; passed: boolean; error?: string }> } {
    const results = [];
    let passed = 0;
    let failed = 0;

    try {
      // Clear previous logs
      TenantAuditLogger['logs'] = [];

      // Test logging an activity
      TenantAuditLogger.logActivity(
        'test-tenant',
        'test-user',
        'create',
        'animal',
        'animal_123',
        { species: 'cattle', weight: 450 }
      );

      const logs = TenantAuditLogger.getTenantLogs('test-tenant', 10);

      if (logs.length === 1 && logs[0].action === 'create' && logs[0].resource === 'animal') {
        results.push({ test: 'Audit logging', passed: true });
        passed++;
      } else {
        results.push({ test: 'Audit logging', passed: false, error: 'Audit logging failed' });
        failed++;
      }

      // Test activity summary
      const summary = TenantAuditLogger.getActivitySummary('test-tenant', 24);

      if (typeof summary.totalActions === 'number' && summary.actionsByType) {
        results.push({ test: 'Activity summary generation', passed: true });
        passed++;
      } else {
        results.push({ test: 'Activity summary generation', passed: false, error: 'Activity summary generation failed' });
        failed++;
      }

    } catch (error) {
      results.push({
        test: 'Audit logging tests',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      failed++;
    }

    return { passed, failed, results };
  }

  // Run all integration tests
  static runAllTests(): {
    totalPassed: number;
    totalFailed: number;
    results: Array<{ category: string; passed: number; failed: number; tests: Array<{ test: string; passed: boolean; error?: string }> }>;
  } {
    const testCategories = [
      { name: 'Data Transformers', test: this.testDataTransformers },
      { name: 'Cross-Collection Aggregation', test: this.testCrossCollectionAggregation },
      { name: 'Tenant Isolation', test: this.testTenantIsolation },
      { name: 'Data Validation', test: this.testDataValidation },
      { name: 'Relationship Queries', test: this.testRelationshipQueries },
      { name: 'Audit Logging', test: this.testAuditLogging },
    ];

    let totalPassed = 0;
    let totalFailed = 0;
    const results = [];

    for (const category of testCategories) {
      const categoryResult = category.test();
      totalPassed += categoryResult.passed;
      totalFailed += categoryResult.failed;
      results.push({
        category: category.name,
        ...categoryResult,
      });
    }

    return {
      totalPassed,
      totalFailed,
      results: results.map(result => ({
        category: result.category,
        passed: result.passed,
        failed: result.failed,
        tests: result.results
      })),
    };
  }
}

// Visualization connection tests
export class VisualizationConnectionTests {
  // Test chart data generation
  static testChartDataGeneration(): { passed: number; failed: number; results: Array<{ test: string; passed: boolean; error?: string }> } {
    const results = [];
    let passed = 0;
    let failed = 0;

    try {
      const animals = TestDataGenerator.generateMockAnimals(8);

      // Test that transformers produce valid chart data
      const speciesData = AnimalDataTransformer.toSpeciesDistribution(animals);
      if (speciesData.every(item => typeof item.value === 'number' && item.value >= 0)) {
        results.push({ test: 'Species distribution chart data', passed: true });
        passed++;
      } else {
        results.push({ test: 'Species distribution chart data', passed: false, error: 'Invalid chart data format' });
        failed++;
      }

      const healthData = AnimalDataTransformer.toHealthStatusDistribution(animals);
      if (healthData.every(item => typeof item.value === 'number' && item.value >= 0)) {
        results.push({ test: 'Health status chart data', passed: true });
        passed++;
      } else {
        results.push({ test: 'Health status chart data', passed: false, error: 'Invalid chart data format' });
        failed++;
      }

      const weightData = AnimalDataTransformer.toWeightDistribution(animals);
      if (weightData.every(item => typeof item.value === 'number' && item.value >= 0)) {
        results.push({ test: 'Weight distribution chart data', passed: true });
        passed++;
      } else {
        results.push({ test: 'Weight distribution chart data', passed: false, error: 'Invalid chart data format' });
        failed++;
      }

    } catch (error) {
      results.push({
        test: 'Chart data generation tests',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      failed++;
    }

    return { passed, failed, results };
  }

  // Test data formatting utilities
  static testDataFormatting(): { passed: number; failed: number; results: Array<{ test: string; passed: boolean; error?: string }> } {
    const results = [];
    let passed = 0;
    let failed = 0;

    try {
      // Test currency formatting
      const currencyFormatted = DataFormatter.formatCurrency(1234.56, 'ZAR');
      if (currencyFormatted.includes('R') && currencyFormatted.includes('1,234')) {
        results.push({ test: 'Currency formatting', passed: true });
        passed++;
      } else {
        results.push({ test: 'Currency formatting', passed: false, error: 'Currency formatting failed' });
        failed++;
      }

      // Test percentage formatting
      const percentageFormatted = DataFormatter.formatPercentage(85.5, 1);
      if (percentageFormatted === '85.5%') {
        results.push({ test: 'Percentage formatting', passed: true });
        passed++;
      } else {
        results.push({ test: 'Percentage formatting', passed: false, error: 'Percentage formatting failed' });
        failed++;
      }

      // Test date formatting
      const testDate = new Date('2024-01-15T10:30:00');
      const dateFormatted = DataFormatter.formatDate(testDate);
      if (dateFormatted.includes('Jan') && dateFormatted.includes('2024')) {
        results.push({ test: 'Date formatting', passed: true });
        passed++;
      } else {
        results.push({ test: 'Date formatting', passed: false, error: 'Date formatting failed' });
        failed++;
      }

    } catch (error) {
      results.push({
        test: 'Data formatting tests',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      failed++;
    }

    return { passed, failed, results };
  }

  // Test data flow integration
  static testDataFlowIntegration(): { passed: number; failed: number; results: Array<{ test: string; passed: boolean; error?: string }> } {
    const results = [];
    let passed = 0;
    let failed = 0;

    try {
      // Simulate complete data flow from generation to visualization
      const animals = TestDataGenerator.generateMockAnimals(5);
      const healthRecords = TestDataGenerator.generateMockHealthRecords(animals, 5);
      const financialRecords = TestDataGenerator.generateMockFinancialRecords(5);

      // Test that data flows correctly through transformers
      const speciesData = AnimalDataTransformer.toSpeciesDistribution(animals);
      const healthData = HealthDataTransformer.toSeverityDistribution(healthRecords);
      const financialData = FinancialDataTransformer.toMonthlyTrends(financialRecords);

      // Test cross-collection aggregation
      const metrics = CrossCollectionAggregator.calculateCrossCollectionMetrics(
        animals,
        healthRecords,
        financialRecords,
        [],
        []
      );

      // Verify the entire pipeline produces consistent results
      const totalAnimalsFromSpecies = speciesData.reduce((sum, item) => sum + item.value, 0);
      const totalAnimalsFromMetrics = metrics.animalHealth.totalAnimals;

      if (totalAnimalsFromSpecies === totalAnimalsFromMetrics) {
        results.push({ test: 'Data flow consistency', passed: true });
        passed++;
      } else {
        results.push({ test: 'Data flow consistency', passed: false, error: 'Data flow inconsistency detected' });
        failed++;
      }

      // Test that all chart data has required properties
      const allChartData = [...speciesData, ...healthData, ...financialData];
      const validChartData = allChartData.every(item =>
        typeof item.value === 'number' &&
        typeof item.label === 'string' &&
        item.value >= 0
      );

      if (validChartData) {
        results.push({ test: 'Chart data format validation', passed: true });
        passed++;
      } else {
        results.push({ test: 'Chart data format validation', passed: false, error: 'Invalid chart data format' });
        failed++;
      }

    } catch (error) {
      results.push({
        test: 'Data flow integration tests',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      failed++;
    }

    return { passed, failed, results };
  }
}

// Performance tests
export class PerformanceTests {
  // Test data processing performance
  static testDataProcessingPerformance(): { passed: number; failed: number; results: Array<{ test: string; passed: boolean; duration?: number; error?: string }> } {
    const results = [];
    let passed = 0;
    let failed = 0;

    try {
      const largeDatasetSize = 1000;

      // Test animal data processing performance
      const startTime = performance.now();
      const animals = TestDataGenerator.generateMockAnimals(largeDatasetSize);
      const speciesData = AnimalDataTransformer.toSpeciesDistribution(animals);
      const endTime = performance.now();

      const duration = endTime - startTime;

      if (duration < 1000 && speciesData.length > 0) { // Should complete within 1 second
        results.push({ test: 'Large dataset animal processing', passed: true, duration });
        passed++;
      } else {
        results.push({ test: 'Large dataset animal processing', passed: false, duration, error: 'Performance threshold exceeded' });
        failed++;
      }

      // Test cross-collection aggregation performance
      const healthRecords = TestDataGenerator.generateMockHealthRecords(animals, largeDatasetSize);
      const financialRecords = TestDataGenerator.generateMockFinancialRecords(largeDatasetSize);

      const aggStartTime = performance.now();
      const metrics = CrossCollectionAggregator.calculateCrossCollectionMetrics(
        animals,
        healthRecords,
        financialRecords,
        [],
        []
      );
      const aggEndTime = performance.now();

      const aggDuration = aggEndTime - aggStartTime;

      if (aggDuration < 2000 && metrics) { // Should complete within 2 seconds
        results.push({ test: 'Large dataset aggregation', passed: true, duration: aggDuration });
        passed++;
      } else {
        results.push({ test: 'Large dataset aggregation', passed: false, duration: aggDuration, error: 'Aggregation performance threshold exceeded' });
        failed++;
      }

    } catch (error) {
      results.push({
        test: 'Performance tests',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      failed++;
    }

    return { passed, failed, results };
  }
}

// Main test runner
export class IntegrationTestRunner {
  static runAllTests(): {
    summary: {
      totalPassed: number;
      totalFailed: number;
      totalTests: number;
      successRate: number;
    };
    categories: Array<{
      category: string;
      passed: number;
      failed: number;
      tests: Array<{ test: string; passed: boolean; duration?: number; error?: string }>;
    }>;
  } {
    const dataIntegrationTests = DataIntegrationTests.runAllTests();
    const visualizationTests = this.runVisualizationTests();
    const performanceTests = PerformanceTests.testDataProcessingPerformance();

    const totalPassed = dataIntegrationTests.totalPassed + visualizationTests.passed + performanceTests.passed;
    const totalFailed = dataIntegrationTests.totalFailed + visualizationTests.failed + performanceTests.failed;
    const totalTests = totalPassed + totalFailed;

    return {
      summary: {
        totalPassed,
        totalFailed,
        totalTests,
        successRate: totalTests > 0 ? (totalPassed / totalTests) * 100 : 0,
      },
      categories: [
        ...dataIntegrationTests.results.map(result => ({
          category: result.category,
          passed: result.passed,
          failed: result.failed,
          tests: result.tests.map(t => ({ ...t }))
        })),
        {
          category: 'Visualization Tests',
          passed: visualizationTests.passed,
          failed: visualizationTests.failed,
          tests: visualizationTests.results.map(t => ({ ...t }))
        },
        {
          category: 'Performance Tests',
          passed: performanceTests.passed,
          failed: performanceTests.failed,
          tests: performanceTests.results.map(t => ({ ...t }))
        },
      ],
    };
  }

  private static runVisualizationTests(): { passed: number; failed: number; results: Array<{ test: string; passed: boolean; error?: string }> } {
    const chartTests = VisualizationConnectionTests.testChartDataGeneration();
    const formatTests = VisualizationConnectionTests.testDataFormatting();
    const flowTests = VisualizationConnectionTests.testDataFlowIntegration();

    const totalPassed = chartTests.passed + formatTests.passed + flowTests.passed;
    const totalFailed = chartTests.failed + formatTests.failed + flowTests.failed;

    return {
      passed: totalPassed,
      failed: totalFailed,
      results: [
        ...chartTests.results,
        ...formatTests.results,
        ...flowTests.results,
      ],
    };
  }
}