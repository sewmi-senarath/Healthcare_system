import express from 'express';
import { body, validationResult } from 'express-validator';
import container from '../config/DIContainer.js';

const router = express.Router();

const checkValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  return null;
};

router.post('/patient/register', (req, res) => {
  const patientController = container.get('patientController');
  patientController.registerPatient(req, res);
});

router.post('/patient/login', (req, res) => {
  const patientController = container.get('patientController');
  patientController.loginPatient(req, res);
});

router.post('/authority/register', (req, res) => {
  const employeeController = container.get('employeeController');
  employeeController.registerEmployee(req, res);
});

router.post('/authority/login', (req, res) => {
  const employeeController = container.get('employeeController');
  employeeController.loginEmployee(req, res);
});

router.post('/refresh-token', (req, res) => {
  const userController = container.get('userController');
  userController.refreshToken(req, res);
});

router.post('/change-password', (req, res) => {
  const userController = container.get('userController');
  userController.changePassword(req, res);
});

export default router;

// import express from 'express';
// import { body, validationResult } from 'express-validator';
// import PatientController from '../controllers/PatientController.js';
// import EmployeeController from '../controllers/EmployeeController.js';
// import UserController from '../controllers/UserController.js';

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

// // Patient validation
// const patientRegisterValidation = [
//   nameValidation,
//   emailValidation,
//   passwordValidation,
//   body('confirmPassword')
//     .custom((value, { req }) => {
//       if (value !== req.body.password) {
//         throw new Error('Password confirmation does not match password');
//       }
//       return true;
//     }),
//   body('dateOfBirth')
//     .isISO8601()
//     .withMessage('Please provide a valid date of birth')
//     .custom((value) => {
//       const birthDate = new Date(value);
//       const today = new Date();
//       const age = today.getFullYear() - birthDate.getFullYear();
//       if (age < 0 || age > 150) {
//         throw new Error('Please provide a valid date of birth');
//       }
//       return true;
//     }),
//   body('gender')
//     .isIn(['male', 'female', 'other'])
//     .withMessage('Gender must be male, female, or other'),
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
// ];

// const loginValidation = [
//   emailValidation,
//   body('password')
//     .notEmpty()
//     .withMessage('Password is required')
// ];

// // Authority validation
// const authorityRegisterValidation = [
//   nameValidation,
//   emailValidation,
//   passwordValidation,
//   body('confirmPassword')
//     .custom((value, { req }) => {
//       if (value !== req.body.password) {
//         throw new Error('Password confirmation does not match password');
//       }
//       return true;
//     }),
//   body('userType')
//     .isIn(['doctor', 'nurse', 'pharmacist', 'hospitalStaff', 'healthCareManager', 'systemAdmin'])
//     .withMessage('Invalid user type'),
//   body('department')
//     .trim()
//     .isLength({ min: 2, max: 50 })
//     .withMessage('Department must be between 2 and 50 characters'),
//   body('position')
//     .trim()
//     .isLength({ min: 2, max: 50 })
//     .withMessage('Position must be between 2 and 50 characters'),
//   body('salary')
//     .optional()
//     .isFloat({ min: 0 })
//     .withMessage('Salary must be a positive number'),
//   body('contactInfo.workPhone')
//     .optional()
//     .matches(/^[\+]?[1-9][\d]{0,15}$/)
//     .withMessage('Please provide a valid work phone number'),
//   body('contactInfo.workEmail')
//     .optional()
//     .isEmail()
//     .withMessage('Please provide a valid work email'),
//   body('emergencyContact.name')
//     .optional()
//     .trim()
//     .isLength({ min: 2, max: 50 })
//     .withMessage('Emergency contact name must be between 2 and 50 characters'),
//   body('emergencyContact.phone')
//     .optional()
//     .matches(/^[\+]?[1-9][\d]{0,15}$/)
//     .withMessage('Please provide a valid emergency contact phone number')
// ];

// /**
//  * POST /api/auth/patient/register
//  * Register a new patient
//  */
// router.post('/patient/register', patientRegisterValidation, async (req, res) => {
//   try {
//     const validationError = checkValidationErrors(req, res);
//     if (validationError) return validationError;

//     const result = await PatientController.registerPatient(req.body);
    
//     if (result.success) {
//       res.status(201).json(result);
//     } else {
//       res.status(400).json(result);
//     }
//   } catch (error) {
//     console.error('Patient registration error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// /**
//  * POST /api/auth/patient/login
//  * Login as patient
//  */
// router.post('/patient/login', loginValidation, async (req, res) => {
//   try {
//     const validationError = checkValidationErrors(req, res);
//     if (validationError) return validationError;

//     const { email, password } = req.body;
//     const result = await PatientController.loginPatient(email, password);
    
//     if (result.success) {
//       res.json(result);
//     } else {
//       res.status(401).json(result);
//     }
//   } catch (error) {
//     console.error('Patient login error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// /**
//  * POST /api/auth/authority/register
//  * Register a new authority member (employee)
//  */
// router.post('/authority/register', authorityRegisterValidation, async (req, res) => {
//   try {
//     console.log('=== AUTHORITY REGISTRATION REQUEST ===');
//     console.log('Request body:', req.body);
    
//     const validationError = checkValidationErrors(req, res);
//     if (validationError) {
//       console.log('Validation failed:', validationError);
//       return validationError;
//     }

//     console.log('Validation passed, calling EmployeeController.registerEmployee');
//     const { userType, ...employeeData } = req.body;
//     const result = await EmployeeController.registerEmployee(employeeData, userType);
    
//     if (result.success) {
//       res.status(201).json(result);
//     } else {
//       res.status(400).json(result);
//     }
//   } catch (error) {
//     console.error('Authority registration error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// /**
//  * POST /api/auth/authority/login
//  * Login as authority member
//  */
// router.post('/authority/login', [
//   emailValidation,
//   body('password')
//     .notEmpty()
//     .withMessage('Password is required'),
//   body('userType')
//     .isIn(['doctor', 'nurse', 'pharmacist', 'hospitalStaff', 'healthCareManager', 'systemAdmin'])
//     .withMessage('Invalid user type')
// ], async (req, res) => {
//   try {
//     const validationError = checkValidationErrors(req, res);
//     if (validationError) return validationError;

//     const { email, password, userType } = req.body;
//     const result = await EmployeeController.loginEmployee(email, password, userType);
    
//     if (result.success) {
//       res.json(result);
//     } else {
//       res.status(401).json(result);
//     }
//   } catch (error) {
//     console.error('Authority login error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// /**
//  * POST /api/auth/refresh-token
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
//  * POST /api/auth/change-password
//  * Change user password
//  */
// router.post('/change-password', [
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

//     // This would need authentication middleware to get user ID
//     // For now, we'll require it in the request body
//     const { userId, currentPassword, newPassword } = req.body;

//     if (!userId) {
//       return res.status(400).json({
//         success: false,
//         message: 'User ID is required'
//       });
//     }

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

// export default router;
