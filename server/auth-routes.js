import express from 'express';
import cookieParser from 'cookie-parser';
import User from './models/User.js';
import { generateToken, authenticateToken } from './middleware/auth.js';
import { getUserModules } from './utils/permissions.js';
import { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser, 
  resetUserPassword 
} from './controllers/userController.js';
import bcrypt from 'bcryptjs';
import { profileUpload } from './middleware/upload.js';
import path from 'path';
import fs from 'fs';

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

    console.log('Looking for user with username:', username);
    
    // Check all users first
    const allUsers = await User.find({}, 'username email role');
    console.log('All users in database:', allUsers);
    
    const user = await User.findOne({ 
      $or: [
        { username: username },
        { email: username }
      ]
    });

    console.log('Found user:', user ? 'Yes' : 'No');
    if (user) {
      console.log('User details:', {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        passwordHash: user.password.substring(0, 20) + '...'
      });
    }

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Comparing password with hash...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('Invalid password');
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

// Middleware to verify token
const verifyToken = authenticateToken;

// Profile management routes (MUST come BEFORE user/:id routes to avoid conflicts)
router.get('/users/profile', authenticateToken, async (req, res) => {
  try {
    console.log('=== GET PROFILE ROUTE HIT ===');
    const userId = req.user.userId?.userId || req.user.userId || req.user._id;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      profilePicture: user.profilePicture ? `/uploads/profiles/${user.profilePicture}` : null,
      role: user.role,
      unit: user.unit,
      permissions: user.permissions,
      profile: user.profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/users/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, email } = req.body;
    const userId = req.user.userId?.userId || req.user.userId || req.user._id;
    
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email;

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        profilePicture: user.profilePicture ? `/uploads/profiles/${user.profilePicture}` : null,
        role: user.role,
        unit: user.unit
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/users/profile/password', authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old password and new password are required' });
    }

    const userId = req.user.userId?.userId || req.user.userId || req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/users/profile/picture', authenticateToken, profileUpload.single('picture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user.userId?.userId || req.user.userId || req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old profile picture if exists
    if (user.profilePicture) {
      const oldImagePath = path.join('uploads/profiles/', user.profilePicture);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: req.file.filename },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile picture updated successfully',
      profilePicture: `/uploads/profiles/${req.file.filename}`,
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        profilePicture: `/uploads/profiles/${updatedUser.profilePicture}`,
        role: updatedUser.role,
        unit: updatedUser.unit
      }
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// User Management Routes (Super User Only) - These come AFTER profile routes
router.get('/users', verifyToken, getUsers);
router.get('/users/:id', verifyToken, getUserById);
router.post('/users', verifyToken, createUser);
router.put('/users/:id', verifyToken, updateUser);
router.delete('/users/:id', verifyToken, deleteUser);
router.post('/users/:id/reset-password', verifyToken, resetUserPassword);

export default router;