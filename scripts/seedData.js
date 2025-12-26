import mongoose from 'mongoose';

// Comprehensive seeding script for AgrIntelV4 database
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

async function seedDatabase() {
  try {
    const db = await connectDB();
    console.log('🚀 Starting comprehensive data seeding for AgrIntelV4...\n');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    const collections = ['users', 'animals', 'healthrecords', 'financialrecords', 'feedingrecords', 'breedingrecords', 'rfidrecords', 'tasks', 'weatherdatas'];

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
    await seedWeatherDatas(db);

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
      email: 'demo@agriintel.co.za',
      password: '$2b$12$GawOWgDK/SUvDOzjoDveVebrntuesV.yktAet02EsTmNAq8aF.BLK', // Demo123!
      firstName: 'Demo',
      lastName: 'User',
      phone: '+27 11 123 4567',
      role: 'viewer',
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
        notifications: {
          email: true,
          sms: true,
          push: true,
        },
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
        notifications: {
          email: true,
          sms: true,
          push: true,
        },
      },
      permissions: ['all'],
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

  const animals = [];
  const species = ['cattle', 'sheep', 'goats'];
  const speciesCounts = { cattle: 20, sheep: 16, goats: 12 };
  const cattleNames = ['Bella', 'Daisy', 'Luna', 'Molly', 'Ruby', 'Stella', 'Willow', 'Aurora', 'Coco', 'Honey', 'Jasmine', 'Lily', 'Milo', 'Oliver', 'Max', 'Charlie', 'Buddy', 'Rocky', 'Jack', 'Duke'];
  const sheepNames = ['Fluffy', 'Cotton', 'Snowball', 'Marshmallow', 'Cloud', 'Pearl', 'Ivory', 'Blanca', 'Frost', 'Crystal', 'Wooly', 'Fleece', 'Baabaa', 'Lambchop', 'Shep', 'Rambo'];
  const goatNames = ['Billy', 'Nanny', 'Kiko', 'Boer', 'Alpine', 'Saanen', 'Toggenburg', 'Nubian', 'Lamancha', 'Oberhasli', 'Pepper', 'Ginger'];

  let globalIndex = 1;

  for (const [speciesName, count] of Object.entries(speciesCounts)) {
    console.log(`  Generating ${count} ${speciesName}...`);

    let names;
    switch (speciesName) {
      case 'cattle': names = cattleNames; break;
      case 'sheep': names = sheepNames; break;
      case 'goats': names = goatNames; break;
      default: names = cattleNames;
    }

    for (let i = 0; i < count; i++) {
      const age = Math.floor(Math.random() * 8) + 1;
      const birthDate = new Date(Date.now() - age * 365 * 24 * 60 * 60 * 1000);
      const gender = Math.random() > 0.5 ? 'male' : 'female';

      const breeds = {
        cattle: ['Angus', 'Hereford', 'Charolais', 'Simmental', 'Limousin'],
        sheep: ['Merino', 'Dorper', 'Suffolk', 'Hampshire'],
        goats: ['Boer', 'Kiko', 'Spanish', 'Myotonic']
      };

      const colors = {
        cattle: ['Black', 'Red', 'White', 'Brown', 'Spotted'],
        sheep: ['White', 'Black', 'Brown', 'Grey'],
        goats: ['White', 'Black', 'Brown', 'Grey']
      };

      const animal = {
        tenantId: 'demo-farm',
        rfidTag: `RFID${String(100000 + globalIndex).padStart(6, '0')}`,
        name: names[i % names.length] + (i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : ''),
        species: speciesName,
        breed: breeds[speciesName][Math.floor(Math.random() * breeds[speciesName].length)],
        dateOfBirth: birthDate,
        gender,
        color: colors[speciesName][Math.floor(Math.random() * colors[speciesName].length)],
        weight: speciesName === 'cattle' ? 400 + Math.floor(Math.random() * 400) : speciesName === 'sheep' ? 50 + Math.floor(Math.random() * 70) : 40 + Math.floor(Math.random() * 60),
        height: speciesName === 'cattle' ? 120 + Math.floor(Math.random() * 40) : speciesName === 'sheep' ? 60 + Math.floor(Math.random() * 20) : 50 + Math.floor(Math.random() * 30),
        status: Math.random() > 0.9 ? 'breeding' : 'active',
        location: {
          latitude: -26.2041 + (Math.random() * 0.1 - 0.05),
          longitude: 28.0473 + (Math.random() * 0.1 - 0.05),
          address: `${Math.floor(Math.random() * 9999) + 1} Farm Road, Gauteng, South Africa`,
          farmSection: ['Main Barn', 'North Pasture', 'South Field', 'East Pen', 'West Corral'][Math.floor(Math.random() * 5)]
        },
        health: {
          overallCondition: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)],
          lastCheckup: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
          nextCheckup: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
          vaccinations: [],
          diseases: []
        },
        breeding: {
          isBreedingStock: gender === 'female' && age >= 2,
          fertilityStatus: ['fertile', 'subfertile'][Math.floor(Math.random() * 2)],
          lastBreedingDate: gender === 'female' && Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 200 * 24 * 60 * 60 * 1000) : undefined,
          expectedCalvingDate: gender === 'female' && Math.random() > 0.7 ? new Date(Date.now() + Math.random() * 100 * 24 * 60 * 60 * 1000) : undefined,
          offspring: []
        },
        nutrition: {
          dailyFeedIntake: 5 + Math.floor(Math.random() * 15),
          feedType: ['Grass Hay', 'Alfalfa', 'Mixed Grains', 'Silage'][Math.floor(Math.random() * 4)],
          supplements: ['Mineral Block', 'Salt Lick'].filter(() => Math.random() > 0.5),
          feedingSchedule: 'Twice daily'
        },
        productivity: {
          milkProduction: speciesName === 'cattle' && gender === 'female' ? Math.floor(Math.random() * 30) + 10 : undefined,
          weightGain: 0.5 + Math.random() * 2,
          lastMeasurement: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        },
        images: [],
        notes: `Healthy ${speciesName} in ${['Main Barn', 'North Pasture', 'South Field'][Math.floor(Math.random() * 3)]} section.`,
        alerts: [],
        createdBy: 'demo-user',
        updatedBy: 'demo-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      animals.push(animal);
      globalIndex++;
    }
  }

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
      reference: `INV-${Math.floor(Math.random() * 1000000)}`,
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
      reference: `EXP-${Math.floor(Math.random() * 1000000)}`,
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

  const feedTypes = [
    {
      feedName: 'Premium Cattle Feed',
      type: 'concentrate',
      baseStock: 500,
      unit: 'kg',
      baseCost: 15,
      supplier: 'Farm Feeds Ltd',
      quality: 'premium',
      nutritionalValue: { protein: 18, energy: 12, fiber: 8, fat: 4 },
    },
    {
      feedName: 'Grass Hay',
      type: 'roughage',
      baseStock: 2000,
      unit: 'kg',
      baseCost: 3,
      supplier: 'Local Farmer Co-op',
      quality: 'standard',
      nutritionalValue: { protein: 8, energy: 8, fiber: 35, fat: 2 },
    },
    {
      feedName: 'Alfalfa Hay',
      type: 'roughage',
      baseStock: 1500,
      unit: 'kg',
      baseCost: 5,
      supplier: 'Green Valley Farms',
      quality: 'premium',
      nutritionalValue: { protein: 16, energy: 10, fiber: 28, fat: 3 },
    },
    {
      feedName: 'Corn Silage',
      type: 'silage',
      baseStock: 3000,
      unit: 'kg',
      baseCost: 2,
      supplier: 'Midwest Grain Corp',
      quality: 'standard',
      nutritionalValue: { protein: 8, energy: 15, fiber: 22, fat: 3 },
    },
    {
      feedName: 'Mineral Mix',
      type: 'supplement',
      baseStock: 200,
      unit: 'kg',
      baseCost: 25,
      supplier: 'Nutri-Vet Supplies',
      quality: 'premium',
      nutritionalValue: { protein: 0, energy: 0, fiber: 0, fat: 0 },
    },
    {
      feedName: 'Protein Supplement',
      type: 'supplement',
      baseStock: 150,
      unit: 'kg',
      baseCost: 35,
      supplier: 'Farm Nutrition Inc',
      quality: 'premium',
      nutritionalValue: { protein: 45, energy: 8, fiber: 2, fat: 2 },
    }
  ];

  const feedingRecords = [];

  // Generate 48 feed records (8 variations of each of 6 feed types)
  for (let i = 0; i < 48; i++) {
    const feedType = feedTypes[i % feedTypes.length];
    const variation = Math.floor(i / feedTypes.length);

    // Add some variation to stock levels and costs
    const stockVariation = (Math.random() - 0.5) * 0.3; // ±15% variation
    const costVariation = (Math.random() - 0.5) * 0.2; // ±10% variation

    feedingRecords.push({
      tenantId: 'demo-farm',
      feedName: feedType.feedName,
      type: feedType.type,
      currentStock: Math.round(feedType.baseStock * (1 + stockVariation)),
      unit: feedType.unit,
      minStock: Math.round(feedType.baseStock * 0.2), // 20% of base stock
      maxStock: Math.round(feedType.baseStock * 2), // 200% of base stock
      costPerUnit: Math.round(feedType.baseCost * (1 + costVariation) * 100) / 100,
      supplier: feedType.supplier,
      expiryDate: new Date(Date.now() + (30 + Math.random() * 90) * 24 * 60 * 60 * 1000), // 30-120 days from now
      quality: feedType.quality,
      nutritionalValue: feedType.nutritionalValue,
      createdBy: 'demo-user',
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Random date within last 60 days
      updatedAt: new Date(),
    });
  }

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

  const taskTemplates = [
    {
      title: 'Weekly Health Check - {animal}',
      description: 'Perform routine health examination on {animal} ({rfid})',
      category: 'health',
      priority: 'medium',
      estimatedHours: 1,
    },
    {
      title: 'Feed Inventory Check',
      description: 'Check and update feed inventory levels',
      category: 'feeding',
      priority: 'high',
      estimatedHours: 2,
    },
    {
      title: 'Equipment Maintenance',
      description: 'Perform routine maintenance on farm equipment',
      category: 'maintenance',
      priority: 'medium',
      estimatedHours: 3,
    },
    {
      title: 'Vaccination Schedule Review',
      description: 'Review and update vaccination schedules for livestock',
      category: 'health',
      priority: 'high',
      estimatedHours: 1,
    },
    {
      title: 'Financial Record Update',
      description: 'Update financial records and expense tracking',
      category: 'financial',
      priority: 'medium',
      estimatedHours: 2,
    },
    {
      title: 'Breeding Program Review',
      description: 'Review breeding program progress and update records',
      category: 'breeding',
      priority: 'medium',
      estimatedHours: 2,
    }
  ];

  const tasks = [];
  const animals = ['Bella', 'Max', 'Daisy', 'Charlie', 'Luna', 'Rocky'];
  const rfidTags = ['RFID001', 'RFID002', 'RFID003', 'RFID004', 'RFID005', 'RFID006'];

  // Generate 48 tasks with varied dates and priorities
  for (let i = 0; i < 48; i++) {
    const template = taskTemplates[i % taskTemplates.length];
    const animalIndex = i % animals.length;
    const daysOffset = Math.floor(i / 4) * 7; // Spread over multiple weeks

    let title = template.title;
    let description = template.description;

    if (template.category === 'health' && i % 3 === 0) {
      title = title.replace('{animal}', animals[animalIndex]);
      description = description.replace('{animal}', animals[animalIndex]).replace('{rfid}', rfidTags[animalIndex]);
    } else {
      title = title.replace(' - {animal}', '');
      description = description.replace(' on {animal} ({rfid})', '');
    }

    tasks.push({
      tenantId: 'demo-farm',
      title: title,
      description: description,
      assignedTo: 'demo-user',
      assignedBy: 'demo-user',
      priority: i % 3 === 0 ? 'high' : (i % 2 === 0 ? 'medium' : 'low'),
      status: i % 4 === 0 ? 'completed' : (i % 3 === 0 ? 'in_progress' : 'pending'),
      dueDate: new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000 + Math.random() * 7 * 24 * 60 * 60 * 1000),
      category: template.category,
      animalId: template.category === 'health' && i % 3 === 0 ? `ANIMAL_${animalIndex + 1}` : null,
      estimatedHours: template.estimatedHours,
      location: i % 3 === 0 ? 'Farm Section A' : (i % 2 === 0 ? 'Farm Section B' : 'Farm Section C'),
      createdBy: 'demo-user',
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    });
  }

  const result = await db.collection('tasks').insertMany(tasks);
  console.log(`  ✓ Created ${result.insertedCount} tasks`);
}

