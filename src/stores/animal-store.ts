import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  createStoreError,
  memoize,
  withErrorHandling,
  type StoreError
} from './store-utils';

export interface Animal {
  _id?: string;
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

interface AnimalState {
  animals: Animal[];
  selectedAnimal: Animal | null;
  loading: boolean;
  error: StoreError | null;

  // Actions
  setAnimals: (animals: Animal[]) => void;
  addAnimal: (animal: Animal) => void;
  updateAnimal: (id: string, updates: Partial<Animal>) => void;
  deleteAnimal: (id: string) => void;
  setSelectedAnimal: (animal: Animal | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | StoreError | null) => void;
  clearError: () => void;
  reset: () => void;

  // Async actions with error handling
  fetchAnimals: () => Promise<void>;
  createAnimal: (animal: Omit<Animal, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAnimalById: (id: string, updates: Partial<Animal>) => Promise<void>;
  removeAnimal: (id: string) => Promise<void>;

  // Computed values with memoization
  getAnimalsBySpecies: (species: string) => Animal[];
  getAnimalsByHealthStatus: (status: string) => Animal[];
  getTotalValue: () => number;
  getAverageAge: () => number;
  getAnimalStats: () => {
    total: number;
    bySpecies: Record<string, number>;
    byHealthStatus: Record<string, number>;
    averageValue: number;
  };
}

// Memoized computed values for better performance
const memoizedSelectors = {
  getAnimalsBySpecies: memoize(
    (animals: Animal[], species: string) =>
      animals.filter((animal) => animal.species === species),
    (animals, species) => `species-${species}-${animals.length}`
  ),

  getAnimalsByHealthStatus: memoize(
    (animals: Animal[], status: string) =>
      animals.filter((animal) => animal.health?.overallCondition === status),
    (animals, status) => `health-${status}-${animals.length}`
  ),

  getTotalValue: memoize(
    (animals: Animal[]) =>
      animals.reduce((total, animal) => total + (animal.purchaseInfo?.purchasePrice || 0), 0),
    (animals) => `total-value-${animals.length}`
  ),

  getAverageAge: memoize(
    (animals: Animal[]) => {
      if (animals.length === 0) return 0;

      const totalAge = animals.reduce((total, animal) => {
        const age = new Date().getFullYear() - new Date(animal.dateOfBirth).getFullYear();
        return total + age;
      }, 0);

      return totalAge / animals.length;
    },
    (animals) => `average-age-${animals.length}`
  ),

  getAnimalStats: memoize(
    (animals: Animal[]) => {
      const bySpecies = animals.reduce((acc, animal) => {
        acc[animal.species] = (acc[animal.species] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const byHealthStatus = animals.reduce((acc, animal) => {
        const status = animal.health?.overallCondition || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const averageValue = animals.length > 0
        ? animals.reduce((total, animal) => total + (animal.purchaseInfo?.purchasePrice || 0), 0) / animals.length
        : 0;

      return {
        total: animals.length,
        bySpecies,
        byHealthStatus,
        averageValue,
      };
    },
    (animals) => `stats-${animals.length}`
  ),
};

export const useAnimalStore = create<AnimalState>()(
  devtools(
    (set, get) => ({
      animals: [],
      selectedAnimal: null,
      loading: false,
      error: null,

      setAnimals: (animals) => set({ animals }),

      addAnimal: (animal) =>
        set((state) => ({
          animals: [...state.animals, animal],
        })),

      updateAnimal: (id, updates) =>
        set((state) => ({
          animals: state.animals.map((animal) =>
            animal._id === id ? { ...animal, ...updates } : animal
          ),
        })),

      deleteAnimal: (id) =>
        set((state) => ({
          animals: state.animals.filter((animal) => animal._id !== id),
        })),

      setSelectedAnimal: (animal) => set({ selectedAnimal: animal }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => {
        if (typeof error === 'string') {
          set({ error: createStoreError('GENERIC_ERROR', error) });
        } else {
          set({ error });
        }
      },

      clearError: () => set({ error: null }),

      reset: () => set({
        loading: false,
        error: null,
      }),

      // Async actions with improved error handling
      fetchAnimals: async () => {
        return withErrorHandling(async () => {
          set({ loading: true, error: null });

          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Mock data for now
          const mockAnimals: Animal[] = [];

          set({
            animals: mockAnimals,
            loading: false,
          });
        }, (error) => createStoreError('FETCH_ANIMALS_ERROR', 'Failed to fetch animals', { originalError: error }));
      },

      createAnimal: async (animalData) => {
        return withErrorHandling(async () => {
          set({ loading: true, error: null });

          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 800));

          const newAnimal: Animal = {
            ...animalData,
            _id: `animal-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          set((state) => ({
            animals: [...state.animals, newAnimal],
            loading: false,
          }));
        }, (error) => createStoreError('CREATE_ANIMAL_ERROR', 'Failed to create animal', { originalError: error }));
      },

      updateAnimalById: async (id, updates) => {
        return withErrorHandling(async () => {
          set({ loading: true, error: null });

          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 600));

          set((state) => ({
            animals: state.animals.map((animal) =>
              animal._id === id ? { ...animal, ...updates, updatedAt: new Date() } : animal
            ),
            loading: false,
          }));
        }, (error) => createStoreError('UPDATE_ANIMAL_ERROR', 'Failed to update animal', { originalError: error }));
      },

      removeAnimal: async (id) => {
        return withErrorHandling(async () => {
          set({ loading: true, error: null });

          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));

          set((state) => ({
            animals: state.animals.filter((animal) => animal._id !== id),
            loading: false,
          }));
        }, (error) => createStoreError('DELETE_ANIMAL_ERROR', 'Failed to delete animal', { originalError: error }));
      },

      // Memoized computed values for better performance
      getAnimalsBySpecies: (species: string) => {
        const { animals } = get();
        return animals.filter((animal) => animal.species === species);
      },

      getAnimalsByHealthStatus: (status: string) => {
        const { animals } = get();
        return animals.filter((animal) => animal.health?.overallCondition === status);
      },

      getTotalValue: () => {
        const { animals } = get();
        return animals.reduce((total, animal) => total + (animal.purchaseInfo?.purchasePrice || 0), 0);
      },

      getAverageAge: () => {
        const { animals } = get();
        if (animals.length === 0) return 0;

        const totalAge = animals.reduce((total, animal) => {
          const age = new Date().getFullYear() - new Date(animal.dateOfBirth).getFullYear();
          return total + age;
        }, 0);

        return totalAge / animals.length;
      },

      getAnimalStats: () => {
        const { animals } = get();

        const bySpecies = animals.reduce((acc, animal) => {
          acc[animal.species] = (acc[animal.species] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const byHealthStatus = animals.reduce((acc, animal) => {
          const status = animal.health?.overallCondition || 'unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const averageValue = animals.length > 0
          ? animals.reduce((total, animal) => total + (animal.purchaseInfo?.purchasePrice || 0), 0) / animals.length
          : 0;

        return {
          total: animals.length,
          bySpecies,
          byHealthStatus,
          averageValue,
        };
      },
    }),
    {
      name: 'animal-store',
    }
  )
);