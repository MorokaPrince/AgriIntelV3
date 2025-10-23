import { StateCreator } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Standard error types for consistent error handling
export interface StoreError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
  handled?: boolean;
}

// Generic loading state interface
export interface LoadingState {
  loading: boolean;
  error: StoreError | null;
}

// Base store interface that all stores should implement
export interface BaseStore extends LoadingState {
  // Standard actions for all stores
  setLoading: (loading: boolean) => void;
  setError: (error: string | StoreError | null) => void;
  clearError: () => void;
  reset: () => void;
}

// Error handling utilities
export const createStoreError = (
  code: string,
  message: string,
  details?: Record<string, unknown>
): StoreError => ({
  code,
  message,
  details,
  timestamp: new Date(),
});

// Memoization utilities for computed values
export const memoize = <Args extends readonly unknown[], Return>(
  fn: (...args: Args) => Return,
  keyGenerator?: (...args: Args) => string
): ((...args: Args) => Return) => {
  const cache = new Map<string, Return>();

  return (...args: Args): Return => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);

    // Clear cache if it gets too large (prevent memory leaks)
    if (cache.size > 100) {
      cache.clear();
    }

    return result;
  };
};

// Async action wrapper with consistent error handling
export const withErrorHandling = async <T>(
  action: () => Promise<T>,
  errorHandler?: (error: unknown) => StoreError
): Promise<T> => {
  try {
    return await action();
  } catch (error) {
    const storeError = errorHandler
      ? errorHandler(error)
      : createStoreError(
          'UNKNOWN_ERROR',
          error instanceof Error ? error.message : 'An unknown error occurred'
        );

    throw storeError;
  }
};

// Persistence configuration utilities
export const createPersistConfig = <T>(
  name: string,
  partialize?: (state: T) => Partial<T>
) => ({
  name: `${name}-storage`,
  partialize,
  // Add error recovery for corrupted persisted state
  onRehydrateStorage: () => (state: T | undefined) => {
    if (state && typeof state === 'object') {
      // Validate state integrity
      if ('error' in state && state.error && typeof state.error === 'object' && 'timestamp' in state.error) {
        // Keep error state for debugging but mark as handled
        (state.error as StoreError).handled = true;
      }
      return state;
    }
    // Return default state if corrupted
    return {
      loading: false,
      error: null,
    } as T;
  },
});

// Standard store creator with common middleware
export const createBaseStore = <T extends BaseStore>(
  config: (set: (state: Partial<T>) => void, get: () => T) => T,
  options: {
    name: string;
    persist?: boolean;
    persistConfig?: {
      partialize?: (state: T) => Partial<T>;
      version?: number;
      migrate?: (persistedState: unknown, version: number) => T;
    };
  }
) => {
  const { name, persist: shouldPersist, persistConfig } = options;

  // Base store with common functionality
  const baseStore: StateCreator<T> = (set, get) => {
    const customConfig = config(set, get);

    return {
      ...customConfig,
      loading: false,
      error: null,

      setLoading: (loading: boolean) => set({ loading } as Partial<T>),

      setError: (error: string | StoreError | null) => {
        if (typeof error === 'string') {
          set({ error: createStoreError('GENERIC_ERROR', error) } as Partial<T>);
        } else {
          set({ error } as Partial<T>);
        }
      },

      clearError: () => set({ error: null } as Partial<T>),

      reset: () => set({
        loading: false,
        error: null,
      } as Partial<T>),
    };
  };

  // Apply middleware based on options
  if (shouldPersist) {
    return devtools(
      persist(baseStore, {
        name: `${name}-storage`,
        partialize: persistConfig?.partialize,
      }),
      { name }
    );
  }

  return devtools(baseStore, { name });
};

// Utility for creating computed values with memoization
export const createMemoizedSelector = <T extends Record<string, unknown>, R>(
  selector: (state: T) => R,
  dependencies: (keyof T)[]
) => {
  return memoize(selector, (state: T) => {
    // Create cache key based on dependencies
    return dependencies.map(dep => String(state[dep])).join('|');
  });
};

// Batch update utility to prevent multiple re-renders
export const batchUpdate = <T extends Record<string, unknown>>(
  updates: T,
  set: (updates: Partial<T>) => void
) => {
  set(updates);
};

// Type guards for error handling
export const isStoreError = (error: unknown): error is StoreError => {
  return error !== null &&
         typeof error === 'object' &&
         'code' in error &&
         'message' in error &&
         'timestamp' in error &&
         error.code !== undefined &&
         error.message !== undefined &&
         error.timestamp !== undefined;
};

// Store validation utilities
export const validateStoreState = <T extends BaseStore>(state: T): boolean => {
  return (
    typeof state.loading === 'boolean' &&
    (state.error === null || isStoreError(state.error))
  );
};

// Performance monitoring utilities
export const withPerformanceMonitoring = <T extends (...args: never[]) => unknown>(
  fn: T,
  storeName: string
): T => {
  return ((...args: Parameters<T>) => {
    const startTime = performance.now();
    try {
      const result = fn(...args);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Log slow operations (over 100ms)
      if (duration > 100) {
        console.warn(`Slow store operation in ${storeName}: ${duration.toFixed(2)}ms`);
      }

      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.error(`Store operation failed in ${storeName} after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }) as T;
};