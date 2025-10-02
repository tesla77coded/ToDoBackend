import express from 'express';
import * as taskCtrl from '../controllers/task.controller.js';
import {
  createTask,
  updateTask,
  taskIdParam,
  listQuery
} from '../validators/tasks.validator.js';
import { protect } from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validate.js';

const router = express.Router();

// All task routes require authentication
router.use(protect);

// Create a task
router.post('/', createTask, validateRequest, taskCtrl.createTask);

// List tasks (supports filters: status, q, archived, sort)
router.get('/', listQuery, validateRequest, taskCtrl.getTasks);

// Get single task
router.get('/:id', taskIdParam, validateRequest, taskCtrl.getTask);

// Update task
router.put('/:id', taskIdParam, updateTask, validateRequest, taskCtrl.updateTask);

// Archive (soft delete)
router.patch('/:id/archive', taskIdParam, validateRequest, taskCtrl.archiveTask);

// Hard delete
router.delete('/:id', taskIdParam, validateRequest, taskCtrl.deleteTask);

export default router;
