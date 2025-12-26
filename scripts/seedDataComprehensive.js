import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// MongoDB connection
async function connectDB() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://agriintel:XYEXSyQkSiAhgWg7@cluster0.yvkuood.mongodb.net/AgriIntelV3?retryWrites=true&w=majority&appName=AgriIntelV3';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas - AgriIntelV3');
    return mongoose.connection.db;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Clear existing data
async function clearDatabase(db) {
  console.log('\n🗑️  Clearing existing data...');
  const collections = ['users', 'animals', 'healthrecords', 'financialrecords', 'feedrecords', 'breedingrecords', 'rfidrecords', 'tasks', 'weatherdatas', 'notifications'];
  
  for (const collection of collections) {
    try {
      await db.collection(collection).deleteMany({});
      console.log(`  ✓ Cleared ${collection}`);
    } catch (error) {
      console.log(`  ⚠️  Collection ${collection} not found or already empty`);
    }
  }
}

// Seed users
async function seedUsers(db) {
  console.log('\n👥 Seeding users...');
  
  const trialStartDate = new Date();
  const trialEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const users = [
    {
      tenantId: 'demo-farm',
      email: 'demo@agriintel.co.za',
      password: '$2b$12$GawOWgDK/SUvDOzjoDveVebrntuesV.yktAet02EsTmNAq8aF.BLK', // Demo123!
      firstName: 'Demo',
      lastName: 'User',
      phone: '+27 11 123 4567',
      role: 'viewer',
      tier: 'beta',
      trialStartDate: trialStartDate,
      trialEndDate: trialEndDate,
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
        notifications: { email: true, sms: false, push: true },
      },
      permissions: ['animals:read', 'health:read'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      tenantId: 'demo-farm',
      email: 'pro@agriintel.co.za',
      password: '$2b$12$n6DefdVIZb35hcsDZBT6PODVbm863AVTldshKXDquqER5JBzmlQ3.', // Pro123!
      firstName: 'Pro',
      lastName: 'User',
      phone: '+27 11 234 5678',
      role: 'manager',
      tier: 'professional',
      trialStartDate: trialStartDate,
      trialEndDate: trialEndDate,
      country: 'ZA',
      region: 'Gauteng',
      farmName: 'Professional Farm',
      farmSize: 500,
      livestockTypes: ['cattle', 'sheep'],
      isActive: true,
      preferences: {
        language: 'en',
        currency: 'ZAR',
        timezone: 'Africa/Johannesburg',
        theme: 'light',
        notifications: { email: true, sms: true, push: true },
      },
      permissions: ['animals:read', 'animals:write', 'health:read', 'health:write'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      tenantId: 'demo-farm',
      email: 'admin@agriintel.co.za',
      password: '$2b$12$BpHSD3uzJJPT0hes7w4QhutDudF6Mkh0ac3f0MCJBrLezTkr5C7gm', // Admin123!
      firstName: 'Admin',
      lastName: 'User',
      phone: '+27 11 345 6789',
      role: 'admin',
      tier: 'enterprise',
      trialStartDate: trialStartDate,
      trialEndDate: trialEndDate,
      country: 'ZA',
      region: 'Gauteng',
      farmName: 'Enterprise Farm',
      farmSize: 1000,
      livestockTypes: ['cattle', 'sheep', 'goats', 'pigs'],
      isActive: true,
      preferences: {
        language: 'en',
        currency: 'ZAR',
        timezone: 'Africa/Johannesburg',
        theme: 'auto',
        notifications: { email: true, sms: true, push: true },
      },
      permissions: ['all'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const result = await db.collection('users').insertMany(users);
  console.log(`  ✓ Created ${result.insertedCount} users`);
  return result.insertedIds;
}

// Seed animals (48 records)
async function seedAnimals(db, userIds) {
  console.log('\n🐄 Seeding animals (48 records)...');
  
  const species = ['cattle', 'sheep', 'goats', 'poultry', 'pigs'];
  const breeds = {
    cattle: ['Angus', 'Hereford', 'Brahman', 'Simmental'],
    sheep: ['Merino', 'Dorper', 'Rambouillet', 'Suffolk'],
    goats: ['Boer', 'Saanen', 'Alpine', 'Nubian'],
    poultry: ['Leghorn', 'Rhode Island Red', 'Wyandotte', 'Orpington'],
    pigs: ['Duroc', 'Hampshire', 'Yorkshire', 'Berkshire'],
  };
  const colors = ['Black', 'White', 'Brown', 'Red', 'Spotted', 'Cream', 'Gray'];
  
  const animals = [];
  for (let i = 1; i <= 48; i++) {
    const speciesType = species[Math.floor(Math.random() * species.length)];
    const breed = breeds[speciesType][Math.floor(Math.random() * breeds[speciesType].length)];
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - Math.floor(Math.random() * 5) - 1);
    
    animals.push({
      tenantId: 'demo-farm',
      rfidTag: `RFID-${String(i).padStart(5, '0')}`,
      name: `${speciesType.charAt(0).toUpperCase()}${speciesType.slice(1)} #${i}`,
      species: speciesType,
      breed: breed,
      dateOfBirth: dob,
      gender: Math.random() > 0.5 ? 'male' : 'female',
      color: colors[Math.floor(Math.random() * colors.length)],
      weight: Math.floor(Math.random() * 500) + 100,
      height: Math.floor(Math.random() * 200) + 100,
      status: 'active',
      location: {
        latitude: -26.2041 + (Math.random() - 0.5) * 0.1,
        longitude: 28.0473 + (Math.random() - 0.5) * 0.1,
        address: 'Demo Farm, Johannesburg',
        farmSection: `Section ${Math.floor(Math.random() * 5) + 1}`,
      },
      parentage: {},
      health: {
        overallCondition: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)],
        lastCheckup: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        nextCheckup: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
        vaccinations: [],
        diseases: [],
      },
      breeding: {
        isBreedingStock: Math.random() > 0.6,
        fertilityStatus: 'fertile',
        offspring: [],
      },
      nutrition: {
        dailyFeedIntake: Math.floor(Math.random() * 20) + 5,
        feedType: 'Mixed grain and hay',
        supplements: ['Mineral block', 'Vitamin supplement'],
        feedingSchedule: 'Twice daily',
      },
      productivity: {
        milkProduction: speciesType === 'cattle' ? Math.floor(Math.random() * 30) + 10 : undefined,
        eggProduction: speciesType === 'poultry' ? Math.floor(Math.random() * 300) + 200 : undefined,
        weightGain: Math.floor(Math.random() * 50) + 10,
        lastMeasurement: new Date(),
      },
      images: [],
      notes: `Demo animal #${i}`,
      alerts: [],
      createdBy: userIds[2], // admin user
      updatedBy: userIds[2],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  const result = await db.collection('animals').insertMany(animals);
  console.log(`  ✓ Created ${result.insertedCount} animals`);
  return result.insertedIds;
}

// Seed health records (48 records, linked to animals)
async function seedHealthRecords(db, animalIds, userIds) {
  console.log('\n🏥 Seeding health records (48 records)...');
  
  const recordTypes = ['checkup', 'vaccination', 'treatment', 'surgery', 'emergency', 'quarantine'];
  const diagnoses = ['Healthy', 'Minor infection', 'Respiratory issue', 'Digestive problem', 'Skin condition'];
  
  const healthRecords = [];
  const animalIdsArray = Object.values(animalIds);
  
  for (let i = 0; i < 48; i++) {
    const animalId = animalIdsArray[i % animalIdsArray.length];
    const recordType = recordTypes[Math.floor(Math.random() * recordTypes.length)];
    
    healthRecords.push({
      tenantId: 'demo-farm',
      animalId: animalId,
      animalRfid: `RFID-${String((i % 48) + 1).padStart(5, '0')}`,
      recordType: recordType,
      date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      veterinarian: `Dr. Vet ${Math.floor(Math.random() * 3) + 1}`,
      veterinarianId: userIds[Math.floor(Math.random() * userIds.length)],
      diagnosis: diagnoses[Math.floor(Math.random() * diagnoses.length)],
      symptoms: ['Lethargy', 'Loss of appetite', 'Fever'].slice(0, Math.floor(Math.random() * 3) + 1),
      treatment: 'Standard treatment protocol',
      medications: [],
      vaccinations: recordType === 'vaccination' ? [{
        vaccine: 'Multi-vaccine',
        batchNumber: `BATCH-${Math.random().toString(36).substr(2, 9)}`,
        manufacturer: 'Vaccine Corp',
        nextDueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        notes: 'Annual vaccination',
      }] : [],
      tests: [],
      followUp: { required: Math.random() > 0.7, date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
      cost: Math.floor(Math.random() * 500) + 100,
      currency: 'ZAR',
      notes: `Health record #${i + 1}`,
      createdBy: userIds[2],
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    });
  }

  const result = await db.collection('healthrecords').insertMany(healthRecords);
  console.log(`  ✓ Created ${result.insertedCount} health records`);
  return result.insertedIds;
}

// Seed financial records (48 records)
async function seedFinancialRecords(db, userIds) {
  console.log('\n💰 Seeding financial records (48 records)...');

  const recordTypes = ['income', 'expense', 'transfer', 'loan', 'investment'];
  const categories = {
    income: ['Milk sales', 'Meat sales', 'Breeding stock sales', 'Subsidies'],
    expense: ['Feed', 'Veterinary', 'Equipment', 'Labor', 'Utilities', 'Maintenance'],
  };

  const financialRecords = [];
  for (let i = 0; i < 48; i++) {
    const recordType = recordTypes[Math.floor(Math.random() * recordTypes.length)];
    const categoryList = categories[recordType] || ['General'];
    const category = categoryList[Math.floor(Math.random() * categoryList.length)];

    financialRecords.push({
      tenantId: 'demo-farm',
      recordType: recordType,
      category: category,
      subcategory: 'General',
      amount: Math.floor(Math.random() * 10000) + 500,
      currency: 'ZAR',
      exchangeRate: 18.5,
      date: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
      description: `${recordType} - ${category} #${i + 1}`,
      reference: `REF-${String(i + 1).padStart(6, '0')}`,
      paymentMethod: ['cash', 'bank_transfer', 'mobile_money'][Math.floor(Math.random() * 3)],
      paymentDetails: {},
      approvedBy: userIds[2],
      status: 'approved',
      notes: `Financial record #${i + 1}`,
      createdBy: userIds[Math.floor(Math.random() * userIds.length)],
      createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    });
  }

  const result = await db.collection('financialrecords').insertMany(financialRecords);
  console.log(`  ✓ Created ${result.insertedCount} financial records`);
}

// Seed feeding records (48 records)
async function seedFeedingRecords(db, userIds) {
  console.log('\n🌾 Seeding feeding records (48 records)...');

  const feedTypes = ['concentrate', 'roughage', 'supplement', 'silage'];
  const feedNames = ['Maize meal', 'Hay', 'Lucerne', 'Barley', 'Oats', 'Mineral mix', 'Protein supplement'];

  const feedingRecords = [];
  for (let i = 0; i < 48; i++) {
    const feedType = feedTypes[Math.floor(Math.random() * feedTypes.length)];
    const feedName = feedNames[Math.floor(Math.random() * feedNames.length)];

    feedingRecords.push({
      tenantId: 'demo-farm',
      feedName: feedName,
      type: feedType,
      currentStock: Math.floor(Math.random() * 5000) + 500,
      unit: 'kg',
      minStock: 500,
      maxStock: 5000,
      costPerUnit: Math.floor(Math.random() * 50) + 10,
      supplier: `Supplier ${Math.floor(Math.random() * 5) + 1}`,
      expiryDate: new Date(Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000),
      quality: ['premium', 'standard', 'basic'][Math.floor(Math.random() * 3)],
      nutritionalValue: {
        protein: Math.floor(Math.random() * 20) + 5,
        energy: Math.floor(Math.random() * 3000) + 1000,
        fiber: Math.floor(Math.random() * 30) + 5,
        fat: Math.floor(Math.random() * 10) + 2,
      },
      notes: `Feed record #${i + 1}`,
      createdBy: userIds[Math.floor(Math.random() * userIds.length)],
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    });
  }

  const result = await db.collection('feedrecords').insertMany(feedingRecords);
  console.log(`  ✓ Created ${result.insertedCount} feeding records`);
}

// Seed breeding records (48 records)
async function seedBreedingRecords(db, userIds) {
  console.log('\n👶 Seeding breeding records (48 records)...');

  const species = ['cattle', 'sheep', 'goats', 'pigs'];
  const breeds = {
    cattle: ['Angus', 'Hereford', 'Brahman'],
    sheep: ['Merino', 'Dorper'],
    goats: ['Boer', 'Saanen'],
    pigs: ['Duroc', 'Hampshire'],
  };

  const breedingRecords = [];
  for (let i = 0; i < 48; i++) {
    const speciesType = species[Math.floor(Math.random() * species.length)];
    const breed = breeds[speciesType][Math.floor(Math.random() * breeds[speciesType].length)];
    const startDate = new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000);

    breedingRecords.push({
      tenantId: 'demo-farm',
      programName: `${breed} Breeding Program #${i + 1}`,
      species: speciesType,
      breed: breed,
      startDate: startDate,
      endDate: endDate,
      status: ['planning', 'active', 'completed'][Math.floor(Math.random() * 3)],
      totalAnimals: Math.floor(Math.random() * 20) + 5,
      breedingFemales: Math.floor(Math.random() * 15) + 2,
      breedingMales: Math.floor(Math.random() * 5) + 1,
      expectedOffspring: Math.floor(Math.random() * 30) + 5,
      actualOffspring: Math.floor(Math.random() * 25) + 2,
      successRate: Math.floor(Math.random() * 100),
      goals: ['Improve genetics', 'Increase productivity', 'Disease resistance'],
      manager: `Manager ${Math.floor(Math.random() * 3) + 1}`,
      budget: Math.floor(Math.random() * 50000) + 10000,
      currency: 'ZAR',
      notes: `Breeding record #${i + 1}`,
      createdBy: userIds[2],
      createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    });
  }

  const result = await db.collection('breedingrecords').insertMany(breedingRecords);
  console.log(`  ✓ Created ${result.insertedCount} breeding records`);
}

// Seed RFID records (48 records, linked to animals)
async function seedRFIDRecords(db, animalIds, userIds) {
  console.log('\n📡 Seeding RFID records (48 records)...');

  const rfidRecords = [];
  const animalIdsArray = Object.values(animalIds);

  for (let i = 0; i < 48; i++) {
    const animalId = animalIdsArray[i % animalIdsArray.length];

    rfidRecords.push({
      tenantId: 'demo-farm',
      tagId: `RFID-${String(i).padStart(5, '0')}`,
      animalId: animalId,
      animalName: `Animal #${i + 1}`,
      species: ['cattle', 'sheep', 'goats'][Math.floor(Math.random() * 3)],
      breed: 'Mixed',
      tagType: ['ear_tag', 'bolus', 'collar', 'leg_band'][Math.floor(Math.random() * 4)],
      frequency: '134.2 kHz',
      installationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      lastScan: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      batteryLevel: Math.floor(Math.random() * 100),
      signalStrength: ['excellent', 'good', 'fair', 'poor'][Math.floor(Math.random() * 4)],
      location: `Section ${Math.floor(Math.random() * 5) + 1}`,
      status: ['active', 'maintenance', 'offline'][Math.floor(Math.random() * 3)],
      temperature: Math.floor(Math.random() * 10) + 35,
      healthAlerts: Math.floor(Math.random() * 5),
      notes: `RFID record #${i + 1}`,
      createdBy: userIds[2],
      createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    });
  }

  const result = await db.collection('rfidrecords').insertMany(rfidRecords);
  console.log(`  ✓ Created ${result.insertedCount} RFID records`);
}

// Seed tasks (48 records, linked to users)
async function seedTasks(db, userIds) {
  console.log('\n✅ Seeding tasks (48 records)...');

  const categories = ['feeding', 'health', 'maintenance', 'breeding', 'financial', 'general'];
  const priorities = ['low', 'medium', 'high', 'critical'];
  const statuses = ['pending', 'in_progress', 'completed', 'cancelled'];

  const tasks = [];
  for (let i = 0; i < 48; i++) {
    const dueDate = new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000);
    const category = categories[Math.floor(Math.random() * categories.length)];

    tasks.push({
      tenantId: 'demo-farm',
      title: `${category.charAt(0).toUpperCase() + category.slice(1)} Task #${i + 1}`,
      description: `This is a demo ${category} task for testing purposes`,
      assignedTo: userIds[Math.floor(Math.random() * userIds.length)],
      assignedBy: userIds[2], // admin
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      dueDate: dueDate,
      completedDate: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
      category: category,
      tags: [category, 'demo'],
      estimatedHours: Math.floor(Math.random() * 8) + 1,
      actualHours: Math.floor(Math.random() * 10),
      progress: Math.floor(Math.random() * 100),
      dependencies: [],
      attachments: [],
      notes: `Task #${i + 1}`,
      location: `Section ${Math.floor(Math.random() * 5) + 1}`,
      kpi: {
        efficiency: Math.floor(Math.random() * 100),
        quality: Math.floor(Math.random() * 100),
        timeliness: Math.floor(Math.random() * 100),
        safety: Math.floor(Math.random() * 100),
      },
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    });
  }

  const result = await db.collection('tasks').insertMany(tasks);
  console.log(`  ✓ Created ${result.insertedCount} tasks`);
}

// Seed notifications (48 records, linked to users)
async function seedNotifications(db, userIds) {
  console.log('\n🔔 Seeding notifications (48 records)...');

  const types = ['vaccination', 'task_deadline', 'health_alert', 'breeding_cycle', 'feed_inventory', 'general'];
  const priorities = ['low', 'medium', 'high', 'critical'];

  const notifications = [];
  for (let i = 0; i < 48; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const userId = userIds[Math.floor(Math.random() * userIds.length)];

    let title = '';
    let message = '';

    switch(type) {
      case 'vaccination':
        title = `Vaccination Due`;
        message = `Animal #${Math.floor(Math.random() * 48) + 1} is due for vaccination`;
        break;
      case 'task_deadline':
        title = `Task Deadline Approaching`;
        message = `Task #${Math.floor(Math.random() * 48) + 1} is due soon`;
        break;
      case 'health_alert':
        title = `Health Alert`;
        message = `Animal #${Math.floor(Math.random() * 48) + 1} requires medical attention`;
        break;
      case 'breeding_cycle':
        title = `Breeding Cycle Alert`;
        message = `Animal #${Math.floor(Math.random() * 48) + 1} is in breeding cycle`;
        break;
      case 'feed_inventory':
        title = `Low Feed Inventory`;
        message = `Feed stock is running low, please reorder`;
        break;
      default:
        title = `General Notification`;
        message = `This is a general notification #${i + 1}`;
    }

    notifications.push({
      tenantId: 'demo-farm',
      userId: userId,
      type: type,
      title: title,
      message: message,
      relatedEntityType: ['animal', 'task', 'health_record'][Math.floor(Math.random() * 3)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      isRead: Math.random() > 0.5,
      readAt: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
      actionUrl: '/dashboard',
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    });
  }

  const result = await db.collection('notifications').insertMany(notifications);
  console.log(`  ✓ Created ${result.insertedCount} notifications`);
}

async function seedDatabase() {
  try {
    const db = await connectDB();
    console.log('🚀 Starting comprehensive data seeding...\n');

    await clearDatabase(db);
    const userIds = await seedUsers(db);
    const animalIds = await seedAnimals(db, userIds);
    await seedHealthRecords(db, animalIds, userIds);
    await seedFinancialRecords(db, userIds);
    await seedFeedingRecords(db, userIds);
    await seedBreedingRecords(db, userIds);
    await seedRFIDRecords(db, animalIds, userIds);
    await seedTasks(db, userIds);
    await seedNotifications(db, userIds);

    console.log('\n✅ SEEDING COMPLETED SUCCESSFULLY!');
    console.log('📊 Database is now populated with demo data');
    console.log('\n📈 Summary:');
    console.log('  ✓ 3 Users');
    console.log('  ✓ 48 Animals');
    console.log('  ✓ 48 Health Records');
    console.log('  ✓ 48 Financial Records');
    console.log('  ✓ 48 Feeding Records');
    console.log('  ✓ 48 Breeding Records');
    console.log('  ✓ 48 RFID Records');
    console.log('  ✓ 48 Tasks');
    console.log('  ✓ 48 Notifications');

    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

