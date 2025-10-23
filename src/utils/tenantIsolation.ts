'use client';

import { Animal, HealthRecord, FinancialRecord, TaskRecord, FeedRecord, BreedingRecord, RFIDRecord } from '@/services/apiService';

// Tenant context interface
export interface TenantContext {
  tenantId: string;
  userId: string;
  roles: string[];
  permissions: string[];
  subscription: {
    tier: 'beta' | 'professional' | 'enterprise';
    limits: {
      maxAnimals: number;
      maxTransactions: number;
      maxUsers: number;
    };
  };
}

// Enhanced tenant isolation utilities with security and performance optimizations
export class TenantIsolation {
  // Validate tenant access to a resource with enhanced security
  static validateTenantAccess(resourceTenantId: string, context: TenantContext): boolean {
    if (!resourceTenantId || !context?.tenantId) {
      return false;
    }
    return resourceTenantId === context.tenantId;
  }

  // Enhanced data filtering with performance optimizations
  static filterByTenant<T extends { tenantId: string }>(data: T[], context: TenantContext): T[] {
    if (!context?.tenantId) {
      console.warn('TenantIsolation: No tenant context provided for filtering');
      return [];
    }

    // Pre-validate context to avoid repeated checks
    const isValidContext = this.validateTenantContext(context);
    if (!isValidContext) {
      console.error('TenantIsolation: Invalid tenant context');
      return [];
    }

    return data.filter(item => this.validateTenantAccess(item.tenantId, context));
  }

  // Validate tenant context
  static validateTenantContext(context: TenantContext): boolean {
    return !!(context?.tenantId && context?.userId && context?.subscription);
  }

  // Add tenant context to data operations with enhanced metadata
  static withTenantContext<T extends Record<string, unknown>>(
    data: T,
    context: TenantContext
  ): T & { tenantId: string; createdBy: string; updatedBy: string; tenantValidated: boolean } {
    if (!this.validateTenantContext(context)) {
      throw new Error('Invalid tenant context provided');
    }

    return {
      ...data,
      tenantId: context.tenantId,
      createdBy: context.userId,
      updatedBy: context.userId,
      tenantValidated: true,
    };
  }

  // Batch tenant validation for performance
  static validateBatchTenantAccess<T extends { tenantId: string }>(
    data: T[],
    context: TenantContext
  ): { valid: T[]; invalid: T[] } {
    const valid: T[] = [];
    const invalid: T[] = [];

    for (const item of data) {
      if (this.validateTenantAccess(item.tenantId, context)) {
        valid.push(item);
      } else {
        invalid.push(item);
      }
    }

    return { valid, invalid };
  }

  // Validate tenant limits
  static validateTenantLimits(context: TenantContext, currentCounts: {
    animals?: number;
    transactions?: number;
    users?: number;
  }): { allowed: boolean; reason?: string } {
    const limits = context.subscription.limits;

    if (currentCounts.animals !== undefined && currentCounts.animals >= limits.maxAnimals) {
      return {
        allowed: false,
        reason: `Animal limit exceeded. Current: ${currentCounts.animals}, Limit: ${limits.maxAnimals}`,
      };
    }

    if (currentCounts.transactions !== undefined && currentCounts.transactions >= limits.maxTransactions) {
      return {
        allowed: false,
        reason: `Transaction limit exceeded. Current: ${currentCounts.transactions}, Limit: ${limits.maxTransactions}`,
      };
    }

    if (currentCounts.users !== undefined && currentCounts.users >= limits.maxUsers) {
      return {
        allowed: false,
        reason: `User limit exceeded. Current: ${currentCounts.users}, Limit: ${limits.maxUsers}`,
      };
    }

    return { allowed: true };
  }

  // Generate tenant-specific cache keys
  static generateTenantCacheKey(endpoint: string, tenantId: string, params?: Record<string, unknown>): string {
    const baseKey = `${tenantId}:${endpoint}`;
    if (params && Object.keys(params).length > 0) {
      const sortedParams = Object.keys(params)
        .sort()
        .map(key => `${key}=${params[key]}`)
        .join('&');
      return `${baseKey}:${sortedParams}`;
    }
    return baseKey;
  }

