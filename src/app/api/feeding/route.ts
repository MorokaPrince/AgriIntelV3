import { NextRequest, NextResponse } from 'next/server';
import { Session } from 'next-auth';
import { withAuth } from '../../../middleware/auth';
import connectDB from '../../../lib/mongodb';
import FeedRecord from '../../../models/FeedRecord';

// GET /api/feeding - Get all feed records for the authenticated user's tenant
export async function GET(request: NextRequest) {
  return withAuth(
    request,
    async (_request: NextRequest, session: Session | null) => {
      try {
        await connectDB();

        // Import User model to register it for populate
        await import('../../../models/User');

        // Build filter - use demo tenant for demo purposes
        const tenantId = session?.user?.tenantId || 'demo-farm';
        const filter: Record<string, unknown> = { tenantId };

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '48');
        const type = searchParams.get('type');
        const lowStock = searchParams.get('lowStock') === 'true';

        const skip = (page - 1) * limit;

        if (type) {
          filter.type = type;
        }

        // Filter for low stock items
        if (lowStock) {
          filter.currentStock = { $lte: '$minStock' };
        }

        const feedRecords = await FeedRecord.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);

        const total = await FeedRecord.countDocuments(filter);

        // Calculate inventory summary
        const inventorySummary = await FeedRecord.aggregate([
          { $match: { tenantId } },
          {
            $group: {
              _id: null,
              totalItems: { $sum: 1 },
              lowStockItems: {
                $sum: { $cond: [{ $lte: ['$currentStock', '$minStock'] }, 1, 0] }
              },
              totalValue: { $sum: { $multiply: ['$currentStock', '$costPerUnit'] } },
              totalStock: { $sum: '$currentStock' }
            }
          }
        ]);

        return NextResponse.json({
          success: true,
          data: feedRecords,
          inventorySummary: inventorySummary[0] || {
            totalItems: 0,
            lowStockItems: 0,
            totalValue: 0,
            totalStock: 0
          },
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        });
      } catch (error) {
        console.error('Error fetching feed records:', error);
        return NextResponse.json(
          { error: 'Failed to fetch feed records' },
          { status: 500 }
        );
      }
    },
    { allowPublic: true }
  );
}

// POST /api/feeding - Create a new feed record
export async function POST(request: NextRequest) {
  return withAuth(
    request,
    async (_request: NextRequest, session: Session | null) => {
      try {
        await connectDB();

        const body = await request.json();

        // Validate required fields
        const requiredFields = ['feedName', 'type', 'currentStock', 'unit', 'minStock', 'costPerUnit', 'supplier'];
        for (const field of requiredFields) {
          if (!body[field]) {
            return NextResponse.json(
              { error: `${field} is required` },
              { status: 400 }
            );
          }
        }

        // Validate stock values
        if (body.currentStock < 0 || body.minStock < 0 || body.costPerUnit < 0) {
          return NextResponse.json(
            { error: 'Stock and cost values must be non-negative' },
            { status: 400 }
          );
        }

        // Create new feed record - use demo user for demo purposes
        const userId = session?.user?.id || 'demo-user';
        const tenantId = session?.user?.tenantId || 'demo-farm';

        const feedRecord = new FeedRecord({
          ...body,
          tenantId,
          createdBy: userId,
        });

        const savedRecord = await feedRecord.save();

        // Populate the saved record
        const populatedRecord = await FeedRecord.findById(savedRecord._id)
          .populate('createdBy', 'firstName lastName');

        return NextResponse.json({
          success: true,
          data: populatedRecord,
          message: 'Feed record created successfully',
        }, { status: 201 });
      } catch (error) {
        console.error('Error creating feed record:', error);
        return NextResponse.json(
          { error: 'Failed to create feed record' },
          { status: 500 }
        );
      }
    },
    { allowPublic: true }
  );
}