import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

const authenticateToken = async (req, res, next) => {
  try {
    console.log('=== TOKEN VERIFICATION ===');
    console.log('Request URL:', req.originalUrl);
    console.log('Request method:', req.method);
    
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '') || req.cookies?.token;

    console.log('Auth header:', authHeader ? 'Present' : 'Missing');
    console.log('Token:', token ? 'Present' : 'Missing');

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Token decoded successfully:', { 
        userId: decoded.userId, 
        exp: new Date(decoded.exp * 1000) 
      });
      
      const user = await User.findById(decoded.userId.userId).select('-password');

      if (!user || !user.isActive) {
        console.log('User not found or inactive');
        return res.status(401).json({ message: 'Invalid token or user not active.' });
      }

      req.user = {
        _id: user._id,
        userId: user._id,
        username: user.username,
        role: user.role,
        unit: user.unit,
        permissions: user.permissions
      };
      
      console.log('User authenticated:', req.user.username, 'Role:', req.user.role);
      next();
    } catch (jwtError) {
      console.log('JWT verification failed:', jwtError.message);
      return res.status(401).json({ message: 'Invalid token.' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};

const checkUnitAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }

  // Super users have access to all units
  if (req.user.role === 'Super User') {
    return next();
  }

  // Check if the requested resource belongs to user's unit
  const requestedUnit = req.body.unit || req.query.unit || req.params.unit;
  
  if (requestedUnit && req.user.unit !== requestedUnit) {
    return res.status(403).json({ message: 'Access denied. Unit access restriction.' });
  }

  next();
};

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

export {
  authenticateToken,
  authorizeRoles,
  checkUnitAccess,
  generateToken
};
