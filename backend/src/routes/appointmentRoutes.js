import express from 'express';
import { body, validationResult } from 'express-validator';
import container from '../config/DIContainer.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const checkValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  return null;
};

const appointmentValidation = [
  body('patientID').notEmpty().withMessage('Patient ID is required'),
  body('doctorID').notEmpty().withMessage('Doctor ID is required'),
  body('dateTime').isISO8601().withMessage('Valid date and time is required'),
  body('reasonForVisit').trim().isLength({ min: 5, max: 500 }),
  body('department').trim().isLength({ min: 2, max: 50 })
];

router.get('/departments', (req, res) => {
  const appointmentController = container.get('appointmentController');
  appointmentController.getDepartments(req, res);
});

router.get('/doctors/:department', (req, res) => {
  const appointmentController = container.get('appointmentController');
  appointmentController.getDoctorsByDepartment(req, res);
});

router.get('/available-slots/:doctorId', (req, res) => {
  const appointmentController = container.get('appointmentController');
  appointmentController.getAvailableSlots(req, res);
});

router.post('/reserve-slot', [
  body('doctorId').notEmpty(),
  body('dateTime').isISO8601(),
  body('patientId').notEmpty()
], (req, res) => {
  const error = checkValidationErrors(req, res);
  if (error) return error;
  const appointmentController = container.get('appointmentController');
  appointmentController.reserveSlot(req, res);
});

router.post('/book', [authenticateToken, ...appointmentValidation], (req, res) => {
  const error = checkValidationErrors(req, res);
  if (error) return error;
  const appointmentController = container.get('appointmentController');
  appointmentController.bookAppointment(req, res);
});

router.post('/:id/payment', authenticateToken, (req, res) => {
  const appointmentController = container.get('appointmentController');
  appointmentController.processPayment(req, res);
});

router.get('/patient/:patientId', authenticateToken, (req, res) => {
  const appointmentController = container.get('appointmentController');
  appointmentController.getPatientAppointments(req, res);
});

router.get('/doctor/:doctorId', authenticateToken, (req, res) => {
  const appointmentController = container.get('appointmentController');
  appointmentController.getDoctorAppointments(req, res);
});

router.put('/:id/status', authenticateToken, (req, res) => {
  const appointmentController = container.get('appointmentController');
  appointmentController.updateAppointmentStatus(req, res);
});

router.delete('/:id', authenticateToken, (req, res) => {
  const appointmentController = container.get('appointmentController');
  appointmentController.cancelAppointment(req, res);
});

router.get('/pending-approval', authenticateToken, (req, res) => {
  const appointmentController = container.get('appointmentController');
  appointmentController.getPendingApprovalAppointments(req, res);
});

router.put('/:id/approve', authenticateToken, (req, res) => {
  const appointmentController = container.get('appointmentController');
  appointmentController.approveAppointment(req, res);
});

router.put('/:id/decline', authenticateToken, (req, res) => {
  const appointmentController = container.get('appointmentController');
  appointmentController.declineAppointment(req, res);
});

router.get('/health-manager/all', authenticateToken, (req, res) => {
  const appointmentController = container.get('appointmentController');
  appointmentController.getAllAppointmentsForManager(req, res);
});

export default router;

// import express from 'express';
// import { body, validationResult } from 'express-validator';
// import AppointmentController from '../controllers/AppointmentController.js';
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
// const appointmentValidation = [
//   body('patientID')
//     .notEmpty()
//     .withMessage('Patient ID is required'),
//   body('doctorID')
//     .notEmpty()
//     .withMessage('Doctor ID is required'),
//   body('dateTime')
//     .isISO8601()
//     .withMessage('Valid date and time is required'),
//   body('reasonForVisit')
//     .trim()
//     .isLength({ min: 5, max: 500 })
//     .withMessage('Reason for visit must be between 5 and 500 characters'),
//   body('department')
//     .trim()
//     .isLength({ min: 2, max: 50 })
//     .withMessage('Department must be between 2 and 50 characters')
// ];

// const paymentValidation = [
//   body('appointmentId')
//     .notEmpty()
//     .withMessage('Appointment ID is required'),
//   body('paymentMethod')
//     .isIn(['card', 'cash', 'insurance'])
//     .withMessage('Invalid payment method'),
//   body('amount')
//     .isFloat({ min: 0 })
//     .withMessage('Amount must be a positive number')
// ];

// /**
//  * GET /api/appointments/departments
//  * Get all available departments
//  */
// router.get('/departments', async (req, res) => {
//   try {
//     const result = await AppointmentController.getDepartments();
//     res.json(result);
//   } catch (error) {
//     console.error('Get departments error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// /**
//  * GET /api/appointments/doctors/:department
//  * Get doctors by department
//  */
// router.get('/doctors/:department', async (req, res) => {
//   try {
//     const { department } = req.params;
//     const result = await AppointmentController.getDoctorsByDepartment(department);
//     res.json(result);
//   } catch (error) {
//     console.error('Get doctors error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// /**
//  * GET /api/appointments/available-slots/:doctorId
//  * Get available time slots for a doctor
//  */
// router.get('/available-slots/:doctorId', async (req, res) => {
//   try {
//     const { doctorId } = req.params;
//     const { date } = req.query;
//     const result = await AppointmentController.getAvailableSlots(doctorId, date);
//     res.json(result);
//   } catch (error) {
//     console.error('Get available slots error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// /**
//  * POST /api/appointments/reserve-slot
//  * Temporarily reserve a time slot
//  */
// router.post('/reserve-slot', [
//   body('doctorId').notEmpty().withMessage('Doctor ID is required'),
//   body('dateTime').isISO8601().withMessage('Valid date and time is required'),
//   body('patientId').notEmpty().withMessage('Patient ID is required')
// ], async (req, res) => {
//   try {
//     const validationError = checkValidationErrors(req, res);
//     if (validationError) return validationError;

