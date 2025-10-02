import redis from './redis.js';
import { taskKey, tasksListKey } from './cacheKeys.js';
import { delPattern } from './scan-delete.js';
import logger from './logger.js';

const DEFAULT_TTL = Number(process.env.CACHE_TTL) || 60;

export const get = async (key) => {
  if (!key) return null;
  try {
    const raw = await redis.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    logger.warn('Redis get failed', { key, message: err.message });
    return null;
  }
};

export const set = async (key, value, ttl = DEFAULT_TTL) => {
  if (!key) return;
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
  } catch (err) {
    logger.warn('Redis set failed', { key, message: err.message });
  }
};

//Invalidate caches for an owner.
//deletes single task key if taskId provided
//deletes all list keys for owner via SCAN - based delPattern
export const invalidateForOwner = async (owner, taskId = null) => {
  if (!owner) return;
  try {
    if (taskId) {
      await redis.del(taskKey(taskId));
    }
    await delPattern(`tasks:list:${owner}:*`);
  } catch (err) {
    logger.error('Cache invalidation failed', { owner, taskId, message: err.message });
  }
};

export const keys = {
  taskKey,
  tasksListKey
};
