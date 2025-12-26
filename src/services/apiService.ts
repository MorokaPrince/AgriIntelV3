interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationInfo;
}

// Type definitions for API data structures
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

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ApiService {
  private baseUrl: string;
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private pendingRequests: Map<string, Promise<unknown>> = new Map();

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  }

  private getCacheKey(endpoint: string, options: RequestInit = {}): string {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${endpoint}:${body}`;
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  private setCache<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useCache: boolean = false,
    cacheTtl: number = 5 * 60 * 1000
  ): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint, options);

    // Check cache first for GET requests
    if (useCache && options.method === 'GET') {
      const cachedData = this.getFromCache<T>(cacheKey);
      if (cachedData !== null) {
        return cachedData;
      }
    }

    // Deduplicate concurrent requests
    const pendingKey = `${options.method || 'GET'}:${endpoint}`;
    if (this.pendingRequests.has(pendingKey)) {
      return this.pendingRequests.get(pendingKey) as Promise<T>;
    }

    const requestPromise = this.performRequest<T>(endpoint, options, cacheKey, useCache, cacheTtl);
    this.pendingRequests.set(pendingKey, requestPromise);

    try {
      return await requestPromise;
    } finally {
      this.pendingRequests.delete(pendingKey);
    }
  }

  private async performRequest<T>(
    endpoint: string,
    options: RequestInit,
    cacheKey: string,
    useCache: boolean,
    cacheTtl: number
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Enhanced error handling with specific error types
        if (response.status === 429) {
          throw new Error(`Rate limit exceeded: ${errorData.error || 'Too many requests'}`);
        } else if (response.status === 401) {
          throw new Error(`Authentication required: ${errorData.error || 'Unauthorized'}`);
        } else if (response.status === 403) {
          throw new Error(`Access forbidden: ${errorData.error || 'Forbidden'}`);
        } else if (response.status >= 500) {
          throw new Error(`Server error: ${errorData.error || 'Internal server error'}`);
        } else {
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();

      // Cache successful GET requests
      if (useCache && options.method === 'GET') {
        this.setCache(cacheKey, data, cacheTtl);
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);

      // Retry logic for transient failures
      if (error instanceof Error && this.isRetryableError(error)) {
        console.log(`Retrying request for ${endpoint}...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        return this.performRequest(endpoint, options, cacheKey, useCache, cacheTtl);
      }

      throw error;
    }
  }

  private isRetryableError(error: Error): boolean {
    const retryableErrors = [
      'NetworkError',
      'TimeoutError',
      'ECONNRESET',
      'ENOTFOUND',
      'Server error',
    ];

    return retryableErrors.some(retryableError =>
      error.message.includes(retryableError)
    );
  }

  private getAuthHeaders(): HeadersInit {
    // In production, this should come from NextAuth session
    // For now, we'll use a basic implementation
    return {
      'Content-Type': 'application/json',
      // Add proper authentication headers when available
    };
  }

  // Animal API methods
  async getAnimals(params?: {
    tenantId?: string;
    page?: number;
    limit?: number;
    species?: string;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Animal>> {
    const searchParams = new URLSearchParams();
    if (params?.tenantId) searchParams.append('tenantId', params.tenantId);
    if (params?.page) searchParams.append('page', Math.max(1, params.page).toString());
    if (params?.limit) searchParams.append('limit', Math.min(1000, Math.max(1, params.limit)).toString());
    if (params?.species) searchParams.append('species', params.species);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);

    const query = searchParams.toString();
    // Cache animal data for 2 minutes since it doesn't change frequently
    return this.request<PaginatedResponse<Animal>>(
      `/animals${query ? `?${query}` : ''}`,
      {},
      true,
      2 * 60 * 1000
    );
  }

  async getAnimal(id: string): Promise<ApiResponse<Animal>> {
    return this.request<ApiResponse<Animal>>(`/animals/${id}`);
  }

  async createAnimal(animalData: Omit<Animal, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Animal>> {
    return this.request<ApiResponse<Animal>>('/animals', {
      method: 'POST',
      body: JSON.stringify(animalData),
      headers: this.getAuthHeaders(),
    });
  }

  async updateAnimal(id: string, animalData: Partial<Omit<Animal, '_id' | 'createdAt' | 'updatedAt'>>): Promise<ApiResponse<Animal>> {
    return this.request<ApiResponse<Animal>>(`/animals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(animalData),
      headers: this.getAuthHeaders(),
    });
  }

  async deleteAnimal(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<ApiResponse<{ message: string }>>(`/animals/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
  }

  // Health API methods
  async getHealthRecords(params?: {
    tenantId?: string;
    page?: number;
    limit?: number;
    animalId?: string;
    severity?: string;
    status?: string;
  }): Promise<PaginatedResponse<HealthRecord>> {
    const searchParams = new URLSearchParams();
    if (params?.tenantId) searchParams.append('tenantId', params.tenantId);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.animalId) searchParams.append('animalId', params.animalId);
    if (params?.severity) searchParams.append('severity', params.severity);
    if (params?.status) searchParams.append('status', params.status);

    const query = searchParams.toString();
    return this.request<PaginatedResponse<HealthRecord>>(`/health${query ? `?${query}` : ''}`);
  }

  async createHealthRecord(healthData: Omit<HealthRecord, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<HealthRecord>> {
    return this.request<ApiResponse<HealthRecord>>('/health', {
      method: 'POST',
      body: JSON.stringify(healthData),
      headers: this.getAuthHeaders(),
    });
  }

  // Financial API methods
  async getFinancialRecords(params?: {
    tenantId?: string;
    page?: number;
    limit?: number;
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<FinancialRecord>> {
    const searchParams = new URLSearchParams();
    if (params?.tenantId) searchParams.append('tenantId', params.tenantId);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.type) searchParams.append('type', params.type);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);

    const query = searchParams.toString();
    return this.request<PaginatedResponse<FinancialRecord>>(`/financial${query ? `?${query}` : ''}`);
  }

  async createFinancialRecord(financialData: Omit<FinancialRecord, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<FinancialRecord>> {
    return this.request<ApiResponse<FinancialRecord>>('/financial', {
      method: 'POST',
      body: JSON.stringify(financialData),
      headers: this.getAuthHeaders(),
    });
  }

  // Feeding API methods
  async getFeedRecords(params?: {
    tenantId?: string;
    page?: number;
    limit?: number;
    type?: string;
    lowStock?: boolean;
  }): Promise<PaginatedResponse<FeedRecord>> {
    const searchParams = new URLSearchParams();
    if (params?.tenantId) searchParams.append('tenantId', params.tenantId);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.type) searchParams.append('type', params.type);
    if (params?.lowStock) searchParams.append('lowStock', 'true');

    const query = searchParams.toString();
    return this.request<PaginatedResponse<FeedRecord>>(`/feeding${query ? `?${query}` : ''}`);
  }

  async createFeedRecord(feedData: Omit<FeedRecord, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<FeedRecord>> {
    return this.request<ApiResponse<FeedRecord>>('/feeding', {
      method: 'POST',
      body: JSON.stringify(feedData),
      headers: this.getAuthHeaders(),
    });
  }

  // Breeding API methods
  async getBreedingRecords(params?: {
    tenantId?: string;
    page?: number;
    limit?: number;
    species?: string;
    status?: string;
  }): Promise<PaginatedResponse<BreedingRecord>> {
    const searchParams = new URLSearchParams();
    if (params?.tenantId) searchParams.append('tenantId', params.tenantId);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.species) searchParams.append('species', params.species);
    if (params?.status) searchParams.append('status', params.status);

    const query = searchParams.toString();
    return this.request<PaginatedResponse<BreedingRecord>>(`/breeding${query ? `?${query}` : ''}`);
  }

  async createBreedingRecord(breedingData: Omit<BreedingRecord, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<BreedingRecord>> {
    return this.request<ApiResponse<BreedingRecord>>('/breeding', {
      method: 'POST',
      body: JSON.stringify(breedingData),
      headers: this.getAuthHeaders(),
    });
  }

  // RFID API methods
  async getRFIDRecords(params?: {
    tenantId?: string;
    page?: number;
    limit?: number;
    status?: string;
    tagType?: string;
    lowBattery?: boolean;
  }): Promise<PaginatedResponse<RFIDRecord>> {
    const searchParams = new URLSearchParams();
    if (params?.tenantId) searchParams.append('tenantId', params.tenantId);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.tagType) searchParams.append('tagType', params.tagType);
    if (params?.lowBattery) searchParams.append('lowBattery', 'true');

    const query = searchParams.toString();
    return this.request<PaginatedResponse<RFIDRecord>>(`/rfid${query ? `?${query}` : ''}`);
  }

  async createRFIDRecord(rfidData: Omit<RFIDRecord, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<RFIDRecord>> {
    return this.request<ApiResponse<RFIDRecord>>('/rfid', {
      method: 'POST',
      body: JSON.stringify(rfidData),
      headers: this.getAuthHeaders(),
    });
  }

  // Tasks API methods
  async getTasks(params?: {
    tenantId?: string;
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    category?: string;
    assignedTo?: string;
  }): Promise<PaginatedResponse<TaskRecord>> {
    const searchParams = new URLSearchParams();
    if (params?.tenantId) searchParams.append('tenantId', params.tenantId);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.priority) searchParams.append('priority', params.priority);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.assignedTo) searchParams.append('assignedTo', params.assignedTo);

    const query = searchParams.toString();
    return this.request<PaginatedResponse<TaskRecord>>(`/tasks${query ? `?${query}` : ''}`);
  }

  async createTask(taskData: Omit<TaskRecord, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<TaskRecord>> {
    return this.request<ApiResponse<TaskRecord>>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
      headers: this.getAuthHeaders(),
    });
  }

  // Weather API method (already exists)
  async getWeather(location: string): Promise<ApiResponse<unknown>> {
    return this.request<ApiResponse<unknown>>(`/weather/${encodeURIComponent(location)}`);
  }
}

export const apiService = new ApiService();