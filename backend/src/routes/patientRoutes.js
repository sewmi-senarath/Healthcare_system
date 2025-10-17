import express from 'express';
import { body, validationResult } from 'express-validator';
import PatientController from '../controllers/PatientController.js';
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

// Validation rules
const patientRegisterValidation = [
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
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 0 || age > 150) {
        throw new Error('Please provide a valid date of birth');
      }
      return true;
    }),
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('contactInfo.phone')
    .optional({ checkFalsy: true })
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('address.street')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Street address must be between 5 and 100 characters'),
  body('address.city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('address.state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  body('address.zipCode')
    .optional()
    .trim()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('Please provide a valid ZIP code'),
  body('address.country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * POST /api/patient/register
 * Register a new patient
 */
router.post('/register', patientRegisterValidation, async (req, res) => {
  try {
    console.log('=== PATIENT REGISTRATION REQUEST ===');
    console.log('Request body:', req.body);
    
    const validationError = checkValidationErrors(req, res);
    if (validationError) {
      console.log('Validation failed:', validationError);
      return validationError;
    }

    console.log('Validation passed, calling PatientController.registerPatient');
    const result = await PatientController.registerPatient(req.body);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Patient registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/patient/login
 * Login as patient
 */
router.post('/login', loginValidation, async (req, res) => {
  try {
    console.log('=== PATIENT LOGIN ROUTE HIT ===');
    console.log('Request body:', req.body);
    
    const validationError = checkValidationErrors(req, res);
    if (validationError) {
      console.log('Validation error:', validationError);
      return validationError;
    }

    const { email, password } = req.body;
    console.log('About to call PatientController.loginPatient');
    
    const result = await PatientController.loginPatient(email, password);
    console.log('PatientController.loginPatient result:', result);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('Patient login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /api/patient/profile
 * Get patient profile (authenticated)
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.userId;
    const result = await PatientController.getPatientProfile(patientId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * PUT /api/patient/profile
 * Update patient profile (authenticated)
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
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('contactInfo.phone')
    .optional({ checkFalsy: true })
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('address.street')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Street address must be between 5 and 100 characters'),
  body('address.city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('address.state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  body('address.zipCode')
    .optional()
    .trim()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('Please provide a valid ZIP code'),
  body('address.country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters')
], async (req, res) => {
  try {
    const validationError = checkValidationErrors(req, res);
    if (validationError) return validationError;

    const patientId = req.user.userId;
    const result = await PatientController.updatePatientProfile(patientId, req.body);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Update patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/patient/medical-records
 * Get patient medical records (authenticated)
 */
router.get('/medical-records', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.userId;
    const result = await PatientController.viewMedicalRecords(patientId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * PUT /api/patient/medical-history
 * Update patient medical history (authenticated)
 */
router.put('/medical-history', [
  authenticateToken,
  body('medicalHistory')
    .isArray()
    .withMessage('Medical history must be an array'),
  body('medicalHistory.*.condition')
    .notEmpty()
    .withMessage('Condition is required for each medical history entry'),
  body('medicalHistory.*.date')
    .isISO8601()
    .withMessage('Date must be valid for each medical history entry')
], async (req, res) => {
  try {
    const validationError = checkValidationErrors(req, res);
    if (validationError) return validationError;

    const patientId = req.user.userId;
    const { medicalHistory } = req.body;
    const result = await PatientController.updateMedicalHistory(patientId, medicalHistory);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Update medical history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * PUT /api/patient/allergies
 * Update patient allergies (authenticated)
 */
router.put('/allergies', [
  authenticateToken,
  body('allergies')
    .isArray()
    .withMessage('Allergies must be an array'),
  body('allergies.*.name')
    .notEmpty()
    .withMessage('Allergy name is required for each allergy entry'),
  body('allergies.*.severity')
    .optional()
    .isIn(['mild', 'moderate', 'severe'])
    .withMessage('Severity must be mild, moderate, or severe')
], async (req, res) => {
  try {
    const validationError = checkValidationErrors(req, res);
    if (validationError) return validationError;

    const patientId = req.user.userId;
    const { allergies } = req.body;
    const result = await PatientController.updateAllergies(patientId, allergies);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Update allergies error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/patient/:patientId
 * Get patient by ID (for staff/doctor use)
 */
router.get('/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const result = await PatientController.getPatientById(patientId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Get patient by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/patient/dashboard/stats
 * Get patient dashboard statistics
 */
router.get('/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const result = await PatientController.getDashboardStats(req.user._id);
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/patient/dashboard/recent-activity
 * Get patient recent activity
 */
router.get('/dashboard/recent-activity', authenticateToken, async (req, res) => {
  try {
    const result = await PatientController.getRecentActivity(req.user._id);
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/patient/appointments
 * Get patient appointments
 */
router.get('/appointments', authenticateToken, async (req, res) => {
  try {
    const result = await PatientController.getPatientAppointments(req.user._id);
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/patient/notifications
 * Get patient notifications
 */
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const result = await PatientController.getPatientNotifications(req.user._id);
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Get patient notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * PUT /api/patient/profile
 * Update patient profile
 */
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await PatientController.updatePatientProfile(req.user._id, req.body);
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Update patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/patient/medical-records
 * Get patient medical records
 */
router.get('/medical-records', authenticateToken, async (req, res) => {
  try {
    const result = await PatientController.getPatientMedicalRecords(req.user._id);
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Get patient medical records error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/patient/search/:patientId
 * Search patient by ID (for nurses and staff)
 */
router.get('/search/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const result = await PatientController.searchPatientById(patientId);
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Search patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
