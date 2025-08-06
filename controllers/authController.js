import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';

// Register a new user
export const registerUser = async (req, res, next) => {
  try {
    const { NameOfStu, StuID, AccessKey } = req.validatedBody;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { StuID },
        { AccessKey }
      ]
    });

    if (existingUser) {
      if (existingUser.StuID === StuID) {
        return next(new AppError('Student ID already exists', 400));
      }
      if (existingUser.AccessKey === AccessKey) {
        return next(new AppError('Access key already exists', 400));
      }
    }

    // Create new user
    const user = new User({
      NameOfStu: NameOfStu.trim(),
      StuID: StuID.trim(),
      AccessKey: AccessKey.trim()
    });

    await user.save();

    // Return user data without sensitive information
    const response = {
      success: true,
      message: 'User registered successfully',
      data: {
        id: user._id,
        NameOfStu: user.NameOfStu,
        StuID: user.StuID,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Error in registerUser:', error);
    return next(new AppError('Registration failed', 500));
  }
};

// Verify access key (login-like functionality)
export const verifyAccessKey = async (req, res, next) => {
  try {
    const { AccessKey } = req.validatedBody;
    console.log("verifyAccessKey is Called");

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
      return next(new AppError('Invalid access key', 401));
    }

    // Reset login attempts and update last login
    await authenticatedUser.resetLoginAttempts();

    const response = {
      success: true,
      message: 'Access key verified successfully',
      data: {
        id: authenticatedUser._id,
        NameOfStu: authenticatedUser.NameOfStu,
        StuID: authenticatedUser.StuID,
        lastLogin: new Date(),
        isActive: authenticatedUser.isActive
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Error in verifyAccessKey:', error);
    return next(new AppError('Verification failed', 500));
  }
};

// Get user profile
export const getUserProfile = async (req, res, next) => {
  try {
    // req.user is set by authentication middleware
    const response = {
      success: true,
      data: {
        id: req.user.id,
        NameOfStu: req.user.NameOfStu,
        StuID: req.user.StuID,
        isActive: req.user.isActive,
        lastLogin: req.user.lastLogin
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return next(new AppError('Failed to get user profile', 500));
  }
};

// Update user profile
export const updateUserProfile = async (req, res, next) => {
  try {
    const { NameOfStu } = req.validatedBody;
    const userId = req.user.id;

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        NameOfStu: NameOfStu.trim(),
        updatedAt: new Date()
      },
      { 
        new: true,
        runValidators: true
      }
    ).select('-AccessKey -loginAttempts -lockUntil');

    if (!updatedUser) {
      return next(new AppError('User not found', 404));
    }

    const response = {
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser._id,
        NameOfStu: updatedUser.NameOfStu,
        StuID: updatedUser.StuID,
        isActive: updatedUser.isActive,
        updatedAt: updatedUser.updatedAt
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return next(new AppError('Profile update failed', 500));
  }
};

// Deactivate user account
export const deactivateAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        isActive: false,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedUser) {
      return next(new AppError('User not found', 404));
    }

    const response = {
      success: true,
      message: 'Account deactivated successfully',
      data: {
        id: updatedUser._id,
        isActive: updatedUser.isActive,
        deactivatedAt: updatedUser.updatedAt
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Error in deactivateAccount:', error);
    return next(new AppError('Account deactivation failed', 500));
  }
};

// Get user statistics (admin function)
export const getUserStats = async (req, res, next) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          inactiveUsers: {
            $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
          },
          lockedUsers: {
            $sum: { 
              $cond: [
                { $and: [
                  { $ne: ['$lockUntil', null] },
                  { $gt: ['$lockUntil', new Date()] }
                ]}, 
                1, 
                0 
              ] 
            }
          }
        }
      }
    ]);

    const response = {
      success: true,
      data: stats[0] || {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        lockedUsers: 0
      },
      requestedBy: req.user.NameOfStu,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Error in getUserStats:', error);
    return next(new AppError('Failed to get user statistics', 500));
  }
};
