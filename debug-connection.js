import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config({ path: '.env.local' });

async function debugConnection() {
  console.log('🔍 CONNECTION DEBUG REPORT');
  console.log('=========================\n');

  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || 'AgriIntelV3';

  console.log('Environment Variables:');
  console.log(`MONGODB_URI: ${mongoUri ? 'Set (length: ' + mongoUri.length + ')' : 'Not set'}`);
  console.log(`DB_NAME: ${dbName}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log('');

  if (!mongoUri) {
    console.error('❌ MONGODB_URI is not set!');
    return;
  }

  // Test 1: Connect to the URI as-is (this is what the app actually uses)
  console.log('TEST 1: Connecting to MONGODB_URI as-is');
  console.log('=======================================');

  let connection = null;
  try {
    connection = await mongoose.createConnection(mongoUri);
    console.log('✅ Successfully connected to MongoDB');
    console.log(`📊 Database name: ${connection.db.databaseName}`);
    console.log(`🔗 Connection name: ${connection.name}`);
    console.log(`📡 Ready state: ${connection.readyState}`);

    // List collections in the actual database being used
    const collections = await connection.db.listCollections().toArray();
    console.log(`📋 Collections found: ${collections.length}`);

    if (collections.length > 0) {
      console.log('Collections:');
      collections.forEach(coll => {
        console.log(`  - ${coll.name}`);
      });
    } else {
      console.log('⚠️  No collections found in this database');
    }

    await connection.close();

  } catch (error) {
    console.error(`❌ Failed to connect: ${error.message}`);
  }

  // Test 2: Try to connect to AgriIntelV3 specifically
  console.log('\nTEST 2: Connecting to AgriIntelV3 specifically');
  console.log('==============================================');

  try {
    const uriParts = mongoUri.split('/');
    const baseUri = mongoUri.substring(0, mongoUri.lastIndexOf('/'));
    const agriIntelUri = `${baseUri}/AgriIntelV3?retryWrites=true&w=majority`;

    console.log(`🔗 Attempting URI: ${baseUri}/AgriIntelV3`);

    connection = await mongoose.createConnection(agriIntelUri);
    console.log('✅ Successfully connected to AgriIntelV3');
    console.log(`📊 Database name: ${connection.db.databaseName}`);

    const collections = await connection.db.listCollections().toArray();
    console.log(`📋 Collections in AgriIntelV3: ${collections.length}`);

    if (collections.length > 0) {
      console.log('Collections:');
      collections.forEach(coll => {
        console.log(`  - ${coll.name}`);
      });
    } else {
      console.log('⚠️  No collections found in AgriIntelV3');
    }

    await connection.close();

  } catch (error) {
    console.error(`❌ Failed to connect to AgriIntelV3: ${error.message}`);
  }

  // Test 3: Check what databases exist in the cluster
  console.log('\nTEST 3: Listing all databases in cluster');
  console.log('========================================');

  try {
    const adminConnection = await mongoose.createConnection(`${mongoUri.split('/').slice(0, -1).join('/')}/admin`);
    const adminDb = adminConnection.db;

    // Use the MongoDB driver directly to list databases
    const client = new MongoClient(mongoUri);
    await client.connect();

    const databases = await client.db().admin().listDatabases();
    console.log('📋 Available databases:');
    databases.databases.forEach(db => {
      if (db.name.includes('AgriIntel') || db.name.includes('test') || db.name.includes('ampd')) {
        console.log(`  - ${db.name} (${Math.round(db.sizeOnDisk / 1024 / 1024)} MB)`);
      }
    });

    await client.close();
    await adminConnection.close();

  } catch (error) {
    console.error(`❌ Failed to list databases: ${error.message}`);
  }

  console.log('\n✅ DEBUG COMPLETE');
}

debugConnection().catch(console.error);