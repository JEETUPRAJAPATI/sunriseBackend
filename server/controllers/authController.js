import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { getUserModules } from '../utils/permissions.js';
import bcrypt from 'bcryptjs';

const login = async (req, res) => {
  try {
    console.log('=== LOGIN CONTROLLER START ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findOne({ 
      $or: [{ username }, { email: username }],
      isActive: true 
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    const userModules = getUserModules(user.role);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      unit: user.unit,
      isActive: user.isActive,
      modules: userModules,
      lastLogin: user.lastLogin,
      permissions: {
        canManageUsers: ['Super User', 'Unit Head'].includes(user.role),
        canAccessSettings: user.role === 'Super User',
        modules: userModules
      }
    };

    console.log('=== SENDING LOGIN RESPONSE ===');
    const response = {
      message: 'Login successful',
      success: true,
      user: userResponse,
      token
    };
    console.log('Response data:', response);
    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie('token');
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    const userModules = getUserModules(user.role);

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      unit: user.unit,
      isActive: user.isActive,
      modules: userModules,
      lastLogin: user.lastLogin,
      permissions: {
        canManageUsers: ['Super User', 'Unit Head'].includes(user.role),
        canAccessSettings: user.role === 'Super User',
        modules: userModules
      }
    };

    res.json(userResponse);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user._id);
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export {
  login,
  logout,
  getCurrentUser,
  changePassword
};
