import mongoose from 'mongoose';
import { config } from './env.js';

let isDbConnected = false;

/**
 * Connects to MongoDB database with auto-fallback to resilient in-memory mode
 * @returns {Promise<boolean>}
 */
export const connectDatabase = async () => {
  if (isDbConnected) {
    return true;
  }

  try {
    mongoose.set('strictQuery', true);
    mongoose.set('bufferCommands', false);

    const connection = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 3000,
      autoIndex: config.nodeEnv !== 'production',
    });

    isDbConnected = connection.connection.readyState === 1;
    console.log(`🕉️ [MongoDB] Connected successfully to VedRiti Sanctum DB: ${connection.connection.name}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ [MongoDB] Connection to ${config.mongoUri} was not established: ${error.message}`);
    console.warn('ℹ️ [MongoDB] Server will operate in resilient mode with in-memory fallback.');
    return false;
  }
};

/**
 * Checks if active MongoDB connection is open
 * @returns {boolean}
 */
export const isDatabaseConnected = () => mongoose.connection.readyState === 1;

/**
 * Returns current database health status
 * @returns {{ connected: boolean, host?: string, name?: string }}
 */
export const getDatabaseStatus = () => {
  return {
    connected: isDatabaseConnected(),
    host: mongoose.connection.host,
    name: mongoose.connection.name,
  };
};

mongoose.connection.on('disconnected', () => {
  isDbConnected = false;
  console.log('📡 [MongoDB] Disconnected from database.');
});

mongoose.connection.on('reconnected', () => {
  isDbConnected = true;
  console.log('🕉️ [MongoDB] Reconnected to database.');
});
