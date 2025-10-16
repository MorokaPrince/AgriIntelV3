import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Use a module-level cache instead of global
const cached: MongooseCache = {
  conn: null,
  promise: null,
};

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('✅ Connected to MongoDB Atlas');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;

// Multi-tenant connection helper
export async function connectToTenant(tenantId: string): Promise<mongoose.Connection> {
  const DB_NAME = process.env.DB_NAME || 'AgrIntelV4';
  const baseUri = MONGODB_URI!;
  const tenantConnection = baseUri.replace(/\/[^\/]*$/, `/${DB_NAME}_${tenantId}`);

  // Use a module-level cache for tenant connections
  const tenantConnections = new Map<string, mongoose.Connection>();

  if (tenantConnections.has(tenantId)) {
    return tenantConnections.get(tenantId)!;
  }

  const opts = {
    bufferCommands: false,
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
  };

  try {
    const conn = await mongoose.createConnection(tenantConnection, opts);
    console.log(`✅ Connected to tenant database: ${tenantId}`);
    tenantConnections.set(tenantId, conn);
    return conn;
  } catch (e) {
    throw e;
  }
}