  // Validate data ownership
  static validateDataOwnership<T extends { tenantId: string; createdBy?: string }>(
    data: T,
    context: TenantContext
  ): { allowed: boolean; reason?: string } {
    if (!this.validateTenantAccess(data.tenantId, context)) {
      return {
        allowed: false,
        reason: 'Access denied: Data belongs to different tenant',
      };
    }

    // For non-admin users, ensure they can only access their own data
    if (!context.roles.includes('admin') && data.createdBy && data.createdBy !== context.userId) {
      return {
        allowed: false,
        reason: 'Access denied: Can only access own data',
      };
    }

    return { allowed: true };
  }
}

// Tenant-aware data transformers
export class TenantAwareTransformers {
  // Transform animal data with tenant validation
  static transformAnimalDataWithTenant(
    animals: Animal[],
    context: TenantContext
  ): Array<Animal & { _tenantValidated: boolean }> {
    return TenantIsolation.filterByTenant(animals, context).map(animal => ({
      ...animal,
      _tenantValidated: true,
    }));
  }

  // Transform financial data with tenant validation
  static transformFinancialDataWithTenant(
    financialRecords: FinancialRecord[],
    context: TenantContext
  ): Array<FinancialRecord & { _tenantValidated: boolean }> {
    return TenantIsolation.filterByTenant(financialRecords, context).map(record => ({
      ...record,
      _tenantValidated: true,
    }));
  }

  // Transform health data with tenant validation
  static transformHealthDataWithTenant(
    healthRecords: HealthRecord[],
    context: TenantContext
  ): Array<HealthRecord & { _tenantValidated: boolean }> {
    return TenantIsolation.filterByTenant(healthRecords, context).map(record => ({
      ...record,
      _tenantValidated: true,
    }));
  }

  // Transform task data with tenant validation
  static transformTaskDataWithTenant(
    tasks: TaskRecord[],
    context: TenantContext
  ): Array<TaskRecord & { _tenantValidated: boolean }> {
    return TenantIsolation.filterByTenant(tasks, context).map(task => ({
      ...task,
      _tenantValidated: true,
    }));
  }
}

// Tenant subscription management
export class TenantSubscriptionManager {
  private static readonly SUBSCRIPTION_LIMITS = {
    beta: {
      maxAnimals: 50,
      maxTransactions: 100,
      maxUsers: 3,
      features: ['basic_animals', 'basic_financial', 'basic_health'],
    },
    professional: {
      maxAnimals: 500,
      maxTransactions: 1000,
      maxUsers: 10,
      features: ['basic_animals', 'basic_financial', 'basic_health', 'advanced_analytics', 'breeding_module'],
    },
    enterprise: {
      maxAnimals: 5000,
      maxTransactions: 10000,
      maxUsers: 50,
      features: ['basic_animals', 'basic_financial', 'basic_health', 'advanced_analytics', 'breeding_module', 'rfid_integration', 'api_access'],
    },
  };

  static getSubscriptionLimits(tier: 'beta' | 'professional' | 'enterprise') {
    return this.SUBSCRIPTION_LIMITS[tier];
  }

  static validateFeatureAccess(tier: 'beta' | 'professional' | 'enterprise', feature: string): boolean {
    const limits = this.getSubscriptionLimits(tier);
    return limits.features.includes(feature);
  }

  static getAvailableFeatures(tier: 'beta' | 'professional' | 'enterprise'): string[] {
    const limits = this.getSubscriptionLimits(tier);
    return limits.features;
  }

  static calculateUsagePercentage(
    currentUsage: { animals: number; transactions: number; users: number },
    tier: 'beta' | 'professional' | 'enterprise'
  ): { animals: number; transactions: number; users: number } {
    const limits = this.getSubscriptionLimits(tier);

    return {
      animals: (currentUsage.animals / limits.maxAnimals) * 100,
      transactions: (currentUsage.transactions / limits.maxTransactions) * 100,
      users: (currentUsage.users / limits.maxUsers) * 100,
    };
  }
}

// Tenant data encryption/decryption utilities
export class TenantDataSecurity {
  // In a real implementation, this would use proper encryption
  // For now, we'll use a simple obfuscation mechanism

  static encryptSensitiveData(data: string, tenantId: string): string {
    // Simple Caesar cipher with tenant ID as key (for demo purposes)
    // In production, use proper encryption like AES-256
    const key = tenantId.slice(0, 8);
    let encrypted = '';

    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      encrypted += String.fromCharCode(charCode + keyChar);
    }

