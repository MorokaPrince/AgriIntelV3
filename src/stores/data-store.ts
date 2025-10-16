import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Types for unified data management
export interface BaseRecord {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  module: string;
  status: string;
}

export interface AnimalRecord extends BaseRecord {
  module: 'animals';
  animalId: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  location: string;
  rfidTag?: string;
  notes?: string;
}

export interface HealthRecord extends BaseRecord {
  module: 'health';
  animalId: string;
  animalName: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  treatment: string;
  medication?: string;
  dosage?: string;
  veterinarian: string;
  cost: number;
  followUpDate?: Date;
  resolved: boolean;
}

export interface FinancialRecord extends BaseRecord {
  module: 'financial';
  type: 'income' | 'expense';
  category: string;
  subcategory?: string;
  amount: number;
  currency: string;
  description: string;
  date: Date;
  paymentMethod: string;
  receiptNumber?: string;
  vendor?: string;
  tags?: string[];
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface FeedRecord extends BaseRecord {
  module: 'feeding';
  feedName: string;
  type: 'concentrate' | 'roughage' | 'supplement' | 'silage';
  currentStock: number;
  unit: string;
  minStock: number;
  maxStock: number;
  costPerUnit: number;
  supplier: string;
  expiryDate: Date;
  quality: 'premium' | 'standard' | 'basic';
  nutritionalValue: {
    protein: number;
    energy: number;
    fiber: number;
    fat: number;
    [key: string]: number | string;
  };
}

export interface BreedingRecord extends BaseRecord {
  module: 'breeding';
  programName: string;
  species: string;
  breed: string;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  totalAnimals: number;
  breedingFemales: number;
  breedingMales: number;
  expectedOffspring: number;
  actualOffspring: number;
  successRate: number;
  goals: string[];
  manager: string;
  budget: number;
  currency: string;
}

export interface RFIDRecord extends BaseRecord {
  module: 'rfid';
  tagId: string;
  animalId: string;
  animalName: string;
  species: string;
  breed: string;
  tagType: 'ear_tag' | 'bolus' | 'collar' | 'leg_band';
  frequency: string;
  installationDate: Date;
  lastScan: Date;
  batteryLevel: number;
  signalStrength: 'excellent' | 'good' | 'fair' | 'poor';
  location: string;
  status: 'active' | 'maintenance' | 'offline' | 'error';
  temperature?: number;
  healthAlerts: number;
  notes?: string;
}

export interface TaskRecord extends BaseRecord {
  module: 'tasks';
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  dueDate: Date;
  completedDate?: Date;
  category: string;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
  progress: number;
  dependencies?: string[];
  attachments?: string[];
  notes?: string;
}

export type UnifiedRecord =
  | AnimalRecord
  | HealthRecord
  | FinancialRecord
  | FeedRecord
  | BreedingRecord
  | RFIDRecord
  | TaskRecord;

interface DataState {
  records: UnifiedRecord[];
  totalRecords: number;
  maxRecords: number;
  isBetaExpired: boolean;
  betaExpiryDate: Date;
  currentUser: string;

