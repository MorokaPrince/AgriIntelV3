#!/usr/bin/env node

/**
 * Simple Database Index Checker for AgriIntel V3
 *
 * This script checks existing indexes without importing TypeScript models
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

async function checkIndexes() {
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

    console.log('\n📊 Database Index Report');
    console.log('=======================\n');

    let totalIndexes = 0;
    let totalCollections = 0;

    for (const collectionName of collections) {
      try {
        const db = mongoose.connection.db;
        const indexes = await db.collection(collectionName).indexes();

        if (indexes.length > 0) {
          console.log(`📋 ${collectionName} (${indexes.length} indexes):`);
          totalCollections++;

          for (const index of indexes) {
            const keys = Object.keys(index.key);
            const isUnique = index.unique ? ' (unique)' : '';
            const isSparse = index.sparse ? ' (sparse)' : '';

            if (keys.length === 1) {
              console.log(`   🔹 Single: ${keys[0]}${isUnique}${isSparse}`);
            } else {
              console.log(`   🔗 Compound: ${keys.join(', ')}${isUnique}${isSparse}`);
            }

            // Check for text indexes
            if (index.weights) {
              console.log(`   📝 Text index on: ${Object.keys(index.weights).join(', ')}`);
            }
          }
          totalIndexes += indexes.length;
          console.log('');
        } else {
          console.log(`⚠️  ${collectionName}: No indexes found`);
        }

      } catch (error) {
        console.log(`❌ ${collectionName}: Error - ${error.message}`);
      }
    }

    console.log('📈 Summary');
    console.log('==========');
    console.log(`Collections with indexes: ${totalCollections}/${collections.length}`);
    console.log(`Total indexes: ${totalIndexes}`);

    // Performance assessment
    console.log('\n💡 Performance Assessment');
    console.log('========================');
    if (totalIndexes < 15) {
      console.log('⚠️  Limited index coverage - consider adding more indexes for query optimization');
    } else if (totalIndexes < 30) {
      console.log('✅ Good index coverage for typical application needs');
    } else {
      console.log('✅ Excellent index coverage for high-performance queries');
    }

  } catch (error) {
    console.error('❌ Error during index check:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the check
if (import.meta.url === `file://${process.argv[1]}`) {
  checkIndexes()
    .then(() => {
      console.log('\n🎉 Index check completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Check failed:', error);
      process.exit(1);
    });
}