async function seedWeatherDatas(db) {
  console.log('\n🌤️ Seeding weather data...');

  const weatherData = [];
  const locations = [
    { name: 'Farm Section A', latitude: -26.2041, longitude: 28.0473 },
    { name: 'Farm Section B', latitude: -26.2042, longitude: 28.0474 },
    { name: 'Farm Section C', latitude: -26.2043, longitude: 28.0475 }
  ];

  // Generate 48 weather records (16 per location for variety)
  for (let i = 0; i < 48; i++) {
    const location = locations[i % locations.length];
    const date = new Date();
    date.setDate(date.getDate() - (47 - i)); // Spread over last 48 days

    weatherData.push({
      tenantId: 'demo-farm',
      location: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      date: date,
      temperature: {
        min: Math.round((15 + Math.random() * 10) * 10) / 10, // 15-25°C
        max: Math.round((20 + Math.random() * 15) * 10) / 10, // 20-35°C
        avg: Math.round((18 + Math.random() * 12) * 10) / 10  // 18-30°C
      },
      humidity: Math.floor(40 + Math.random() * 40), // 40-80%
      precipitation: Math.round((Math.random() * 20) * 10) / 10, // 0-20mm
      windSpeed: Math.round((Math.random() * 25) * 10) / 10, // 0-25 km/h
      windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
      conditions: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Clear'][Math.floor(Math.random() * 5)],
      forecast: {
        next24h: 'Partly cloudy with moderate temperatures',
        next3days: 'Stable weather with slight chance of rain',
        next7days: 'Mixed conditions with temperatures ranging from 18-28°C'
      },
      alerts: i % 10 === 0 ? ['Heat Warning'] : [], // Occasional heat warnings
      recordedAt: new Date(),
      source: 'Weather Station API',
      accuracy: '95%'
    });
  }

  const result = await db.collection('weatherdatas').insertMany(weatherData);
  console.log(`  ✓ Created ${result.insertedCount} weather data records`);
}

async function displayDataSummary(db) {
  console.log('\n📊 Final Data Summary for AgrIntelV4:');

  const collections = ['users', 'animals', 'healthrecords', 'financialrecords', 'feedingrecords', 'breedingrecords', 'rfidrecords', 'tasks', 'weatherdatas'];
  for (const collectionName of collections) {
    const count = await db.collection(collectionName).countDocuments();
    console.log(`   ${collectionName}: ${count} documents`);
  }
}




















// Run seeding if called directly
seedDatabase().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});