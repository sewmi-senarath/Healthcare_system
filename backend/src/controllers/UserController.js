import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateTokenPair } from '../middleware/auth.js';

/**
 * UserController - Handles all user-related operations
 * Following Single Responsibility Principle
 */
class UserController {
  /**
   * Find user by email and type
   * @param {string} email 
   * @param {string} userType 
   * @returns {Promise<Object|null>}
   */
  static async findUserByEmailAndType(email, userType) {
    try {
      // For discriminator models, we need to use the specific model
      if (userType === 'patient') {
        const Patient = (await import('../models/Patient.js')).default;
        return await Patient.findOne({ email });
      } else {
        // For employee types, use the base User model with discriminator
        return await User.findOne({ email, userType });
      }
    } catch (error) {
      console.error('Error finding user by email and type:', error);
      throw error;
    }
  }

  /**
   * Check if email already exists
   * @param {string} email 
   * @param {string} userType 
   * @returns {Promise<Object|null>}
   */
  static async checkEmailExists(email, userType) {
    try {
      return await User.findOne({ email, userType });
    } catch (error) {
      console.error('Error checking email exists:', error);
      throw error;
    }
  }

  /**
   * Authenticate user login
   * @param {string} email 
   * @param {string} password 
   * @param {string} userType 
   * @returns {Promise<Object>}
   */
  static async authenticateUser(email, password, userType) {
    try {
      console.log(`=== ${userType.toUpperCase()} LOGIN DEBUG ===`);
      console.log('Request body:', { email, password: '[HIDDEN]' });

      // Find user
      const user = await this.findUserByEmailAndType(email, userType);
      console.log('User found:', user ? 'YES' : 'NO');
      
      if (!user) {
        console.log('ERROR: User not found');
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      console.log('User ID:', user.patientId || user.empID || user._id);
      console.log('Stored password hash (full):', user.password);
      console.log('Input password (plain text):', password);
      console.log('Input password length:', password.length);
      console.log('Stored hash length:', user.password.length);
      console.log('Stored hash starts with $2a$:', user.password.startsWith('$2a$'));

      // Check password
      console.log('About to compare:');
      console.log('- Plain text password:', password);
      console.log('- Against stored hash:', user.password);
      
      // Let's also test if the stored hash is actually a bcrypt hash
      const isStoredHashValid = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
      console.log('Is stored password a valid bcrypt hash?', isStoredHashValid);
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('Password comparison result:', isPasswordValid);
      
      if (!isPasswordValid) {
        console.log('ERROR: Password comparison failed');
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      console.log('SUCCESS: Password valid, generating tokens...');

      // Generate tokens
      let tokens;
      try {
        tokens = generateTokenPair(user, userType);
        console.log('Tokens generated successfully');
      } catch (tokenError) {
        console.error('Token generation error:', tokenError);
        throw new Error('Token generation failed');
      }

      // Remove password from user object
      const userResponse = user.toObject();
      delete userResponse.password;

      return {
        success: true,
        message: `${userType} logged in successfully`,
        user: userResponse,
        userType: userType,
        ...tokens
      };

    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  /**
   * Generate JWT token pair
   * @param {Object} user 
   * @param {string} userType 
   * @returns {Object}
   */
  static generateTokens(user, userType) {
    return generateTokenPair(user, userType);
  }

  /**
   * Verify JWT token
   * @param {string} token 
   * @returns {Promise<Object>}
   */
  static async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        user: user.toObject()
      };
    } catch (error) {
      return {
        success: false,
        message: 'Invalid token'
      };
    }
  }

  /**
   * Refresh JWT token
   * @param {string} refreshToken 
   * @returns {Promise<Object>}
   */
  static async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      const tokens = generateTokenPair(user, user.userType);

      return {
        success: true,
        message: 'Token refreshed successfully',
        ...tokens
      };
    } catch (error) {
      return {
        success: false,
        message: 'Invalid refresh token'
      };
    }
  }

  /**
   * Change user password
   * @param {string} userId 
   * @param {string} currentPassword 
   * @param {string} newPassword 
   * @returns {Promise<Object>}
   */
  static async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          message: 'Current password is incorrect'
        };
      }

      // Update password (will be hashed by pre-save middleware)
      user.password = newPassword;
      await user.save();

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Get user profile
   * @param {string} userId 
   * @returns {Promise<Object>}
   */
  static async getUserProfile(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      return {
        success: true,
        user: user.toObject()
      };
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} userId 
   * @param {Object} updateData 
   * @returns {Promise<Object>}
   */
  static async updateUserProfile(userId, updateData) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Update allowed fields
      const allowedUpdates = ['name', 'email', 'contactInfo', 'address'];
      const updates = {};
      
      allowedUpdates.forEach(field => {
        if (updateData[field] !== undefined) {
          updates[field] = updateData[field];
        }
      });

      Object.assign(user, updates);
      await user.save();

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      return {
        success: true,
        message: 'Profile updated successfully',
        user: userResponse
      };
    } catch (error) {
      console.error('Update user profile error:', error);
      throw error;
    }
  }
}

export default UserController;
