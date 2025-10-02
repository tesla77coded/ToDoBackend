import fs from 'fs';
import path from 'path';
import winston from 'winston';

const { combine, timestamp, errors, json } = winston.format;

const isProd = process.env.NODE_ENV === 'production';

// ensure logs folder exists in non-prod
if (!isProd) {
  const logsDir = path.resolve(process.cwd(), 'logs');
  try {
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  } catch (err) {
    console.warn('Could not create logs directory:', err.message);
  }
}

const transports = [
  // Console transport always active 
  new winston.transports.Console({
    stderrLevels: ['error'],
    handleExceptions: true,
  }),
];

// Add file transports only in non-production (dev/test)
if (!isProd) {
  transports.push(
    new winston.transports.File({ filename: 'logs/error.log', level: 'error', handleExceptions: true }),
    new winston.transports.File({ filename: 'logs/combined.log', handleExceptions: true })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    errors({ stack: true }), // captures stack trace in error objects
    json()
  ),
  transports,
  exitOnError: false,
});

export default logger;
