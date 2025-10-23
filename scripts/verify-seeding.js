const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agriintelv3';

// Import models
const Animal = require('../dist/src/models/Animal').default;
const HealthRecord = require('../dist/src/models/HealthRecord').default;
const FinancialRecord = require('../dist/src/models/FinancialRecord').default;
const FeedRecord = require('../dist/src/models/FeedRecord').default;
const BreedingRecord = require('../dist/src/models/BreedingRecord').default;
const Task = require('../dist/src/models/Task').default;
const RFIDRecord = require('../dist/src/models/RFIDRecord').default;
const User = require('../dist/src/models/User').default;

async function verifySeeding() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('🔍 Verifying comprehensive seeding...\n');

    // Expected counts based on comprehensive seeder
    const expectedCounts = {
      animals: { min: 48, max: 48, description: '48+ animals (20 cattle, 16 sheep, 12 goats)' },
      healthRecords: { min: 160, max: 240, description: '160+ health/vaccination records (2-5 per animal)' },
      financialRecords: { min: 150, max: 150, description: '150+ financial transactions (50 income + 100 expense)' },
      feedRecords: { min: 5, max: 5, description: '5 feed/nutrition records' },
      breedingRecords: { min: 3, max: 3, description: '3 breeding program records' },
      taskRecords: { min: 150, max: 150, description: '150+ farm operation records' },
      rfidRecords: { min: 48, max: 48, description: '48+ RFID records (one per animal)' }
    };

    // Check actual counts
    const actualCounts = {
      animals: await Animal.countDocuments(),
      healthRecords: await HealthRecord.countDocuments(),
      financialRecords: await FinancialRecord.countDocuments(),
      feedRecords: await FeedRecord.countDocuments(),
      breedingRecords: await BreedingRecord.countDocuments(),
      taskRecords: await Task.countDocuments(),
      rfidRecords: await RFIDRecord.countDocuments(),
      users: await User.countDocuments()
    };

    // Display results
    console.log('📊 DATABASE VERIFICATION RESULTS');
    console.log('=====================================\n');

    let allPassed = true;

    for (const [recordType, count] of Object.entries(actualCounts)) {
      const expected = expectedCounts[recordType];
      if (!expected) continue; // Skip record types not in expected counts

      const status = count >= expected.min ? '✅ PASS' : '❌ FAIL';
      const percentage = expected.max > 0 ? Math.round((count / expected.max) * 100) : 0;

      if (status === '❌ FAIL') {
        allPassed = false;
      }

      console.log(`${status} ${recordType.toUpperCase()}:`);
      console.log(`   Count: ${count} (Expected: ${expected.description})`);
      console.log(`   Percentage: ${percentage}% of expected`);
      console.log('');
    }

    // Additional detailed breakdown for animals
    if (actualCounts.animals > 0) {
      console.log('🐄 ANIMAL BREAKDOWN BY SPECIES:');
      console.log('------------------------------');

      const cattleCount = await Animal.countDocuments({ species: 'cattle' });
      const sheepCount = await Animal.countDocuments({ species: 'sheep' });
      const goatCount = await Animal.countDocuments({ species: 'goats' });

      console.log(`   Cattle: ${cattleCount} (Expected: 20)`);
      console.log(`   Sheep: ${sheepCount} (Expected: 16)`);
      console.log(`   Goats: ${goatCount} (Expected: 12)`);
      console.log('');
    }

    // Additional detailed breakdown for financial records
    if (actualCounts.financialRecords > 0) {
      console.log('💰 FINANCIAL RECORDS BREAKDOWN:');
      console.log('------------------------------');

      const incomeCount = await FinancialRecord.countDocuments({ recordType: 'income' });
      const expenseCount = await FinancialRecord.countDocuments({ recordType: 'expense' });

      console.log(`   Income: ${incomeCount} (Expected: ~50)`);
      console.log(`   Expense: ${expenseCount} (Expected: ~100)`);
      console.log('');
    }

    // Summary
    console.log('🎯 VERIFICATION SUMMARY:');
    console.log('=======================');
    if (allPassed) {
      console.log('✅ All seeding targets met or exceeded!');
      console.log('🎉 Comprehensive seeding appears to be successful.');
    } else {
      console.log('❌ Some seeding targets were not met.');
      console.log('⚠️  Seeding may have failed or been incomplete.');
    }

    console.log(`\n📈 Total Records: ${Object.values(actualCounts).reduce((sum, count) => sum + count, 0)}`);

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run verification if called directly
if (require.main === module) {
  verifySeeding();
}

module.exports = { verifySeeding };