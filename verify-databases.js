import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function verifyDatabases() {
  console.log('🔍 COMPREHENSIVE DATABASE VERIFICATION REPORT');
  console.log('==============================================\n');

  // Get connection details
  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || 'AgriIntelV3';

  if (!mongoUri) {
    console.error('❌ MONGODB_URI environment variable is missing!');
    return;
  }

  console.log('📋 CONNECTION CONFIGURATION');
  console.log('============================');
  console.log(`MONGODB_URI: ${mongoUri ? 'Set (hidden for security)' : 'Not set'}`);
  console.log(`DB_NAME: ${dbName}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');

  // Extract database name from URI for checking multiple databases
  const uriParts = mongoUri.split('/');
  const baseUri = mongoUri.substring(0, mongoUri.lastIndexOf('/'));

  const databasesToCheck = [
    'AgriIntelV3',      // Main expected database
    'AgrIntelV4',       // Default from connection config
    'test',             // Common test database
    'ampd_livestock'    // From hardcoded URI in check-db.js
  ];

  for (const dbName of databasesToCheck) {
    await checkDatabase(baseUri, dbName);
    console.log('\n' + '='.repeat(60) + '\n');
  }

  // Check for tenant databases
  await checkTenantDatabases(baseUri);

  console.log('✅ VERIFICATION COMPLETE');
}

// Check a specific database
async function checkDatabase(baseUri, dbName) {
  let connection = null;

  try {
    console.log(`🔍 CHECKING DATABASE: ${dbName}`);
    console.log('-'.repeat(40));

    const fullUri = `${baseUri}/${dbName}?retryWrites=true&w=majority`;
    connection = await mongoose.createConnection(fullUri);

    console.log(`✅ Connected to: ${dbName}`);
    console.log(`📊 Database name: ${connection.db.databaseName}`);

    // List collections
    const collections = await connection.db.listCollections().toArray();
    console.log(`\n📋 COLLECTIONS (${collections.length} found):`);

    if (collections.length === 0) {
      console.log('  No collections found');
      return;
    }

    // Sort collections by name for consistent output
    collections.sort((a, b) => a.name.localeCompare(b.name));

    for (const coll of collections) {
      await checkCollection(connection, coll.name);
    }

  } catch (error) {
    console.log(`❌ Cannot connect to ${dbName}: ${error.message}`);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

// Check a specific collection
async function checkCollection(connection, collectionName) {
  try {
    const collection = connection.db.collection(collectionName);
    const count = await collection.countDocuments();
    const indexes = await collection.indexes();

    console.log(`\n  📂 ${collectionName}`);
    console.log(`    Documents: ${count}`);
    console.log(`    Indexes: ${indexes.length}`);

    // Show index details
    if (indexes.length > 0) {
      console.log(`    Index details:`);
      indexes.forEach((idx, i) => {
        const name = idx.name || `Index_${i}`;
        const keys = Object.keys(idx.key).join(', ');
        console.log(`      - ${name}: ${keys}`);
      });
    }

    // Sample data for collections with few documents
    if (count > 0 && count <= 10) {
      const samples = await collection.find({}).limit(3).toArray();
      console.log(`    Sample data:`);
      samples.forEach((sample, i) => {
        // Remove sensitive fields and limit output
        const cleanSample = { ...sample };
        delete cleanSample.password;
        delete cleanSample._id;
        console.log(`      ${i + 1}:`, JSON.stringify(cleanSample, null, 2));
      });
    }

    // Check for potential data quality issues
    await checkDataQuality(collection, collectionName, count);

  } catch (error) {
    console.log(`    ❌ Error checking collection ${collectionName}: ${error.message}`);
  }
}

// Check for data quality issues
async function checkDataQuality(collection, collectionName, count) {
  try {
    // Check for missing required fields (basic check)
    if (count > 0) {
      const sample = await collection.findOne({});

      // Common required fields to check
      const commonFields = ['createdAt', 'updatedAt', 'name', 'id'];

      console.log(`    Data quality check:`);
      for (const field of commonFields) {
        if (sample && sample.hasOwnProperty(field)) {
          console.log(`      ✅ ${field}: Present`);
        }
      }

      // Check for potential duplicates (if _id is not the only unique field)
      if (sample && sample.email) {
        const emailCount = await collection.countDocuments({ email: sample.email });
        if (emailCount > 1) {
          console.log(`      ⚠️  Potential duplicates found (${emailCount} with same email)`);
        }
      }
    }
  } catch (error) {
    console.log(`    ❌ Error in data quality check: ${error.message}`);
  }
}

// Check for tenant databases
async function checkTenantDatabases(baseUri) {
  console.log('🔍 CHECKING FOR TENANT DATABASES');
  console.log('================================');

  try {
    // Connect to admin database to list all databases
    const adminConnection = await mongoose.createConnection(`${baseUri}/admin`);
    const adminDb = adminConnection.db;

    const dbs = await adminDb.admin().listDatabases();
    const allDatabases = dbs.databases.map(db => db.name);

    console.log(`📋 All databases in cluster:`);
    allDatabases
      .filter(name => name.includes('AgrIntel') || name.includes('test') || name.includes('ampd'))
      .forEach(name => {
        console.log(`  - ${name}`);
      });

    await adminConnection.close();

  } catch (error) {
    console.log(`❌ Error checking tenant databases: ${error.message}`);
  }
}

// Run the verification
verifyDatabases().catch(console.error);