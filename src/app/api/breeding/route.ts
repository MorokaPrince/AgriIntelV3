import { NextRequest, NextResponse } from 'next/server';
import { Session } from 'next-auth';
import { withAuth } from '../../../middleware/auth';
import connectDB from '../../../lib/mongodb';
import BreedingRecord from '../../../models/BreedingRecord';

// GET /api/breeding - Get all breeding records for the authenticated user's tenant
export async function GET(request: NextRequest) {
  return withAuth(
    request,
    async (_request: NextRequest, session: Session | null) => {
      try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '48');
        const species = searchParams.get('species');
        const status = searchParams.get('status');

        const skip = (page - 1) * limit;

        // Build filter
        const filter: Record<string, unknown> = { tenantId: session!.user.tenantId };

        if (species) {
          filter.species = species;
        }

        if (status) {
          filter.status = status;
        }

        const breedingRecords = await BreedingRecord.find(filter)
          .populate('createdBy', 'firstName lastName')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);

        const total = await BreedingRecord.countDocuments(filter);

        return NextResponse.json({
          success: true,
          data: breedingRecords,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        });
      } catch (error) {
        console.error('Error fetching breeding records:', error);
        return NextResponse.json(
          { error: 'Failed to fetch breeding records' },
          { status: 500 }
        );
      }
    }
  );
}

// POST /api/breeding - Create a new breeding record
export async function POST(request: NextRequest) {
  return withAuth(
    request,
    async (_request: NextRequest, session: Session | null) => {
      // Additional permission check for write operations
      if (session?.user?.role && !['admin', 'manager', 'veterinarian'].includes(session.user.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions to create breeding records' },
          { status: 403 }
        );
      }
      try {
        await connectDB();

        const body = await request.json();

        // Validate required fields
        const requiredFields = ['programName', 'species', 'breed', 'startDate', 'endDate', 'totalAnimals'];
        for (const field of requiredFields) {
          if (!body[field]) {
            return NextResponse.json(
              { error: `${field} is required` },
              { status: 400 }
            );
          }
        }

        // Validate dates
        const startDate = new Date(body.startDate);
        const endDate = new Date(body.endDate);
        if (startDate >= endDate) {
          return NextResponse.json(
            { error: 'End date must be after start date' },
            { status: 400 }
          );
        }

        // Create new breeding record
        const breedingRecord = new BreedingRecord({
          ...body,
          tenantId: session!.user.tenantId,
          createdBy: session!.user.id,
        });

        const savedRecord = await breedingRecord.save();

        // Populate the saved record
        const populatedRecord = await BreedingRecord.findById(savedRecord._id)
          .populate('createdBy', 'firstName lastName');

        return NextResponse.json({
          success: true,
          data: populatedRecord,
          message: 'Breeding record created successfully',
        }, { status: 201 });
      } catch (error) {
        console.error('Error creating breeding record:', error);
        return NextResponse.json(
          { error: 'Failed to create breeding record' },
          { status: 500 }
        );
      }
    }
  );
}