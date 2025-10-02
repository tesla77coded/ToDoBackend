import { body, param } from 'express-validator';
import mongoose from 'mongoose';

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

// Register
export const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

// Login
export const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Update
export const updateValidator = [
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email must be valid'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

// ID param
export const idParamValidator = [
  param('id')
    .custom((val) => isValidObjectId(val))
    .withMessage('Invalid user ID'),
];
