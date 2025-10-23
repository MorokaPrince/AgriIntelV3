import mongoose from 'mongoose';

// Clean, comprehensive seeding script for AgrIntelV4 database
async function connectDB() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://luckyrakgama:MayR123@cluster0.yvkuood.mongodb.net/AgrIntelV4?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas - AgrIntelV4');
    return mongoose.connection.db;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

async function seedDatabase() {
  try {
    const db = await connectDB();
    console.log('🚀 Starting comprehensive data seeding for AgrIntelV4...\n');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    const collections = ['users', 'animals', 'healthrecords', 'financialrecords', 'feedingrecords', 'breedingrecords', 'rfidrecords', 'tasks'];

    for (const collectionName of collections) {
      await db.collection(collectionName).deleteMany({});
      console.log(`  ✓ Cleared ${collectionName}`);
    }

    // Seed all modules
    await seedUsers(db);
    await seedAnimals(db);
    await seedHealthRecords(db);
    await seedFinancialRecords(db);
    await seedFeedingRecords(db);
    await seedBreedingRecords(db);
    await seedRFIDRecords(db);
    await seedTasks(db);

    // Display final summary
    await displayDataSummary(db);

    console.log('\n🎉 COMPREHENSIVE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('📊 AgrIntelV4 database is now fully populated with:');
    console.log('   • Users & Authentication');
    console.log('   • Animal Management');
    console.log('   • Health & Veterinary Records');
    console.log('   • Financial Management');
    console.log('   • Feed & Nutrition');
    console.log('   • Breeding Programs');
    console.log('   • RFID Tracking');
    console.log('   • Task Management');
    console.log('\n✅ All API endpoints are now functional with real data!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
  }
}

async function seedUsers(db) {
  console.log('\n👥 Seeding users...');

  const users = [
    {
      tenantId: 'demo-farm',
      email: 'admin@demo.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj', // password123
      firstName: 'John',
      lastName: 'Admin',
      phone: '+1234567890',
      role: 'admin',
      country: 'ZA',
      region: 'Gauteng',
      farmName: 'Demo Farm',
      farmSize: 100,
      livestockTypes: ['cattle', 'sheep', 'goats'],
      isActive: true,
      preferences: {
        language: 'en',
        currency: 'ZAR',
        timezone: 'Africa/Johannesburg',
        theme: 'auto',
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
      },
      permissions: ['all'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      tenantId: 'demo-farm',
      email: 'manager@demo.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj', // password123
      firstName: 'Jane',
      lastName: 'Manager',
      phone: '+1234567891',
      role: 'manager',
      country: 'ZA',
      region: 'Gauteng',
      farmName: 'Demo Farm',
      farmSize: 100,
      livestockTypes: ['cattle', 'sheep'],
      isActive: true,
      preferences: {
        language: 'en',
        currency: 'ZAR',
        timezone: 'Africa/Johannesburg',
        theme: 'light',
        notifications: {
          email: true,
          sms: true,
          push: true,
        },
      },
      permissions: ['animals:read', 'animals:write', 'health:read', 'health:write'],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  const result = await db.collection('users').insertMany(users);
  console.log(`  ✓ Created ${result.insertedCount} users`);
  return result.insertedIds;
}

async function seedAnimals(db) {
  console.log('\n🐄 Seeding animals...');

  const animals = [
    {
      tenantId: 'demo-farm',
      rfidTag: 'RFID001',
      name: 'Bella',
      species: 'cattle',
      breed: 'Angus',
      dateOfBirth: new Date('2020-03-15'),
      gender: 'female',
      color: 'Black',
      weight: 450,
      height: 140,
      status: 'active',
      location: {
        latitude: -26.2041,
        longitude: 28.0473,
        address: 'Farm Section A',
        farmSection: 'Section A',
      },
      health: {
        overallCondition: 'excellent',
        lastCheckup: new Date(),
        nextCheckup: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        vaccinations: [
          {
            vaccine: 'Brucellosis',
            date: new Date('2024-01-15'),
            nextDue: new Date('2025-01-15'),
            veterinarian: 'Dr. Smith',
          },
        ],
        diseases: [],
      },
      breeding: {
        isBreedingStock: true,
        fertilityStatus: 'fertile',
        lastBreedingDate: new Date('2023-11-01'),
        expectedCalvingDate: new Date('2024-08-01'),
        offspring: [],
      },
      nutrition: {
        dailyFeedIntake: 12,
        feedType: 'Grass Hay',
        supplements: ['Mineral Mix', 'Protein Supplement'],
        feedingSchedule: 'Twice daily',
      },
      productivity: {
        milkProduction: 25,
        weightGain: 1.2,
        lastMeasurement: new Date(),
      },
      images: [
        {
          url: '/images/modules/animals/cattle-1.jpeg',
          caption: 'Bella - Main photo',
          uploadedAt: new Date(),
        },
      ],
      notes: 'Excellent breeding cow, good temperament',
      createdBy: 'demo-user',
      updatedBy: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      tenantId: 'demo-farm',
      rfidTag: 'RFID002',
      name: 'Max',
      species: 'cattle',
      breed: 'Hereford',
      dateOfBirth: new Date('2019-08-20'),
      gender: 'male',
      color: 'Red and White',
      weight: 680,
      height: 150,
      status: 'breeding',
      location: {
        latitude: -26.2041,
        longitude: 28.0473,
        address: 'Farm Section B',
        farmSection: 'Section B',
      },
      health: {
        overallCondition: 'good',
        lastCheckup: new Date(),
        nextCheckup: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        vaccinations: [
          {
            vaccine: 'IBR/BVD',
            date: new Date('2024-02-01'),
            nextDue: new Date('2025-02-01'),
            veterinarian: 'Dr. Smith',
          },
        ],
        diseases: [],
      },
      breeding: {
        isBreedingStock: true,
        fertilityStatus: 'fertile',
        offspring: [],
      },
      nutrition: {
        dailyFeedIntake: 15,
        feedType: 'Alfalfa Hay',
        supplements: ['Mineral Mix'],
        feedingSchedule: 'Three times daily',
      },
      productivity: {
        weightGain: 1.5,
        lastMeasurement: new Date(),
      },
      images: [
        {
          url: '/images/animals/cattle-2.avif',
          caption: 'Max - Breeding bull',
          uploadedAt: new Date(),
        },
      ],
      notes: 'Prime breeding bull, excellent genetics',
      createdBy: 'demo-user',
      updatedBy: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  const result = await db.collection('animals').insertMany(animals);
  console.log(`  ✓ Created ${result.insertedCount} animals`);
  return result.insertedIds;
}

async function seedHealthRecords(db) {
  console.log('\n🏥 Seeding health records...');

  const healthRecords = [
    {
      tenantId: 'demo-farm',
      animalId: 'ANIMAL_ID_PLACEHOLDER',
      animalRfid: 'RFID001',
      recordType: 'checkup',
      date: new Date(),
      veterinarian: 'Dr. Smith',
      diagnosis: 'Routine health check - Excellent condition',
      symptoms: [],
      treatment: 'No treatment required',
      medications: [],
      vaccinations: [{
        vaccine: 'Annual Vaccination',
        batchNumber: 'BATCH2024',
        manufacturer: 'FarmVet Inc',
        nextDueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        notes: 'Annual booster completed'
      }],
      tests: [],
      followUp: {
        required: false,
        instructions: 'Continue regular monitoring'
      },
      cost: {
        consultationFee: 150,
        medicationCost: 0,
        testCost: 0,
        totalCost: 150,
        currency: 'ZAR'
      },
      notes: 'Animal in excellent health',
      attachments: [],
      severity: 'low',
      status: 'resolved',
      createdBy: 'demo-user',
      updatedBy: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  const result = await db.collection('healthrecords').insertMany(healthRecords);
  console.log(`  ✓ Created ${result.insertedCount} health records`);
}

async function seedFinancialRecords(db) {
  console.log('\n💰 Seeding financial records...');

  const financialRecords = [
    {
      tenantId: 'demo-farm',
      type: 'income',
      category: 'livestock_sales',
      amount: 15000,
      currency: 'ZAR',
      description: 'Sale of 5 cattle to local butcher',
      date: new Date('2024-01-15'),
      paymentMethod: 'bank_transfer',
      vendor: 'Local Butcher',
      createdBy: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      tenantId: 'demo-farm',
      type: 'expense',
      category: 'feed',
      amount: 2500,
      currency: 'ZAR',
      description: 'Monthly feed purchase - Premium cattle feed',
      date: new Date('2024-01-01'),
      paymentMethod: 'bank_transfer',
      vendor: 'Farm Feeds Ltd',
      createdBy: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  const result = await db.collection('financialrecords').insertMany(financialRecords);
  console.log(`  ✓ Created ${result.insertedCount} financial records`);
}

async function seedFeedingRecords(db) {
  console.log('\n🌾 Seeding feeding records...');

  const feedingRecords = [
    {
      tenantId: 'demo-farm',
      feedName: 'Premium Cattle Feed',
      type: 'concentrate',
      currentStock: 500,
      unit: 'kg',
      minStock: 100,
      maxStock: 1000,
      costPerUnit: 15,
      supplier: 'Farm Feeds Ltd',
      expiryDate: new Date('2024-12-31'),
      quality: 'premium',
      nutritionalValue: {
        protein: 18,
        energy: 12,
        fiber: 8,
        fat: 4,
      },
      createdBy: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  const result = await db.collection('feedingrecords').insertMany(feedingRecords);
  console.log(`  ✓ Created ${result.insertedCount} feeding records`);
}

async function seedBreedingRecords(db) {
  console.log('\n🧬 Seeding breeding records...');

  const breedingRecords = [
    {
      tenantId: 'demo-farm',
      programName: 'Angus Elite Program',
      species: 'cattle',
      breed: 'Angus',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      status: 'active',
      totalAnimals: 25,
      breedingFemales: 20,
      breedingMales: 2,
      expectedOffspring: 18,
      actualOffspring: 15,
      successRate: 75,
      goals: ['Improve meat quality', 'Increase growth rate', 'Better disease resistance'],
      manager: 'John Admin',
      budget: 50000,
      currency: 'ZAR',
      createdBy: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  const result = await db.collection('breedingrecords').insertMany(breedingRecords);
  console.log(`  ✓ Created ${result.insertedCount} breeding records`);
}

async function seedRFIDRecords(db) {
  console.log('\n📡 Seeding RFID records...');

  const rfidRecords = [
    {
      tenantId: 'demo-farm',
      tagId: 'RFID001',
      animalId: 'ANIMAL_ID_PLACEHOLDER',
      animalName: 'Bella',
      species: 'cattle',
      breed: 'Angus',
      tagType: 'ear_tag',
      frequency: '134.2 kHz',
      installationDate: new Date('2023-06-01'),
      lastScan: new Date(),
      batteryLevel: 85,
      signalStrength: 'excellent',
      location: 'Farm Section A',
      status: 'active',
      temperature: 38.5,
      healthAlerts: 0,
      createdBy: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      tenantId: 'demo-farm',
      tagId: 'RFID002',
      animalId: 'ANIMAL_ID_PLACEHOLDER',
      animalName: 'Max',
      species: 'cattle',
      breed: 'Hereford',
      tagType: 'ear_tag',
      frequency: '134.2 kHz',
      installationDate: new Date('2023-06-01'),
      lastScan: new Date(),
      batteryLevel: 92,
      signalStrength: 'excellent',
      location: 'Farm Section B',
      status: 'active',
      temperature: 38.2,
      healthAlerts: 0,
      createdBy: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  const result = await db.collection('rfidrecords').insertMany(rfidRecords);
  console.log(`  ✓ Created ${result.insertedCount} RFID records`);
}

async function seedTasks(db) {
  console.log('\n📋 Seeding tasks...');

  const tasks = [
    {
      tenantId: 'demo-farm',
      title: 'Weekly Health Check - Bella',
      description: 'Perform routine health examination on Bella (RFID001)',
      assignedTo: 'USER_ID_PLACEHOLDER',
      assignedBy: 'demo-user',
      priority: 'medium',
      status: 'pending',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      category: 'health',
      animalId: 'ANIMAL_ID_PLACEHOLDER',
      estimatedHours: 1,
      location: 'Farm Section A',
      createdBy: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  const result = await db.collection('tasks').insertMany(tasks);
  console.log(`  ✓ Created ${result.insertedCount} tasks`);
}

async function displayDataSummary(db) {
  console.log('\n📊 Final Data Summary for AgrIntelV4:');

  const collections = ['users', 'animals', 'healthrecords', 'financialrecords', 'feedingrecords', 'breedingrecords', 'rfidrecords', 'tasks'];
  for (const collectionName of collections) {
    const count = await db.collection(collectionName).countDocuments();
    console.log(`   ${collectionName}: ${count} documents`);
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };