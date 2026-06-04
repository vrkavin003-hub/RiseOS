import mongoose from 'mongoose';
import { env } from './env.js';

let connectionPromise = null;

export async function connectDB() {
  if (!env.mongoUri) {
    console.warn('MONGO_URI is missing. Server started without a database connection.');
    return null;
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  mongoose.set('autoIndex', env.nodeEnv !== 'production');
  mongoose.set('strictQuery', true);

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(env.mongoUri)
      .then((connection) => {
        console.log(`MongoDB connected: ${connection.connection.host}`);
        return connection;
      })
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  return connectionPromise;
}
