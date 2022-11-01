import express from 'express';
require('dotenv').config();

import logger from './utils/logger';
import { connectDB, disconnectDB } from './utils/database';

const app = express();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  await connectDB();
  logger.info(`App is running on port ${PORT}`);
});

const signals = ['SIGTERM', 'SIGINT'];

// shutdown server based on signals
function gracefulShutdown(signal: string) {
  process.on(signal, async () => {
    server.close();

    // disconnect from the DB
    await disconnectDB();

    logger.info('My work here is done...');

    process.exit(0);
  });
}

for (let i = 0; i < signals.length; i++) {
  gracefulShutdown(signals[i]);
}
