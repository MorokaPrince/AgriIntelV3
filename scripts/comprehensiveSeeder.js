const mongoose = require('mongoose');

// Import models
const Animal = require('../dist/src/models/Animal').default;
const HealthRecord = require('../dist/src/models/HealthRecord').default;
const FinancialRecord = require('../dist/src/models/FinancialRecord').default;
const FeedRecord = require('../dist/src/models/FeedRecord').default;
const BreedingRecord = require('../dist/src/models/BreedingRecord').default;
const Task = require('../dist/src/models/Task').default;
const RFIDRecord = require('../dist/src/models/RFIDRecord').default;
const User = require('../dist/src/models/User').default;

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Load environment variables
    require('dotenv').config({ path: '.env.local' });

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/agriintelv3';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Realistic data generators
const dataGenerators = {
  // Generate realistic names for animals
  generateAnimalName: (species, index) => {
    const cattleNames = ['Bella', 'Daisy', 'Luna', 'Molly', 'Ruby', 'Stella', 'Willow', 'Aurora', 'Coco', 'Honey', 'Jasmine', 'Lily', 'Milo', 'Oliver', 'Max', 'Charlie', 'Buddy', 'Rocky', 'Jack', 'Duke'];
    const sheepNames = ['Fluffy', 'Cotton', 'Snowball', 'Marshmallow', 'Cloud', 'Pearl', 'Ivory', 'Blanca', 'Frost', 'Crystal', 'Wooly', 'Fleece', 'Baabaa', 'Lambchop', 'Shep', 'Rambo', 'Curly', 'Puffy', 'Bounce', 'Skip'];
    const goatNames = ['Billy', 'Nanny', 'Kiko', 'Boer', 'Alpine', 'Saanen', 'Toggenburg', 'Nubian', 'Lamancha', 'Oberhasli', 'Pepper', 'Ginger', 'Cinnamon', 'Sage', 'Rosemary', 'Thyme', 'Basil', 'Oreo', 'Panda', 'Spot'];

    let names;
    switch (species) {
      case 'cattle': names = cattleNames; break;
      case 'sheep': names = sheepNames; break;
      case 'goats': names = goatNames; break;
      default: names = cattleNames;
    }

    return names[index % names.length] + (index > names.length ? ` ${Math.floor(index / names.length) + 1}` : '');
  },

  // Generate realistic RFID tags
  generateRFIDTag: (index) => {
    return `RFID${String(100000 + index).padStart(6, '0')}`;
  },

  // Generate realistic breeds
  getBreeds: (species) => {
    const breeds = {
      cattle: ['Angus', 'Hereford', 'Charolais', 'Simmental', 'Limousin', 'Brahman', 'Holstein', 'Jersey'],
      sheep: ['Merino', 'Dorper', 'Suffolk', 'Hampshire', 'Southdown', 'Dorset', 'Rambouillet', 'Cheviot'],
      goats: ['Boer', 'Kiko', 'Spanish', 'Myotonic', 'Nubian', 'Alpine', 'Saanen', 'Toggenburg']
    };
    return breeds[species] || breeds.cattle;
  },

  // Generate realistic colors
  getColors: (species) => {
    const colors = {
      cattle: ['Black', 'Red', 'White', 'Brown', 'Spotted', 'Brindle', 'Roan', 'Palomino'],
      sheep: ['White', 'Black', 'Brown', 'Grey', 'Cream', 'Spotted', 'Badger Face', 'Kemp'],
      goats: ['White', 'Black', 'Brown', 'Grey', 'Cream', 'Spotted', 'Multi-colored', 'Chocolate']
    };
    return colors[species] || colors.cattle;
  },

  // Generate realistic weights
  generateWeight: (species, age) => {
    const baseWeights = {
      cattle: { min: 400, max: 800 },
      sheep: { min: 50, max: 120 },
      goats: { min: 40, max: 100 }
    };

    const base = baseWeights[species] || baseWeights.cattle;
    const ageMultiplier = Math.min(age * 0.1 + 0.5, 1); // Grow to full size by age 5
    return Math.round(base.min + (base.max - base.min) * ageMultiplier + (Math.random() * 50 - 25));
  },

  // Generate realistic heights
  generateHeight: (species, age) => {
    const baseHeights = {
      cattle: { min: 120, max: 160 },
      sheep: { min: 60, max: 80 },
      goats: { min: 50, max: 75 }
    };

    const base = baseHeights[species] || baseHeights.cattle;
    const ageMultiplier = Math.min(age * 0.15 + 0.7, 1);
    return Math.round((base.min + (base.max - base.min) * ageMultiplier + (Math.random() * 10 - 5)) * 10) / 10;
  },

  // Generate random date within range
  randomDate: (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  },

  // Generate random date in the past
  randomPastDate: (daysAgo) => {
    const now = new Date();
    const past = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
  }
};

