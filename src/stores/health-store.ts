import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface HealthRecord {
  _id?: string;
  animalId: string;
  animalTagId: string;
  date: Date;
  type: 'vaccination' | 'treatment' | 'checkup' | 'surgery' | 'emergency';
  veterinarian?: string;
  diagnosis?: string;
  treatment?: string;
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  cost?: number;
  nextVisit?: Date;
  notes?: string;
  status: 'completed' | 'pending' | 'cancelled';
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface HealthState {
  healthRecords: HealthRecord[];
  selectedRecord: HealthRecord | null;
  loading: boolean;
  error: string | null;

  // Actions
  setHealthRecords: (records: HealthRecord[]) => void;
  addHealthRecord: (record: HealthRecord) => void;
  updateHealthRecord: (id: string, updates: Partial<HealthRecord>) => void;
  deleteHealthRecord: (id: string) => void;
  setSelectedRecord: (record: HealthRecord | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed values
  getRecordsByAnimal: (animalId: string) => HealthRecord[];
  getRecordsByType: (type: string) => HealthRecord[];
  getUpcomingAppointments: () => HealthRecord[];
  getTotalCost: (animalId?: string) => number;
  getRecentRecords: (days: number) => HealthRecord[];
}

export const useHealthStore = create<HealthState>()(
  devtools(
    (set, get) => ({
      healthRecords: [],
      selectedRecord: null,
      loading: false,
      error: null,

      setHealthRecords: (records) => set({ healthRecords: records }),

      addHealthRecord: (record) =>
        set((state) => ({
          healthRecords: [...state.healthRecords, record],
        })),

      updateHealthRecord: (id, updates) =>
        set((state) => ({
          healthRecords: state.healthRecords.map((record) =>
            record._id === id ? { ...record, ...updates } : record
          ),
        })),

      deleteHealthRecord: (id) =>
        set((state) => ({
          healthRecords: state.healthRecords.filter((record) => record._id !== id),
        })),

      setSelectedRecord: (record) => set({ selectedRecord: record }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      getRecordsByAnimal: (animalId) => {
        return get().healthRecords.filter((record) => record.animalId === animalId);
      },

      getRecordsByType: (type) => {
        return get().healthRecords.filter((record) => record.type === type);
      },

      getUpcomingAppointments: () => {
        const now = new Date();
        return get().healthRecords.filter((record) =>
          record.nextVisit && record.nextVisit > now && record.status === 'pending'
        );
      },

      getTotalCost: (animalId) => {
        const records = animalId
          ? get().getRecordsByAnimal(animalId)
          : get().healthRecords;

        return records.reduce((total, record) => total + (record.cost || 0), 0);
      },

      getRecentRecords: (days) => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return get().healthRecords.filter((record) =>
          record.date >= cutoffDate
        );
      },
    }),
    {
      name: 'health-store',
    }
  )
);