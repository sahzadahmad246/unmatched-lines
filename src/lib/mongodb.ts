// src/lib/mongodb.ts
import mongoose from "mongoose";
import { registerModels } from "@/models"; // Import model registration

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env");
}

interface Cached {
  mongoose?: {
    conn: mongoose.Mongoose | null;
    promise: Promise<mongoose.Mongoose> | null;
  };
}

const cached: Cached = global as Cached;

if (!cached.mongoose) {
  cached.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.mongoose?.conn) {
    
    return cached.mongoose.conn;
  }

  if (!cached.mongoose?.promise) {
    const opts = {
      bufferCommands: false,
    };

    
    cached.mongoose!.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      
      registerModels(); // Register all models
      return mongoose;
    });
  }

  try {
    cached.mongoose!.conn = await cached.mongoose!.promise;
   
    return cached.mongoose!.conn;
  } catch (error) {
  
    throw error;
  }
}

export default dbConnect;