import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Base User Model - Following Single Responsibility Principle
 * Responsible only for core user functionality
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  userType: {
    type: String,
    enum: ['patient', 'systemAdmin', 'doctor', 'hospitalStaff', 'nurse', 'pharmacist', 'healthCareManager'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true,
  discriminatorKey: 'userType'
});

// Hash password before saving - Open/Closed Principle (extensible without modification)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance methods - Interface Segregation Principle (only relevant methods exposed)
userSchema.methods.getName = function() {
  return this.name;
};

userSchema.methods.getEmail = function() {
  return this.email;
};

userSchema.methods.setName = function(name) {
  this.name = name;
  return this.save();
};

userSchema.methods.setEmail = function(email) {
  this.email = email;
  return this.save();
};

userSchema.methods.setPassword = function(password) {
  this.password = password;
  return this.save();
};

userSchema.methods.login = async function(password) {
  try {
    const isMatch = await bcrypt.compare(password, this.password);
    if (isMatch) {
      this.lastLogin = new Date();
      await this.save();
      return true;
    }
    return false;
  } catch (error) {
    throw new Error('Login failed');
  }
};

userSchema.methods.logout = function() {
  // In a real application, you might invalidate tokens here
  this.lastLogin = null;
  return this.save();
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

const User = mongoose.model('User', userSchema);

export default User;
