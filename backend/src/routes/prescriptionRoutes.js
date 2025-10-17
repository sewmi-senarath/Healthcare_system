// import express from 'express';
// import PrescriptionController from '../controllers/PrescriptionController.js';
// import { authenticateToken } from '../middleware/auth.js';

// const router = express.Router();

// /**
//  * POST /api/prescriptions
//  * Create a new prescription (Doctor only)
//  */
// router.post('/', authenticateToken, async (req, res) => {
//   try {
//     // Check if user is a doctor
//     if (req.user.userType !== 'doctor') {
//       return res.status(403).json({
//         success: false,
//         message: 'Only doctors can create prescriptions'
//       });
//     }

//     const result = await PrescriptionController.createPrescription(req.body, req.user.empID);
    
//     if (result.success) {
//       res.status(201).json(result);
//     } else {
//       res.status(400).json(result);
//     }
//   } catch (error) {
//     console.error('Create prescription error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// /**
//  * GET /api/prescriptions/doctor
//  * Get prescriptions for a doctor
//  */
// router.get('/doctor', authenticateToken, async (req, res) => {
//   try {
//     // Check if user is a doctor
//     if (req.user.userType !== 'doctor') {
//       return res.status(403).json({
//         success: false,
//         message: 'Access denied'
//       });
//     }

//     const result = await PrescriptionController.getDoctorPrescriptions(req.user.empID);
//     res.json(result);
//   } catch (error) {
//     console.error('Get doctor prescriptions error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// /**
//  * GET /api/prescriptions/pharmacist
//  * Get prescriptions for pharmacist
//  */
// router.get('/pharmacist', authenticateToken, async (req, res) => {
//   try {
//     // Check if user is a pharmacist
//     if (req.user.userType !== 'pharmacist') {
//       return res.status(403).json({
//         success: false,
//         message: 'Access denied'
//       });
//     }

//     const result = await PrescriptionController.getPharmacistPrescriptions();
//     res.json(result);
//   } catch (error) {
//     console.error('Get pharmacist prescriptions error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// /**
//  * GET /api/prescriptions/:prescriptionId
//  * Get prescription by ID
//  */
// router.get('/:prescriptionId', authenticateToken, async (req, res) => {
//   try {
//     const { prescriptionId } = req.params;
//     const result = await PrescriptionController.getPrescriptionById(prescriptionId);
    
//     if (result.success) {
//       res.json(result);
//     } else {
//       res.status(404).json(result);
//     }
//   } catch (error) {
//     console.error('Get prescription by ID error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// /**
//  * PUT /api/prescriptions/:prescriptionId/status
//  * Update prescription status (Pharmacist only)
//  */
// router.put('/:prescriptionId/status', authenticateToken, async (req, res) => {
//   try {
//     // Check if user is a pharmacist
//     if (req.user.userType !== 'pharmacist') {
//       return res.status(403).json({
//         success: false,
//         message: 'Only pharmacists can update prescription status'
//       });
//     }

//     const { prescriptionId } = req.params;
//     const { status } = req.body;
    
//     const result = await PrescriptionController.updatePrescriptionStatus(
//       prescriptionId, 
//       status, 
//       req.user.empID, 
//       req.user.name
//     );
    
//     if (result.success) {
//       res.json(result);
//     } else {
//       res.status(400).json(result);
//     }
//   } catch (error) {
//     console.error('Update prescription status error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// /**
//  * GET /api/prescriptions/stats
//  * Get prescription statistics
//  */
// router.get('/stats', authenticateToken, async (req, res) => {
//   try {
//     const result = await PrescriptionController.getPrescriptionStats();
//     res.json(result);
//   } catch (error) {
//     console.error('Get prescription stats error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// /**
//  * GET /api/prescriptions/patient/:patientId
//  * Search prescriptions by patient ID
//  */
// router.get('/patient/:patientId', authenticateToken, async (req, res) => {
//   try {
//     const { patientId } = req.params;
//     const result = await PrescriptionController.searchPrescriptionsByPatient(patientId);
//     res.json(result);
//   } catch (error) {
//     console.error('Search prescriptions by patient error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// export default router;

import express from 'express';
import container from '../config/DIContainer.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, (req, res) => {
  if (req.user.userType !== 'doctor') {
    return res.status(403).json({ success: false, message: 'Only doctors can create prescriptions' });
  }
  const prescriptionController = container.get('prescriptionController');
  prescriptionController.createPrescription(req, res);
});

router.get('/doctor', authenticateToken, (req, res) => {
  if (req.user.userType !== 'doctor') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  const prescriptionController = container.get('prescriptionController');
  prescriptionController.getDoctorPrescriptions(req, res);
});

router.get('/pharmacist', authenticateToken, (req, res) => {
  if (req.user.userType !== 'pharmacist') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  const prescriptionController = container.get('prescriptionController');
  prescriptionController.getPharmacistPrescriptions(req, res);
});

router.get('/stats', authenticateToken, (req, res) => {
  const prescriptionController = container.get('prescriptionController');
  prescriptionController.getPrescriptionStats(req, res);
});

router.get('/patient/:patientId', authenticateToken, (req, res) => {
  const prescriptionController = container.get('prescriptionController');
  prescriptionController.searchPrescriptionsByPatient(req, res);
});

router.get('/:prescriptionId', authenticateToken, (req, res) => {
  const prescriptionController = container.get('prescriptionController');
  prescriptionController.getPrescriptionById(req, res);
});

router.put('/:prescriptionId/status', authenticateToken, (req, res) => {
  if (req.user.userType !== 'pharmacist') {
    return res.status(403).json({ success: false, message: 'Only pharmacists can update prescription status' });
  }
  const prescriptionController = container.get('prescriptionController');
  prescriptionController.updatePrescriptionStatus(req, res);
});

export default router;