    return btoa(encrypted); // Base64 encode
  }

  static decryptSensitiveData(encryptedData: string, tenantId: string): string {
    try {
      const data = atob(encryptedData); // Base64 decode
      const key = tenantId.slice(0, 8);
      let decrypted = '';

      for (let i = 0; i < data.length; i++) {
        const charCode = data.charCodeAt(i);
        const keyChar = key.charCodeAt(i % key.length);
        decrypted += String.fromCharCode(charCode - keyChar);
      }

      return decrypted;
    } catch {
      return 'DECRYPTION_ERROR';
    }
  }

  // Validate data integrity
  static validateDataIntegrity(data: unknown, checksum?: string): boolean {
    // In a real implementation, this would use proper hashing
    // For demo purposes, we'll do a simple validation
    if (typeof data === 'object' && data !== null) {
      const dataString = JSON.stringify(data);
      const calculatedChecksum = btoa(dataString).slice(0, 16);

      return checksum ? calculatedChecksum === checksum : true;
    }
    return true;
  }
}

// Tenant audit logging
export class TenantAuditLogger {
  private static logs: Array<{
    tenantId: string;
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    timestamp: Date;
    details?: Record<string, unknown>;
  }> = [];

  static logActivity(
    tenantId: string,
    userId: string,
    action: string,
    resource: string,
    resourceId?: string,
    details?: Record<string, unknown>
  ): void {
    this.logs.push({
      tenantId,
      userId,
      action,
      resource,
      resourceId,
      timestamp: new Date(),
      details,
    });

    // Keep only last 1000 logs per tenant to prevent memory issues
    const tenantLogs = this.logs.filter(log => log.tenantId === tenantId);
    if (tenantLogs.length > 1000) {
      this.logs = this.logs.filter(log => log.tenantId !== tenantId);
      this.logs.push(...tenantLogs.slice(-1000));
    }

    // In a real implementation, this would write to a persistent audit log
    console.log(`[AUDIT:${tenantId}] ${userId} ${action} ${resource}${resourceId ? `:${resourceId}` : ''}`, details);
  }

