import { validationResult } from 'express-validator';

export default function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map(err => ({
      message: err.msg,
      path: err.param
    }));
    return res.status(400).json({ error: 'Validation failed', details });
  }
  next();
}
