import express from 'express';
import { body, validationResult } from 'express-validator';
import EmployeeController from '../controllers/EmployeeController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Validation middleware
 */
const checkValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        type: 'field',
        value: error.value,
        msg: error.msg,
        path: error.path,
        location: error.location
      }))
    });
  }
  return null;
};

// Common validation rules
const commonEmployeeValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  body('department')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Department must be between 2 and 50 characters'),
  body('position')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Position must be between 2 and 50 characters'),
  body('salary')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Salary must be a positive number'),
  body('contactInfo.workPhone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid work phone number'),
  body('contactInfo.workEmail')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid work email'),
  body('emergencyContact.name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Emergency contact name must be between 2 and 50 characters'),
  body('emergencyContact.phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid emergency contact phone number')
];

// Doctor-specific validation
const doctorValidation = [
  ...commonEmployeeValidation,
  body('specialization')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Specialization must be between 2 and 50 characters'),
  body('phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('whatApp')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid WhatsApp number'),
  body('preferredCommunicationMethod')
    .optional()
    .isIn(['email', 'phone', 'whatsapp'])
    .withMessage('Preferred communication method must be email, phone, or whatsapp')
];

// Nurse-specific validation
const nurseValidation = [
  ...commonEmployeeValidation,
  body('assignedWard')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Assigned ward must be between 2 and 50 characters'),
  body('shiftSchedule')
    .optional()
    .isArray()
    .withMessage('Shift schedule must be an array')
];

// Pharmacist-specific validation
const pharmacistValidation = [
  ...commonEmployeeValidation,
  body('licenseNumber')
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('License number must be between 5 and 20 characters')
];

// Hospital Staff-specific validation
const hospitalStaffValidation = [
  ...commonEmployeeValidation,
  body('role')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Role must be between 2 and 50 characters'),
  body('assignedDepartment')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Assigned department must be between 2 and 50 characters'),
  body('shiftSchedule')
    .optional()
    .isArray()
    .withMessage('Shift schedule must be an array')
];

// Healthcare Manager-specific validation
const healthCareManagerValidation = [
  ...commonEmployeeValidation,
  body('assignedHospital')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Assigned hospital must be between 2 and 100 characters')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  body('userType')
    .isIn(['doctor', 'nurse', 'pharmacist', 'hospitalStaff', 'healthCareManager', 'systemAdmin'])
    .withMessage('Invalid user type')
];

/**
 * POST /api/employee/doctor/register
 * Register a new doctor
 */
router.post('/doctor/register', doctorValidation, async (req, res) => {
  try {
    const validationError = checkValidationErrors(req, res);
    if (validationError) return validationError;

    const result = await EmployeeController.registerEmployee(req.body, 'doctor');
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Doctor registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/employee/nurse/register
 * Register a new nurse
 */
router.post('/nurse/register', nurseValidation, async (req, res) => {
  try {
    const validationError = checkValidationErrors(req, res);
    if (validationError) return validationError;

    const result = await EmployeeController.registerEmployee(req.body, 'nurse');
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Nurse registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/employee/pharmacist/register
 * Register a new pharmacist
 */
router.post('/pharmacist/register', pharmacistValidation, async (req, res) => {
  try {
    const validationError = checkValidationErrors(req, res);
    if (validationError) return validationError;

    const result = await EmployeeController.registerEmployee(req.body, 'pharmacist');
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Pharmacist registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/employee/hospital-staff/register
 * Register a new hospital staff
 */
router.post('/hospital-staff/register', hospitalStaffValidation, async (req, res) => {
  try {
    const validationError = checkValidationErrors(req, res);
    if (validationError) return validationError;

    const result = await EmployeeController.registerEmployee(req.body, 'hospitalStaff');
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Hospital staff registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/employee/healthcare-manager/register
 * Register a new healthcare manager
 */
router.post('/healthcare-manager/register', healthCareManagerValidation, async (req, res) => {
  try {
    const validationError = checkValidationErrors(req, res);
    if (validationError) return validationError;

    const result = await EmployeeController.registerEmployee(req.body, 'healthCareManager');
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Healthcare manager registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/employee/login
 * Login as employee (any type)
 */
router.post('/login', loginValidation, async (req, res) => {
  try {
    const validationError = checkValidationErrors(req, res);
    if (validationError) return validationError;

    const { email, password, userType } = req.body;
    const result = await EmployeeController.loginEmployee(email, password, userType);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('Employee login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/employee/profile
 * Get employee profile (authenticated)
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const employeeId = req.user.userId;
    const userType = req.user.userType;
    const result = await EmployeeController.getEmployeeProfile(employeeId, userType);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Get employee profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * PUT /api/employee/profile
 * Update employee profile (authenticated)
 */
router.put('/profile', [
  authenticateToken,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('department')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Department must be between 2 and 50 characters'),
  body('position')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Position must be between 2 and 50 characters'),
  body('contactInfo.workPhone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid work phone number'),
  body('contactInfo.workEmail')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid work email')
], async (req, res) => {
  try {
    const validationError = checkValidationErrors(req, res);
    if (validationError) return validationError;

    const employeeId = req.user.userId;
    const userType = req.user.userType;
    const result = await EmployeeController.updateEmployeeProfile(employeeId, userType, req.body);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Update employee profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/employee/:employeeType
 * Get all employees of a specific type (authenticated)
 */
router.get('/:employeeType', authenticateToken, async (req, res) => {
  try {
    const { employeeType } = req.params;
    const filters = req.query;
    
    const result = await EmployeeController.getAllEmployees(employeeType, filters);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Get all employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/employee/:employeeType/:empID
 * Get employee by empID (authenticated)
 */
router.get('/:employeeType/:empID', authenticateToken, async (req, res) => {
  try {
    const { employeeType, empID } = req.params;
    const result = await EmployeeController.getEmployeeByEmpID(empID, employeeType);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Get employee by empID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * PUT /api/employee/:employeeType/:empID/status
 * Update employee status (authenticated)
 */
router.put('/:employeeType/:empID/status', [
  authenticateToken,
  body('status')
    .isIn(['active', 'inactive', 'terminated', 'on_leave'])
    .withMessage('Status must be active, inactive, terminated, or on_leave'),
  body('reason')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Reason must be between 5 and 200 characters')
], async (req, res) => {
  try {
    const validationError = checkValidationErrors(req, res);
    if (validationError) return validationError;

    const { employeeType, empID } = req.params;
    const { status, reason } = req.body;
    
    // Find employee by empID first
    const employeeResult = await EmployeeController.getEmployeeByEmpID(empID, employeeType);
    if (!employeeResult.success) {
      return res.status(404).json(employeeResult);
    }

    const result = await EmployeeController.updateEmployeeStatus(
      employeeResult.employee._id, 
      employeeType, 
      status, 
      reason
    );
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Update employee status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
