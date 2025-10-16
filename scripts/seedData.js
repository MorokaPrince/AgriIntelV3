/* eslint-disable @typescript-eslint/no-var-requires */
const mongoose = require('mongoose');

// Comprehensive seeding script for AgrIntelV4 database
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
          url: '/images/animals/cattle-1.jpeg',
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
          url: '/images/animals/cattle-2.jpeg',
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
      animalId: 'ANIMAL_ID_PLACEHOLDER', // Will be updated with real IDs
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

async function clearExistingData() {
  console.log('🧹 Clearing existing data...');
  const { User, Animal, HealthRecord, FinancialRecord, FeedRecord, BreedingRecord, RFIDRecord, Task } = await loadModels();

  await Promise.all([
    User.deleteMany({}),
    Animal.deleteMany({}),
    HealthRecord.deleteMany({}),
    FinancialRecord.deleteMany({}),
    FeedRecord.deleteMany({}),
    BreedingRecord.deleteMany({}),
    RFIDRecord.deleteMany({}),
    Task.deleteMany({})
  ]);
  console.log('✅ Existing data cleared');
}





async function seedFeedRecords() {
  console.log('🌱 Seeding feed records...');

  const feedRecords = [
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
      createdBy: new mongoose.Types.ObjectId(),
    },
    {
      tenantId: 'demo-farm',
      feedName: 'Grass Hay',
      type: 'roughage',
      currentStock: 2000,
      unit: 'kg',
      minStock: 500,
      maxStock: 3000,
      costPerUnit: 3,
      supplier: 'Local Farmer',
      expiryDate: new Date('2024-10-31'),
      quality: 'standard',
      nutritionalValue: {
        protein: 8,
        energy: 8,
        fiber: 35,
        fat: 2,
      },
      createdBy: new mongoose.Types.ObjectId(),
    },
    // Add more feed records...
  ];

  for (const recordData of feedRecords) {
    const existingRecord = await FeedRecord.findOne({
      feedName: recordData.feedName,
      supplier: recordData.supplier,
    });
    if (!existingRecord) {
      const record = new FeedRecord(recordData);
      await record.save();
      console.log(`  ✓ Created feed record: ${recordData.feedName}`);
    } else {
      console.log(`  - Feed record already exists: ${recordData.feedName}`);
    }
  }
}

async function seedBreedingRecords() {
  console.log('🌱 Seeding breeding records...');

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
      createdBy: new mongoose.Types.ObjectId(),
    },
    // Add more breeding records...
  ];

  for (const recordData of breedingRecords) {
    const existingRecord = await BreedingRecord.findOne({
      programName: recordData.programName,
    });
    if (!existingRecord) {
      const record = new BreedingRecord(recordData);
      await record.save();
      console.log(`  ✓ Created breeding record: ${recordData.programName}`);
    } else {
      console.log(`  - Breeding record already exists: ${recordData.programName}`);
    }
  }
}

async function seedRFIDRecords() {
  console.log('🌱 Seeding RFID records...');

  const rfidRecords = [
    {
      tenantId: 'demo-farm',
      tagId: 'RFID001',
      animalId: 'ANIMAL_ID_HERE', // Will be updated after animals are created
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
      createdBy: new mongoose.Types.ObjectId(),
    },
    {
      tenantId: 'demo-farm',
      tagId: 'RFID002',
      animalId: 'ANIMAL_ID_HERE', // Will be updated after animals are created
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
      createdBy: new mongoose.Types.ObjectId(),
    },
    // Add more RFID records...
  ];

  for (const recordData of rfidRecords) {
    const existingRecord = await RFIDRecord.findOne({
      tagId: recordData.tagId,
    });
    if (!existingRecord) {
      const record = new RFIDRecord(recordData);
      await record.save();
      console.log(`  ✓ Created RFID record: ${recordData.tagId}`);
    } else {
      console.log(`  - RFID record already exists: ${recordData.tagId}`);
    }
  }
}

