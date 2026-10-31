import mongoose from 'mongoose';
import { config } from './env.js';

export const connectDatabase = async () => {
  mongoose.set('strictQuery', true);
  const connection = await mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 10000,
    autoIndex: true,
  });
  console.log(`[MongoDB] Connected: ${connection.connection.name}`);
  return connection;
};

export const isDatabaseConnected = () => mongoose.connection.readyState === 1;

export const getDatabaseStatus = () => ({
  connected: isDatabaseConnected(),
  name: mongoose.connection.name,
});
