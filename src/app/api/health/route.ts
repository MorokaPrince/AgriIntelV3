import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';

// Simple health check endpoint
export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    await connectDB();
    
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Check memory usage
    const memoryUsage = process.memoryUsage();
    
    // Check uptime
    const uptime = process.uptime();
    
    // Check environment
    const environment = process.env.NODE_ENV || 'development';
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        port: mongoose.connection.port
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: `${Math.floor(uptime / 60)} minutes`,
        memory: {
          used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
          total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
        }
      },
      application: {
        environment,
        version: process.env.npm_package_version || '0.1.0',
        buildTime: new Date().toISOString()
      },
      checks: {
        database: dbStatus === 'connected',
        memory: memoryUsage.heapUsed < 500 * 1024 * 1024, // Less than 500MB
        uptime: uptime > 60 // More than 1 minute
      }
    };

    // Determine overall health status
    const isHealthy = Object.values(healthData.checks).every(check => check === true);
    
    return NextResponse.json(healthData, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      checks: {
        database: false,
        memory: false,
        uptime: false
      }
    };

    return NextResponse.json(errorResponse, { status: 503 });
  }
}

// Database connection test endpoint
export async function POST(request: NextRequest) {
  try {
    // Test database connection
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || '');
    }
    
    // Test a simple operation
    const collections = mongoose.connection.db ? 
      await mongoose.connection.db.listCollections().toArray() : [];
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection test passed',
      collections: collections.length,
      collectionNames: collections.map(c => c.name)
    });
  } catch (error) {
    console.error('Database test failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Database connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}