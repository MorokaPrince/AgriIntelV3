import { BaseServiceClass } from './base-service';
import { ServiceResponse, PaginatedResponse, PaginationParams, ServiceConfig } from './types';

// Domain model interfaces (subset for API service)
export interface Animal {
  _id: string;
  tenantId: string;
  rfidTag: string;
  name?: string;
  species: 'cattle' | 'sheep' | 'goats' | 'poultry' | 'pigs' | 'other';
  breed: string;
  dateOfBirth: Date;
  gender: 'male' | 'female';
  color: string;
  weight: number;
  height?: number;
  status: 'active' | 'sold' | 'deceased' | 'quarantined' | 'breeding';
  location: {
    latitude: number;
    longitude: number;
    address: string;
    farmSection: string;
  };
  parentage?: {
    sireId?: string;
    damId?: string;
    sireName?: string;
    damName?: string;
  };
  purchaseInfo?: {
    purchaseDate: Date;
    purchasePrice: number;
    currency: string;
    supplier: string;
  };
  health: {
    overallCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    lastCheckup: Date;
    nextCheckup: Date;
    vaccinations: Array<{
      vaccine: string;
      date: Date;
      nextDue: Date;
      veterinarian: string;
    }>;
    diseases: Array<{
      disease: string;
      diagnosisDate: Date;
      treatment: string;
      status: 'active' | 'recovered' | 'chronic';
    }>;
  };
  breeding: {
    isBreedingStock: boolean;
    fertilityStatus: 'fertile' | 'subfertile' | 'infertile';
    lastBreedingDate?: Date;
    expectedCalvingDate?: Date;
    offspring: string[];
  };
  nutrition: {
    dailyFeedIntake: number;
    feedType: string;
    supplements: string[];
    feedingSchedule: string;
  };
  productivity: {
    milkProduction?: number;
    eggProduction?: number;
    weightGain: number;
    lastMeasurement: Date;
  };
  images: Array<{
    url: string;
    caption: string;
    uploadedAt: Date;
  }>;
  notes: string;
  alerts: Array<{
    type: 'health' | 'breeding' | 'nutrition' | 'maintenance';
    message: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    createdAt: Date;
    resolved: boolean;
    resolvedAt?: Date;
  }>;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthRecord {
  _id: string;
  tenantId: string;
  animalId: string;
  animalRfid: string;
  recordType: 'checkup' | 'vaccination' | 'treatment' | 'surgery' | 'emergency' | 'quarantine';
  date: Date;
  veterinarian: string;
  veterinarianId?: string;
  diagnosis: string;
  symptoms: string[];
  treatment: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: number;
    instructions: string;
  }>;
  vaccinations: Array<{
    vaccine: string;
    batchNumber: string;
    manufacturer: string;
    nextDueDate: Date;
    notes: string;
  }>;
  tests: Array<{
    testType: string;
    result: string;
    normalRange: string;
    notes: string;
  }>;
  followUp: {
    required: boolean;
    date?: Date;
    instructions: string;
  };
  cost: {
    consultationFee: number;
    medicationCost: number;
    testCost: number;
    totalCost: number;
    currency: string;
  };
  notes: string;
  attachments: Array<{
    type: 'image' | 'document' | 'lab_result';
    url: string;
    filename: string;
    uploadedAt: Date;
  }>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'chronic' | 'monitoring';
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialRecord {
  _id: string;
  tenantId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedRecord {
  _id: string;
  tenantId: string;
  feedName: string;
  type: 'concentrate' | 'roughage' | 'supplement' | 'silage';
  currentStock: number;
  unit: string;
  minStock: number;
  costPerUnit: number;
  supplier: string;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface BreedingRecord {
  _id: string;
  tenantId: string;
  programName: string;
  species: string;
  breed: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  totalAnimals: number;
  expectedOffspring: number;
  actualOffspring: number;
  successRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface RFIDRecord {
  _id: string;
  tenantId: string;
  tagId: string;
  animalId: string;
  animalName: string;
  species: string;
  breed: string;
  tagType: 'ear_tag' | 'bolus' | 'collar' | 'leg_band';
  batteryLevel: number;
  signalStrength: 'excellent' | 'good' | 'fair' | 'poor';
  status: 'active' | 'maintenance' | 'offline' | 'error';
  lastScan: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskRecord {
  _id: string;
  tenantId: string;
  title: string;
  description: string;
  assignedTo: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  assignedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  dueDate: string;
  completedDate?: string;
  category: 'feeding' | 'health' | 'maintenance' | 'breeding' | 'financial' | 'general';
  progress: number;
  estimatedHours?: number;
  actualHours?: number;
  location?: string;
  animalId?: {
    _id: string;
    name: string;
    species: string;
  };
  kpi?: {
    efficiency?: number;
    quality?: number;
    timeliness?: number;
    safety?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export class ImprovedApiService extends BaseServiceClass {
  constructor(config: Partial<ServiceConfig> = {}) {
    const apiConfig: ServiceConfig = {
      baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
      timeout: 15000,
      retries: 3,
      retryDelay: 1000,
      cache: {
        enabled: true,
        ttl: 5 * 60 * 1000, // 5 minutes
        maxSize: 200,
      },
      ...config,
    };

    super(apiConfig);
  }

  protected getAuthHeaders(): Record<string, string> {
    // In a real application, this would get the auth token from NextAuth session
    // For now, we'll use a simple approach that can be extended
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add tenant ID if available (for multi-tenancy)
    if (typeof window !== 'undefined') {
      const tenantId = localStorage.getItem('tenantId');
      if (tenantId) {
        headers['X-Tenant-ID'] = tenantId;
      }
    }

    return headers;
  }

  // Animal API methods with enhanced error handling and caching
  async getAnimals(params?: PaginationParams & {
    species?: string;
    status?: string;
    search?: string;
  }): Promise<ServiceResponse<PaginatedResponse<Animal>>> {
    return this.makeRequest<PaginatedResponse<Animal>>('/animals', {
      method: 'GET',
      params: params as Record<string, string | number | boolean>,
      config: {
        cache: { enabled: true, ttl: 2 * 60 * 1000, maxSize: 50 }, // 2 minutes cache
      },
    });
  }

  async getAnimal(id: string): Promise<ServiceResponse<Animal>> {
    return this.makeRequest<Animal>(`/animals/${id}`, {
      method: 'GET',
      config: {
        cache: { enabled: true, ttl: 5 * 60 * 1000, maxSize: 100 }, // 5 minutes cache for individual records
      },
    });
  }

  async createAnimal(animalData: Omit<Animal, '_id' | 'createdAt' | 'updatedAt'>): Promise<ServiceResponse<Animal>> {
    return this.makeRequest<Animal>('/animals', {
      method: 'POST',
      body: animalData,
      config: {
        cache: { enabled: false, ttl: 0, maxSize: 0 }, // Don't cache POST requests
      },
    });
  }

  async updateAnimal(id: string, animalData: Partial<Omit<Animal, '_id' | 'createdAt' | 'updatedAt'>>): Promise<ServiceResponse<Animal>> {
    return this.makeRequest<Animal>(`/animals/${id}`, {
      method: 'PUT',
      body: animalData,
      config: {
        cache: { enabled: false, ttl: 0, maxSize: 0 }, // Don't cache PUT requests
      },
    });
  }

  async deleteAnimal(id: string): Promise<ServiceResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/animals/${id}`, {
      method: 'DELETE',
      config: {
        cache: { enabled: false, ttl: 0, maxSize: 0 }, // Don't cache DELETE requests
      },
    });
  }

  // Health API methods
  async getHealthRecords(params?: PaginationParams & {
    animalId?: string;
    severity?: string;
    status?: string;
  }): Promise<ServiceResponse<PaginatedResponse<HealthRecord>>> {
    return this.makeRequest<PaginatedResponse<HealthRecord>>('/health', {
      method: 'GET',
      params: params as Record<string, string | number | boolean>,
      config: {
        cache: { enabled: true, ttl: 1 * 60 * 1000, maxSize: 50 }, // 1 minute cache for health records
      },
    });
  }

  async createHealthRecord(healthData: Omit<HealthRecord, '_id' | 'createdAt' | 'updatedAt'>): Promise<ServiceResponse<HealthRecord>> {
    return this.makeRequest<HealthRecord>('/health', {
      method: 'POST',
      body: healthData,
      config: {
        cache: { enabled: false, ttl: 0, maxSize: 0 },
      },
    });
  }

  // Financial API methods
  async getFinancialRecords(params?: PaginationParams & {
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ServiceResponse<PaginatedResponse<FinancialRecord>>> {
    return this.makeRequest<PaginatedResponse<FinancialRecord>>('/financial', {
      method: 'GET',
      params: params as Record<string, string | number | boolean>,
      config: {
        cache: { enabled: true, ttl: 10 * 60 * 1000, maxSize: 50 }, // 10 minutes cache for financial data
      },
    });
  }

  async createFinancialRecord(financialData: Omit<FinancialRecord, '_id' | 'createdAt' | 'updatedAt'>): Promise<ServiceResponse<FinancialRecord>> {
    return this.makeRequest<FinancialRecord>('/financial', {
      method: 'POST',
      body: financialData,
      config: {
        cache: { enabled: false, ttl: 0, maxSize: 0 },
      },
    });
  }

  // Feeding API methods
  async getFeedRecords(params?: PaginationParams & {
    type?: string;
    lowStock?: boolean;
  }): Promise<ServiceResponse<PaginatedResponse<FeedRecord>>> {
    return this.makeRequest<PaginatedResponse<FeedRecord>>('/feeding', {
      method: 'GET',
      params: params as Record<string, string | number | boolean>,
      config: {
        cache: { enabled: true, ttl: 5 * 60 * 1000, maxSize: 50 }, // 5 minutes cache for feed data
      },
    });
  }

  async createFeedRecord(feedData: Omit<FeedRecord, '_id' | 'createdAt' | 'updatedAt'>): Promise<ServiceResponse<FeedRecord>> {
    return this.makeRequest<FeedRecord>('/feeding', {
      method: 'POST',
      body: feedData,
      config: {
        cache: { enabled: false, ttl: 0, maxSize: 0 },
      },
    });
  }

  // Breeding API methods
  async getBreedingRecords(params?: PaginationParams & {
    species?: string;
    status?: string;
  }): Promise<ServiceResponse<PaginatedResponse<BreedingRecord>>> {
    return this.makeRequest<PaginatedResponse<BreedingRecord>>('/breeding', {
      method: 'GET',
      params: params as Record<string, string | number | boolean>,
      config: {
        cache: { enabled: true, ttl: 15 * 60 * 1000, maxSize: 50 }, // 15 minutes cache for breeding data
      },
    });
  }

  async createBreedingRecord(breedingData: Omit<BreedingRecord, '_id' | 'createdAt' | 'updatedAt'>): Promise<ServiceResponse<BreedingRecord>> {
    return this.makeRequest<BreedingRecord>('/breeding', {
      method: 'POST',
      body: breedingData,
      config: {
        cache: { enabled: false, ttl: 0, maxSize: 0 },
      },
    });
  }

  // RFID API methods
  async getRFIDRecords(params?: PaginationParams & {
    status?: string;
    tagType?: string;
    lowBattery?: boolean;
  }): Promise<ServiceResponse<PaginatedResponse<RFIDRecord>>> {
    return this.makeRequest<PaginatedResponse<RFIDRecord>>('/rfid', {
      method: 'GET',
      params: params as Record<string, string | number | boolean>,
      config: {
        cache: { enabled: true, ttl: 2 * 60 * 1000, maxSize: 50 }, // 2 minutes cache for RFID data
      },
    });
  }

  async createRFIDRecord(rfidData: Omit<RFIDRecord, '_id' | 'createdAt' | 'updatedAt'>): Promise<ServiceResponse<RFIDRecord>> {
    return this.makeRequest<RFIDRecord>('/rfid', {
      method: 'POST',
      body: rfidData,
      config: {
        cache: { enabled: false, ttl: 0, maxSize: 0 },
      },
    });
  }

  // Tasks API methods
  async getTasks(params?: PaginationParams & {
    status?: string;
    priority?: string;
    category?: string;
    assignedTo?: string;
  }): Promise<ServiceResponse<PaginatedResponse<TaskRecord>>> {
    return this.makeRequest<PaginatedResponse<TaskRecord>>('/tasks', {
      method: 'GET',
      params: params as Record<string, string | number | boolean>,
      config: {
        cache: { enabled: true, ttl: 30 * 1000, maxSize: 50 }, // 30 seconds cache for tasks (dynamic data)
      },
    });
  }

  async createTask(taskData: Omit<TaskRecord, '_id' | 'createdAt' | 'updatedAt'>): Promise<ServiceResponse<TaskRecord>> {
    return this.makeRequest<TaskRecord>('/tasks', {
      method: 'POST',
      body: taskData,
      config: {
        cache: { enabled: false, ttl: 0, maxSize: 0 },
      },
    });
  }

  // Batch operations for better performance
  async batchGetAnimals(ids: string[]): Promise<ServiceResponse<Animal[]>> {
    const requestId = this.generateRequestId();

    try {
      const promises = ids.map(id => this.getAnimal(id));
      const results = await Promise.allSettled(promises);

      const successful: Animal[] = [];
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success && result.value.data) {
          successful.push(result.value.data);
        } else {
          errors.push(`Failed to fetch animal ${ids[index]}: ${
            result.status === 'rejected'
              ? result.reason
              : result.value.error || 'Unknown error'
          }`);
        }
      });

      return {
        success: errors.length === 0,
        data: successful,
        error: errors.length > 0 ? errors.join('; ') : undefined,
        metadata: {
          timestamp: new Date(),
          requestId,
        },
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Batch request failed',
        metadata: {
          timestamp: new Date(),
          requestId,
        },
      };
    }
  }

  // Search functionality across multiple entity types
  async searchEntities(query: string, types: string[] = ['animals', 'tasks']): Promise<ServiceResponse<{
    animals?: Animal[];
    tasks?: TaskRecord[];
    total: number;
  }>> {
    return this.makeRequest(`/search`, {
      method: 'GET',
      params: { q: query, types: types.join(',') },
      config: {
        cache: { enabled: true, ttl: 2 * 60 * 1000, maxSize: 50 }, // 2 minutes cache for search results
      },
    });
  }

  // Dashboard data aggregation
  async getDashboardData(dateRange?: { start: string; end: string }): Promise<ServiceResponse<{
    animals: {
      total: number;
      bySpecies: Record<string, number>;
      byStatus: Record<string, number>;
      recentActivity: number;
    };
    health: {
      totalRecords: number;
      criticalAlerts: number;
      upcomingVaccinations: number;
    };
    financial: {
      totalIncome: number;
      totalExpenses: number;
      netProfit: number;
    };
    tasks: {
      pending: number;
      overdue: number;
      completed: number;
    };
  }>> {
    return this.makeRequest('/dashboard', {
      method: 'GET',
      params: dateRange as Record<string, string | number | boolean>,
      config: {
        cache: { enabled: true, ttl: 5 * 60 * 1000, maxSize: 50 }, // 5 minutes cache for dashboard data
      },
    });
  }
}

// Export singleton instance
export const improvedApiService = new ImprovedApiService();