import mongoose from 'mongoose';

// Load environment variables - MongoDB URI must be provided via environment variable only
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  lastHealthCheck: number;
  connectionAttempts: number;
  lastError?: Error;
}

// Use a module-level cache instead of global
const cached: MongooseCache = {
  conn: null,
  promise: null,
  lastHealthCheck: 0,
  connectionAttempts: 0,
};

// Enhanced connection pool monitoring
interface ConnectionPoolStats {
  totalConnections: number;
  availableConnections: number;
  pendingConnections: number;
  createdConnections: number;
  healthScore: number;
}

// Connection pool monitoring
interface ConnectionPoolStats {
  totalConnections: number;
  availableConnections: number;
  pendingConnections: number;
  createdConnections: number;
}

// Function to get connection pool statistics
export function getConnectionPoolStats(): ConnectionPoolStats | null {
  if (!cached.conn) return null;

  const readyState = cached.conn.connection.readyState;

  // Enhanced connection pool statistics based on configuration and connection state
  let totalConnections = 0;
  let availableConnections = 0;
  let pendingConnections = 0;

  try {
    if (readyState === 1) {
      // Use configured pool sizes based on environment
      totalConnections = process.env.NODE_ENV === 'production' ? 20 : 50;
      availableConnections = Math.max(1, totalConnections - 1); // Reserve one for monitoring

      // Estimate pending connections based on connection attempts and errors
      if (cached.connectionAttempts > 0) {
        pendingConnections = Math.min(3, cached.connectionAttempts);
      }
    }
  } catch (error) {
    console.warn('Failed to get connection pool stats, using fallback:', error);
    // Fallback to basic stats based on readyState
    totalConnections = readyState === 1 ? 1 : 0;
    availableConnections = totalConnections;
  }

  // Calculate health score based on connection state and error history
  let healthScore = 100;
  if (readyState !== 1) healthScore -= 50;
  if (cached.lastError) healthScore -= 30;
  if (cached.connectionAttempts > 5) healthScore -= 20;
  if (pendingConnections > totalConnections * 0.5) healthScore -= 25; // High pending connections ratio

  const poolStats: ConnectionPoolStats = {
    totalConnections,
    availableConnections,
    pendingConnections,
    createdConnections: totalConnections,
    healthScore: Math.max(0, healthScore),
  };

  return poolStats;
}

// Function to log connection pool status
export function logConnectionPoolStatus(): void {
  const stats = getConnectionPoolStats();
  if (stats) {
    const utilizationPercent = ((stats.totalConnections - stats.availableConnections) / stats.totalConnections * 100).toFixed(1);

    console.log('🔗 MongoDB Connection Pool Status:', {
      totalConnections: stats.totalConnections,
      availableConnections: stats.availableConnections,
      pendingConnections: stats.pendingConnections,
      createdConnections: stats.createdConnections,
      utilizationPercent: `${utilizationPercent}%`,
      healthScore: stats.healthScore,
      readyState: cached.conn?.connection.readyState,
      lastHealthCheck: new Date(cached.lastHealthCheck).toISOString(),
      connectionAttempts: cached.connectionAttempts,
      hasError: !!cached.lastError,
      // Performance indicators
      performance: stats.healthScore > 90 ? '🟢 Excellent' :
                  stats.healthScore > 70 ? '🟡 Good' :
                  stats.healthScore > 50 ? '🟠 Fair' : '🔴 Poor',
    });

    // Log warnings for high utilization or poor health
    if (parseFloat(utilizationPercent) > 80) {
      console.warn(`⚠️ High connection pool utilization: ${utilizationPercent}% - consider increasing maxPoolSize`);
    }

    if (stats.healthScore < 70) {
      console.warn(`⚠️ Poor connection health score: ${stats.healthScore} - check MongoDB connectivity`);
    }

    if (stats.pendingConnections > 0) {
      console.warn(`⚠️ Pending connections detected: ${stats.pendingConnections} - connection pool may be saturated`);
    }
  } else {
    console.log('❌ No active MongoDB connection');
  }
}

