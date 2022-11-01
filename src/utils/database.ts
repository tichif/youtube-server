import mongoose from 'mongoose';

import logger from './logger';

const MONGOOSE_CONNECTION_STRING = process.env.MONGO_URI || '';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGOOSE_CONNECTION_STRING);
    logger.info(`Database is connected: ${conn.connection.host}`);
  } catch (error: any) {
    logger.error(error, 'failed to connect to database');
    process.exit(0);
  }
};

export const disconnectDB = async () => {
  await mongoose.connection.close();
  logger.info('Disconnected from database');
  return;
};
