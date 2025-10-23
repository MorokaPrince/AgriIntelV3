import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function verifyAgriIntelV3() {
  console.log('🔍 AGRIINTELV3 DATABASE VERIFICATION REPORT');
  console.log('==========================================\n');

  // Get connection details
  const mongoUri = process.env.MONGODB_URI;
  const dbName = 'AgriIntelV3';

  if (!mongoUri) {
    console.error('❌ MONGODB_URI environment variable is missing!');
    return;
  }

  console.log('📋 CONNECTION CONFIGURATION');
  console.log('============================');
  console.log(`MONGODB_URI: ${mongoUri ? 'Set (hidden for security)' : 'Not set'}`);
  console.log(`Target Database: ${dbName}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');

  let connection = null;

  try {
    console.log(`🔍 CONNECTING TO DATABASE: ${dbName}`);
    console.log('-'.repeat(50));

    // Extract base URI and connect directly to AgriIntelV3
    const uriParts = mongoUri.split('/');
    const baseUri = mongoUri.substring(0, mongoUri.lastIndexOf('/'));
    const fullUri = `${baseUri}/${dbName}?retryWrites=true&w=majority`;

    connection = await mongoose.createConnection(fullUri);

    console.log(`✅ Successfully connected to: ${dbName}`);
    console.log(`📊 Database name: ${connection.db.databaseName}`);

    // List collections
    const collections = await connection.db.listCollections().toArray();
    console.log(`\n📋 COLLECTIONS (${collections.length} found):`);

    if (collections.length === 0) {
      console.log('  ❌ No collections found in AgriIntelV3 database!');
      console.log('\n💡 RECOMMENDATIONS:');
      console.log('  - Run seeding scripts to populate the database');
      console.log('  - Check if environment variables point to correct database');
      return;
    }

    // Sort collections by name for consistent output
    collections.sort((a, b) => a.name.localeCompare(b.name));

    console.log('\n📂 Collection Details:');
    console.log('-'.repeat(50));

    for (const coll of collections) {
      await checkCollectionDetailed(connection, coll.name);
    }

    // Check data relationships
    await checkDataRelationships(connection, collections);

    console.log('\n✅ VERIFICATION COMPLETE');

  } catch (error) {
    console.log(`❌ Cannot connect to ${dbName}: ${error.message}`);
    console.log('\n💡 TROUBLESHOOTING:');
    console.log('  - Check if MONGODB_URI is correct');
    console.log('  - Verify database exists in MongoDB Atlas');
    console.log('  - Check network connectivity');
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

// Detailed collection check
async function checkCollectionDetailed(connection, collectionName) {
  try {
    const collection = connection.db.collection(collectionName);
    const count = await collection.countDocuments();
    const indexes = await collection.indexes();
    const stats = await connection.db.command({ collStats: collectionName });

    console.log(`\n📂 Collection: ${collectionName}`);
    console.log(`  📊 Document Count: ${count}`);
    console.log(`  🔍 Indexes: ${indexes.length}`);
    console.log(`  💾 Storage Size: ${Math.round(stats.storageSize / 1024)} KB`);
    console.log(`  📈 Total Index Size: ${Math.round(stats.totalIndexSize / 1024)} KB`);

    // Show index details
    if (indexes.length > 0) {
      console.log(`  🔑 Index Details:`);
      indexes.forEach((idx, i) => {
        const name = idx.name || `Index_${i}`;
        const keys = Object.keys(idx.key).join(', ');
        const unique = idx.unique ? ' (UNIQUE)' : '';
        console.log(`    - ${name}: ${keys}${unique}`);
      });
    }

    // Sample data for collections with documents
    if (count > 0 && count <= 20) {
      console.log(`  📋 Sample Documents:`);
      const samples = await collection.find({}).limit(5).toArray();

      samples.forEach((sample, i) => {
        // Clean sensitive data and format output
        const cleanSample = { ...sample };
        delete cleanSample.password;
        delete cleanSample._id;

        console.log(`    ${i + 1}:`, JSON.stringify(cleanSample, null, 2));
      });
    } else if (count > 20) {
      console.log(`  📋 First document preview:`);
      const firstDoc = await collection.findOne({});
      if (firstDoc) {
        const cleanSample = { ...firstDoc };
        delete cleanSample.password;
        delete cleanSample._id;
        console.log(`    Preview:`, JSON.stringify(cleanSample, null, 2));
      }
    }

    // Data quality checks
    await checkCollectionDataQuality(collection, collectionName, count);

  } catch (error) {
    console.log(`  ❌ Error checking collection ${collectionName}: ${error.message}`);
  }
}

// Check data quality for a collection
async function checkCollectionDataQuality(collection, collectionName, count) {
  try {
    console.log(`  🔍 Data Quality Checks:`);

    if (count === 0) {
      console.log(`    ⚠️  No documents to check`);
      return;
    }

    // Check for required fields based on collection type
    const sample = await collection.findOne({});
    const fieldsToCheck = getFieldsToCheck(collectionName);

    let missingFields = 0;
    for (const field of fieldsToCheck) {
      if (sample && sample.hasOwnProperty(field)) {
        console.log(`    ✅ ${field}: Present`);
      } else {
        missingFields++;
        console.log(`    ❌ ${field}: Missing`);
      }
    }

    // Check for potential duplicates
    if (sample && sample.email) {
      const emailCount = await collection.countDocuments({ email: sample.email });
      if (emailCount > 1) {
        console.log(`    ⚠️  Potential duplicates: ${emailCount} documents with same email`);
      }
    }

    // Check for documents without timestamps
    if (collectionName !== 'weatherdatas') { // Weather data might not have these
      const noCreatedAt = await collection.countDocuments({ createdAt: { $exists: false } });
      const noUpdatedAt = await collection.countDocuments({ updatedAt: { $exists: false } });

      if (noCreatedAt > 0) {
        console.log(`    ⚠️  ${noCreatedAt} documents missing createdAt`);
      }
      if (noUpdatedAt > 0) {
        console.log(`    ⚠️  ${noUpdatedAt} documents missing updatedAt`);
      }
    }

    if (missingFields === 0) {
      console.log(`    ✅ All expected fields present`);
    }

  } catch (error) {
    console.log(`    ❌ Error in data quality check: ${error.message}`);
  }
}

// Get expected fields based on collection name
function getFieldsToCheck(collectionName) {
  const fieldMaps = {
    'users': ['email', 'name', 'createdAt'],
    'animals': ['name', 'tagId', 'species', 'createdAt'],
    'breedingrecords': ['animalId', 'breedingDate', 'createdAt'],
    'feedingrecords': ['animalId', 'feedType', 'quantity', 'createdAt'],
    'financialrecords': ['type', 'amount', 'description', 'createdAt'],
    'healthrecords': ['animalId', 'condition', 'treatment', 'createdAt'],
    'rfidrecords': ['tagId', 'animalId', 'status', 'createdAt'],
    'tasks': ['title', 'description', 'status', 'createdAt'],
    'weatherdatas': ['location', 'temperature', 'humidity', 'createdAt']
  };

  return fieldMaps[collectionName] || ['createdAt'];
}

// Check data relationships between collections
async function checkDataRelationships(connection, collections) {
  console.log('\n🔗 DATA RELATIONSHIPS CHECK');
  console.log('============================');

  try {
    const collectionNames = collections.map(c => c.name);

    // Check animal references in related collections
    if (collectionNames.includes('animals')) {
      const animalCount = await connection.db.collection('animals').countDocuments();

      if (animalCount > 0) {
        console.log(`📊 Animals: ${animalCount} documents`);

        // Check breeding records referencing animals
        if (collectionNames.includes('breedingrecords')) {
          const breedingWithAnimals = await connection.db.collection('breedingrecords').countDocuments({ animalId: { $exists: true } });
          console.log(`🔗 Breeding records with animal references: ${breedingWithAnimals}`);
        }

        // Check feeding records referencing animals
        if (collectionNames.includes('feedingrecords')) {
          const feedingWithAnimals = await connection.db.collection('feedingrecords').countDocuments({ animalId: { $exists: true } });
          console.log(`🔗 Feeding records with animal references: ${feedingWithAnimals}`);
        }

        // Check health records referencing animals
        if (collectionNames.includes('healthrecords')) {
          const healthWithAnimals = await connection.db.collection('healthrecords').countDocuments({ animalId: { $exists: true } });
          console.log(`🔗 Health records with animal references: ${healthWithAnimals}`);
        }

        // Check RFID records referencing animals
        if (collectionNames.includes('rfidrecords')) {
          const rfidWithAnimals = await connection.db.collection('rfidrecords').countDocuments({ animalId: { $exists: true } });
          console.log(`🔗 RFID records with animal references: ${rfidWithAnimals}`);
        }
      }
    }

    // Check user references
    if (collectionNames.includes('users')) {
      const userCount = await connection.db.collection('users').countDocuments();
      console.log(`👥 Users: ${userCount} documents`);

      if (collectionNames.includes('tasks')) {
        const tasksWithUsers = await connection.db.collection('tasks').countDocuments({ userId: { $exists: true } });
        console.log(`🔗 Tasks with user references: ${tasksWithUsers}`);
      }
    }

  } catch (error) {
    console.log(`❌ Error checking data relationships: ${error.message}`);
  }
}

// Run the verification
verifyAgriIntelV3().catch(console.error);