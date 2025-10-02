import IORedis from 'ioredis';
import logger from './logger.js';

const opts = {
  // parse REDIS_URL like: redis://:password@host:port or rediss://...
  maxRetriesPerRequest: 3,
  connectTimeout: 10000,
  retryStrategy: (times) => Math.min(50 + times * 50, 2000), // ms
  lazyConnect: false,
  enableOfflineQueue: true,
  // if your provider requires TLS, set tls: {} or include rediss:// in REDIS_URL
};

const REDIS_CONNECTION_STRING = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redis = new IORedis(REDIS_CONNECTION_STRING, opts);
console.log(`Redis now initialised at ${redis.options.host}:${redis.options.port}`);

redis.on('ready', () => logger.info('Redis ready'));
redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.error('Redis error', { message: err.message, stack: err.stack }));
redis.on('close', () => logger.warn('Redis connection closed'));

export default redis;
