import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function simpleInspect() {
  console.log('🔍 SIMPLE AGRIINTELV3 INSPECTION');
  console.log('===============================\n');

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('❌ MONGODB_URI environment variable is missing!');
    return;
  }

  console.log('📋 Using MONGODB_URI:', mongoUri ? 'Set (hidden)' : 'Not set');

  let client = null;

  try {
    // Connect using native MongoDB driver
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(mongoUri);
    await client.connect();

    console.log('✅ Connected successfully!');

    // Get database names
    const adminDb = client.db('admin');
    const databases = await adminDb.admin().listDatabases();

    console.log('\n📋 Available databases:');
    databases.databases.forEach(db => {
      if (db.name.includes('AgriIntel') || db.name.includes('test') || db.name.includes('ampd')) {
        console.log(`  - ${db.name} (${Math.round(db.sizeOnDisk / 1024 / 1024)} MB)`);
      }
    });

    // Focus on AgriIntelV3
    const dbName = 'AgriIntelV3';
    const db = client.db(dbName);

    console.log(`\n📊 Inspecting database: ${dbName}`);

    // Get database stats
    const stats = await db.stats();
    console.log('\n📈 Database Statistics:');
    console.log(`  Collections: ${stats.collections}`);
    console.log(`  Documents: ${stats.objects}`);
    console.log(`  Storage Size: ${Math.round(stats.storageSize / 1024 / 1024)} MB`);
    console.log(`  Data Size: ${Math.round(stats.dataSize / 1024 / 1024)} MB`);

    // List collections
    const collections = await db.listCollections().toArray();

    if (collections.length === 0) {
      console.log('\n❌ No collections found in AgriIntelV3');
      return;
    }

    console.log(`\n📋 Collections (${collections.length}):`);

    for (const collectionInfo of collections) {
      await inspectCollection(db, collectionInfo.name);
    }

    console.log('\n✅ INSPECTION COMPLETE');

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.error('Stack:', error.stack);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

async function inspectCollection(db, collectionName) {
  try {
    const collection = db.collection(collectionName);

    // Get collection stats
    const stats = await db.command({ collStats: collectionName });
    const count = await collection.countDocuments();

    console.log(`\n  📂 ${collectionName}`);
    console.log(`    Documents: ${count}`);
    console.log(`    Storage: ${Math.round(stats.storageSize / 1024)} KB`);
    console.log(`    Indexes: ${stats.nindexes}`);

    // Show indexes
    const indexes = await collection.indexes();
    indexes.forEach((index, i) => {
      const keys = Object.keys(index.key).join(', ');
      console.log(`      🔍 Index ${i + 1}: ${keys}`);
    });

    // Show sample data
    if (count > 0 && count <= 10) {
      console.log(`    📋 Sample data:`);
      const documents = await collection.find({}).limit(3).toArray();

      documents.forEach((doc, i) => {
        console.log(`      ${i + 1}:`, JSON.stringify(cleanDocument(doc), null, 2));
      });
    } else if (count > 10) {
      console.log(`    📋 First document preview:`);
      const firstDoc = await collection.findOne({});
      if (firstDoc) {
        console.log(`      Preview:`, JSON.stringify(cleanDocument(firstDoc), null, 2));
      }
    }

  } catch (error) {
    console.error(`    ❌ Error inspecting ${collectionName}: ${error.message}`);
  }
}

function cleanDocument(doc) {
  const cleaned = { ...doc };
  delete cleaned._id;
  delete cleaned.__v;
  delete cleaned.password;
  return cleaned;
}

simpleInspect().catch(console.error);