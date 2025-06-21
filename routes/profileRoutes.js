import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
  getProfile, 
  updateProfile, 
  changePassword, 
  uploadProfilePicture 
} from '../controllers/profileController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/users/profile - Get current user's profile
router.get('/users/profile', getProfile);

// PUT /api/users/profile - Update profile (fullName, email)
router.put('/users/profile', updateProfile);

// PUT /api/users/profile/password - Change password
router.put('/users/profile/password', changePassword);

// POST /api/users/profile/picture - Upload profile picture
router.post('/users/profile/picture', uploadProfilePicture);

export default router;