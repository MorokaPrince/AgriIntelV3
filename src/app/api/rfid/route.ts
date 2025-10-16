import { NextRequest, NextResponse } from 'next/server';
import { Session } from 'next-auth';
import { withAuth } from '../../../middleware/auth';
import connectDB from '../../../lib/mongodb';
import RFIDRecord from '../../../models/RFIDRecord';

// GET /api/rfid - Get all RFID records for the authenticated user's tenant
export async function GET(request: NextRequest) {
  return withAuth(
    request,
    async (_request: NextRequest, session: Session | null) => {
      try {
        await connectDB();

        if (!session?.user) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status');
        const tagType = searchParams.get('tagType');
        const lowBattery = searchParams.get('lowBattery') === 'true';

        const skip = (page - 1) * limit;

        // Build filter
        const filter: Record<string, unknown> = { tenantId: session.user.tenantId };

        if (status) {
          filter.status = status;
        }

        if (tagType) {
          filter.tagType = tagType;
        }

        // Filter for low battery devices
        if (lowBattery) {
          filter.batteryLevel = { $lt: 20 };
        }

        const rfidRecords = await RFIDRecord.find(filter)
          .populate('animalId', 'name species breed')
          .populate('createdBy', 'firstName lastName')
          .sort({ lastScan: -1 })
          .skip(skip)
          .limit(limit);

        const total = await RFIDRecord.countDocuments(filter);

        // Get device statistics
        const deviceStats = await RFIDRecord.aggregate([
          { $match: { tenantId: session.user.tenantId } },
          {
            $group: {
              _id: null,
              totalDevices: { $sum: 1 },
              activeDevices: {
                $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
              },
              lowBatteryDevices: {
                $sum: { $cond: [{ $lt: ['$batteryLevel', 20] }, 1, 0] }
              },
              avgBatteryLevel: { $avg: '$batteryLevel' }
            }
          }
        ]);

        return NextResponse.json({
          success: true,
          data: rfidRecords,
          deviceStats: deviceStats[0] || {
            totalDevices: 0,
            activeDevices: 0,
            lowBatteryDevices: 0,
            avgBatteryLevel: 0
          },
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        });
      } catch (error) {
        console.error('Error fetching RFID records:', error);
        return NextResponse.json(
          { error: 'Failed to fetch RFID records' },
          { status: 500 }
        );
      }
    }
  );
}

// POST /api/rfid - Create a new RFID record
export async function POST(request: NextRequest) {
  return withAuth(
    request,
    async (_request: NextRequest, session: Session | null) => {
      try {
        await connectDB();

        if (!session?.user) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        }

        const body = await request.json();

        // Validate required fields
        const requiredFields = ['tagId', 'animalId', 'animalName', 'species', 'breed', 'tagType', 'installationDate'];
        for (const field of requiredFields) {
          if (!body[field]) {
            return NextResponse.json(
              { error: `${field} is required` },
              { status: 400 }
            );
          }
        }

        // Validate battery level
        if (body.batteryLevel < 0 || body.batteryLevel > 100) {
          return NextResponse.json(
            { error: 'Battery level must be between 0 and 100' },
            { status: 400 }
          );
        }

        // Create new RFID record
        const rfidRecord = new RFIDRecord({
          ...body,
          tenantId: session.user.tenantId,
          createdBy: session.user.id,
        });

        const savedRecord = await rfidRecord.save();

        // Populate the saved record
        const populatedRecord = await RFIDRecord.findById(savedRecord._id)
          .populate('animalId', 'name species breed')
          .populate('createdBy', 'firstName lastName');

        return NextResponse.json({
          success: true,
          data: populatedRecord,
          message: 'RFID record created successfully',
        }, { status: 201 });
      } catch (error: unknown) {
        console.error('Error creating RFID record:', error);

        // Handle duplicate tag ID error
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
          return NextResponse.json(
            { error: 'Tag ID already exists' },
            { status: 400 }
          );
        }

        return NextResponse.json(
          { error: 'Failed to create RFID record' },
          { status: 500 }
        );
      }
    }
  );
}