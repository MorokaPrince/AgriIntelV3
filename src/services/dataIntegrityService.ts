/**
 * Data Integrity Service
 * Ensures referential integrity and data consistency
 */

import mongoose from 'mongoose';

export interface IntegrityCheckResult {
  isValid: boolean;
  issues: string[];
  warnings: string[];
}

export class DataIntegrityService {
  /**
   * Check if referenced document exists
   */
  static async checkReferentialIntegrity(
    modelName: string,
    referenceId: mongoose.Types.ObjectId | string | undefined,
    referencedModelName: string
  ): Promise<boolean> {
    if (!referenceId) {
      return true; // Optional reference
    }

    try {
      const db = mongoose.connection.db;
      if (!db) return false;

      const collection = db.collection(referencedModelName.toLowerCase());
      const doc = await collection.findOne({
        _id: new mongoose.Types.ObjectId(referenceId as string),
      });

      return !!doc;
    } catch (error) {
      console.error(`Referential integrity check failed: ${error}`);
      return false;
    }
  }

  /**
   * Validate animal references in health records
   */
  static async validateHealthRecordIntegrity(
    tenantId: string,
    animalId: mongoose.Types.ObjectId
  ): Promise<IntegrityCheckResult> {
    const issues: string[] = [];
    const warnings: string[] = [];

    try {
      const db = mongoose.connection.db;
      if (!db) {
        return { isValid: false, issues: ['Database connection failed'], warnings };
      }

      // Check if animal exists
      const animal = await db.collection('animals').findOne({
        _id: animalId,
        tenantId,
      });

      if (!animal) {
        issues.push(`Animal with ID ${animalId} not found in tenant ${tenantId}`);
      }

      return {
        isValid: issues.length === 0,
        issues,
        warnings,
      };
    } catch (error) {
      return {
        isValid: false,
        issues: [`Integrity check failed: ${error}`],
        warnings,
      };
    }
  }

  /**
   * Validate task references
   */
  static async validateTaskIntegrity(
    tenantId: string,
    assignedToId: mongoose.Types.ObjectId,
    assignedById: mongoose.Types.ObjectId
  ): Promise<IntegrityCheckResult> {
    const issues: string[] = [];
    const warnings: string[] = [];

    try {
      const db = mongoose.connection.db;
      if (!db) {
        return { isValid: false, issues: ['Database connection failed'], warnings };
      }

      // Check if assigned user exists
      const assignedUser = await db.collection('users').findOne({
        _id: assignedToId,
        tenantId,
      });

      if (!assignedUser) {
        issues.push(`Assigned user with ID ${assignedToId} not found`);
      }

      // Check if assigner exists
      const assigner = await db.collection('users').findOne({
        _id: assignedById,
        tenantId,
      });

      if (!assigner) {
        issues.push(`Assigner user with ID ${assignedById} not found`);
      }

      return {
        isValid: issues.length === 0,
        issues,
        warnings,
      };
    } catch (error) {
      return {
        isValid: false,
        issues: [`Integrity check failed: ${error}`],
        warnings,
      };
    }
  }

  /**
   * Check for orphaned records (records with missing references)
   */
  static async findOrphanedRecords(
    tenantId: string,
    collectionName: string,
    referenceField: string,
    referencedCollection: string
  ): Promise<string[]> {
    const orphanedIds: string[] = [];

    try {
      const db = mongoose.connection.db;
      if (!db) return orphanedIds;

      const collection = db.collection(collectionName);
      const records = await collection
        .find({ tenantId })
        .toArray();

      for (const record of records) {
        const refId = record[referenceField];
        if (refId) {
          const referenced = await db.collection(referencedCollection).findOne({
            _id: refId,
          });

          if (!referenced) {
            orphanedIds.push(record._id.toString());
          }
        }
      }

      return orphanedIds;
    } catch (error) {
      console.error(`Error finding orphaned records: ${error}`);
      return orphanedIds;
    }
  }

  /**
   * Validate data consistency across related records
   */
  static async validateDataConsistency(tenantId: string): Promise<IntegrityCheckResult> {
    const issues: string[] = [];
    const warnings: string[] = [];

    try {
      const db = mongoose.connection.db;
      if (!db) {
        return { isValid: false, issues: ['Database connection failed'], warnings };
      }

      // Check for orphaned health records
      const orphanedHealthRecords = await this.findOrphanedRecords(
        tenantId,
        'healthrecords',
        'animalId',
        'animals'
      );

      if (orphanedHealthRecords.length > 0) {
        warnings.push(
          `Found ${orphanedHealthRecords.length} orphaned health records with missing animal references`
        );
      }

      // Check for orphaned tasks
      const orphanedTasks = await this.findOrphanedRecords(
        tenantId,
        'tasks',
        'assignedTo',
        'users'
      );

      if (orphanedTasks.length > 0) {
        warnings.push(
          `Found ${orphanedTasks.length} orphaned tasks with missing user references`
        );
      }

      // Check for orphaned notifications
      const orphanedNotifications = await this.findOrphanedRecords(
        tenantId,
        'notifications',
        'userId',
        'users'
      );

      if (orphanedNotifications.length > 0) {
        warnings.push(
          `Found ${orphanedNotifications.length} orphaned notifications with missing user references`
        );
      }

      return {
        isValid: issues.length === 0,
        issues,
        warnings,
      };
    } catch (error) {
      return {
        isValid: false,
        issues: [`Data consistency check failed: ${error}`],
        warnings,
      };
    }
  }

  /**
   * Clean up orphaned records
   */
  static async cleanupOrphanedRecords(
    tenantId: string,
    collectionName: string,
    referenceField: string,
    referencedCollection: string
  ): Promise<number> {
    try {
      const orphanedIds = await this.findOrphanedRecords(
        tenantId,
        collectionName,
        referenceField,
        referencedCollection
      );

      if (orphanedIds.length === 0) {
        return 0;
      }

      const db = mongoose.connection.db;
      if (!db) return 0;

      const collection = db.collection(collectionName);
      const result = await collection.deleteMany({
        _id: { $in: orphanedIds.map((id) => new mongoose.Types.ObjectId(id)) },
      });

      return result.deletedCount || 0;
    } catch (error) {
      console.error(`Error cleaning up orphaned records: ${error}`);
      return 0;
    }
  }
}

