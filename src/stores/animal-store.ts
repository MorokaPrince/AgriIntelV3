import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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
  error: string | null;

  // Actions
  setAnimals: (animals: Animal[]) => void;
  addAnimal: (animal: Animal) => void;
  updateAnimal: (id: string, updates: Partial<Animal>) => void;
  deleteAnimal: (id: string) => void;
  setSelectedAnimal: (animal: Animal | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed values
  getAnimalsBySpecies: (species: string) => Animal[];
  getAnimalsByHealthStatus: (status: string) => Animal[];
  getTotalValue: () => number;
  getAverageAge: () => number;
}

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

      setError: (error) => set({ error }),

      getAnimalsBySpecies: (species) => {
        return get().animals.filter((animal) => animal.species === species);
      },

      getAnimalsByHealthStatus: (status) => {
        return get().animals.filter((animal) => animal.healthStatus === status);
      },

      getTotalValue: () => {
        return get().animals.reduce((total, animal) => total + (animal.currentValue || 0), 0);
      },

      getAverageAge: () => {
        const animals = get().animals;
        if (animals.length === 0) return 0;

        const totalAge = animals.reduce((total, animal) => {
          const age = new Date().getFullYear() - new Date(animal.dateOfBirth).getFullYear();
          return total + age;
        }, 0);

        return totalAge / animals.length;
      },
    }),
    {
      name: 'animal-store',
    }
  )
);