import mongoose from 'mongoose';

async function verifySeeding() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://luckyrakgama:MayR123@cluster0.yvkuood.mongodb.net/AgrIntelV3?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas - AgriIntelV3');

    const db = mongoose.connection.db;
    const collections = ['users', 'animals', 'healthrecords', 'financialrecords', 'feedingrecords', 'breedingrecords', 'rfidrecords', 'tasks'];

    console.log('\n📊 Current Database Record Counts:');
    for (const collectionName of collections) {
      const count = await db.collection(collectionName).countDocuments();
      console.log(`   ${collectionName}: ${count} documents`);
    }

    // Verify relationships by checking sample data
    console.log('\n🔗 Verifying Data Relationships:');

    // Check if animals have proper RFID links
    const sampleAnimal = await db.collection('animals').findOne({});
    if (sampleAnimal) {
      console.log(`   ✓ Sample animal found: ${sampleAnimal.name} (${sampleAnimal.species})`);

      // Check if RFID record exists for this animal
      const rfidRecord = await db.collection('rfidrecords').findOne({ animalId: sampleAnimal._id });
      if (rfidRecord) {
        console.log(`   ✓ RFID record linked: ${rfidRecord.tagId}`);
      } else {
        console.log(`   ⚠ No RFID record found for animal ${sampleAnimal._id}`);
      }

      // Check if health record exists for this animal
      const healthRecord = await db.collection('healthrecords').findOne({ animalId: sampleAnimal._id });
      if (healthRecord) {
        console.log(`   ✓ Health record linked: ${healthRecord.recordType}`);
      } else {
        console.log(`   ⚠ No health record found for animal ${sampleAnimal._id}`);
      }
    }

    // Check tenant consistency
    const tenantCounts = await db.collection('users').aggregate([
      { $group: { _id: '$tenantId', count: { $sum: 1 } } }
    ]).toArray();

    console.log('\n🏢 Tenant Distribution:');
    tenantCounts.forEach(tenant => {
      console.log(`   ${tenant._id}: ${tenant.count} users`);
    });

    console.log('\n✅ Data verification completed!');

  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
  }
}

verifySeeding();