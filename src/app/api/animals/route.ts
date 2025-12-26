import { NextRequest, NextResponse } from 'next/server';
import { Session } from 'next-auth';
// import mongoose from 'mongoose'; // Not currently used
import { withAuth } from '../../../middleware/auth';
import connectDB from '../../../lib/mongodb';
import Animal from '../../../models/Animal';
import {
  validateWithSchema,
  CreateAnimalSchema,
  validatePagination,
  sanitizeString,
  sanitizeSearchTerm,
  checkRateLimit
} from '../../../utils/validation';
import { ZodIssue } from 'zod';

// GET /api/animals - Get all animals for the authenticated user's tenant
export async function GET(request: NextRequest) {
  return withAuth(
    request,
    async (_request: NextRequest, session: Session | null) => {
      // For demo purposes, use default tenant if no session
      const tenantId = session?.user?.tenantId || 'demo-farm';
      const clientIP = request.headers.get('x-forwarded-for') || 'unknown';

      try {
        // Check rate limiting
        const rateLimit = checkRateLimit(`animals:get:${clientIP}`, 1000, 60 * 60 * 1000); // 1000 requests per hour
        if (!rateLimit.allowed) {
          return NextResponse.json(
            {
              error: 'Rate limit exceeded',
              resetTime: rateLimit.resetTime,
              retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
            },
            { status: 429 }
          );
        }

        // Connect to database once per request
        await connectDB();

        const { searchParams } = new URL(request.url);

        // Validate and sanitize pagination parameters
        const pageParam = searchParams.get('page');
        const limitParam = searchParams.get('limit');
        const tenantIdParam = searchParams.get('tenantId');

        const page = pageParam ? Math.max(1, parseInt(pageParam)) : 1;
        const limit = limitParam ? Math.min(1000, Math.max(1, parseInt(limitParam))) : 48;
        const species = searchParams.get('species');
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        // Use tenantId from query params if provided, otherwise use session
        const tenantId = tenantIdParam || session?.user?.tenantId || 'demo-farm';

        // Validate and sanitize filter parameters
        const validSpecies = ['cattle', 'sheep', 'goats', 'poultry', 'pigs', 'other'];
        const validStatuses = ['active', 'sold', 'deceased', 'quarantined', 'breeding'];

        if (species && !validSpecies.includes(species)) {
          return NextResponse.json(
            { error: 'Invalid species parameter' },
            { status: 400 }
          );
        }

        if (status && !validStatuses.includes(status)) {
          return NextResponse.json(
            { error: 'Invalid status parameter' },
            { status: 400 }
          );
        }

        const sanitizedSearch = search ? sanitizeSearchTerm(search) : null;

        const skip = (page - 1) * limit;

        // Validate pagination parameters are reasonable
        if (page < 1 || page > 1000 || limit < 1 || limit > 1000) {
          return NextResponse.json(
            { error: 'Invalid pagination parameters' },
            { status: 400 }
          );
        }

        // Build filter - use demo tenant for demo purposes
        const filter: Record<string, unknown> = { tenantId };

        if (species) {
          filter.species = sanitizeString(species);
        }

        if (status) {
          filter.status = sanitizeString(status);
        }

        if (sanitizedSearch) {
          filter.$or = [
            { name: { $regex: sanitizedSearch, $options: 'i' } },
            { rfidTag: { $regex: sanitizedSearch, $options: 'i' } },
            { breed: { $regex: sanitizedSearch, $options: 'i' } },
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
    },
    { allowPublic: true }
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

      const clientIP = request.headers.get('x-forwarded-for') || 'unknown';

      // Check rate limiting for POST requests (more restrictive)
      const rateLimit = checkRateLimit(`animals:post:${clientIP}`, 20, 60 * 60 * 1000); // 20 requests per hour
      if (!rateLimit.allowed) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded for create operations',
            resetTime: rateLimit.resetTime,
            retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
          },
          { status: 429 }
        );
      }

      try {
        await connectDB();

        const body = await request.json();

        // Validate request body using Zod schema
        const validation = validateWithSchema(CreateAnimalSchema, body);
        if (!validation.success) {
          return NextResponse.json(
            {
              error: 'Validation failed',
              details: validation.errors.issues.map((issue: ZodIssue) => ({
                field: issue.path.join('.'),
                message: issue.message
              }))
            },
            { status: 400 }
          );
        }

        const animalData = validation.data;

        // Create new animal - use demo user for demo purposes
        const userId = session?.user?.id || 'demo-user';
        const tenantId = session?.user?.tenantId || 'demo-farm';

        // Check animal limit (50 animals max for free tier)
        const currentAnimalCount = await Animal.countDocuments({ tenantId });
        if (currentAnimalCount >= 50) {
          return NextResponse.json(
            {
              error: 'Animal limit reached',
              message: 'You have reached the maximum of 50 animals for the free tier. Please upgrade to the Pro tier to add more animals.',
              upgradeRequired: true,
              currentCount: currentAnimalCount,
              limit: 50
            },
            { status: 403 }
          );
        }

        const finalAnimalData = {
          ...animalData,
          tenantId,
          createdBy: userId,
          updatedBy: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Create new animal using Mongoose model
        const animal = new Animal(finalAnimalData);
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
    },
    { allowPublic: true }
  );
}