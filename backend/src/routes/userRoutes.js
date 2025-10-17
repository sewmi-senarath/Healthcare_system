// import express from 'express';
// import { body, validationResult } from 'express-validator';
// import UserController from '../controllers/UserController.js';
// import { authenticateToken } from '../middleware/auth.js';

// const router = express.Router();

// /**
//  * Validation middleware
//  */
// const checkValidationErrors = (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({
//       success: false,
//       message: 'Validation failed',
//       errors: errors.array().map(error => ({
//         type: 'field',
//         value: error.value,
//         msg: error.msg,
//         path: error.path,
//         location: error.location
//       }))
//     });
//   }
//   return null;
// };

// // Common validation rules
// const emailValidation = body('email')
//   .isEmail()
//   .withMessage('Please provide a valid email')
//   .normalizeEmail();

// const passwordValidation = body('password')
//   .isLength({ min: 6 })
//   .withMessage('Password must be at least 6 characters long')
//   .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
//   .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number');

// const nameValidation = body('name')
//   .trim()
//   .isLength({ min: 2, max: 50 })
//   .withMessage('Name must be between 2 and 50 characters')
//   .matches(/^[a-zA-Z\s]+$/)
//   .withMessage('Name can only contain letters and spaces');

// /**
//  * POST /api/user/verify-token
//  * Verify JWT token
//  */
// router.post('/verify-token', async (req, res) => {
//   try {
//     const { token } = req.body;

//     if (!token) {
//       return res.status(400).json({
//         success: false,
//         message: 'Token is required'
//       });
//     }

//     const result = await UserController.verifyToken(token);
    
//     if (result.success) {
//       res.json(result);
//     } else {
//       res.status(401).json(result);
//     }
//   } catch (error) {
//     console.error('Verify token error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// /**
//  * POST /api/user/refresh-token
//  * Refresh JWT token
//  */
// router.post('/refresh-token', async (req, res) => {
//   try {
//     const { refreshToken } = req.body;

//     if (!refreshToken) {
//       return res.status(400).json({
//         success: false,
//         message: 'Refresh token is required'
//       });
//     }

//     const result = await UserController.refreshToken(refreshToken);
    
//     if (result.success) {
//       res.json(result);
//     } else {
//       res.status(401).json(result);
//     }
//   } catch (error) {
//     console.error('Refresh token error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// /**
//  * POST /api/user/change-password
//  * Change user password
//  */
// router.post('/change-password', [
//   authenticateToken,
//   body('currentPassword')
//     .notEmpty()
//     .withMessage('Current password is required'),
//   passwordValidation,
//   body('newPassword')
//     .custom((value, { req }) => {
//       if (value !== req.body.confirmPassword) {
//         throw new Error('New password and confirmation password do not match');
//       }
//       return true;
//     })
// ], async (req, res) => {
//   try {
//     const validationError = checkValidationErrors(req, res);
//     if (validationError) return validationError;

//     const { currentPassword, newPassword } = req.body;
//     const userId = req.user.userId;

//     const result = await UserController.changePassword(userId, currentPassword, newPassword);
    
//     if (result.success) {
//       res.json(result);
//     } else {
//       res.status(400).json(result);
//     }
//   } catch (error) {
//     console.error('Change password error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// /**
//  * GET /api/user/profile
//  * Get user profile
//  */
// router.get('/profile', authenticateToken, async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const result = await UserController.getUserProfile(userId);
    
//     if (result.success) {
//       res.json(result);
//     } else {
//       res.status(404).json(result);
//     }
//   } catch (error) {
//     console.error('Get user profile error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// /**
//  * PUT /api/user/profile
//  * Update user profile
//  */
// router.put('/profile', [
//   authenticateToken,
//   nameValidation,
//   emailValidation,
//   body('contactInfo.phone')
//     .optional()
//     .matches(/^[\+]?[1-9][\d]{0,15}$/)
//     .withMessage('Please provide a valid phone number'),
//   body('address.street')
//     .optional()
//     .trim()
//     .isLength({ min: 5, max: 100 })
//     .withMessage('Street address must be between 5 and 100 characters'),
//   body('address.city')
//     .optional()
//     .trim()
//     .isLength({ min: 2, max: 50 })
//     .withMessage('City must be between 2 and 50 characters'),
//   body('address.state')
//     .optional()
//     .trim()
//     .isLength({ min: 2, max: 50 })
//     .withMessage('State must be between 2 and 50 characters'),
//   body('address.zipCode')
//     .optional()
//     .trim()
//     .matches(/^\d{5}(-\d{4})?$/)
//     .withMessage('Please provide a valid ZIP code'),
//   body('address.country')
//     .optional()
//     .trim()
//     .isLength({ min: 2, max: 50 })
//     .withMessage('Country must be between 2 and 50 characters')
// ], async (req, res) => {
//   try {
//     const validationError = checkValidationErrors(req, res);
//     if (validationError) return validationError;

//     const userId = req.user.userId;
//     const updateData = req.body;

//     const result = await UserController.updateUserProfile(userId, updateData);
    
//     if (result.success) {
//       res.json(result);
//     } else {
//       res.status(404).json(result);
//     }
//   } catch (error) {
//     console.error('Update user profile error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// /**
//  * POST /api/user/logout
//  * Logout user (client-side token removal)
//  */
// router.post('/logout', authenticateToken, async (req, res) => {
//   try {
//     // In a stateless JWT system, logout is handled client-side
//     // You could implement token blacklisting here if needed
//     res.json({
//       success: true,
//       message: 'Logged out successfully'
//     });
//   } catch (error) {
//     console.error('Logout error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// export default router;

import express from 'express';
import { body } from 'express-validator';
import container from '../config/DIContainer.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/verify-token', (req, res) => {
  const userController = container.get('userController');
  userController.verifyToken(req, res);
});

router.post('/refresh-token', (req, res) => {
  const userController = container.get('userController');
  userController.refreshToken(req, res);
});

router.post('/change-password', authenticateToken, (req, res) => {
  const userController = container.get('userController');
  userController.changePassword(req, res);
});

router.get('/profile', authenticateToken, (req, res) => {
  const userController = container.get('userController');
  userController.getUserProfile(req, res);
});

router.put('/profile', authenticateToken, (req, res) => {
  const userController = container.get('userController');
  userController.updateUserProfile(req, res);
});

router.post('/logout', authenticateToken, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;