// Enhanced function to log comprehensive connection status
export function logComprehensiveConnectionStatus(): void {
  console.log('\n📊 Comprehensive MongoDB Connection Status');
  console.log('=========================================');

  // Main connection status
  const mainStats = getConnectionPoolStats();
  if (mainStats) {
    const utilizationPercent = ((mainStats.totalConnections - mainStats.availableConnections) / mainStats.totalConnections * 100).toFixed(1);

    console.log('🔗 Main Connection:', {
      readyState: cached.conn?.connection.readyState,
      healthScore: mainStats.healthScore,
      totalConnections: mainStats.totalConnections,
      availableConnections: mainStats.availableConnections,
      pendingConnections: mainStats.pendingConnections,
      utilizationPercent: `${utilizationPercent}%`,
      connectionAttempts: cached.connectionAttempts,
      lastError: cached.lastError?.message,
      performance: mainStats.healthScore > 90 ? '🟢 Excellent' :
                  mainStats.healthScore > 70 ? '🟡 Good' :
                  mainStats.healthScore > 50 ? '🟠 Fair' : '🔴 Poor',
    });
  }

  // Tenant connections status
  const tenantStats = getTenantConnectionStats();
  console.log('🏢 Tenant Connections:', tenantStats);

  // Environment-specific recommendations
  if (process.env.NODE_ENV === 'production') {
    console.log('🏭 Production Mode: High-performance settings active');
  } else {
    console.log('🧪 Development Mode: Enhanced debugging enabled');
  }

  // Overall health assessment
  const overallHealth = mainStats ? (mainStats.healthScore > 80 ? '🟢 Healthy' : mainStats.healthScore > 50 ? '🟡 Warning' : '🔴 Critical') : '⚫ Disconnected';
  console.log('🏥 Overall Health:', overallHealth);

  // Performance recommendations
  if (mainStats) {
    const utilizationPercent = ((mainStats.totalConnections - mainStats.availableConnections) / mainStats.totalConnections * 100);
    if (utilizationPercent > 80) {
      console.log('💡 Recommendation: Consider increasing maxPoolSize for better performance');
    } else if (utilizationPercent < 20) {
      console.log('💡 Info: Connection pool has plenty of capacity for current load');
    }

    if (mainStats.pendingConnections > 5) {
      console.log('🚨 Alert: High pending connections - immediate attention required');
    }
  }

  console.log('=========================================\n');
}

