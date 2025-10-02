import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

// Create Task
export const createTask = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),
  body('dueDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Due date must be a valid date'),
  body('status')
    .optional()
    .isIn(['in-progress', 'done', 'expired'])
    .withMessage('Invalid status'),
  body('subtasks')
    .optional()
    .isArray()
    .withMessage('Subtasks must be an array'),
  body('subtasks.*.title')
    .optional()
    .isString()
    .withMessage('Subtask title must be a string'),
  body('subtasks.*.done')
    .optional()
    .isBoolean()
    .withMessage('Subtask done must be boolean'),
];

// Update Task
export const updateTask = [
  body('title')
    .optional()
    .isString()
    .withMessage('Title must be a string'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),
  body('dueDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Due date must be a valid date'),
  body('status')
    .optional()
    .isIn(['in-progress', 'done', 'expired'])
    .withMessage('Invalid status'),
  body('subtasks')
    .optional()
    .isArray()
    .withMessage('Subtasks must be an array'),
  body('subtasks.*.title')
    .optional()
    .isString()
    .withMessage('Subtask title must be a string'),
  body('subtasks.*.done')
    .optional()
    .isBoolean()
    .withMessage('Subtask done must be boolean'),
];

// Task ID param
export const taskIdParam = [
  param('id')
    .custom((value) => isValidObjectId(value))
    .withMessage('Invalid task ID'),
];

// Query params for list endpoint
export const listQuery = [
  query('status')
    .optional()
    .isIn(['in-progress', 'done', 'expired'])
    .withMessage('Invalid status filter'),
  query('archived')
    .optional()
    .isBoolean()
    .withMessage('Archived must be true/false'),
  query('q')
    .optional()
    .isString()
    .withMessage('Query must be a string'),
  query('sort')
    .optional()
    .matches(/^[a-zA-Z]+:(asc|desc)$/)
    .withMessage('Sort format must be field:asc|desc'),
];
