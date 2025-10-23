import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function checkDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://luckyrakgama:MayR123@cluster0.yvkuood.mongodb.net/ampd_livestock?retryWrites=true&w=majority&appName=Cluster0';

    console.log('🔍 MongoDB Connection Test');
    console.log('================================');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set (hidden for security)' : 'Not set');
    console.log('DB_NAME:', process.env.DB_NAME || 'Not set');
    console.log('Attempting connection...');

    await mongoose.connect(mongoUri);

    console.log('Connected to MongoDB');
    console.log('Database:', mongoose.connection.db.databaseName);

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n=== Collections ===');
    collections.forEach(coll => {
      console.log(`- ${coll.name}`);
    });

    for (const coll of collections) {
      const count = await mongoose.connection.db.collection(coll.name).countDocuments();
      console.log(`${coll.name}: ${count} documents`);

      if (count > 0 && count < 10) {
        const sample = await mongoose.connection.db.collection(coll.name).find({}).limit(3).toArray();
        console.log(`  Sample data:`, JSON.stringify(sample, null, 2));
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDatabase();