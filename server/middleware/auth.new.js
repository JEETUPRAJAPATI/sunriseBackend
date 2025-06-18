import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'manufacturing-erp-secret-key-2024';

// Authenticate token middleware
export const authenticateToken = async (req, res, next) => {
  try {
    console.log('=== AUTHENTICATING TOKEN ===');
    
    // Get token from cookie or Authorization header
    let token = req.cookies?.token;
    
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided' 
      });
    }

    console.log('Token found, verifying...');

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded:', decoded);

    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.log('User not found for token');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token. User not found' 
      });
    }

    if (!user.isActive) {
      console.log('User account is inactive');
      return res.status(401).json({ 
        success: false,
        message: 'Account is inactive' 
      });
    }

    // Attach user to request
    req.user = {
      id: user._id,
      username: user.username,
      role: user.role,
      unit: user.unit
    };

    console.log('Authentication successful for user:', user.username);
    next();

  } catch (error) {
    console.error('Token authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired' 
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Token verification failed' 
    });
  }
};

// Authorize roles middleware
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      console.log('=== AUTHORIZING ROLES ===');
      console.log('User role:', req.user?.role);
      console.log('Allowed roles:', allowedRoles);

      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: 'Authentication required' 
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        console.log('Access denied for role:', req.user.role);
        return res.status(403).json({ 
          success: false,
          message: 'Access denied. Insufficient permissions' 
        });
      }

      console.log('Role authorization successful');
      next();

    } catch (error) {
      console.error('Role authorization error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Authorization failed' 
      });
    }
  };
};

// Generate JWT token utility
export const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id || user.id, 
      username: user.username, 
      role: user.role,
      unit: user.unit 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Verify JWT token utility
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw error;
  }
};