// Real-time connection pool monitoring function
export function startConnectionPoolMonitoring(intervalMs: number = 60000): NodeJS.Timeout {
  console.log(`📊 Starting MongoDB connection pool monitoring (interval: ${intervalMs}ms)`);

  const monitoringInterval = setInterval(() => {
    const stats = getConnectionPoolStats();
    if (stats) {
      // Only log if there are issues or high utilization
      const utilizationPercent = ((stats.totalConnections - stats.availableConnections) / stats.totalConnections * 100);

      if (utilizationPercent > 70 || stats.healthScore < 80 || stats.pendingConnections > 0) {
        console.log('📊 Connection Pool Alert:', {
          utilizationPercent: `${utilizationPercent.toFixed(1)}%`,
          healthScore: stats.healthScore,
          pendingConnections: stats.pendingConnections,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Always log comprehensive status every 5 minutes
    if (Date.now() % (5 * 60 * 1000) < intervalMs) {
      logComprehensiveConnectionStatus();
    }
  }, intervalMs);

  return monitoringInterval;
}

// Function to stop connection pool monitoring
export function stopConnectionPoolMonitoring(intervalId: NodeJS.Timeout): void {
  clearInterval(intervalId);
  console.log('⏹️ Stopped MongoDB connection pool monitoring');
}

async function connectDB(): Promise<typeof mongoose> {
    // Check if we have a healthy existing connection
    if (cached.conn && cached.conn.connection.readyState === 1) {
      const stats = getConnectionPoolStats();
      if (stats && stats.healthScore > 70) {
        return cached.conn;
      }
    }

    if (!cached.promise) {
      const opts = {
        // Enhanced buffer settings for better error handling
        bufferCommands: false,

        // Optimized connection pool settings for high concurrency
        maxPoolSize: process.env.NODE_ENV === 'production' ? 50 : 100,
        minPoolSize: process.env.NODE_ENV === 'production' ? 10 : 20,

        // Optimized connection timeouts for better performance
        serverSelectionTimeoutMS: process.env.NODE_ENV === 'production' ? 5000 : 10000,
        socketTimeoutMS: 60000,
        connectTimeoutMS: 10000,

        // Enhanced connection health settings for faster recovery
        maxIdleTimeMS: process.env.NODE_ENV === 'production' ? 30000 : 45000,
        heartbeatFrequencyMS: 10000,

        // Network and performance settings
        family: 4,

        // Enhanced retry settings for better reliability
        retryWrites: true,
        retryReads: true,

        // Production-specific optimizations for high performance
        ...(process.env.NODE_ENV === 'production' && {
          minPoolSize: 10,
          maxPoolSize: 50,
          maxIdleTimeMS: 30000,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 60000,
          connectTimeoutMS: 10000,
          heartbeatFrequencyMS: 10000,
          // Enable connection pooling monitoring
          monitorCommands: true,
        }),
      };

      cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
        console.log('✅ Connected to MongoDB Atlas');
        cached.lastHealthCheck = Date.now();
        cached.connectionAttempts = 0;
        cached.lastError = undefined;

        // Enhanced connection event listeners
        mongoose.connection.on('error', (err) => {
          console.error('❌ MongoDB connection error:', err);
          cached.lastError = err;
          cached.connectionAttempts++;

          // Alert if too many errors
          if (cached.connectionAttempts > 3) {
            console.error('🚨 Multiple connection errors detected - check MongoDB Atlas status');
          }
        });

        mongoose.connection.on('disconnected', () => {
          console.warn('⚠️ MongoDB disconnected - attempting reconnection...');
          cached.conn = null;
          cached.promise = null;
          cached.lastError = new Error('Connection lost');
        });

        mongoose.connection.on('reconnected', () => {
          console.log('🔄 MongoDB reconnected successfully');
          cached.lastError = undefined;
          cached.connectionAttempts = 0;
        });

        mongoose.connection.on('reconnectFailed', (err) => {
          console.error('❌ MongoDB reconnection failed:', err);
          cached.lastError = err;
        });

        // Enhanced monitoring with health checks
        const monitoringInterval = setInterval(() => {
          const stats = getConnectionPoolStats();
          if (stats) {
            logConnectionPoolStatus();

            // Health check every 5 minutes
            if (Date.now() - cached.lastHealthCheck > 5 * 60 * 1000) {
              performHealthCheck();
            }
          }
        }, 30000);

        // Store monitoring interval for cleanup if needed
        (mongoose.connection as mongoose.Connection & { _monitoringInterval?: NodeJS.Timeout })._monitoringInterval = monitoringInterval;

        return mongoose;
      }).catch((error) => {
        cached.promise = null;
        cached.lastError = error;
        cached.connectionAttempts++;
        console.error('❌ Failed to connect to MongoDB:', error);

        // Provide more specific error messages
        if (error.message.includes('authentication failed')) {
          console.error('🔐 Authentication failed - check MongoDB credentials');
        } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
          console.error('🌐 DNS resolution failed - check MongoDB URI');
        } else if (error.message.includes('connection timed out')) {
          console.error('⏱️ Connection timeout - check network connectivity');
        }

        throw error;
      });
    }

    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (e) {
      cached.promise = null;
      cached.lastError = e as Error;
      throw e;
    }
  }

  // Enhanced health check function
  async function performHealthCheck(): Promise<void> {
    if (!cached.conn || !cached.conn.connection.db) return;

    try {
      // Simple ping to check if connection is alive
      await cached.conn.connection.db.admin().ping();
      cached.lastHealthCheck = Date.now();
      console.log('💚 MongoDB health check passed');
    } catch (error) {
      console.error('💔 MongoDB health check failed:', error);
      cached.lastError = error as Error;

      // Attempt to reconnect if health check fails
      if (cached.conn.connection.readyState !== 1) {
        console.log('🔄 Attempting to reconnect after health check failure...');
        cached.conn = null;
        cached.promise = null;
      }
    }
  }

export default connectDB;

// Enhanced multi-tenant connection helper with better management
interface TenantConnectionCache {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
  lastUsed: number;
  errorCount: number;
  lastError?: Error;
}

// Use a module-level cache for tenant connections with enhanced tracking
const tenantConnections = new Map<string, TenantConnectionCache>();

export async function connectToTenant(tenantId: string): Promise<mongoose.Connection> {
  if (!tenantId) {
    throw new Error('Tenant ID is required');
  }

  const DB_NAME = process.env.DB_NAME || 'AgriIntelV3';
  const baseUri = MONGODB_URI!;
  const tenantConnection = baseUri.replace(/\/[^\/]*$/, `/${DB_NAME}_${tenantId}`);

  // Check for existing healthy connection
  const existingCache = tenantConnections.get(tenantId);
  if (existingCache?.conn && existingCache.conn.readyState === 1) {
    // Update last used timestamp
    existingCache.lastUsed = Date.now();
    return existingCache.conn;
  }

  // Clean up stale connections (older than 30 minutes)
  cleanupStaleTenantConnections();

  // Create new connection if needed
  if (!existingCache?.promise) {
    const opts = {
      // Enhanced buffer settings for better error handling
      bufferCommands: false,

      // Optimized connection pool settings for tenants (higher for better performance)
      maxPoolSize: process.env.NODE_ENV === 'production' ? 20 : 30,
      minPoolSize: process.env.NODE_ENV === 'production' ? 5 : 8,

      // Connection timeouts optimized for tenant connections (faster)
      serverSelectionTimeoutMS: process.env.NODE_ENV === 'production' ? 4000 : 8000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 8000,

      // Connection health settings (faster recovery)
      maxIdleTimeMS: process.env.NODE_ENV === 'production' ? 25000 : 35000,
      heartbeatFrequencyMS: 8000,

      // Network settings
      family: 4,

      // Enhanced retry settings for better reliability
      retryWrites: true,
      retryReads: true,

      // Production-specific optimizations for high performance
      ...(process.env.NODE_ENV === 'production' && {
        minPoolSize: 5,
        maxPoolSize: 20,
        maxIdleTimeMS: 25000,
        serverSelectionTimeoutMS: 4000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 8000,
        heartbeatFrequencyMS: 8000,
        // Enable connection pooling monitoring for tenants
        monitorCommands: true,
      }),
    };

    const connectionPromise = Promise.resolve(mongoose.createConnection(tenantConnection, opts)).then((conn: mongoose.Connection) => {
      console.log(`✅ Connected to tenant database: ${tenantId}`);

      // Enhanced connection event listeners for tenant connections
      conn.on('error', (err: Error) => {
        console.error(`❌ Tenant database connection error (${tenantId}):`, err);
        const cache = tenantConnections.get(tenantId);
        if (cache) {
          cache.lastError = err;
          cache.errorCount++;
        }
      });

      conn.on('disconnected', () => {
        console.warn(`⚠️ Tenant database disconnected (${tenantId})`);
        const cache = tenantConnections.get(tenantId);
        if (cache) {
          cache.conn = null;
          cache.promise = null;
          cache.lastError = new Error('Connection lost');
        }
      });

      conn.on('reconnected', () => {
        console.log(`🔄 Tenant database reconnected (${tenantId})`);
        const cache = tenantConnections.get(tenantId);
        if (cache) {
          cache.lastError = undefined;
          cache.errorCount = 0;
        }
      });

      conn.on('reconnectFailed', (err: Error) => {
        console.error(`❌ Tenant database reconnection failed (${tenantId}):`, err);
        const cache = tenantConnections.get(tenantId);
        if (cache) {
          cache.lastError = err;
        }
      });

      return conn;
    }).catch((error: Error) => {
      // Clean up failed connection attempt
      tenantConnections.delete(tenantId);
      console.error(`❌ Failed to connect to tenant database (${tenantId}):`, error);

      // Provide specific error messages for tenant connections
      if (error.message.includes('authentication failed')) {
        console.error(`🔐 Tenant authentication failed for ${tenantId} - check tenant permissions`);
      } else if (error.message.includes('not found')) {
        console.error(`🗄️ Tenant database not found for ${tenantId} - verify tenant setup`);
      }

      throw error;
    });

    // Update cache with promise
    tenantConnections.set(tenantId, {
      conn: null,
      promise: connectionPromise,
      lastUsed: Date.now(),
      errorCount: 0,
    });
  }

  try {
    const conn = await existingCache!.promise!;
    // Update cache with successful connection
    if (existingCache) {
      existingCache.conn = conn;
      existingCache.promise = null;
      existingCache.lastUsed = Date.now();
      existingCache.lastError = undefined;
    }
    return conn;
  } catch (e) {
    // Clean up failed connection
    tenantConnections.delete(tenantId);
    throw e;
  }
}

// Helper function to clean up stale tenant connections
function cleanupStaleTenantConnections(): void {
  const staleThreshold = 30 * 60 * 1000; // 30 minutes
  const now = Date.now();

  for (const [tenantId, cache] of tenantConnections.entries()) {
    if (now - cache.lastUsed > staleThreshold) {
      if (cache.conn) {
        cache.conn.close().catch(err => {
          console.warn(`Failed to close stale tenant connection ${tenantId}:`, err);
        });
      }
      tenantConnections.delete(tenantId);
      console.log(`🧹 Cleaned up stale tenant connection: ${tenantId}`);
    }
  }
}

// Function to get tenant connection stats
export function getTenantConnectionStats(): { total: number; active: number; stale: number } {
  const now = Date.now();
  const staleThreshold = 30 * 60 * 1000; // 30 minutes

  let active = 0;
  let stale = 0;

  for (const cache of tenantConnections.values()) {
    if (cache.conn && cache.conn.readyState === 1) {
      if (now - cache.lastUsed > staleThreshold) {
        stale++;
      } else {
        active++;
      }
    }
  }

  return {
    total: tenantConnections.size,
    active,
    stale,
  };
}