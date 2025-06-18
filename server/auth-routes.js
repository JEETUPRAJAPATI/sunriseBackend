import express from 'express';
import User from './models/User.js';
import { generateToken, authenticateToken } from './middleware/auth.js';
import { getUserModules } from './utils/permissions.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  console.log('=== TEST ROUTE HIT ===');
  res.json({ message: 'API working', success: true, timestamp: new Date().toISOString() });
});

// Login route
router.post('/auth/login', async (req, res) => {
  try {
    console.log('=== LOGIN ROUTE HIT ===');
    console.log('Request body:', req.body);
    
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findOne({ 
      $or: [
        { username: username.toLowerCase() },
        { email: username.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is disabled' });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id,
      username: user.username,
      role: user.role,
      permissions: user.permissions
    });

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Get user modules
    const userModules = getUserModules(user.role);

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      unit: user.unit,
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        modules: userModules
      }
    };

    const response = {
      message: 'Login successful',
      success: true,
      user: userResponse,
      token
    };
    
    console.log('=== LOGIN SUCCESS ===');
    console.log('User:', userResponse.username, 'Role:', userResponse.role);
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user
router.get('/auth/me', authenticateToken, async (req, res) => {
  try {
    console.log('=== AUTH/ME ROUTE HIT ===');
    
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userModules = getUserModules(user.role);

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      unit: user.unit,
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        modules: userModules
      }
    };

    res.json(userResponse);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout route
router.post('/auth/logout', (req, res) => {
  console.log('=== LOGOUT ROUTE HIT ===');
  
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully', success: true });
});

// Change password
router.post('/auth/change-password', authenticateToken, async (req, res) => {
  try {
    console.log('=== CHANGE PASSWORD ROUTE HIT ===');
    
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(req.user.userId, { password: hashedPassword });

    res.json({ message: 'Password changed successfully', success: true });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;