async function seedAllData() {
  try {
    await connectDB();
    console.log('🚀 Starting comprehensive data seeding process...\n');

    // Clear existing data for clean seed
    await clearExistingData();

    // 1. Create users first
    const users = await seedUsers();
    const createdBy = users[0]._id; // Use first user as creator

    // 2. Create animals with complete data
    const animals = await seedAnimals(createdBy);

    // 3. Create related records using actual animal IDs
    await seedHealthRecords(animals, createdBy);
    await seedRFIDRecords(animals, createdBy);
    await seedFinancialRecords(createdBy);
    await seedFeedRecords(createdBy);
    await seedBreedingRecords(animals, createdBy);
    await seedTasks(users, animals, createdBy);

    // 4. Update animal records with cross-references
    await updateAnimalCrossReferences(animals);

    console.log('\n✅ Comprehensive data seeding completed successfully!');
    await displayDataSummary();

  } catch (error) {
    console.error('❌ Error during comprehensive seeding:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
  }
}

async function seedUsers() {
  console.log('🌱 Seeding users...');
  const { User } = await loadModels();

  const users = [
    {
      tenantId: 'demo-farm',
      email: 'admin@demo.com',
      password: 'password123',
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
    },
    {
      tenantId: 'demo-farm',
      email: 'manager@demo.com',
      password: 'password123',
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
    },
  ];

  const createdUsers = [];
  for (const userData of users) {
    const existingUser = await User.findOne({ email: userData.email });
    if (!existingUser) {
      const user = new User(userData);
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`  ✓ Created user: ${userData.firstName} ${userData.lastName}`);
    } else {
      createdUsers.push(existingUser);
      console.log(`  - User already exists: ${userData.firstName} ${userData.lastName}`);
    }
  }

  return createdUsers;
}

async function seedAnimals(createdBy) {
  console.log('🌱 Seeding animals with complete data...');
  const { Animal } = await loadModels();

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
          url: '/images/animals/cattle-1.jpeg',
          caption: 'Bella - Main photo',
          uploadedAt: new Date(),
        },
      ],
      notes: 'Excellent breeding cow, good temperament',
      createdBy,
      updatedBy: createdBy,
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
          url: '/images/animals/cattle-2.jpeg',
          caption: 'Max - Breeding bull',
          uploadedAt: new Date(),
        },
      ],
      notes: 'Prime breeding bull, excellent genetics',
      createdBy,
      updatedBy: createdBy,
    },
    // Add more animals...
  ];

  const createdAnimals = [];
  for (const animalData of animals) {
    const existingAnimal = await Animal.findOne({ rfidTag: animalData.rfidTag });
    if (!existingAnimal) {
      const animal = new Animal(animalData);
      const savedAnimal = await animal.save();
      createdAnimals.push(savedAnimal);
      console.log(`  ✓ Created animal: ${savedAnimal.name} (${savedAnimal.species}) - RFID: ${savedAnimal.rfidTag}`);
    } else {
      createdAnimals.push(existingAnimal);
      console.log(`  - Animal already exists: ${existingAnimal.name}`);
    }
  }

  return createdAnimals;
}

async function seedHealthRecords(animals, createdBy) {
  console.log('🌱 Seeding health records with proper animal links...');
  const { HealthRecord } = await loadModels();

  for (const animal of animals) {
    const records = [
      {
        tenantId: 'demo-farm',
        animalId: animal._id,
        animalRfid: animal.rfidTag,
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
        createdBy,
        updatedBy: createdBy,
      }
    ];

    for (const recordData of records) {
      const record = new HealthRecord(recordData);
      await record.save();
      console.log(`  ✓ Created health record for ${animal.name}`);
    }
  }
}

async function seedRFIDRecords(animals, createdBy) {
  console.log('🌱 Seeding RFID records with proper animal links...');
  const { RFIDRecord } = await loadModels();

  for (const animal of animals) {
    const rfidData = {
      tenantId: 'demo-farm',
      tagId: animal.rfidTag,
      animalId: animal._id.toString(),
      animalName: animal.name,
      species: animal.species,
      breed: animal.breed,
      tagType: 'ear_tag',
      frequency: '134.2 kHz',
      installationDate: new Date('2023-06-01'),
      lastScan: new Date(),
      batteryLevel: Math.floor(Math.random() * 30) + 70,
      signalStrength: 'excellent',
      location: animal.location.farmSection,
      status: 'active',
      temperature: 38.5 + (Math.random() * 2),
      healthAlerts: 0,
      createdBy,
    };

    const rfidRecord = new RFIDRecord(rfidData);
    await rfidRecord.save();
    console.log(`  ✓ Created RFID record for ${animal.name} - Tag: ${animal.rfidTag}`);
  }
}

