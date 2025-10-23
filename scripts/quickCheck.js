import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function quickCheck() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collections = ['animals', 'users', 'tasks', 'financialrecords'];

    for (const collectionName of collections) {
      const indexes = await db.collection(collectionName).indexes();
      console.log(`${collectionName}: ${indexes.length} indexes`);
      indexes.forEach(index => {
        console.log(`  - ${Object.keys(index.key).join(', ')}`);
      });
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

quickCheck();