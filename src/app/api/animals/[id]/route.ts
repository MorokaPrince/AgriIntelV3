import { NextRequest, NextResponse } from 'next/server';
import { Session } from 'next-auth';
import { withAuth } from '../../../../middleware/auth';
import connectDB from '../../../../lib/mongodb';
import Animal from '../../../../models/Animal';

// GET /api/animals/[id] - Get a specific animal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;

        const animal = await Animal.findOne({
          _id: id,
          tenantId: session.user.tenantId,
        })
          .populate('createdBy', 'firstName lastName')
          .populate('updatedBy', 'firstName lastName');

        if (!animal) {
          return NextResponse.json(
            { error: 'Animal not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: animal,
        });
      } catch (error) {
        console.error('Error fetching animal:', error);
        return NextResponse.json(
          { error: 'Failed to fetch animal' },
          { status: 500 }
        );
      }
    }
  );
}

// PUT /api/animals/[id] - Update a specific animal
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;
        const body = await request.json();

        // Check if animal exists and belongs to user's tenant
        const existingAnimal = await Animal.findOne({
          _id: id,
          tenantId: session.user.tenantId,
        });

        if (!existingAnimal) {
          return NextResponse.json(
            { error: 'Animal not found' },
            { status: 404 }
          );
        }

        // Update animal
        const updatedAnimal = await Animal.findByIdAndUpdate(
          id,
          {
            ...body,
            updatedBy: session.user.id,
          },
          { new: true, runValidators: true }
        )
          .populate('createdBy', 'firstName lastName')
          .populate('updatedBy', 'firstName lastName');

        return NextResponse.json({
          success: true,
          data: updatedAnimal,
          message: 'Animal updated successfully',
        });
      } catch (error: unknown) {
        console.error('Error updating animal:', error);

        // Handle duplicate RFID tag error
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
          return NextResponse.json(
            { error: 'RFID tag already exists' },
            { status: 400 }
          );
        }

        return NextResponse.json(
          { error: 'Failed to update animal' },
          { status: 500 }
        );
      }
    }
  );
}

// DELETE /api/animals/[id] - Delete a specific animal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;

        // Check if animal exists and belongs to user's tenant
        const existingAnimal = await Animal.findOne({
          _id: id,
          tenantId: session.user.tenantId,
        });

        if (!existingAnimal) {
          return NextResponse.json(
            { error: 'Animal not found' },
            { status: 404 }
          );
        }

        // Delete animal
        await Animal.findByIdAndDelete(id);

        return NextResponse.json({
          success: true,
          message: 'Animal deleted successfully',
        });
      } catch (error) {
        console.error('Error deleting animal:', error);
        return NextResponse.json(
          { error: 'Failed to delete animal' },
          { status: 500 }
        );
      }
    }
  );
}