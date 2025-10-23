#!/usr/bin/env node

/**
 * Database Index Optimization Script for AgriIntel V3
 *
 * This script analyzes existing indexes and creates missing indexes
 * for optimal query performance across all collections.
 */

import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// MongoDB connection string from environment
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}


async function getExistingIndexes(collectionName) {
  try {
    const db = mongoose.connection.db;
    const indexes = await db.collection(collectionName).indexes();
    return indexes;
  } catch (error) {
    console.error(`Error getting indexes for ${collectionName}:`, error);
    return [];
  }
}

async function createIndex(collectionName, indexSpec, options = {}) {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection(collectionName);

    console.log(`Creating index on ${collectionName}:`, indexSpec);
    await collection.createIndex(indexSpec, options);
    console.log(`✅ Successfully created index on ${collectionName}`);
    return true;
  } catch (error) {
    console.error(`❌ Error creating index on ${collectionName}:`, error);
    return false;
  }
}

async function optimizeIndexes() {
  try {
    // Connect to database directly
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    };

    await mongoose.connect(MONGODB_URI, opts);
    console.log('✅ Connected to MongoDB');

    const results = {
      created: [],
      skipped: [],
      errors: []
    };

    // 1. Animals Collection Indexes
    console.log('\n🔍 Optimizing Animals Collection...');

    // Text index for search functionality
    await createIndex('animals', {
      name: 'text',
      rfidTag: 'text',
      breed: 'text'
    }, { name: 'animals_text_search' });

    // Compound indexes for common queries
    await createIndex('animals', { tenantId: 1, species: 1, status: 1 });
    await createIndex('animals', { tenantId: 1, 'location.farmSection': 1, status: 1 });
    await createIndex('animals', { tenantId: 1, 'health.overallCondition': 1, status: 1 });
    await createIndex('animals', { tenantId: 1, 'breeding.isBreedingStock': 1 });
    await createIndex('animals', { tenantId: 1, 'parentage.sireId': 1 });
    await createIndex('animals', { tenantId: 1, 'parentage.damId': 1 });

    // 2. Tasks Collection Indexes
    console.log('\n🔍 Optimizing Tasks Collection...');

    // Text index for search
    await createIndex('tasks', {
      title: 'text',
      description: 'text'
    }, { name: 'tasks_text_search' });

    // Compound indexes for common queries
    await createIndex('tasks', { tenantId: 1, status: 1, dueDate: 1 });
    await createIndex('tasks', { tenantId: 1, assignedTo: 1, status: 1 });
    await createIndex('tasks', { tenantId: 1, category: 1, priority: 1 });
    await createIndex('tasks', { tenantId: 1, animalId: 1, status: 1 });

    // 3. Financial Records Collection Indexes
    console.log('\n🔍 Optimizing Financial Records Collection...');

    // Compound indexes for reports and filtering
    await createIndex('financialrecords', { tenantId: 1, recordType: 1, date: -1 });
    await createIndex('financialrecords', { tenantId: 1, category: 1, date: -1 });
    await createIndex('financialrecords', { tenantId: 1, status: 1, date: -1 });
    await createIndex('financialrecords', { tenantId: 1, amount: -1 });
    await createIndex('financialrecords', { tenantId: 1, 'relatedEntities.animalId': 1, date: -1 });

    // 4. Health Records Collection Indexes
    console.log('\n🔍 Optimizing Health Records Collection...');

    // Compound indexes for animal health tracking
    await createIndex('healthrecords', { tenantId: 1, animalId: 1, date: -1 });
    await createIndex('healthrecords', { tenantId: 1, severity: 1, status: 1 });
    await createIndex('healthrecords', { tenantId: 1, recordType: 1, date: -1 });
    await createIndex('healthrecords', { tenantId: 1, veterinarian: 1, date: -1 });

    // 5. Feed Records Collection Indexes
    console.log('\n🔍 Optimizing Feed Records Collection...');

    // Indexes for inventory management
    await createIndex('feedrecords', { tenantId: 1, currentStock: 1, minStock: 1 });
    await createIndex('feedrecords', { tenantId: 1, expiryDate: 1, currentStock: 1 });

    // 6. Users Collection Indexes
    console.log('\n🔍 Optimizing Users Collection...');

    // Compound indexes for user management
    await createIndex('users', { tenantId: 1, role: 1, isActive: 1 });
    await createIndex('users', { tenantId: 1, country: 1, region: 1 });

    // 7. Breeding Records Collection Indexes
    console.log('\n🔍 Optimizing Breeding Records Collection...');

    // Indexes for breeding program management
    await createIndex('breedingrecords', { tenantId: 1, species: 1, status: 1 });
    await createIndex('breedingrecords', { tenantId: 1, startDate: -1, endDate: -1 });

    // 8. RFID Records Collection Indexes
    console.log('\n🔍 Optimizing RFID Records Collection...');

    // Indexes for RFID tracking
    await createIndex('rfidrecords', { tenantId: 1, status: 1, batteryLevel: 1 });
    await createIndex('rfidrecords', { tenantId: 1, lastScan: -1, signalStrength: 1 });

    // 9. Weather Data Collection Indexes
    console.log('\n🔍 Optimizing Weather Data Collection...');

    // Compound index for location-based queries
    await createIndex('weatherdatas', {
      tenantId: 1,
      'location.latitude': 1,
      'location.longitude': 1,
      lastUpdated: -1
    });

    console.log('\n✅ Index optimization completed!');
    console.log('\n📊 Summary:');
    console.log(`Created indexes: ${results.created.length}`);
    console.log(`Skipped indexes: ${results.skipped.length}`);
    console.log(`Errors: ${results.errors.length}`);

    if (results.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      results.errors.forEach(error => console.log(`- ${error}`));
    }

  } catch (error) {
    console.error('❌ Error during index optimization:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the optimization
if (import.meta.url === `file://${process.argv[1]}`) {
  optimizeIndexes()
    .then(() => {
      console.log('🎉 Index optimization script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}
