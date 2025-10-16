import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface User {
  _id: string;
  name: string;
  email: string;
  tier: 'beta' | 'professional' | 'enterprise';
  role: 'admin' | 'manager' | 'user';
  avatar?: string;
  phone?: string;
  farmName?: string;
  farmSize?: string;
  location?: {
    country: string;
    province: string;
    city: string;
  };
  preferences: {
    language: string;
    currency: string;
    timezone: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  subscription: {
    status: 'active' | 'expired' | 'cancelled';
    startDate: Date;
    endDate: Date;
    animalCount: number;
    maxAnimals: number;
    transactionCount: number;
    maxTransactions: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;

  // Computed values
  isAdmin: () => boolean;
  isManager: () => boolean;
  isBetaUser: () => boolean;
  isProfessionalUser: () => boolean;
  isEnterpriseUser: () => boolean;
  canAccessFeature: (feature: string) => boolean;
}

const DEMO_USERS = [
  {
    _id: '1',
    name: 'Demo User',
    email: 'demo@agriintel.co.za',
    password: 'Demo123!',
    tier: 'beta' as const,
    role: 'user' as const,
    farmName: 'Demo Farm',
    farmSize: 'small',
    location: {
      country: 'ZA',
      province: 'Gauteng',
      city: 'Johannesburg'
    },
    preferences: {
      language: 'en',
      currency: 'ZAR',
      timezone: 'Africa/Johannesburg',
      notifications: {
        email: true,
        sms: true,
        push: true
      }
    },
    subscription: {
      status: 'active' as const,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      animalCount: 5,
      maxAnimals: 50,
      transactionCount: 25,
      maxTransactions: 100
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '2',
    name: 'Pro User',
    email: 'pro@agriintel.co.za',
    password: 'Pro123!',
    tier: 'professional' as const,
    role: 'manager' as const,
    farmName: 'Professional Farm',
    farmSize: 'medium',
    location: {
      country: 'ZA',
      province: 'Western Cape',
      city: 'Cape Town'
    },
    preferences: {
      language: 'en',
      currency: 'ZAR',
      timezone: 'Africa/Johannesburg',
      notifications: {
        email: true,
        sms: true,
        push: true
      }
    },
    subscription: {
      status: 'active' as const,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      animalCount: 150,
      maxAnimals: 500,
      transactionCount: 500,
      maxTransactions: 1000
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '3',
    name: 'Admin User',
    email: 'admin@agriintel.co.za',
    password: 'Admin123!',
    tier: 'enterprise' as const,
    role: 'admin' as const,
    farmName: 'Enterprise Farm',
    farmSize: 'large',
    location: {
      country: 'ZA',
      province: 'KwaZulu-Natal',
      city: 'Durban'
    },
    preferences: {
      language: 'en',
      currency: 'ZAR',
      timezone: 'Africa/Johannesburg',
      notifications: {
        email: true,
        sms: true,
        push: true
      }
    },
    subscription: {
      status: 'active' as const,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      animalCount: 1000,
      maxAnimals: 5000,
      transactionCount: 2000,
      maxTransactions: 10000
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        login: async (email: string, password: string) => {
          set({ isLoading: true, error: null });

          try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            const demoUser = DEMO_USERS.find(
              u => u.email === email && u.password === password
            );

            if (!demoUser) {
              throw new Error('Invalid email or password');
            }

            const { password: _, ...userWithoutPassword } = demoUser;
            const user = userWithoutPassword as User;

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Login failed'
            });
            throw error;
          }
        },

        logout: () => {
          set({
            user: null,
            isAuthenticated: false,
            error: null
          });
        },

        register: async (userData) => {
          set({ isLoading: true, error: null });

          try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            const newUser: User = {
              _id: Date.now().toString(),
              name: userData.name || '',
              email: userData.email || '',
              tier: 'beta',
              role: 'user',
              preferences: {
                language: 'en',
                currency: 'ZAR',
                timezone: 'Africa/Johannesburg',
                notifications: {
                  email: true,
                  sms: true,
                  push: true
                }
              },
              subscription: {
                status: 'active',
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                animalCount: 0,
                maxAnimals: 50,
                transactionCount: 0,
                maxTransactions: 100
              },
              createdAt: new Date(),
              updatedAt: new Date()
            };

            set({
              user: newUser,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Registration failed'
            });
            throw error;
          }
        },

        updateProfile: async (updates) => {
          const { user } = get();

          if (!user) {
            throw new Error('No user logged in');
          }

          set({ isLoading: true, error: null });

          try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            const updatedUser = {
              ...user,
              ...updates,
              updatedAt: new Date()
            };

            set({
              user: updatedUser,
              isLoading: false,
              error: null
            });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Update failed'
            });
            throw error;
          }
        },

        clearError: () => set({ error: null }),

        setLoading: (loading) => set({ isLoading: loading }),

        isAdmin: () => {
          const { user } = get();
          return user?.role === 'admin';
        },

        isManager: () => {
          const { user } = get();
          return user?.role === 'manager' || user?.role === 'admin';
        },

        isBetaUser: () => {
          const { user } = get();
          return user?.tier === 'beta';
        },

        isProfessionalUser: () => {
          const { user } = get();
          return user?.tier === 'professional';
        },

        isEnterpriseUser: () => {
          const { user } = get();
          return user?.tier === 'enterprise';
        },

        canAccessFeature: (feature: string) => {
          const { user } = get();

          if (!user) return false;

          const featureAccess = {
            'basic': ['beta', 'professional', 'enterprise'],
            'advanced': ['professional', 'enterprise'],
            'premium': ['enterprise']
          };

          const allowedTiers = featureAccess[feature as keyof typeof featureAccess] || [];
          return allowedTiers.includes(user.tier);
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
);