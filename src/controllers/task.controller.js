import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import Task from '../models/task.model.js';
import * as cache from '../utils/cache.js';
import logger from '../utils/logger.js';

const CACHE_TTL = Number(process.env.CACHE_TTL) || 60;
const LIST_SAFETY_CAP = Number(process.env.LIST_SAFETY_CAP) || 1000;

// Validation helper
const handleValidation = (req, res) => {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    logger.warn('Validation failed', { errors: err.array(), path: req.originalUrl, user: req.user?.id });
    const details = err.array().map(e => ({ message: e.msg, param: e.param }));
    return res.status(400).json({ error: 'Validation failed', details });
  }
  return null;
};

//Create task
export const createTask = async (req, res) => {
  if (handleValidation(req, res)) return;
  try {
    const ownerIdStr = req.user?.id || req.user?._id;
    if (!ownerIdStr) return res.status(401).json({ error: 'Not authorized' });

    const payload = { ...req.body, owner: ownerIdStr };
    if (payload.status === 'done' && !payload.completedAt) payload.completedAt = new Date();

    const task = await Task.create(payload);

    // invalidate caches for this owner
    await cache.invalidateForOwner(ownerIdStr, task._id.toString());

    logger.info('Task created', { taskId: task._id.toString(), owner: ownerIdStr });
    return res.status(201).json(task);
  } catch (err) {
    logger.error('Error creating task', { message: err.message, stack: err.stack, user: req.user?.id });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

//GET Task
export const getTasks = async (req, res) => {
  if (handleValidation(req, res)) return;
  try {
    const ownerIdStr = req.user?.id || req.user?._id;
    if (!ownerIdStr) return res.status(401).json({ error: 'Not authorized' });

    const { status, archived = false, q = '', sort = 'createdAt:desc' } = req.query;

    // build DB filter
    const filter = { owner: new mongoose.Types.ObjectId(ownerIdStr) };
    filter.archived = archived === 'true' || archived === true;
    if (status) filter.status = status;
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { 'subtasks.title': { $regex: q, $options: 'i' } }
      ];
    }

    // parse sort param
    const [fieldRaw, orderRaw] = String(sort || 'createdAt:desc').split(':');
    const field = String(fieldRaw || 'createdAt');
    const order = (String(orderRaw || 'desc').toLowerCase() === 'asc') ? 1 : -1;
    const ALLOWED_SORT_FIELDS = new Set(['createdAt', 'dueDate', 'priority', 'completedAt', 'updatedAt', 'order']);
    const finalField = ALLOWED_SORT_FIELDS.has(field) ? field : 'createdAt';
    const sortObj = { [finalField]: order };

    // cache key 
    const key = cache.keys.tasksListKey({ owner: ownerIdStr, status, q, sort, archived });

    // Try cache first
    const cached = await cache.get(key);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }

    // Fetch from DB 
    const tasks = await Task.find(filter).sort(sortObj).limit(LIST_SAFETY_CAP);

    // Cache result 
    await cache.set(key, tasks, CACHE_TTL);

    res.setHeader('X-Cache', 'MISS');
    return res.json(tasks);

  } catch (err) {
    logger.error('Unhandled error in getTasks', { message: err.message, stack: err.stack, user: req.user?.id });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

//Get single task
export const getTask = async (req, res) => {

  if (handleValidation(req, res)) return;
  try {
    const ownerIdStr = req.user?.id || req.user?._id;
    if (!ownerIdStr) return res.status(401).json({ error: 'Not authorized' });
    const { id } = req.params;

    const key = cache.keys.taskKey(id);
    const cached = await cache.get(key);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }

    const task = await Task.findOne({ _id: id, owner: new mongoose.Types.ObjectId(ownerIdStr) });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    await cache.set(key, task, CACHE_TTL);
    res.setHeader('X-Cache', 'MISS');
    return res.json(task);

  } catch (err) {
    logger.error('Error fetching task', { message: err.message, stack: err.stack, user: req.user?.id });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Update task 
export const updateTask = async (req, res) => {
  if (handleValidation(req, res)) return;
  try {
    const ownerIdStr = req.user?.id || req.user?._id;
    if (!ownerIdStr) return res.status(401).json({ error: 'Not authorized' });
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.status === 'done') updates.completedAt = updates.completedAt || new Date();
    if (updates.status && updates.status !== 'done') updates.completedAt = null;

    const task = await Task.findOneAndUpdate(
      { _id: id, owner: new mongoose.Types.ObjectId(ownerIdStr) },
      { $set: updates },
      { new: true }
    );

    if (!task) return res.status(404).json({ error: 'Task not found' });

    // invalidate cache for owner & single task
    await cache.invalidateForOwner(ownerIdStr, id);

    logger.info('Task updated', { taskId: id, owner: ownerIdStr });
    return res.json(task);
  } catch (err) {
    logger.error('Error updating task', { message: err.message, stack: err.stack, user: req.user?.id });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

//archive task
export const archiveTask = async (req, res) => {
  if (handleValidation(req, res)) return;
  try {
    const ownerIdStr = req.user?.id || req.user?._id;
    if (!ownerIdStr) return res.status(401).json({ error: 'Not authorized' });
    const { id } = req.params;

    const task = await Task.findOneAndUpdate(
      { _id: id, owner: new mongoose.Types.ObjectId(ownerIdStr) },
      { $set: { archived: true } },
      { new: true }
    );

    if (!task) return res.status(404).json({ error: 'Task not found' });

    await cache.invalidateForOwner(ownerIdStr, id);

    logger.info('Task archived', { taskId: id, owner: ownerIdStr });
    return res.json(task);
  } catch (err) {
    logger.error('Error archiving task', { message: err.message, stack: err.stack, user: req.user?.id });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

//Delete task
export const deleteTask = async (req, res) => {
  if (handleValidation(req, res)) return;
  try {
    const ownerIdStr = req.user?.id || req.user?._id;
    if (!ownerIdStr) return res.status(401).json({ error: 'Not authorized' });
    const { id } = req.params;

    const task = await Task.findOneAndDelete({ _id: id, owner: new mongoose.Types.ObjectId(ownerIdStr) });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    await cache.invalidateForOwner(ownerIdStr, id);

    logger.info('Task deleted', { taskId: id, owner: ownerIdStr });
    return res.json({ message: 'Deleted' });
  } catch (err) {
    logger.error('Error deleting task', { message: err.message, stack: err.stack, user: req.user?.id });
    return res.status(500).json({ error: 'Internal server error' });
  }
};
