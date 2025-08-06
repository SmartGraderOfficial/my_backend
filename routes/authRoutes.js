import express from 'express';
import {
  registerUser,
  verifyAccessKey,
  getUserProfile,
  updateUserProfile,
  deactivateAccount,
  getUserStats
} from '../controllers/authController.js';
import { authenticateUser, logActivity } from '../middleware/auth.middleware.js';
import {
  validateUserRegistration,
  validateAccessKeyVerification,
  validateProfileUpdate
} from '../middleware/validation.js';

const router = express.Router();

// Public routes (no authentication required)

// Register new user
router.post('/register',
  validateUserRegistration,
  logActivity('USER_REGISTRATION'),
  registerUser
);

// Verify access key (login-like functionality)
router.post('/verify',
  validateAccessKeyVerification,
  logActivity('ACCESS_KEY_VERIFICATION'),
  verifyAccessKey
);

// Protected routes (authentication required)

// Get user profile
router.get('/profile',
  authenticateUser,
  logActivity('GET_PROFILE'),
  getUserProfile
);

// Update user profile
router.put('/profile',
  validateProfileUpdate,
  authenticateUser,
  logActivity('UPDATE_PROFILE'),
  updateUserProfile
);

// Deactivate account
router.patch('/deactivate',
  authenticateUser,
  logActivity('DEACTIVATE_ACCOUNT'),
  deactivateAccount
);

// Get user statistics (admin-like functionality)
router.get('/stats',
  authenticateUser,
  logActivity('GET_USER_STATS'),
  getUserStats
);

export default router;
