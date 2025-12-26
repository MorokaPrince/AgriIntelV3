import { NextRequest, NextResponse } from 'next/server';
import { Session } from 'next-auth';
import { withAuth } from '../../../middleware/auth';
import connectDB from '../../../lib/mongodb';
import Task from '../../../models/Task';

// GET /api/tasks - Get all tasks for the authenticated user's tenant
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
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const category = searchParams.get('category');
        const assignedTo = searchParams.get('assignedTo');

        const skip = (page - 1) * limit;

        if (status) {
          filter.status = status;
        }

        if (priority) {
          filter.priority = priority;
        }

        if (category) {
          filter.category = category;
        }

        if (assignedTo) {
          filter.assignedTo = assignedTo;
        }

        const tasks = await Task.find(filter)
          .sort({ dueDate: 1, priority: -1 })
          .skip(skip)
          .limit(limit);

        const total = await Task.countDocuments(filter);

        // Get task statistics
        const taskStats = await Task.aggregate([
          { $match: { tenantId } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              avgProgress: { $avg: '$progress' },
            },
          },
        ]);

        return NextResponse.json({
          success: true,
          data: tasks,
          stats: taskStats,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        });
      } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json(
          { error: 'Failed to fetch tasks' },
          { status: 500 }
        );
      }
    },
    { allowPublic: true }
  );
}

// POST /api/tasks - Create a new task
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
        const requiredFields = ['title', 'description', 'assignedTo', 'dueDate', 'category'];
        for (const field of requiredFields) {
          if (!body[field]) {
            return NextResponse.json(
              { error: `${field} is required` },
              { status: 400 }
            );
          }
        }

        // Create new task - use demo user for demo purposes
        const userId = session?.user?.id || 'demo-user';
        const tenantId = session?.user?.tenantId || 'demo-farm';

        const task = new Task({
          ...body,
          tenantId,
          assignedBy: userId,
        });

        const savedTask = await task.save();

        // Populate the saved task
        const populatedTask = await Task.findById(savedTask._id)
          .populate('assignedTo', 'firstName lastName')
          .populate('assignedBy', 'firstName lastName')
          .populate('animalId', 'name species');

        return NextResponse.json({
          success: true,
          data: populatedTask,
          message: 'Task created successfully',
        }, { status: 201 });
      } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json(
          { error: 'Failed to create task' },
          { status: 500 }
        );
      }
    },
    { allowPublic: true }
  );
}