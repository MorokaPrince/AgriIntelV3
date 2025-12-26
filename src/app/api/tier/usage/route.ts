import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { TierLimitService } from '@/services/tierLimitService';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
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

        const tenantId = session.user.tenantId || 'demo-farm';
        const userId = new mongoose.Types.ObjectId(session.user.id);
        const tier = 'beta'; // Default tier for now
        const trialEndDate = new Date();

        // Get usage information
        const usage = await TierLimitService.getRecordUsage(tenantId, userId, tier);
        const tierLimits = TierLimitService.getTierLimits(tier);
        const isTrialExpired = TierLimitService.isTrialExpired(trialEndDate);
        const trialDaysRemaining = TierLimitService.getTrialDaysRemaining(trialEndDate);

        return NextResponse.json({
          tier: tier,
          tierLimits: tierLimits,
          usage: usage,
          trial: {
            isExpired: isTrialExpired,
            daysRemaining: trialDaysRemaining,
            endDate: trialEndDate,
          },
          features: TierLimitService.getAvailableFeatures(tier),
        });
      } catch (error) {
        console.error('Tier usage check error:', error);
        return NextResponse.json(
          { error: 'Failed to get tier usage' },
          { status: 500 }
        );
      }
    }
  );
}