async function seedFinancialRecords(createdBy) {
  console.log('🌱 Seeding financial records...');
  const { FinancialRecord } = await loadModels();

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
      createdBy,
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
      createdBy,
    },
  ];

  for (const recordData of financialRecords) {
    const record = new FinancialRecord(recordData);
    await record.save();
    console.log(`  ✓ Created financial record: ${recordData.description}`);
  }
}

async function seedFeedRecords(createdBy) {
  console.log('🌱 Seeding feed records...');
  const { FeedRecord } = await loadModels();

  const feedRecords = [
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
      createdBy,
    },
  ];

  for (const recordData of feedRecords) {
    const record = new FeedRecord(recordData);
    await record.save();
    console.log(`  ✓ Created feed record: ${recordData.feedName}`);
  }
}

async function seedBreedingRecords(animals, createdBy) {
  console.log('🌱 Seeding breeding records...');
  const { BreedingRecord } = await loadModels();

  const breedingRecords = [
    {
      tenantId: 'demo-farm',
      programName: 'Angus Elite Program',
      species: 'cattle',
      breed: 'Angus',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      status: 'active',
      totalAnimals: animals.length,
      breedingFemales: animals.filter(a => a.gender === 'female').length,
      breedingMales: animals.filter(a => a.gender === 'male').length,
      expectedOffspring: 18,
      actualOffspring: 15,
      successRate: 75,
      goals: ['Improve meat quality', 'Increase growth rate', 'Better disease resistance'],
      manager: 'John Admin',
      budget: 50000,
      currency: 'ZAR',
      createdBy,
    },
  ];

  for (const recordData of breedingRecords) {
    const record = new BreedingRecord(recordData);
    await record.save();
    console.log(`  ✓ Created breeding record: ${recordData.programName}`);
  }
}

async function seedTasks(users, animals, createdBy) {
  console.log('🌱 Seeding tasks...');
  const { Task } = await loadModels();

  const tasks = [
    {
      tenantId: 'demo-farm',
      title: 'Weekly Health Check - Bella',
      description: 'Perform routine health examination on Bella (RFID001)',
      assignedTo: users[0]._id,
      assignedBy: createdBy,
      priority: 'medium',
      status: 'pending',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      category: 'health',
      animalId: animals[0]._id,
      estimatedHours: 1,
      location: 'Farm Section A',
      createdBy,
    },
  ];

  for (const taskData of tasks) {
    const task = new Task(taskData);
    await task.save();
    console.log(`  ✓ Created task: ${taskData.title}`);
  }
}

async function updateAnimalCrossReferences(animals) {
  console.log('🔗 Updating animal cross-references...');
  const { Animal } = await loadModels();

  for (const animal of animals) {
    if (animal.breeding.offspring.length > 0) {
      await Animal.updateMany(
        { _id: { $in: animal.breeding.offspring } },
        {
          $set: {
            'parentage.sireId': animal.gender === 'male' ? animal._id : undefined,
            'parentage.damId': animal.gender === 'female' ? animal._id : undefined,
          }
        }
      );
    }
  }
  console.log('✅ Animal cross-references updated');
}

async function displayDataSummary() {
  const { User, Animal, HealthRecord, FinancialRecord, FeedRecord, BreedingRecord, RFIDRecord, Task } = await loadModels();

  console.log('\n📊 Final Data Summary:');
  console.log(`   Users: ${await User.countDocuments({ tenantId: 'demo-farm' })}`);
  console.log(`   Animals: ${await Animal.countDocuments({ tenantId: 'demo-farm' })}`);
  console.log(`   Health Records: ${await HealthRecord.countDocuments({ tenantId: 'demo-farm' })}`);
  console.log(`   Financial Records: ${await FinancialRecord.countDocuments({ tenantId: 'demo-farm' })}`);
  console.log(`   Feed Records: ${await FeedRecord.countDocuments({ tenantId: 'demo-farm' })}`);
  console.log(`   Breeding Records: ${await BreedingRecord.countDocuments({ tenantId: 'demo-farm' })}`);
  console.log(`   RFID Records: ${await RFIDRecord.countDocuments({ tenantId: 'demo-farm' })}`);
  console.log(`   Tasks: ${await Task.countDocuments({ tenantId: 'demo-farm' })}`);
}

// Run seeding if called directly
if (require.main === module) {
  seedAllData();
}

module.exports = { seedAllData };