  // Actions
  addRecord: (record: Omit<UnifiedRecord, '_id' | 'createdAt' | 'updatedAt'>) => boolean;
  updateRecord: (id: string, updates: Partial<UnifiedRecord>) => boolean;
  deleteRecord: (id: string) => boolean;
  getRecordsByModule: (module: string) => UnifiedRecord[];
  getRecordById: (id: string) => UnifiedRecord | undefined;
  getModuleStats: (module: string) => { total: number; active: number; recent: number };
  checkRecordLimit: () => boolean;
  checkBetaExpiry: () => boolean;
  initializeData: () => void;
  resetData: () => void;
}

const MAX_RECORDS = 48;
const BETA_DAYS = 60;

export const useDataStore = create<DataState>()(
  devtools(
    persist(
      (set, get) => ({
        records: [],
        totalRecords: 0,
        maxRecords: MAX_RECORDS,
        isBetaExpired: false,
        betaExpiryDate: new Date(Date.now() + BETA_DAYS * 24 * 60 * 60 * 1000),
        currentUser: 'user-1',

        addRecord: (recordData) => {
          const state = get();

          // Check record limit
          if (state.totalRecords >= MAX_RECORDS) {
            return false; // Cannot add more records
          }

          // Check beta expiry
          if (state.isBetaExpired) {
            return false; // Beta expired
          }

          const newRecord: UnifiedRecord = {
            ...recordData,
            _id: `${recordData.module}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as UnifiedRecord;

          set((state) => ({
            records: [...state.records, newRecord],
            totalRecords: state.totalRecords + 1,
          }));

          return true;
        },

        updateRecord: (id, updates) => {
          const state = get();

          if (state.isBetaExpired) {
            return false;
          }

          const recordIndex = state.records.findIndex(r => r._id === id);
          if (recordIndex === -1) return false;

          const updatedRecord: UnifiedRecord = {
            ...state.records[recordIndex],
            ...updates,
            updatedAt: new Date(),
          } as UnifiedRecord;

          set((state) => ({
            records: state.records.map(r => r._id === id ? updatedRecord : r),
          }));

          return true;
        },

        deleteRecord: (id) => {
          const state = get();

          if (state.isBetaExpired) {
            return false;
          }

          set((state) => ({
            records: state.records.filter(r => r._id !== id),
            totalRecords: Math.max(0, state.totalRecords - 1),
          }));

          return true;
        },

        getRecordsByModule: (module) => {
          return get().records.filter(r => r.module === module);
        },

        getRecordById: (id) => {
          return get().records.find(r => r._id === id);
        },

        getModuleStats: (module) => {
          const moduleRecords = get().records.filter(r => r.module === module);
          const now = new Date();
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

          return {
            total: moduleRecords.length,
            active: moduleRecords.filter(r => r.status === 'active').length,
            recent: moduleRecords.filter(r => r.createdAt >= thirtyDaysAgo).length,
          };
        },

        checkRecordLimit: () => {
          const state = get();
          return state.totalRecords >= MAX_RECORDS;
        },

        checkBetaExpiry: () => {
          const state = get();
          const now = new Date();
          const isExpired = now >= state.betaExpiryDate;

          if (isExpired && !state.isBetaExpired) {
            set({ isBetaExpired: true });
          }

          return isExpired;
        },

        initializeData: () => {
          const initialRecords: UnifiedRecord[] = [
            // Animals (12 records)
            ...Array.from({ length: 12 }, (_, i) => ({
              _id: `animals-${i + 1}`,
              module: 'animals' as const,
              createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(),
              createdBy: 'user-1',
              status: 'planning' as const,
              animalId: `ANG-${String(i + 1).padStart(3, '0')}`,
              name: `Premium Animal ${i + 1}`,
              species: ['Cattle', 'Sheep', 'Goats'][i % 3],
              breed: ['Angus', 'Merino', 'Boer'][i % 3],
              age: Math.floor(Math.random() * 60) + 6,
              weight: Math.floor(Math.random() * 500) + 50,
              healthStatus: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)] as 'excellent' | 'good' | 'fair',
              location: `Farm Section ${String.fromCharCode(65 + (i % 8))}`,
              rfidTag: `RFID-${String(i + 1).padStart(3, '0')}`,
              notes: `Sample animal record ${i + 1}`,
            } as AnimalRecord)),

            // Health Records (8 records)
            ...Array.from({ length: 8 }, (_, i) => ({
              _id: `health-${i + 1}`,
              module: 'health' as const,
              createdAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(),
              createdBy: 'user-1',
              status: 'planning' as const,
              animalId: `ANG-${String((i % 12) + 1).padStart(3, '0')}`,
              animalName: `Premium Animal ${(i % 12) + 1}`,
              condition: ['Vaccination', 'Injury', 'Illness', 'Check-up'][i % 4],
              severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
              treatment: `Treatment for ${['Vaccination', 'Injury', 'Illness', 'Check-up'][i % 4]}`,
              medication: `Medication ${i + 1}`,
              dosage: `${Math.floor(Math.random() * 10) + 1}ml`,
              veterinarian: 'Dr. Smith',
              cost: Math.floor(Math.random() * 1000) + 100,
              followUpDate: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000),
              resolved: Math.random() > 0.3,
            } as HealthRecord)),

            // Financial Records (8 records)
            ...Array.from({ length: 8 }, (_, i) => ({
              _id: `financial-${i + 1}`,
              module: 'financial' as const,
              createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(),
              createdBy: 'user-1',
              status: 'pending' as const,
              type: i % 2 === 0 ? 'income' as const : 'expense' as const,
              category: ['sales', 'feed', 'veterinary', 'equipment'][i % 4],
              amount: Math.floor(Math.random() * 5000) + 500,
              currency: 'ZAR',
              description: `Financial transaction ${i + 1}`,
              date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
              paymentMethod: ['bank_transfer', 'cash', 'card'][i % 3],
              receiptNumber: `REC-${String(i + 1).padStart(3, '0')}`,
              vendor: `Vendor ${i + 1}`,
              tags: [`tag${i + 1}`],
              isRecurring: i % 3 === 0,
              recurringFrequency: 'monthly' as const,
            } as FinancialRecord)),

            // Feed Records (5 records)
            ...Array.from({ length: 5 }, (_, i) => ({
              _id: `feeding-${i + 1}`,
              module: 'feeding' as const,
              createdAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(),
              createdBy: 'user-1',
              status: 'pending' as const,
              feedName: ['Premium Cattle Feed', 'Grass Hay', 'Mineral Mix', 'Maize Silage', 'Protein Supplement'][i],
              type: ['concentrate', 'roughage', 'supplement', 'silage', 'supplement'][i] as 'concentrate' | 'roughage' | 'supplement' | 'silage',
              currentStock: Math.floor(Math.random() * 1000) + 100,
              unit: 'kg',
              minStock: 50,
              maxStock: 1000,
              costPerUnit: Math.floor(Math.random() * 50) + 5,
              supplier: `Supplier ${i + 1}`,
              expiryDate: new Date(Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000),
              quality: ['premium', 'standard'][i % 2] as 'premium' | 'standard',
              nutritionalValue: {
                protein: Math.floor(Math.random() * 30) + 10,
                energy: Math.floor(Math.random() * 15) + 5,
                fiber: Math.floor(Math.random() * 40) + 10,
                fat: Math.floor(Math.random() * 10) + 2,
              },
            } as FeedRecord)),

            // Breeding Records (4 records)
            ...Array.from({ length: 4 }, (_, i) => ({
              _id: `breeding-${i + 1}`,
              module: 'breeding' as const,
              createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(),
              createdBy: 'user-1',
              status: 'planning' as const,
              programName: ['Angus Elite Program', 'Merino Wool Program', 'Boer Goat Program', 'Dairy Crossbreeding'][i],
              species: ['Cattle', 'Sheep', 'Goats', 'Cattle'][i],
              breed: ['Angus', 'Merino', 'Boer', 'Holstein-Friesian'][i],
              startDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
              endDate: new Date(Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000),
              totalAnimals: Math.floor(Math.random() * 100) + 20,
              breedingFemales: Math.floor(Math.random() * 50) + 10,
              breedingMales: Math.floor(Math.random() * 5) + 1,
              expectedOffspring: Math.floor(Math.random() * 50) + 10,
              actualOffspring: Math.floor(Math.random() * 40) + 5,
              successRate: Math.floor(Math.random() * 30) + 70,
              goals: ['Improve quality', 'Increase production', 'Better genetics'],
              manager: 'Farm Manager',
              budget: Math.floor(Math.random() * 100000) + 50000,
              currency: 'ZAR',
            } as BreedingRecord)),

            // RFID Records (6 records)
            ...Array.from({ length: 6 }, (_, i) => ({
              _id: `rfid-${i + 1}`,
              module: 'rfid' as const,
              createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(),
              createdBy: 'user-1',
              status: 'active' as const,
              tagId: `RFID-${String(i + 1).padStart(3, '0')}`,
              animalId: `ANG-${String((i % 12) + 1).padStart(3, '0')}`,
              animalName: `Premium Animal ${(i % 12) + 1}`,
              species: ['Cattle', 'Sheep', 'Goats'][i % 3],
              breed: ['Angus', 'Merino', 'Boer'][i % 3],
              tagType: ['ear_tag', 'bolus', 'collar'][i % 3] as 'ear_tag' | 'bolus' | 'collar',
              frequency: '134.2 kHz',
              installationDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
              lastScan: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
              batteryLevel: Math.floor(Math.random() * 100) + 1,
              signalStrength: ['excellent', 'good', 'fair', 'poor'][Math.floor(Math.random() * 4)] as 'excellent' | 'good' | 'fair' | 'poor',
              location: `Location ${i + 1}`,
              temperature: Math.floor(Math.random() * 5) + 37,
              healthAlerts: Math.floor(Math.random() * 3),
              notes: `RFID tag ${i + 1}`,
            } as RFIDRecord)),

            // Task Records (5 records)
            ...Array.from({ length: 5 }, (_, i) => ({
              _id: `tasks-${i + 1}`,
              module: 'tasks' as const,
              createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(),
              createdBy: 'user-1',
              status: 'pending' as const,
              title: `Task ${i + 1}`,
              description: `Description for task ${i + 1}`,
              assignedTo: `Worker ${i + 1}`,
              assignedBy: 'Farm Owner',
              priority: ['low', 'medium', 'high'][i % 3] as 'low' | 'medium' | 'high',
              dueDate: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000),
              category: ['feeding', 'health', 'maintenance', 'breeding'][i % 4],
              tags: [`tag${i + 1}`],
              estimatedHours: Math.floor(Math.random() * 8) + 1,
              progress: Math.floor(Math.random() * 100),
            } as TaskRecord)),
          ];

          set({
            records: initialRecords,
            totalRecords: initialRecords.length,
          });
        },

        resetData: () => {
          set({
            records: [],
            totalRecords: 0,
            isBetaExpired: false,
            betaExpiryDate: new Date(Date.now() + BETA_DAYS * 24 * 60 * 60 * 1000),
          });
        },
      }),
      {
        name: 'data-store',
        partialize: (state) => ({
          records: state.records,
          totalRecords: state.totalRecords,
          isBetaExpired: state.isBetaExpired,
          betaExpiryDate: state.betaExpiryDate,
        }),
      }
    ),
    {
      name: 'data-store',
    }
  )
);