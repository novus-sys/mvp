import express, { Request, Response, Router, RequestHandler } from 'express';
import { User } from '../models/User';
import { auth } from '../middleware/auth';

const router: Router = express.Router();

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: 'student' | 'researcher' | 'educator' | 'admin';
}

interface LoginRequest {
  email: string;
  password: string;
}

// Register a new user
const registerHandler: RequestHandler = async (req, res) => {
  try {
    const { email, password, name, role } = req.body as RegisterRequest;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      role: role || 'student',
    });

    await user.save();
    const token = user.generateAuthToken();

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(400).json({ error: 'Error creating user' });
  }
};

// Login user
const loginHandler: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body as LoginRequest;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = user.generateAuthToken();

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(400).json({ error: 'Error logging in' });
  }
};

// Get current user
const meHandler: RequestHandler = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.get('/me', auth, meHandler);

export default router; 