// Generate comprehensive animal data
const generateAnimals = async (tenantId, userId) => {
  console.log('🐄 Generating 48+ realistic animals...');

  const animals = [];
  const species = ['cattle', 'sheep', 'goats'];
  const speciesCounts = { cattle: 20, sheep: 16, goats: 12 };

  let globalIndex = 1;

  for (const [speciesName, count] of Object.entries(speciesCounts)) {
    console.log(`  Generating ${count} ${speciesName}...`);

    for (let i = 0; i < count; i++) {
      const age = Math.floor(Math.random() * 8) + 1; // 1-8 years old
      const birthDate = dataGenerators.randomPastDate(age * 365);
      const gender = Math.random() > 0.5 ? 'male' : 'female';

      const breeds = dataGenerators.getBreeds(speciesName);
      const colors = dataGenerators.getColors(speciesName);

      const animal = {
        tenantId,
        rfidTag: dataGenerators.generateRFIDTag(globalIndex),
        name: dataGenerators.generateAnimalName(speciesName, i),
        species: speciesName,
        breed: breeds[Math.floor(Math.random() * breeds.length)],
        dateOfBirth: birthDate,
        gender,
        color: colors[Math.floor(Math.random() * colors.length)],
        weight: dataGenerators.generateWeight(speciesName, age),
        height: dataGenerators.generateHeight(speciesName, age),
        status: Math.random() > 0.9 ? 'breeding' : 'active',
        location: {
          latitude: -26.2041 + (Math.random() * 0.1 - 0.05), // Around Johannesburg
          longitude: 28.0473 + (Math.random() * 0.1 - 0.05),
          address: `${Math.floor(Math.random() * 9999) + 1} Farm Road, Gauteng, South Africa`,
          farmSection: ['Main Barn', 'North Pasture', 'South Field', 'East Pen', 'West Corral'][Math.floor(Math.random() * 5)]
        },
        parentage: {
          sireName: `Sire ${Math.floor(Math.random() * 50) + 1}`,
          damName: `Dam ${Math.floor(Math.random() * 50) + 1}`
        },
        purchaseInfo: Math.random() > 0.7 ? {
          purchaseDate: dataGenerators.randomPastDate(1000),
          purchasePrice: Math.floor(Math.random() * 5000) + 1000,
          currency: 'ZAR',
          supplier: ['Gauteng Livestock', 'Free State Farms', 'North West Ranchers', 'Mpumalanga Breeders'][Math.floor(Math.random() * 4)]
        } : undefined,
        health: {
          overallCondition: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)],
          lastCheckup: dataGenerators.randomPastDate(60),
          nextCheckup: dataGenerators.randomPastDate(30) + 30 * 24 * 60 * 60 * 1000,
          vaccinations: [],
          diseases: []
        },
        breeding: {
          isBreedingStock: gender === 'female' && age >= 2,
          fertilityStatus: ['fertile', 'subfertile'][Math.floor(Math.random() * 2)],
          lastBreedingDate: gender === 'female' && Math.random() > 0.5 ? dataGenerators.randomPastDate(200) : undefined,
          expectedCalvingDate: gender === 'female' && Math.random() > 0.7 ? dataGenerators.randomPastDate(100) + 280 * 24 * 60 * 60 * 1000 : undefined,
          offspring: []
        },
        nutrition: {
          dailyFeedIntake: Math.floor(Math.random() * 15) + 5,
          feedType: ['Grass Hay', 'Alfalfa', 'Mixed Grains', 'Silage', 'Concentrate'][Math.floor(Math.random() * 5)],
          supplements: ['Mineral Block', 'Salt Lick', 'Vitamin E', 'Selenium'].filter(() => Math.random() > 0.5),
          feedingSchedule: 'Twice daily'
        },
        productivity: {
          milkProduction: speciesName === 'cattle' && gender === 'female' ? Math.floor(Math.random() * 30) + 10 : undefined,
          eggProduction: speciesName === 'poultry' ? Math.floor(Math.random() * 300) + 100 : undefined,
          weightGain: Math.floor(Math.random() * 2) + 1,
          lastMeasurement: dataGenerators.randomPastDate(30)
        },
        images: [],
        notes: `Healthy ${speciesName} in ${['Main Barn', 'North Pasture', 'South Field'][Math.floor(Math.random() * 3)]} section.`,
        alerts: [],
        createdBy: userId,
        updatedBy: userId
      };

      animals.push(animal);
      globalIndex++;
    }
  }

  const savedAnimals = await Animal.insertMany(animals);
  console.log(`✅ Generated ${savedAnimals.length} animals`);
  return savedAnimals;
};

