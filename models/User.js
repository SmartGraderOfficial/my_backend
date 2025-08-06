import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  NameOfStu: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  StuID: {
    type: String,
    required: [true, 'Student ID is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Student ID cannot exceed 50 characters']
  },
  AccessKey: {
    type: String,
    required: [true, 'Access key is required'],
    unique: true,
    minlength: [8, 'Access key must be at least 8 characters'],
    maxlength: [100, 'Access key cannot exceed 100 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Indexes for performance
userSchema.index({ AccessKey: 1 });
userSchema.index({ StuID: 1 });
userSchema.index({ isActive: 1 });

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash access key if modified
userSchema.pre('save', async function(next) {
  if (!this.isModified('AccessKey')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.AccessKey = await bcrypt.hash(this.AccessKey, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare access key
userSchema.methods.compareAccessKey = async function(candidateKey) {
  if (!candidateKey) return false;
  return await bcrypt.compare(candidateKey, this.AccessKey);
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  const maxAttempts = 5;
  const lockTime = 30 * 60 * 1000; // 30 minutes

  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: {
        loginAttempts: 1,
        lockUntil: 1
      }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + lockTime
    };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1
    },
    $set: {
      lastLogin: new Date()
    }
  });
};

export default mongoose.model('User', userSchema);