//     const result = await AppointmentController.reserveSlot(req.body);
//     res.json(result);
//   } catch (error) {
//     console.error('Reserve slot error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// /**
//  * POST /api/appointments/book
//  * Book an appointment
//  */
// router.post('/book', [authenticateToken, ...appointmentValidation], async (req, res) => {
//   try {
//     const validationError = checkValidationErrors(req, res);
//     if (validationError) return validationError;

//     const result = await AppointmentController.bookAppointment(req.body, req.user);
//     res.json(result);
//   } catch (error) {
//     console.error('Book appointment error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// /**
//  * POST /api/appointments/:id/payment
//  * Process payment for an appointment
//  */
// router.post('/:id/payment', [authenticateToken, ...paymentValidation], async (req, res) => {
//   try {
//     const validationError = checkValidationErrors(req, res);
//     if (validationError) return validationError;

//     const { id } = req.params;
//     const result = await AppointmentController.processPayment(id, req.body, req.user);
//     res.json(result);
//   } catch (error) {
//     console.error('Process payment error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// /**
//  * GET /api/appointments/patient/:patientId
//  * Get appointments for a patient
//  */
// router.get('/patient/:patientId', [authenticateToken], async (req, res) => {
//   try {
//     const { patientId } = req.params;
//     const result = await AppointmentController.getPatientAppointments(patientId, req.user);
//     res.json(result);
//   } catch (error) {
//     console.error('Get patient appointments error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// /**
//  * GET /api/appointments/doctor/:doctorId
//  * Get appointments for a doctor
//  */
// router.get('/doctor/:doctorId', [authenticateToken], async (req, res) => {
//   try {
//     const { doctorId } = req.params;
//     const result = await AppointmentController.getDoctorAppointments(doctorId, req.user);
//     res.json(result);
//   } catch (error) {
//     console.error('Get doctor appointments error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// /**
//  * PUT /api/appointments/:id/status
//  * Update appointment status
//  */
// router.put('/:id/status', [authenticateToken], async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status, reason } = req.body;
//     const result = await AppointmentController.updateAppointmentStatus(id, status, reason, req.user);
//     res.json(result);
//   } catch (error) {
//     console.error('Update appointment status error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// /**
//  * DELETE /api/appointments/:id
//  * Cancel an appointment
//  */
// router.delete('/:id', [authenticateToken], async (req, res) => {
//   try {
//     const { id } = req.params;
//     const result = await AppointmentController.cancelAppointment(id, req.user);
//     res.json(result);
//   } catch (error) {
//     console.error('Cancel appointment error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// /**
//  * GET /api/appointments/pending-approval
//  * Get appointments pending Health Manager approval
//  */
// router.get('/pending-approval', [authenticateToken], async (req, res) => {
//   try {
//     const result = await AppointmentController.getPendingApprovalAppointments();
//     res.json(result);
//   } catch (error) {
//     console.error('Get pending approval appointments error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// /**
//  * PUT /api/appointments/:id/approve
//  * Approve an appointment (Health Manager only)
//  */
// router.put('/:id/approve', [authenticateToken], async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { approvalNotes } = req.body;
//     const result = await AppointmentController.approveAppointment(id, approvalNotes, req.user);
//     res.json(result);
//   } catch (error) {
//     console.error('Approve appointment error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// /**
//  * PUT /api/appointments/:id/decline
//  * Decline an appointment (Health Manager only)
//  */
// router.put('/:id/decline', [authenticateToken], async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { declineReason } = req.body;
//     const result = await AppointmentController.declineAppointment(id, declineReason, req.user);
//     res.json(result);
//   } catch (error) {
//     console.error('Decline appointment error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// /**
//  * GET /api/appointments/doctor/:doctorId
//  * Get appointments for a specific doctor
//  */
// router.get('/doctor/:doctorId', [authenticateToken], async (req, res) => {
//   try {
//     const { doctorId } = req.params;
//     const result = await AppointmentController.getDoctorAppointments(doctorId, req.user);
//     res.json(result);
//   } catch (error) {
//     console.error('Get doctor appointments error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// /**
//  * GET /api/appointments/health-manager/all
//  * Get all appointments for Health Manager
//  */
// router.get('/health-manager/all', [authenticateToken], async (req, res) => {
//   try {
//     const result = await AppointmentController.getAllAppointmentsForManager(req.user);
//     res.json(result);
//   } catch (error) {
//     console.error('Get all appointments for manager error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// export default router;
