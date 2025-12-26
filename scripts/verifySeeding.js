import mongoose from 'mongoose';

async function verifySeeding() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://agriintel:XYEXSyQkSiAhgWg7@cluster0.yvkuood.mongodb.net/AgriIntelV3?retryWrites=true&w=majority&appName=AgriIntelV3';
    
    console.log('🔍 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    const db = mongoose.connection.db;
    const collections = [
      'users',
      'animals',
      'healthrecords',
      'financialrecords',
      'feedrecords',
      'breedingrecords',
      'rfidrecords',
      'tasks',
      'weatherdatas',
      'notifications'
    ];

    console.log('📊 Database Record Counts:\n');
    let totalRecords = 0;

    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments({ tenantId: 'demo-farm' });
        console.log(`  ${collectionName.padEnd(20)} : ${count} records`);
        totalRecords += count;
      } catch (error) {
        console.log(`  ${collectionName.padEnd(20)} : ❌ Error or not found`);
      }
    }

    console.log(`\n📈 Total Records: ${totalRecords}\n`);

    // Check sample data
    console.log('🔎 Sample Data Check:\n');
    
    const animalsCollection = db.collection('animals');
    const sampleAnimal = await animalsCollection.findOne({ tenantId: 'demo-farm' });
    if (sampleAnimal) {
      console.log('✅ Sample Animal:');
      console.log(`   Name: ${sampleAnimal.name}`);
      console.log(`   Species: ${sampleAnimal.species}`);
      console.log(`   RFID: ${sampleAnimal.rfidTag}`);
      console.log(`   Status: ${sampleAnimal.status}\n`);
    } else {
      console.log('❌ No animals found\n');
    }

    const healthCollection = db.collection('healthrecords');
    const sampleHealth = await healthCollection.findOne({ tenantId: 'demo-farm' });
    if (sampleHealth) {
      console.log('✅ Sample Health Record:');
      console.log(`   Type: ${sampleHealth.recordType}`);
      console.log(`   Status: ${sampleHealth.status}`);
      console.log(`   Animal ID: ${sampleHealth.animalId}\n`);
    } else {
      console.log('❌ No health records found\n');
    }

    await mongoose.disconnect();
    console.log('✅ Verification complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifySeeding();

