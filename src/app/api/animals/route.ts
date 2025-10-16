import { NextRequest, NextResponse } from 'next/server';
import { Session } from 'next-auth';
import mongoose from 'mongoose';
import { withAuth } from '../../../middleware/auth';
import connectDB from '../../../lib/mongodb';
import Animal from '../../../models/Animal';

// GET /api/animals - Get all animals for the authenticated user's tenant
export async function GET(request: NextRequest) {
  return withAuth(
    request,
    async (_request: NextRequest, session: Session | null) => {
      // For demo purposes, use default tenant if no session
      const tenantId = session?.user?.tenantId || 'demo-farm';
      try {
        // Connect to database once per request
        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const species = searchParams.get('species');
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        const skip = (page - 1) * limit;

        // Build filter - use demo tenant for demo purposes
        const filter: Record<string, unknown> = { tenantId };

        if (species) {
          filter.species = species;
        }

        if (status) {
          filter.status = status;
        }

        if (search) {
          filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { rfidTag: { $regex: search, $options: 'i' } },
            { breed: { $regex: search, $options: 'i' } },
          ];
        }

        const animals = await Animal.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean();

        const total = await Animal.countDocuments(filter);

        return NextResponse.json({
          success: true,
          data: animals,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        });
      } catch (error) {
        console.error('Error fetching animals:', error);
        return NextResponse.json(
          { error: 'Failed to fetch animals' },
          { status: 500 }
        );
      }
    }
  );
}

// POST /api/animals - Create a new animal
export async function POST(request: NextRequest) {
  return withAuth(
    request,
    async (_request: NextRequest, session: Session | null) => {
      // Additional permission check for write operations
      if (session?.user?.role && !['admin', 'manager', 'veterinarian', 'worker'].includes(session.user.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions to create animals' },
          { status: 403 }
        );
      }
      try {
        await connectDB();

        const body = await request.json();

        // Validate required fields
        const requiredFields = ['species', 'breed', 'dateOfBirth', 'gender', 'color', 'weight', 'location'];
        for (const field of requiredFields) {
          if (!body[field]) {
            return NextResponse.json(
              { error: `${field} is required` },
              { status: 400 }
            );
          }
        }

        // Create new animal - use demo user for demo purposes
        const userId = session?.user?.id || 'demo-user';
        const tenantId = session?.user?.tenantId || 'demo-farm';

        const animalData = {
          ...body,
          tenantId,
          createdBy: userId,
          updatedBy: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Create new animal using Mongoose model
        const animal = new Animal(animalData);
        const savedAnimal = await animal.save();

        return NextResponse.json({
          success: true,
          data: savedAnimal,
          message: 'Animal created successfully',
        }, { status: 201 });
      } catch (error: unknown) {
        console.error('Error creating animal:', error);

        // Handle duplicate RFID tag error
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
          return NextResponse.json(
            { error: 'RFID tag already exists' },
            { status: 400 }
          );
        }

        return NextResponse.json(
          { error: 'Failed to create animal' },
          { status: 500 }
        );
      }
    }
  );
}