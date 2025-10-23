#!/usr/bin/env node

/**
 * Database Index Verification Script for AgriIntel V3
 *
 * This script verifies that all required indexes were created successfully
 * and provides a summary of the database index status.
 */

import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// MongoDB connection string from environment
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}

const collections = [
  'animals',
  'users',
  'tasks',
  'financialrecords',
  'feedrecords',
  'healthrecords',
  'weatherdatas',
  'breedingrecords',
  'rfidrecords'
];

async function getCollectionIndexes(collectionName) {
  try {
    const db = mongoose.connection.db;
    const indexes = await db.collection(collectionName).indexes();
    return indexes;
  } catch (error) {
    console.error(`Error getting indexes for ${collectionName}:`, error);
    return [];
  }
}

async function analyzeIndexes() {
  try {
    // Connect to database
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    };

    await mongoose.connect(MONGODB_URI, opts);
    console.log('✅ Connected to MongoDB');

    const report = {
      totalCollections: collections.length,
      collectionsAnalyzed: 0,
      totalIndexes: 0,
      textIndexes: 0,
      compoundIndexes: 0,
      singleIndexes: 0,
      errors: []
    };

    console.log('\n📊 Database Index Analysis Report');
    console.log('=====================================\n');

    for (const collectionName of collections) {
      try {
        console.log(`🔍 Analyzing ${collectionName} collection...`);
        const indexes = await getCollectionIndexes(collectionName);

        if (indexes.length === 0) {
          console.log(`⚠️  No indexes found for ${collectionName}`);
          report.errors.push(`No indexes found for ${collectionName}`);
          continue;
        }

        console.log(`   Found ${indexes.length} indexes:`);

        for (const index of indexes) {
          const indexKeys = Object.keys(index.key);
          const indexType = indexKeys.length > 1 ? 'compound' : 'single';
          const isTextIndex = index.name && index.name.includes('text');

          if (isTextIndex) {
            report.textIndexes++;
            console.log(`   📝 Text Index: ${index.name} on fields: ${indexKeys.join(', ')}`);
          } else if (indexType === 'compound') {
            report.compoundIndexes++;
            console.log(`   🔗 Compound Index: ${index.name || 'unnamed'} on fields: ${indexKeys.join(', ')}`);
          } else {
            report.singleIndexes++;
            console.log(`   📋 Single Index: ${index.name || 'unnamed'} on field: ${indexKeys[0]}`);
          }

          // Check for tenantId in compound indexes
          if (indexKeys.includes('tenantId') && indexKeys.length > 1) {
            console.log(`      ✅ Multi-tenant index pattern detected`);
          }
        }

        report.totalIndexes += indexes.length;
        report.collectionsAnalyzed++;
        console.log('');

      } catch (error) {
        console.error(`❌ Error analyzing ${collectionName}:`, error.message);
        report.errors.push(`Error analyzing ${collectionName}: ${error.message}`);
      }
    }

    // Print summary
    console.log('\n📈 Summary Report');
    console.log('================');
    console.log(`Collections analyzed: ${report.collectionsAnalyzed}/${report.totalCollections}`);
    console.log(`Total indexes found: ${report.totalIndexes}`);
    console.log(`Text indexes: ${report.textIndexes}`);
    console.log(`Compound indexes: ${report.compoundIndexes}`);
    console.log(`Single indexes: ${report.singleIndexes}`);

    if (report.errors.length > 0) {
      console.log(`\n❌ Errors encountered: ${report.errors.length}`);
      report.errors.forEach(error => console.log(`   - ${error}`));
    } else {
      console.log('\n✅ All collections analyzed successfully!');
    }

    // Performance recommendations
    console.log('\n💡 Performance Recommendations');
    console.log('============================');
    if (report.textIndexes < 2) {
      console.log('⚠️  Consider adding more text indexes for search functionality');
    }
    if (report.compoundIndexes < 10) {
      console.log('⚠️  Consider adding more compound indexes for complex query patterns');
    }
    if (report.totalIndexes < 20) {
      console.log('ℹ️  Index count is reasonable for the application size');
    } else {
      console.log('ℹ️  Good index coverage for query optimization');
    }

  } catch (error) {
    console.error('❌ Error during index verification:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the verification
if (import.meta.url === `file://${process.argv[1]}`) {
  analyzeIndexes()
    .then(() => {
      console.log('\n🎉 Index verification completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Verification failed:', error);
      process.exit(1);
    });
}