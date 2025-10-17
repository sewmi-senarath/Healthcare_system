import express from 'express';
import PrescriptionController from '../controllers/PrescriptionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Debug: Log all routes when they're registered
console.log('=== PRESCRIPTION ROUTES REGISTRATION ===');
console.log('Registering prescription routes...');

/**
 * POST /api/prescriptions
 * Create a new prescription (Doctor only)
 */
console.log('Registering POST /prescriptions');
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Check if user is a doctor
    if (req.user.userType !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can create prescriptions'
      });
    }

    const result = await PrescriptionController.createPrescription(req.body, req.user.empID);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/prescriptions/doctor
 * Get prescriptions for a doctor
 */
console.log('Registering GET /prescriptions/doctor');
router.get('/doctor', authenticateToken, async (req, res) => {
  try {
    // Check if user is a doctor
    if (req.user.userType !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const result = await PrescriptionController.getDoctorPrescriptions(req.user.empID);
    res.json(result);
  } catch (error) {
    console.error('Get doctor prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/prescriptions/pharmacist
 * Get prescriptions for pharmacist
 */
router.get('/pharmacist', authenticateToken, async (req, res) => {
  try {
    // Check if user is a pharmacist
    if (req.user.userType !== 'pharmacist') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const result = await PrescriptionController.getPharmacistPrescriptions();
    res.json(result);
  } catch (error) {
    console.error('Get pharmacist prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/prescriptions/:prescriptionId
 * Get prescription by ID
 */
router.get('/:prescriptionId', authenticateToken, async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const result = await PrescriptionController.getPrescriptionById(prescriptionId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Get prescription by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * PUT /api/prescriptions/:prescriptionId/status
 * Update prescription status (Pharmacist only)
 */
router.put('/:prescriptionId/status', authenticateToken, async (req, res) => {
  try {
    // Check if user is a pharmacist
    if (req.user.userType !== 'pharmacist') {
      return res.status(403).json({
        success: false,
        message: 'Only pharmacists can update prescription status'
      });
    }

    const { prescriptionId } = req.params;
    const { status } = req.body;
    
    const result = await PrescriptionController.updatePrescriptionStatus(
      prescriptionId, 
      status, 
      req.user.empID, 
      req.user.name
    );
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Update prescription status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/prescriptions/stats
 * Get prescription statistics
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const result = await PrescriptionController.getPrescriptionStats();
    res.json(result);
  } catch (error) {
    console.error('Get prescription stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/prescriptions/patient/my-prescriptions
 * Get prescriptions for the authenticated patient
 */
console.log('Registering GET /prescriptions/patient/my-prescriptions');
router.get('/patient/my-prescriptions', authenticateToken, async (req, res) => {
  try {
    console.log('=== PATIENT MY PRESCRIPTIONS ROUTE HIT ===');
    console.log('req.user:', req.user);
    console.log('req.userType:', req.userType);
    console.log('req.userId:', req.userId);
    
    // Check if user is a patient
    if (req.userType !== 'patient') {
      console.log('User is not a patient, userType:', req.userType);
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    console.log('Getting prescriptions for patientId:', req.user.patientId);
    const result = await PrescriptionController.searchPrescriptionsByPatient(req.user.patientId);
    console.log('Prescription result:', result);
    res.json(result);
  } catch (error) {
    console.error('Get patient prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/prescriptions/patient/:patientId
 * Search prescriptions by patient ID (for staff/doctor use)
 */
console.log('Registering GET /prescriptions/patient/:patientId');
router.get('/patient/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    console.log('Getting prescriptions for patientId (staff/doctor):', patientId);
    const result = await PrescriptionController.searchPrescriptionsByPatient(patientId);
    res.json(result);
  } catch (error) {
    console.error('Search prescriptions by patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Debug: Log that routes are fully registered
console.log('All prescription routes registered successfully');

export default router;
