import mongoose from "mongoose";

const MONGODB_URI: string = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

/**
 * Extend globalThis to include mongoose caching.
 */
declare global {
  // Extend NodeJS global type to include mongoose
  namespace NodeJS {
    interface Global {
      mongoose?: {
        conn: mongoose.Mongoose | null;
        promise: Promise<mongoose.Mongoose> | null;
      };
    }
  }
}

const globalWithMongoose = global as NodeJS.Global;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
globalWithMongoose.mongoose = globalWithMongoose.mongoose || {
  conn: null,
  promise: null,
};

const cached = globalWithMongoose.mongoose;

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
