/* eslint-disable prefer-const */
import mongoose, { Mongoose } from "mongoose";

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  var mongoose: MongooseCache;
}

const MONGODB_URI: string = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Veuillez définir la variable MONGODB_URI dans .env.local");
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectToDatabase(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("Connecté à MongoDB");
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;
