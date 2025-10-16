import { NextRequest, NextResponse } from 'next/server';
import { Session } from 'next-auth';
import { withAuth } from '../../../middleware/auth';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import Animal from '../../../models/Animal';
import HealthRecord from '../../../models/HealthRecord';
import FinancialRecord from '../../../models/FinancialRecord';
import FeedRecord from '../../../models/FeedRecord';
import BreedingRecord from '../../../models/BreedingRecord';
import RFIDRecord from '../../../models/RFIDRecord';

// GET /api/test - Comprehensive system test
export async function GET(request: NextRequest) {
  return withAuth(
    request,
    async (_request: NextRequest, session: Session | null) => {
      const results: Record<string, unknown> = {
        timestamp: new Date().toISOString(),
        database: {},
        models: {},
        api: {},
        errors: [] as string[],
      };

      try {
        // Test database connection
        results.database = await testDatabaseConnection();

        // Test model operations
        results.models = await testModelOperations(session);

        // Test API endpoints
        results.api = await testApiEndpoints();

        return NextResponse.json({
          success: true,
          message: 'All tests completed',
          results,
        });

      } catch (error) {
        console.error('Test error:', error);
        (results.errors as string[]).push(error instanceof Error ? error.message : 'Unknown error');

        return NextResponse.json({
          success: false,
          message: 'Some tests failed',
          results,
        }, { status: 500 });
      }
    }
  );
}

async function testDatabaseConnection(): Promise<Record<string, unknown>> {
  const results: Record<string, unknown> = {};

  try {
    await connectDB();
    results.connection = '✅ Connected successfully';

    // Test connection object
    const mongoose = await import('mongoose');
    results.databaseName = mongoose.default.connection.db?.databaseName;
    results.readyState = mongoose.default.connection.readyState;

    // Test collections
    const collections = await mongoose.default.connection.db?.listCollections().toArray() || [];
    results.collections = collections.map((coll: { name: string }) => coll.name);

    // Count documents in each collection
    const counts: Record<string, number> = {};
    if (mongoose.default.connection.db) {
      for (const collection of collections) {
        counts[collection.name] = await mongoose.default.connection.db.collection(collection.name).countDocuments();
      }
    }
    results.documentCounts = counts;

  } catch (error) {
    results.connection = '❌ Connection failed';
    results.error = error instanceof Error ? error.message : 'Unknown error';
  }

  return results;
}

async function testModelOperations(session: Session | null): Promise<Record<string, unknown>> {
  const results: Record<string, unknown> = {};

  if (!session?.user) {
    results.error = 'No authenticated session for model tests';
    return results;
  }

  try {
    // Test User model
    const userCount = await User.countDocuments({ tenantId: session.user.tenantId });
    results.users = {
      count: userCount,
      status: '✅ Working',
    };

    // Test Animal model
    const animalCount = await Animal.countDocuments({ tenantId: session.user.tenantId });
    results.animals = {
      count: animalCount,
      status: '✅ Working',
    };

    // Test HealthRecord model
    const healthCount = await HealthRecord.countDocuments({ tenantId: session.user.tenantId });
    results.healthRecords = {
      count: healthCount,
      status: '✅ Working',
    };

    // Test FinancialRecord model
    const financialCount = await FinancialRecord.countDocuments({ tenantId: session.user.tenantId });
    results.financialRecords = {
      count: financialCount,
      status: '✅ Working',
    };

    // Test FeedRecord model
    const feedCount = await FeedRecord.countDocuments({ tenantId: session.user.tenantId });
    results.feedRecords = {
      count: feedCount,
      status: '✅ Working',
    };

    // Test BreedingRecord model
    const breedingCount = await BreedingRecord.countDocuments({ tenantId: session.user.tenantId });
    results.breedingRecords = {
      count: breedingCount,
      status: '✅ Working',
    };

    // Test RFIDRecord model
    const rfidCount = await RFIDRecord.countDocuments({ tenantId: session.user.tenantId });
    results.rfidRecords = {
      count: rfidCount,
      status: '✅ Working',
    };

  } catch (error) {
    results.error = error instanceof Error ? error.message : 'Model test failed';
  }

  return results;
}

async function testApiEndpoints(): Promise<Record<string, unknown>> {
  const results: Record<string, unknown> = {};

  try {
    // Test weather API (public endpoint)
    try {
      const weatherResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/weather/Johannesburg`);
      results.weatherApi = {
        status: weatherResponse.ok ? '✅ Working' : '❌ Failed',
        statusCode: weatherResponse.status,
      };
    } catch (error) {
      results.weatherApi = {
        status: '❌ Error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // Test auth check
    try {
      const authResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/session`);
      results.authApi = {
        status: authResponse.ok ? '✅ Working' : '❌ Failed',
        statusCode: authResponse.status,
      };
    } catch (error) {
      results.authApi = {
        status: '❌ Error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

  } catch (error) {
    results.error = error instanceof Error ? error.message : 'API test failed';
  }

  return results;
}