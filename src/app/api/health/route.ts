import { NextRequest, NextResponse } from 'next/server';
import { Session } from 'next-auth';
import { withAuth } from '../../../middleware/auth';
import connectDB from '../../../lib/mongodb';
import HealthRecord from '../../../models/HealthRecord';

// GET /api/health - Get all health records for the authenticated user's tenant
export async function GET(request: NextRequest) {
  return withAuth(
    request,
    async (_request: NextRequest, session: Session | null) => {
      try {
        await connectDB();

        // Build filter - use demo tenant for demo purposes
        const tenantId = session?.user?.tenantId || 'demo-farm';
        const filter: Record<string, unknown> = { tenantId };

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const animalId = searchParams.get('animalId');
        const severity = searchParams.get('severity');
        const status = searchParams.get('status');

        const skip = (page - 1) * limit;

        if (animalId) {
          filter.animalId = animalId;
        }

        if (severity) {
          filter.severity = severity;
        }

        if (status) {
          filter.status = status;
        }

        const healthRecords = await HealthRecord.find(filter)
          .populate('animalId', 'name species breed')
          .populate('createdBy', 'firstName lastName')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);

        const total = await HealthRecord.countDocuments(filter);

        return NextResponse.json({
          success: true,
          data: healthRecords,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        });
      } catch (error) {
        console.error('Error fetching health records:', error);
        return NextResponse.json(
          { error: 'Failed to fetch health records' },
          { status: 500 }
        );
      }
    }
  );
}

// POST /api/health - Create a new health record
export async function POST(request: NextRequest) {
  return withAuth(
    request,
    async (_request: NextRequest, session: Session | null) => {
      // Additional permission check for write operations
      if (session?.user?.role && !['admin', 'manager', 'veterinarian'].includes(session.user.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions to create health records' },
          { status: 403 }
        );
      }
      try {
        await connectDB();

        const body = await request.json();

        // Validate required fields
        const requiredFields = ['animalId', 'condition', 'severity', 'treatment', 'veterinarian'];
        for (const field of requiredFields) {
          if (!body[field]) {
            return NextResponse.json(
              { error: `${field} is required` },
              { status: 400 }
            );
          }
        }

        // Create new health record - use demo user for demo purposes
        const userId = session?.user?.id || 'demo-user';
        const tenantId = session?.user?.tenantId || 'demo-farm';

        const healthRecord = new HealthRecord({
          ...body,
          tenantId,
          createdBy: userId,
        });

        const savedRecord = await healthRecord.save();

        // Populate the saved record
        const populatedRecord = await HealthRecord.findById(savedRecord._id)
          .populate('animalId', 'name species breed')
          .populate('createdBy', 'firstName lastName');

        return NextResponse.json({
          success: true,
          data: populatedRecord,
          message: 'Health record created successfully',
        }, { status: 201 });
      } catch (error) {
        console.error('Error creating health record:', error);
        return NextResponse.json(
          { error: 'Failed to create health record' },
          { status: 500 }
        );
      }
    }
  );
}