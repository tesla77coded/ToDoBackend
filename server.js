import 'express-async-errors';
import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import connectDB from './src/db.js';
import logger from './src/utils/logger.js';

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`Server running on port: ${PORT}`);
      console.log(`Server running on port: ${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start server.', {message: err.message, stack: err.stack});
    process.exit(1);
  }
};

start();
