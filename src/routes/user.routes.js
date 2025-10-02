import express from 'express';
import * as userCtrl from '../controllers/user.controller.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validate.js';
import {
  registerValidator,
  loginValidator,
  updateValidator,
  idParamValidator
} from '../validators/users.validator.js';

const router = express.Router();

// Register and login
router.post('/register', registerValidator, validateRequest, userCtrl.register);
router.post('/login', loginValidator, validateRequest, userCtrl.login);

// Current user
router.get('/me', protect, userCtrl.currentUser);

// Allow self or admin to update user
const allowSelfOrAdmin = (req, res, next) => {
  const requesterId = String(req.user?.id);
  const paramId = String(req.params.id);

  if (!requesterId) return res.status(401).json({ error: 'Not authorized' });
  if (req.user.isAdmin || requesterId === paramId) return next();

  return res.status(403).json({ error: 'Forbidden: cannot update other users.' });
};

// Update profile (self or admin)
router.put(
  '/:id',
  protect,
  allowSelfOrAdmin,
  idParamValidator,
  updateValidator,
  validateRequest,
  userCtrl.updateUser
);

// Admin-only routes
router.get('/all', protect, admin, userCtrl.getAllUsers);
router.delete(
  '/:id',
  protect,
  admin,
  idParamValidator,
  validateRequest,
  userCtrl.deleteUserByAdmin
);

export default router;
