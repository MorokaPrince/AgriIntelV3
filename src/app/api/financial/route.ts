import { NextRequest, NextResponse } from 'next/server';
import { Session } from 'next-auth';
import { withAuth } from '../../../middleware/auth';
import connectDB from '../../../lib/mongodb';
import FinancialRecord from '../../../models/FinancialRecord';

// GET /api/financial - Get all financial records for the authenticated user's tenant
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
        const limit = parseInt(searchParams.get('limit') || '48');
        const type = searchParams.get('type'); // income or expense
        const category = searchParams.get('category');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const skip = (page - 1) * limit;

        // Type for date filter
        interface DateFilter {
          $gte?: Date;
          $lte?: Date;
        }

        if (type) {
          filter.type = type;
        }

        if (category) {
          filter.category = category;
        }

        if (startDate || endDate) {
          const dateFilter: DateFilter = {};
          if (startDate) {
            dateFilter.$gte = new Date(startDate);
          }
          if (endDate) {
            dateFilter.$lte = new Date(endDate);
          }
          filter.date = dateFilter;
        }

        const financialRecords = await FinancialRecord.find(filter)
          .populate('createdBy', 'firstName lastName')
          .sort({ date: -1 })
          .skip(skip)
          .limit(limit);

        const total = await FinancialRecord.countDocuments(filter);

        // Calculate totals
        const totals = await FinancialRecord.aggregate([
          { $match: filter },
          {
            $group: {
              _id: null,
              totalIncome: {
                $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
              },
              totalExpenses: {
                $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
              },
              netTotal: {
                $sum: {
                  $cond: [
                    { $eq: ['$type', 'income'] },
                    '$amount',
                    { $multiply: ['$amount', -1] }
                  ]
                }
              }
            }
          }
        ]);

        return NextResponse.json({
          success: true,
          data: financialRecords,
          totals: totals[0] || { totalIncome: 0, totalExpenses: 0, netTotal: 0 },
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        });
      } catch (error) {
        console.error('Error fetching financial records:', error);
        return NextResponse.json(
          { error: 'Failed to fetch financial records' },
          { status: 500 }
        );
      }
    }
  );
}

// POST /api/financial - Create a new financial record
export async function POST(request: NextRequest) {
  return withAuth(
    request,
    async (_request: NextRequest, session: Session | null) => {
      try {
        await connectDB();

        const body = await request.json();

        // Validate required fields
        const requiredFields = ['type', 'category', 'amount', 'description', 'date'];
        for (const field of requiredFields) {
          if (!body[field]) {
            return NextResponse.json(
              { error: `${field} is required` },
              { status: 400 }
            );
          }
        }

        // Validate amount is positive
        if (body.amount <= 0) {
          return NextResponse.json(
            { error: 'Amount must be greater than 0' },
            { status: 400 }
          );
        }

        // Create new financial record - use demo user for demo purposes
        const userId = session?.user?.id || 'demo-user';
        const tenantId = session?.user?.tenantId || 'demo-farm';

        const financialRecord = new FinancialRecord({
          ...body,
          tenantId,
          createdBy: userId,
        });

        const savedRecord = await financialRecord.save();

        // Populate the saved record
        const populatedRecord = await FinancialRecord.findById(savedRecord._id)
          .populate('createdBy', 'firstName lastName');

        return NextResponse.json({
          success: true,
          data: populatedRecord,
          message: 'Financial record created successfully',
        }, { status: 201 });
      } catch (error) {
        console.error('Error creating financial record:', error);
        return NextResponse.json(
          { error: 'Failed to create financial record' },
          { status: 500 }
        );
      }
    }
  );
}