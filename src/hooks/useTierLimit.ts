'use client';

import { useState, useCallback } from 'react';

export interface TierLimitCheckResult {
  allowed: boolean;
  message?: string;
  limit?: number;
  current?: number;
  tier?: string;
  module?: string;
}

export interface TierUsage {
  tier: string;
  tierLimits: {
    tier: string;
    maxAnimals: number;
    maxHealthRecords: number;
    maxFinancialRecords: number;
    maxFeedingRecords: number;
    maxBreedingRecords: number;
    maxRFIDRecords: number;
    maxTasks: number;
    maxNotifications: number;
    maxUsers: number;
    features: string[];
    trialDays: number;
  };
  usage: Record<string, { current: number; limit: number; percentage: number }>;
  trial: {
    isExpired: boolean;
    daysRemaining: number;
    endDate: string;
  };
  features: string[];
}

export const useTierLimit = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkLimit = useCallback(
    async (module: string): Promise<TierLimitCheckResult> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/tier/check-limit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ module }),
        });

        if (!response.ok) {
          throw new Error('Failed to check tier limit');
        }

        const data = await response.json();
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return { allowed: false, message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getUsage = useCallback(async (): Promise<TierUsage | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tier/usage', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get tier usage');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    checkLimit,
    getUsage,
    loading,
    error,
  };
};