  static getTenantLogs(tenantId: string, limit: number = 100): Array<{
    tenantId: string;
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    timestamp: Date;
    details?: Record<string, unknown>;
  }> {
    return this.logs
      .filter(log => log.tenantId === tenantId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  static getActivitySummary(tenantId: string, hours: number = 24): {
    totalActions: number;
    actionsByType: Record<string, number>;
    actionsByUser: Record<string, number>;
  } {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    const recentLogs = this.logs.filter(log => log.tenantId === tenantId && log.timestamp >= cutoffTime);

    const actionsByType: Record<string, number> = {};
    const actionsByUser: Record<string, number> = {};

    recentLogs.forEach(log => {
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;
      actionsByUser[log.userId] = (actionsByUser[log.userId] || 0) + 1;
    });

    return {
      totalActions: recentLogs.length,
      actionsByType,
      actionsByUser,
    };
  }
}

// Tenant data export/import utilities
export class TenantDataManager {
  static exportTenantData(
    animals: Animal[],
    healthRecords: HealthRecord[],
    financialRecords: FinancialRecord[],
    tasks: TaskRecord[],
    context: TenantContext
  ): {
    metadata: {
      tenantId: string;
      exportDate: Date;
      recordCounts: Record<string, number>;
      version: string;
    };
    data: {
      animals: Animal[];
      healthRecords: HealthRecord[];
      financialRecords: FinancialRecord[];
      tasks: TaskRecord[];
    };
  } {
    // Filter all data by tenant
    const tenantAnimals = TenantIsolation.filterByTenant(animals, context);
    const tenantHealth = TenantIsolation.filterByTenant(healthRecords, context);
    const tenantFinancial = TenantIsolation.filterByTenant(financialRecords, context);
    const tenantTasks = TenantIsolation.filterByTenant(tasks, context);

    // Log the export activity
    TenantAuditLogger.logActivity(
      context.tenantId,
      context.userId,
      'export',
      'tenant_data',
      undefined,
      { recordCounts: {
        animals: tenantAnimals.length,
        healthRecords: tenantHealth.length,
        financialRecords: tenantFinancial.length,
        tasks: tenantTasks.length,
      }}
    );

    return {
      metadata: {
        tenantId: context.tenantId,
        exportDate: new Date(),
        recordCounts: {
          animals: tenantAnimals.length,
          healthRecords: tenantHealth.length,
          financialRecords: tenantFinancial.length,
          tasks: tenantTasks.length,
        },
        version: '1.0',
      },
      data: {
        animals: tenantAnimals,
        healthRecords: tenantHealth,
        financialRecords: tenantFinancial,
        tasks: tenantTasks,
      },
    };
  }

  static validateImportData(
    importData: {
      animals: Animal[];
      healthRecords: HealthRecord[];
      financialRecords: FinancialRecord[];
      tasks: TaskRecord[];
    },
    context: TenantContext
  ): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate that all imported data belongs to the same tenant
    const allAnimalsTenantId = new Set(importData.animals.map(a => a.tenantId));
    const allHealthTenantId = new Set(importData.healthRecords.map(h => h.tenantId));
    const allFinancialTenantId = new Set(importData.financialRecords.map(f => f.tenantId));
    const allTasksTenantId = new Set(importData.tasks.map(t => t.tenantId));

    if (allAnimalsTenantId.size > 1 || allAnimalsTenantId.has(context.tenantId) === false) {
      errors.push('Animal data contains records from different tenants or not matching current tenant');
    }

    if (allHealthTenantId.size > 1 || allHealthTenantId.has(context.tenantId) === false) {
      errors.push('Health record data contains records from different tenants or not matching current tenant');
    }

    if (allFinancialTenantId.size > 1 || allFinancialTenantId.has(context.tenantId) === false) {
      errors.push('Financial record data contains records from different tenants or not matching current tenant');
    }

    if (allTasksTenantId.size > 1 || allTasksTenantId.has(context.tenantId) === false) {
      errors.push('Task data contains records from different tenants or not matching current tenant');
    }

    // Check for potential data conflicts
    const duplicateRfids = importData.animals
      .map(a => a.rfidTag)
      .filter((rfid, index, arr) => arr.indexOf(rfid) !== index);

    if (duplicateRfids.length > 0) {
      warnings.push(`Duplicate RFID tags found: ${duplicateRfids.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

// Enhanced middleware for tenant isolation in API calls with performance optimizations
export class TenantIsolationMiddleware {
  static applyToApiCall<T extends Record<string, unknown>>(
    data: T,
    context: TenantContext,
    operation: 'create' | 'update' | 'delete'
  ): T {
    // Ensure tenant context is applied to all data operations
    const tenantAppliedData = TenantIsolation.withTenantContext(data, context);

    // Log the operation with enhanced metadata
    TenantAuditLogger.logActivity(
      context.tenantId,
      context.userId,
      operation,
      'api_operation',
      undefined,
      {
        dataType: typeof data,
        operation,
        timestamp: new Date().toISOString(),
        dataSize: JSON.stringify(data).length
      }
    );

    return tenantAppliedData;
  }

  static validateApiResponse<T extends { tenantId: string }>(
    response: T[],
    context: TenantContext
  ): T[] {
    // Ensure all returned data belongs to the requesting tenant
    return TenantIsolation.filterByTenant(response, context);
  }

  // Rate limiting for tenant operations
  static checkRateLimit(context: TenantContext, operation: string): { allowed: boolean; resetTime?: Date } {
    const key = `${context.tenantId}:${operation}`;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = this.getRateLimitForOperation(operation, context.subscription.tier);

    // In a real implementation, this would use Redis or in-memory store
    // For now, return a simple implementation
    return { allowed: true };
  }

  private static getRateLimitForOperation(operation: string, tier: string): number {
    const limits: Record<string, Record<string, number>> = {
      beta: { read: 100, write: 20, delete: 5 },
      professional: { read: 1000, write: 100, delete: 20 },
      enterprise: { read: 10000, write: 500, delete: 100 },
    };

    return limits[tier]?.[operation] || 10;
  }
}

// Tenant-aware caching strategies
export class TenantAwareCache {
  private static cache = new Map<string, {
    data: unknown;
    timestamp: number;
    ttl: number;
    tenantId: string;
    accessCount: number;
  }>();

  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly MAX_CACHE_SIZE = 1000;

  static set<T>(key: string, data: T, tenantId: string, ttl: number = this.DEFAULT_TTL): void {
    const cacheKey = `${tenantId}:${key}`;

    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl,
      tenantId,
      accessCount: 0,
    });

    // Cleanup if cache gets too large
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      this.cleanup();
    }
  }

  static get<T>(key: string, tenantId: string): T | null {
    const cacheKey = `${tenantId}:${key}`;
    const cached = this.cache.get(cacheKey);

    if (!cached) return null;

    // Check if expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(cacheKey);
      return null;
    }

    // Update access count for LRU
    cached.accessCount++;

    return cached.data as T;
  }

  static invalidateTenant(tenantId: string): number {
    let deletedCount = 0;
    for (const [key] of this.cache) {
      if (key.startsWith(`${tenantId}:`)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }
    return deletedCount;
  }

  static invalidatePattern(pattern: string, tenantId: string): number {
    const regex = new RegExp(pattern.replace('*', '.*'));
    let deletedCount = 0;

    for (const [key] of this.cache) {
      if (key.startsWith(`${tenantId}:`) && regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }
    return deletedCount;
  }

  private static cleanup(): void {
    const entries = Array.from(this.cache.entries());

    // Remove expired entries first
    const now = Date.now();
    for (const [key, value] of entries) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key);
      }
    }

    // If still too large, remove least recently used
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const sortedByAccess = entries
        .filter(([_, value]) => now - value.timestamp <= value.ttl)
        .sort((a, b) => a[1].accessCount - b[1].accessCount);

      const toRemove = sortedByAccess.slice(0, this.cache.size - this.MAX_CACHE_SIZE);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  static getStats(): { totalEntries: number; byTenant: Record<string, number> } {
    const byTenant: Record<string, number> = {};

    for (const [key, value] of this.cache) {
      byTenant[value.tenantId] = (byTenant[value.tenantId] || 0) + 1;
    }

    return {
      totalEntries: this.cache.size,
      byTenant,
    };
  }
}

// Enhanced tenant usage monitoring
export class TenantUsageMonitor {
  private static usage = new Map<string, {
    operations: Record<string, number>;
    dataSize: number;
    lastActivity: number;
    limits: Record<string, number>;
  }>();

  static recordOperation(tenantId: string, operation: string, dataSize: number = 0): void {
    const current = this.usage.get(tenantId) || {
      operations: {},
      dataSize: 0,
      lastActivity: Date.now(),
      limits: {},
    };

    current.operations[operation] = (current.operations[operation] || 0) + 1;
    current.dataSize += dataSize;
    current.lastActivity = Date.now();

    this.usage.set(tenantId, current);
  }

  static getUsage(tenantId: string): {
    operations: Record<string, number>;
    dataSize: number;
    lastActivity: number;
    limits: Record<string, number>;
  } | null {
    return this.usage.get(tenantId) || null;
  }

  static checkLimits(tenantId: string, context: TenantContext): { allowed: boolean; reason?: string } {
    const usage = this.getUsage(tenantId);
    if (!usage) return { allowed: true };

    const limits = context.subscription.limits;

    // Check data size limits
    if (usage.dataSize > limits.maxTransactions * 1000) { // Assuming average 1KB per transaction
      return {
        allowed: false,
        reason: `Data usage limit exceeded. Used: ${usage.dataSize}KB, Limit: ${limits.maxTransactions * 1000}KB`
      };
    }

    // Check operation frequency limits
    const recentOperations = Object.values(usage.operations).reduce((sum, count) => sum + count, 0);
    if (recentOperations > 1000) { // Simple rate limiting
      return {
        allowed: false,
        reason: 'Operation rate limit exceeded. Too many operations in current session.'
      };
    }

    return { allowed: true };
  }

  static getUsageReport(tenantId: string): {
    summary: { totalOperations: number; dataSize: number; lastActivity: Date };
    breakdown: Record<string, number>;
    recommendations: string[];
  } | null {
    const usage = this.getUsage(tenantId);
    if (!usage) return null;

    const totalOperations = Object.values(usage.operations).reduce((sum, count) => sum + count, 0);
    const recommendations: string[] = [];

    if (usage.dataSize > 100000) { // 100MB
      recommendations.push('Consider data archiving for old records');
    }

    if (totalOperations > 5000) {
      recommendations.push('High operation volume detected - consider upgrading plan');
    }

    return {
      summary: {
        totalOperations,
        dataSize: usage.dataSize,
        lastActivity: new Date(usage.lastActivity),
      },
      breakdown: usage.operations,
      recommendations,
    };
  }

  static cleanupOldData(olderThanDays: number = 30): number {
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    let cleanedCount = 0;

    for (const [tenantId, data] of this.usage.entries()) {
      if (data.lastActivity < cutoffTime) {
        this.usage.delete(tenantId);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }
}