import User from '../models/user.model.js';
import logger from '../utils/logger.js';
import generateToken from '../config/generateToken.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists.');
    }

    const user = await User.create({
      name, email, password
    });

    if (user) {
      const savedUser = await User.findById(user._id).select('-password');
      res.status(201).json({ message: 'User registered', user: savedUser });
    }

  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'Email already in use.' });
    }
    logger.error('Registeration error', { message: err.message, stack: err.stack });
    return next(err);
  }
};


export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (user && await user.comparePassword(password)) {
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin,
        token: generateToken(user._id)
      });
      console.log(`${user.name} logged in successfully.`);
    } else {
      res.status(401).json({
        error: 'Invalid credentials.'
      });
    }
  } catch (err) {
    logger.error('Login error', { message: err.message, stack: err.stack });
    return next(err);
  };
}

export const currentUser = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found.' });

    return res.json({ user });
  } catch (err) {
    logger.error('currentUser error', { message: err.message, stack: err.stack });
    return next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      if (req.body.password) {
        user.password = req.body.password;
      };

      if (typeof req.body.isAdmin !== 'undefined') {
        user.isAdmin = !!req.body.isAdmin;
      }

      const updatedUser = await user.save();

      return res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: !!updatedUser.isAdmin,
      });

    } else {
      res.status(404).json({ error: 'User not found.' });
    };
  } catch (err) {
    logger.error('updatedUser error', { message: err.message, stack: err.stack });
    return next(err);
  }
}

// admin access
export const getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await User.find({}).select('-password');
    res.status(200);
    return res.json({ allUsers });

  } catch (err) {
    logger.error('getAllUsers error', { message: err.message, stack: err.stack });
    return next(err);
  }
};


export const deleteUserByAdmin = async (req, res) => {
  try {
    const userIdToDelete = req.params.id;

    const user = await User.findById(userIdToDelete);

    if (!user) {
      res.status(404);
      throw new Error(`User ${req.params.id} not found.`);
    };

    // prevent admins to delete themselves
    if (req.params.id === user.id) {
      res.status(400).json({ error: 'Admins cannot delete themselves.' });
    };

    await User.deleteOne({ _id: userIdToDelete });

    res.status(200).json({ message: 'User deleted successfully.' });

  } catch (err) {
    logger.error('deleteUserByAdmin error', { message: err.message, stack: err.stack });
  }
};
