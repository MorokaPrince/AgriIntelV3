const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('🔍 Testing database connection...');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
  console.log('DB_NAME:', process.env.DB_NAME || 'Not set');

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is missing!');
    console.log('Please set MONGODB_URI in .env.local file');
    console.log('Example: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/');
    return;
  }

  try {
    console.log('🔌 Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    });

    console.log('✅ Successfully connected to MongoDB!');
    console.log('📊 Database name:', mongoose.connection.name);
    console.log('🔗 Connection state:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');

    // Test basic operations
    console.log('\n🔍 Testing basic database operations...');

    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Available collections:', collections.map(c => c.name));

    // Test model imports
    console.log('\n📝 Testing model imports...');
    try {
      const User = require('./src/models/User.ts');
      console.log('✅ User model imported successfully');
    } catch (error) {
      console.error('❌ Error importing User model:', error.message);
    }

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testConnection().catch(console.error);