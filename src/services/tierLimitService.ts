import mongoose from 'mongoose';

export type Tier = 'beta' | 'professional' | 'enterprise';

export interface TierLimits {
  tier: Tier;
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
}

const TIER_LIMITS: Record<Tier, TierLimits> = {
  beta: {
    tier: 'beta',
    maxAnimals: 50,
    maxHealthRecords: 50,
    maxFinancialRecords: 50,
    maxFeedingRecords: 50,
    maxBreedingRecords: 50,
    maxRFIDRecords: 50,
    maxTasks: 50,
    maxNotifications: 50,
    maxUsers: 1,
    features: [
      'animals:read',
      'health:read',
      'financial:read',
      'feed:read',
      'breeding:read',
      'rfid:read',
      'tasks:read',
      'notifications:read',
    ],
    trialDays: 30,
  },
  professional: {
    tier: 'professional',
    maxAnimals: 500,
    maxHealthRecords: 500,
    maxFinancialRecords: 500,
    maxFeedingRecords: 500,
    maxBreedingRecords: 500,
    maxRFIDRecords: 500,
    maxTasks: 500,
    maxNotifications: 500,
    maxUsers: 5,
    features: [
      'animals:read',
      'animals:write',
      'health:read',
      'health:write',
      'financial:read',
      'financial:write',
      'feed:read',
      'feed:write',
      'breeding:read',
      'breeding:write',
      'rfid:read',
      'rfid:write',
      'tasks:read',
      'tasks:write',
      'notifications:read',
      'analytics:read',
      'reports:export',
    ],
    trialDays: 0,
  },
  enterprise: {
    tier: 'enterprise',
    maxAnimals: 10000,
    maxHealthRecords: 10000,
    maxFinancialRecords: 10000,
    maxFeedingRecords: 10000,
    maxBreedingRecords: 10000,
    maxRFIDRecords: 10000,
    maxTasks: 10000,
    maxNotifications: 10000,
    maxUsers: 100,
    features: [
      'animals:read',
      'animals:write',
      'animals:delete',
      'health:read',
      'health:write',
      'health:delete',
      'financial:read',
      'financial:write',
      'financial:delete',
      'feed:read',
      'feed:write',
      'feed:delete',
      'breeding:read',
      'breeding:write',
      'breeding:delete',
      'rfid:read',
      'rfid:write',
      'rfid:delete',
      'tasks:read',
      'tasks:write',
      'tasks:delete',
      'notifications:read',
      'notifications:write',
      'analytics:read',
      'analytics:write',
      'reports:export',
      'api:access',
      'webhooks:access',
      'custom:integrations',
    ],
    trialDays: 0,
  },
};

export class TierLimitService {
  static getTierLimits(tier: Tier): TierLimits {
    return TIER_LIMITS[tier];
  }

  static async checkRecordLimit(
    tenantId: string,
    userId: mongoose.Types.ObjectId,
    tier: Tier,
    module: string,
    currentCount: number
  ): Promise<{ allowed: boolean; message?: string; limit?: number; current?: number }> {
    const limits = this.getTierLimits(tier);
    const limitKey = `max${module.charAt(0).toUpperCase() + module.slice(1)}`;
    const limit = limits[limitKey as keyof TierLimits] as number;

    if (currentCount >= limit) {
      return {
        allowed: false,
        message: `You have reached the ${module} limit for your ${tier} tier (${limit} records). Please upgrade to add more records.`,
        limit,
        current: currentCount,
      };
    }

    return {
      allowed: true,
      limit,
      current: currentCount,
    };
  }

  static async getRecordUsage(
    tenantId: string,
    userId: mongoose.Types.ObjectId,
    tier: Tier
  ): Promise<Record<string, { current: number; limit: number; percentage: number }>> {
    const limits = this.getTierLimits(tier);
    const moduleList = ['animals', 'healthRecords', 'financialRecords', 'feedingRecords', 'breedingRecords', 'rfidRecords', 'tasks', 'notifications'];

    const usage: Record<string, { current: number; limit: number; percentage: number }> = {};

    for (const moduleName of moduleList) {
      const collectionName = moduleName.toLowerCase();
      const db = mongoose.connection.db;

      if (!db) {
        usage[moduleName] = { current: 0, limit: limits[`max${moduleName}` as keyof TierLimits] as number, percentage: 0 };
        continue;
      }

      try {
        const count = await db.collection(collectionName).countDocuments({ tenantId });
        const limit = limits[`max${moduleName}` as keyof TierLimits] as number;
        const percentage = Math.round((count / limit) * 100);

        usage[moduleName] = { current: count, limit, percentage };
      } catch (err) {
        usage[moduleName] = { current: 0, limit: limits[`max${moduleName}` as keyof TierLimits] as number, percentage: 0 };
      }
    }

    return usage;
  }

  static isTrialExpired(trialEndDate: Date): boolean {
    return new Date() > trialEndDate;
  }

  static getTrialDaysRemaining(trialEndDate: Date): number {
    const now = new Date();
    const daysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysRemaining);
  }

  static hasFeatureAccess(tier: Tier, feature: string): boolean {
    const limits = this.getTierLimits(tier);
    return limits.features.includes(feature);
  }

  static getAvailableFeatures(tier: Tier): string[] {
    const limits = this.getTierLimits(tier);
    return limits.features;
  }
}

