import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { TierLimitService } from '@/services/tierLimitService';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  return withAuth(
    request,
    async (_request: NextRequest, session) => {
      try {
        if (!session || !session.user) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        }

        const body = await request.json();
        const { module } = body;

        if (!module) {
          return NextResponse.json(
            { error: 'Module is required' },
            { status: 400 }
          );
        }

        const tenantId = session.user.tenantId || 'demo-farm';
        const userId = new mongoose.Types.ObjectId(session.user.id);
        const tier = 'beta'; // Default tier for now

        // Get current count from database
        const db = mongoose.connection.db;
        if (!db) {
          return NextResponse.json(
            { error: 'Database connection failed' },
            { status: 500 }
          );
        }

        const collectionName = module.toLowerCase();
        const currentCount = await db.collection(collectionName).countDocuments({ tenantId });

        // Check limit
        const result = await TierLimitService.checkRecordLimit(
          tenantId,
          userId,
          tier,
          module,
          currentCount
        );

        return NextResponse.json({
          allowed: result.allowed,
          message: result.message,
          limit: result.limit,
          current: result.current,
          tier: tier,
          module: module,
        });
      } catch (error) {
        console.error('Tier limit check error:', error);
        return NextResponse.json(
          { error: 'Failed to check tier limit' },
          { status: 500 }
        );
      }
    }
  );
}

