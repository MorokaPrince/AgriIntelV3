import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testConnectionPerformance() {
  console.log('🔍 CONNECTION PERFORMANCE AND TIMEOUT TEST');
  console.log('==========================================\n');

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('❌ MONGODB_URI environment variable is missing!');
    return;
  }

  console.log('Testing connection performance and timeouts...\n');

  // Test 1: Basic connection with timeout
  console.log('TEST 1: Basic Connection Test');
  console.log('-----------------------------');

  const startTime = Date.now();
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 30000,
    });

    const connectionTime = Date.now() - startTime;
    console.log(`✅ Connection established in ${connectionTime}ms`);
    console.log(`📊 Ready state: ${mongoose.connection.readyState}`);

    // Test 2: Database operations performance
    console.log('\nTEST 2: Database Operations Performance');
    console.log('--------------------------------------');

    const dbStartTime = Date.now();

    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const listTime = Date.now() - dbStartTime;
    console.log(`📋 Listed ${collections.length} collections in ${listTime}ms`);

    // Test a simple query
    const queryStartTime = Date.now();
    const animalCount = await mongoose.connection.db.collection('animals').countDocuments();
    const queryTime = Date.now() - queryStartTime;
    console.log(`🔍 Counted ${animalCount} animals in ${queryTime}ms`);

    // Test 3: Connection pool status
    console.log('\nTEST 3: Connection Pool Status');
    console.log('------------------------------');

    const readyState = mongoose.connection.readyState;
    console.log(`🔗 Connection ready state: ${readyState}`);

    if (mongoose.connection.db) {
      const dbStats = await mongoose.connection.db.stats();
      console.log(`💾 Database stats:`);
      console.log(`  - Collections: ${dbStats.collections}`);
      console.log(`  - Data size: ${Math.round(dbStats.dataSize / 1024 / 1024)}MB`);
      console.log(`  - Storage size: ${Math.round(dbStats.storageSize / 1024 / 1024)}MB`);
      console.log(`  - Indexes: ${dbStats.indexes}`);
      console.log(`  - Index size: ${Math.round(dbStats.totalIndexSize / 1024 / 1024)}MB`);
    }

    // Test 4: Timeout simulation
    console.log('\nTEST 4: Timeout Simulation');
    console.log('--------------------------');

    try {
      // Try a query with a very short timeout to test timeout handling
      const timeoutTest = await mongoose.connection.db.collection('animals').findOne({}, {
        maxTimeMS: 1000
      });
      console.log('✅ Timeout test passed - query completed within timeout');
    } catch (timeoutError) {
      if (timeoutError.code === 50) {
        console.log('⚠️ Query timed out as expected (testing timeout handling)');
      } else {
        console.log(`❌ Unexpected timeout error: ${timeoutError.message}`);
      }
    }

    await mongoose.disconnect();
    console.log('\n✅ All performance tests completed successfully');

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ Connection failed after ${totalTime}ms: ${error.message}`);

    if (error.message.includes('timeout')) {
      console.error('🚨 Connection timeout detected - check network connectivity');
    } else if (error.message.includes('authentication')) {
      console.error('🔐 Authentication failed - check credentials');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('🌐 DNS resolution failed - check MongoDB URI');
    }
  }
}

testConnectionPerformance().catch(console.error);