// Generate RFID records for animals
const generateRFIDRecords = async (animals, tenantId, userId) => {
  console.log('📡 Generating RFID records...');

  const rfidRecords = animals.map((animal, index) => ({
    tenantId,
    tagId: animal.rfidTag,
    animalId: animal._id,
    animalName: animal.name,
    species: animal.species,
    breed: animal.breed,
    tagType: ['ear_tag', 'bolus', 'collar'][Math.floor(Math.random() * 3)],
    frequency: '134.2 kHz',
    installationDate: animal.dateOfBirth,
    lastScan: dataGenerators.randomPastDate(7),
    batteryLevel: Math.floor(Math.random() * 40) + 60, // 60-100%
    signalStrength: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)],
    location: animal.location.farmSection,
    status: 'active',
    temperature: animal.species === 'cattle' ? 38.5 + (Math.random() * 2 - 1) : undefined,
    healthAlerts: Math.floor(Math.random() * 3),
    createdBy: userId
  }));

  const savedRFID = await RFIDRecord.insertMany(rfidRecords);
  console.log(`✅ Generated ${savedRFID.length} RFID records`);
  return savedRFID;
};

// Generate health records for animals
const generateHealthRecords = async (animals, tenantId, userId) => {
  console.log('🏥 Generating health records...');

  const healthRecords = [];
  const veterinarians = ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown', 'Dr. Davis'];

  for (const animal of animals) {
    // Generate 2-5 health records per animal
    const recordCount = Math.floor(Math.random() * 4) + 2;

    for (let i = 0; i < recordCount; i++) {
      const recordDate = dataGenerators.randomPastDate(365);
      const recordTypes = ['checkup', 'vaccination', 'treatment'];
      const recordType = recordTypes[Math.floor(Math.random() * recordTypes.length)];

      const healthRecord = {
        tenantId,
        animalId: animal._id,
        animalRfid: animal.rfidTag,
        recordType,
        date: recordDate,
        veterinarian: veterinarians[Math.floor(Math.random() * veterinarians.length)],
        diagnosis: recordType === 'checkup' ? 'Routine health check - all systems normal' : 'Vaccination completed successfully',
        symptoms: recordType === 'treatment' ? ['Lethargy', 'Reduced appetite', 'Mild fever'] : [],
        treatment: recordType === 'vaccination' ? 'Administered appropriate vaccine' : 'Supportive care provided',
        medications: recordType === 'treatment' ? [{
          name: 'Antibiotic',
          dosage: '5ml',
          frequency: 'Twice daily',
          duration: 7,
          instructions: 'Complete full course'
        }] : [],
        vaccinations: recordType === 'vaccination' ? [{
          vaccine: ['IBR', 'BVD', 'Leptospirosis', 'Clostridium', 'Foot Rot'][Math.floor(Math.random() * 5)],
          batchNumber: `BATCH${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
          manufacturer: 'Zoetis',
          nextDueDate: new Date(recordDate.getTime() + 365 * 24 * 60 * 60 * 1000),
          notes: 'Vaccination successful'
        }] : [],
        tests: [],
        followUp: {
          required: Math.random() > 0.7,
          date: Math.random() > 0.5 ? dataGenerators.randomPastDate(30) + 30 * 24 * 60 * 60 * 1000 : undefined,
          instructions: 'Monitor for any adverse reactions'
        },
        cost: {
          consultationFee: Math.floor(Math.random() * 500) + 200,
          medicationCost: Math.floor(Math.random() * 300) + 50,
          testCost: Math.floor(Math.random() * 200),
          totalCost: 0, // Will be calculated by pre-save middleware
          currency: 'ZAR'
        },
        notes: `Routine ${recordType} for ${animal.name}`,
        severity: ['low', 'medium'][Math.floor(Math.random() * 2)],
        status: 'resolved',
        createdBy: userId,
        updatedBy: userId
      };

      healthRecords.push(healthRecord);
    }
  }

  const savedHealth = await HealthRecord.insertMany(healthRecords);
  console.log(`✅ Generated ${savedHealth.length} health records`);
  return savedHealth;
};

// Generate financial records
const generateFinancialRecords = async (animals, tenantId, userId) => {
  console.log('💰 Generating financial records...');

  const financialRecords = [];
  const categories = {
    income: ['Livestock Sales', 'Milk Production', 'Crop Sales', 'Government Subsidies'],
    expense: ['Feed Purchase', 'Veterinary Services', 'Equipment', 'Labor', 'Utilities', 'Insurance']
  };

  // Generate income records
  for (let i = 0; i < 50; i++) {
    const date = dataGenerators.randomPastDate(365);
    const category = categories.income[Math.floor(Math.random() * categories.income.length)];

    const record = {
      tenantId,
      recordType: 'income',
      category,
      subcategory: category === 'Livestock Sales' ? 'Cattle Sales' : 'Other Income',
      amount: Math.floor(Math.random() * 50000) + 5000,
      currency: 'ZAR',
      date,
      description: `${category} - ${dataGenerators.randomPastDate(30).toLocaleDateString()}`,
      reference: `INC${String(1000 + i).padStart(4, '0')}`,
      paymentMethod: ['bank_transfer', 'cash', 'mobile_money'][Math.floor(Math.random() * 3)],
      paymentDetails: {
        bankName: 'Standard Bank',
        transactionId: `TXN${Date.now()}${i}`
      },
      relatedEntities: category === 'Livestock Sales' ? {
        animalId: animals[Math.floor(Math.random() * animals.length)]._id,
        animalRfid: animals[Math.floor(Math.random() * animals.length)].rfidTag
      } : {},
      tags: ['farm', 'income'],
      attachments: [],
      recurring: {
        isRecurring: false
      },
      tax: {
        isTaxable: true,
        taxAmount: 0,
        taxRate: 15,
        taxCategory: 'Agricultural Income'
      },
      approval: {
        required: false,
        status: 'approved'
      },
      status: 'completed',
      notes: `Income from ${category.toLowerCase()}`,
      createdBy: userId,
      updatedBy: userId
    };

    financialRecords.push(record);
  }

  // Generate expense records
  for (let i = 0; i < 100; i++) {
    const date = dataGenerators.randomPastDate(365);
    const category = categories.expense[Math.floor(Math.random() * categories.expense.length)];

    const record = {
      tenantId,
      recordType: 'expense',
      category,
      subcategory: category === 'Feed Purchase' ? 'Animal Feed' : 'Operating Expenses',
      amount: Math.floor(Math.random() * 10000) + 1000,
      currency: 'ZAR',
      date,
      description: `${category} - ${dataGenerators.randomPastDate(30).toLocaleDateString()}`,
      reference: `EXP${String(1000 + i).padStart(4, '0')}`,
      paymentMethod: ['bank_transfer', 'cash', 'check'][Math.floor(Math.random() * 3)],
      paymentDetails: {
        bankName: 'Standard Bank',
        transactionId: `TXN${Date.now()}${i}`
      },
      relatedEntities: category === 'Veterinary Services' ? {
        animalId: animals[Math.floor(Math.random() * animals.length)]._id,
        animalRfid: animals[Math.floor(Math.random() * animals.length)].rfidTag
      } : {},
      tags: ['farm', 'expense'],
      attachments: [],
      recurring: {
        isRecurring: category === 'Utilities' || category === 'Insurance'
      },
      tax: {
        isTaxable: false,
        taxAmount: 0,
        taxRate: 0,
        taxCategory: 'Operating Expense'
      },
      approval: {
        required: false,
        status: 'approved'
      },
      status: 'completed',
      notes: `Expense for ${category.toLowerCase()}`,
      createdBy: userId,
      updatedBy: userId
    };

    financialRecords.push(record);
  }

  const savedFinancial = await FinancialRecord.insertMany(financialRecords);
  console.log(`✅ Generated ${savedFinancial.length} financial records`);
  return savedFinancial;
};

// Generate feed records
const generateFeedRecords = async (tenantId, userId) => {
  console.log('🌾 Generating feed records...');

  const feedTypes = [
    { name: 'Grass Hay', type: 'roughage', unit: 'kg', costPerKg: 3.50 },
    { name: 'Alfalfa Hay', type: 'roughage', unit: 'kg', costPerKg: 5.20 },
    { name: 'Corn Silage', type: 'silage', unit: 'kg', costPerKg: 2.80 },
    { name: 'Dairy Concentrate', type: 'concentrate', unit: 'kg', costPerKg: 8.50 },
    { name: 'Mineral Supplement', type: 'supplement', unit: 'kg', costPerKg: 15.00 }
  ];

  const suppliers = ['Agri Suppliers Ltd', 'Farm Feed Co', 'Livestock Nutrition Inc', 'Rural Feeds'];

  const feedRecords = feedTypes.map(feed => ({
    tenantId,
    feedName: feed.name,
    type: feed.type,
    currentStock: Math.floor(Math.random() * 1000) + 100,
    unit: feed.unit,
    minStock: 50,
    maxStock: 2000,
    costPerUnit: feed.costPerKg,
    supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
    expiryDate: dataGenerators.randomPastDate(180) + 365 * 24 * 60 * 60 * 1000, // 1 year from now
    quality: ['premium', 'standard', 'basic'][Math.floor(Math.random() * 3)],
    nutritionalValue: {
      protein: Math.floor(Math.random() * 25) + 5,
      energy: Math.floor(Math.random() * 3000) + 1000,
      fiber: Math.floor(Math.random() * 40) + 10,
      fat: Math.floor(Math.random() * 10) + 2
    },
    notes: `Quality ${feed.type} feed for livestock`,
    createdBy: userId
  }));

  const savedFeed = await FeedRecord.insertMany(feedRecords);
  console.log(`✅ Generated ${savedFeed.length} feed records`);
  return savedFeed;
};

// Generate breeding records
const generateBreedingRecords = async (animals, tenantId, userId) => {
  console.log('🤰 Generating breeding records...');

  const breedingRecords = [];
  const species = ['cattle', 'sheep', 'goats'];

  for (const speciesName of species) {
    const speciesAnimals = animals.filter(a => a.species === speciesName);
    const breedingFemales = speciesAnimals.filter(a => a.gender === 'female' && a.breeding.isBreedingStock);

    if (breedingFemales.length > 0) {
      const record = {
        tenantId,
        programName: `${speciesName.charAt(0).toUpperCase() + speciesName.slice(1)} Breeding Program 2024`,
        species: speciesName,
        breed: breedingFemales[0].breed,
        startDate: dataGenerators.randomPastDate(300),
        endDate: dataGenerators.randomPastDate(60) + 200 * 24 * 60 * 60 * 1000,
        status: 'completed',
        totalAnimals: speciesAnimals.length,
        breedingFemales: breedingFemales.length,
        breedingMales: Math.floor(breedingFemales.length / 20) + 1,
        expectedOffspring: Math.floor(breedingFemales.length * 0.9),
        actualOffspring: Math.floor(breedingFemales.length * 0.85),
        successRate: 0, // Will be calculated by pre-save middleware
        goals: ['Improve genetic quality', 'Increase productivity', 'Maintain herd health'],
        manager: 'Farm Manager',
        budget: Math.floor(Math.random() * 100000) + 50000,
        currency: 'ZAR',
        notes: `Successful ${speciesName} breeding program with good conception rates`,
        createdBy: userId
      };

      breedingRecords.push(record);
    }
  }

  const savedBreeding = await BreedingRecord.insertMany(breedingRecords);
  console.log(`✅ Generated ${savedBreeding.length} breeding records`);
  return savedBreeding;
};

// Generate task records
const generateTaskRecords = async (animals, tenantId, userId) => {
  console.log('📋 Generating task records...');

  const tasks = [];
  const taskTitles = {
    feeding: ['Morning Feed Distribution', 'Evening Feed Run', 'Check Water Supply', 'Monitor Feed Stock'],
    health: ['Weekly Health Check', 'Vaccination Schedule', 'Deworming Program', 'Hoof Care'],
    maintenance: ['Equipment Maintenance', 'Fence Repair', 'Barn Cleaning', 'Pasture Management'],
    breeding: ['Breeding Observation', 'Pregnancy Check', 'Calf Watch', 'Breeding Records Update'],
    financial: ['Monthly Budget Review', 'Expense Tracking', 'Income Recording', 'Financial Reporting'],
    general: ['Staff Meeting', 'Training Session', 'Safety Inspection', 'Record Keeping']
  };

  const users = [userId]; // In a real scenario, you'd have multiple users

  for (let i = 0; i < 150; i++) {
    const categories = Object.keys(taskTitles);
    const category = categories[Math.floor(Math.random() * categories.length)];
    const titles = taskTitles[category];
    const title = titles[Math.floor(Math.random() * titles.length)];

    const dueDate = dataGenerators.randomPastDate(180) + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000;
    const assignedTo = users[Math.floor(Math.random() * users.length)];

    const task = {
      tenantId,
      title: `${title} #${i + 1}`,
      description: `Complete ${title.toLowerCase()} as scheduled`,
      assignedTo,
      assignedBy: userId,
      priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      status: ['pending', 'in_progress', 'completed'][Math.floor(Math.random() * 3)],
      dueDate,
      completedDate: Math.random() > 0.5 ? dataGenerators.randomPastDate(30) : undefined,
      category,
      tags: [category, 'farm'],
      estimatedHours: Math.floor(Math.random() * 8) + 1,
      actualHours: Math.random() > 0.7 ? Math.floor(Math.random() * 8) + 1 : undefined,
      progress: Math.floor(Math.random() * 100),
      dependencies: [],
      attachments: [],
      notes: `Important ${category} task for farm operations`,
      location: ['Main Barn', 'North Pasture', 'South Field', 'Equipment Shed'][Math.floor(Math.random() * 4)],
      animalId: Math.random() > 0.6 ? animals[Math.floor(Math.random() * animals.length)]._id : undefined,
      kpi: {
        efficiency: Math.floor(Math.random() * 40) + 60,
        quality: Math.floor(Math.random() * 30) + 70,
        timeliness: Math.floor(Math.random() * 25) + 75,
        safety: Math.floor(Math.random() * 20) + 80
      }
    };

    tasks.push(task);
  }

  const savedTasks = await Task.insertMany(tasks);
  console.log(`✅ Generated ${savedTasks.length} task records`);
  return savedTasks;
};

// Main seeder function
const seedDatabase = async () => {
  try {
    await connectDB();

    // Check if data already exists
    const existingAnimals = await Animal.countDocuments();
    if (existingAnimals > 10) {
      console.log('⚠️  Database already contains significant data. Use --force to reseed.');
      return;
    }

    console.log('🚀 Starting comprehensive database seeding...');

    // Get or create a user for seeding
    let user = await User.findOne({ role: 'admin' });
    if (!user) {
      user = await User.create({
        tenantId: 'default-tenant',
        email: 'admin@farm.com',
        password: 'password123',
        firstName: 'Farm',
        lastName: 'Admin',
        phone: '+27 11 123 4567',
        role: 'admin',
        country: 'ZA',
        region: 'Gauteng',
        farmName: 'Demo Farm',
        farmSize: 1000,
        livestockTypes: ['cattle', 'sheep', 'goats'],
        isActive: true,
        preferences: {
          language: 'en',
          currency: 'ZAR',
          timezone: 'Africa/Johannesburg',
          theme: 'auto',
          notifications: { email: true, sms: false, push: true }
        },
        permissions: ['all']
      });
      console.log('👤 Created admin user');
    }

    const tenantId = user.tenantId;
    const userId = user._id;

    // Generate all data
    const animals = await generateAnimals(tenantId, userId);
    await generateRFIDRecords(animals, tenantId, userId);
    await generateHealthRecords(animals, tenantId, userId);
    await generateFinancialRecords(animals, tenantId, userId);
    await generateFeedRecords(tenantId, userId);
    await generateBreedingRecords(animals, tenantId, userId);
    await generateTaskRecords(animals, tenantId, userId);

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   🐄 Animals: ${animals.length}`);
    console.log(`   💰 Financial Records: ~150`);
    console.log(`   🏥 Health Records: ~200`);
    console.log(`   🌾 Feed Records: 5`);
    console.log(`   🤰 Breeding Records: 3`);
    console.log(`   📋 Task Records: 150`);
    console.log(`   📡 RFID Records: ${animals.length}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run seeder if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--force')) {
    console.log('⚠️  Force seeding enabled');
  }
  seedDatabase();
}

module.exports = { seedDatabase };