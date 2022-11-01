import express from 'express';
require('dotenv').config();
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';

import logger from './utils/logger';
import { connectDB, disconnectDB } from './utils/database';
import { CORS_ORIGIN } from './constants';
import userRoutes from './modules/user/user.route';

const app = express();

// middleware
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
app.use(helmet());

// routes
app.use('/api/users', userRoutes);

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
