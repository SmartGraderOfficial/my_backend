import User from '../models/User.js';
import { AppError } from './errorHandler.js';

// Authentication middleware using AccessKey
export const authenticateUser = async (req, res, next) => {
  try {
    // Extract AccessKey from Authorization header
    const authHeader = req.headers.authorization;
    let AccessKey = null;

    if (authHeader && authHeader.startsWith('AccessKey ')) {
      AccessKey = authHeader.substring(10); // Remove 'AccessKey ' prefix
    }

    if (!AccessKey) {
      return next(new AppError('Access key is required', 401));
    }

    // Find all active users and check AccessKey against each
    const users = await User.find({ isActive: true });

    if (!users || users.length === 0) {
      return next(new AppError('Invalid access key', 401));
    }

    let authenticatedUser = null;

    // Check AccessKey against all users
    for (const user of users) {
      // Check if account is locked
      if (user.isLocked) {
        continue; // Skip locked accounts
      }

      // Compare access key
      const isValidKey = await user.compareAccessKey(AccessKey);
      
      if (isValidKey) {
        authenticatedUser = user;
        break;
      }
    }

    if (!authenticatedUser) {
      // If no user found, increment attempts for any user that might have this key
      // For security, we don't reveal which user failed
      return next(new AppError('Invalid access key', 401));
    }

    // Reset login attempts on successful authentication
    await authenticatedUser.resetLoginAttempts();

    // Attach user to request object (excluding sensitive data)
    req.user = {
      id: authenticatedUser._id,
      NameOfStu: authenticatedUser.NameOfStu,
      StuID: authenticatedUser.StuID,
      isActive: authenticatedUser.isActive,
      lastLogin: authenticatedUser.lastLogin
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.message.includes('locked')) {
      return next(new AppError(error.message, 423));
    }
    
    return next(new AppError('Authentication failed', 401));
  }
};

// Middleware to log user activity
export const logActivity = (action) => {
  return (req, res, next) => {
    const logData = {
      userId: req.user?.id,
      studentName: req.user?.NameOfStu,
      action,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date()
    };
    
    // In production, you might want to log this to a separate logging service
    console.log('User Activity:', logData);
    
    next();
  };
};
