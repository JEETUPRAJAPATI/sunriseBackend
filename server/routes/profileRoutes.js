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
router.get('/profile', getProfile);

// PUT /api/users/profile - Update profile (fullName, email)
router.put('/profile', updateProfile);

// PUT /api/users/profile/password - Change password
router.put('/profile/password', changePassword);

// POST /api/users/profile/picture - Upload profile picture
router.post('/profile/picture', uploadProfilePicture);

export default router;