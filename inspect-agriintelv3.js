import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function inspectAgriIntelV3() {
  console.log('🔍 AGRIINTELV3 DATABASE INSPECTION REPORT');
  console.log('=========================================\n');

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('❌ MONGODB_URI environment variable is missing!');
    return;
  }

  console.log('📋 CONNECTION DETAILS');
  console.log('=====================');
  console.log(`MONGODB_URI: ${mongoUri ? 'Set (hidden)' : 'Not set'}`);
  console.log(`Target Database: AgriIntelV3`);
  console.log('');

  let connection = null;

  try {
    // Connect directly to AgriIntelV3 database
    const uriParts = mongoUri.split('/');
    const baseUri = mongoUri.substring(0, mongoUri.lastIndexOf('/'));
    const fullUri = `${baseUri}/AgriIntelV3?retryWrites=true&w=majority`;

    console.log('🔌 Connecting to AgriIntelV3...');
    connection = await mongoose.createConnection(fullUri);

    console.log('✅ Connected successfully!');
    console.log(`📊 Database: ${connection.db.databaseName}`);
    console.log(`🔗 Connection ready: ${connection.readyState === 1 ? 'Yes' : 'No'}`);

    // Get comprehensive database statistics
    const stats = await connection.db.stats();
    console.log('\n📊 DATABASE STATISTICS');
    console.log('======================');
    console.log(`Collections: ${stats.collections}`);
    console.log(`Documents: ${stats.objects}`);
    console.log(`Storage Size: ${Math.round(stats.storageSize / 1024 / 1024)} MB`);
    console.log(`Data Size: ${Math.round(stats.dataSize / 1024 / 1024)} MB`);
    console.log(`Indexes: ${stats.indexes}`);
    console.log(`Index Size: ${Math.round(stats.totalIndexSize / 1024 / 1024)} MB`);

    // List all collections with detailed information
    console.log('\n📋 COLLECTIONS DETAILS');
    console.log('=======================');

    const collections = await connection.db.listCollections().toArray();

    if (collections.length === 0) {
      console.log('❌ No collections found in AgriIntelV3 database');
      console.log('\n💡 The database exists but is empty');
      return;
    }

    // Sort collections alphabetically
    collections.sort((a, b) => a.name.localeCompare(b.name));

    for (const collectionInfo of collections) {
      await inspectCollection(connection, collectionInfo.name);
    }

    console.log('\n✅ INSPECTION COMPLETE');

  } catch (error) {
    console.error(`❌ Connection failed: ${error.message}`);
    console.error('Full error:', error);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

async function inspectCollection(connection, collectionName) {
  try {
    console.log(`\n📂 Collection: ${collectionName}`);
    console.log('-'.repeat(40));

    const collection = connection.db.collection(collectionName);

    // Get collection statistics
    const collStats = await connection.db.command({ collStats: collectionName });

    // Count documents
    const count = await collection.countDocuments();

    console.log(`📊 Documents: ${count}`);
    console.log(`💾 Storage Size: ${Math.round(collStats.storageSize / 1024)} KB`);
    console.log(`📈 Index Size: ${Math.round(collStats.totalIndexSize / 1024)} KB`);

    // Get indexes
    const indexes = await collection.indexes();
    console.log(`🔍 Indexes: ${indexes.length}`);

    indexes.forEach((index, i) => {
      const name = index.name || `Index_${i}`;
      const keys = Object.keys(index.key).join(', ');
      const unique = index.unique ? ' (UNIQUE)' : '';
      console.log(`  - ${name}: ${keys}${unique}`);
    });

    // Show sample documents if collection has data
    if (count > 0) {
      console.log('\n📋 SAMPLE DATA:');

      if (count <= 5) {
        // Show all documents for small collections
        const allDocs = await collection.find({}).toArray();
        allDocs.forEach((doc, i) => {
          console.log(`\n  Document ${i + 1}:`);
          printDocumentSafely(doc);
        });
      } else {
        // Show first few documents for larger collections
        const samples = await collection.find({}).limit(3).toArray();
        samples.forEach((doc, i) => {
          console.log(`\n  Sample ${i + 1}:`);
          printDocumentSafely(doc);
        });
        console.log(`\n  ... and ${count - 3} more documents`);
      }
    } else {
      console.log('📭 No documents in collection');
    }

  } catch (error) {
    console.error(`❌ Error inspecting collection ${collectionName}: ${error.message}`);
  }
}

function printDocumentSafely(doc) {
  // Remove sensitive fields and format for display
  const cleanDoc = { ...doc };

  // Remove MongoDB internal fields and sensitive data
  delete cleanDoc._id;
  delete cleanDoc.__v;
  delete cleanDoc.password;
  delete cleanDoc.token;

  // Format the output
  console.log(JSON.stringify(cleanDoc, null, 2));
}

// Run the inspection
inspectAgriIntelV3().catch(console.error);