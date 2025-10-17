import express from 'express';
import { body } from 'express-validator';
import { validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import SupportTicket from '../models/SupportTicket.js';

const router = express.Router();

// Validation middleware
const validateSupportTicket = [
  body('issueDescription')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Issue description must be between 10 and 1000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  body('category')
    .optional()
    .isIn(['technical_issue', 'billing_inquiry', 'appointment_issue', 'medical_record_access', 'prescription_issue', 'general_inquiry', 'complaint', 'feedback', 'emergency'])
    .withMessage('Invalid category')
];

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

/**
 * GET /api/support-tickets
 * Get all support tickets for the authenticated user
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = {};
    
    // If user is a patient, only show their tickets
    if (req.user.userType === 'patient') {
      query.patientID = req.user.patientId;
    }
    // If user is a health care manager, show all tickets
    else if (req.user.userType === 'healthCareManager') {
      // Show all tickets
    }
    // For other user types, show tickets assigned to them
    else {
      query.assignedStaffID = req.user._id;
    }

    const tickets = await SupportTicket.find(query)
      .sort({ dateCreated: -1 });

    res.json({
      success: true,
      message: 'Support tickets retrieved successfully',
      tickets: tickets.map(ticket => ({
        id: ticket._id,
        ticketID: ticket.ticketID,
        patient: ticket.patientID,
        issueDescription: ticket.issueDescription,
        status: ticket.status,
        priority: ticket.priority,
        assignedStaff: ticket.assignedStaffID,
        dateCreated: ticket.dateCreated,
        lastUpdated: ticket.lastUpdated
      }))
    });
  } catch (error) {
    console.error('Get support tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/support-tickets
 * Create a new support ticket
 */
router.post('/', [authenticateToken, ...validateSupportTicket], async (req, res) => {
  try {
    console.log('=== CREATE SUPPORT TICKET REQUEST ===');
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    console.log('User type:', req.userType);
    
    const validationError = checkValidationErrors(req, res);
    if (validationError) return validationError;

    const { issueDescription, priority, category } = req.body;

    // Get patientID from authenticated user
    let patientID;
    if (req.user.userType === 'patient') {
      patientID = req.user.patientId;
      console.log('Patient ID:', patientID);
    } else {
      console.log('User is not a patient:', req.user.userType);
      return res.status(403).json({
        success: false,
        message: 'Only patients can create support tickets'
      });
    }

    // Generate unique ticket ID
    const ticketID = `TKT${Date.now()}${Math.random().toString(36).substring(2, 4).toUpperCase()}`;
    console.log('Generated ticket ID:', ticketID);

    const ticketData = {
      ticketID,
      patientID,
      issueDescription,
      status: 'open',
      priority: priority || 'medium',
      category: category || 'general_inquiry',
      dateCreated: new Date(),
      lastUpdated: new Date()
    };
    
    console.log('Ticket data:', ticketData);

    const ticket = new SupportTicket(ticketData);
    console.log('Created ticket object:', ticket);

    const savedTicket = await ticket.save();
    console.log('Saved ticket:', savedTicket);

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      ticket: {
        id: savedTicket._id,
        ticketID: savedTicket.ticketID,
        issueDescription: savedTicket.issueDescription,
        status: savedTicket.status,
        priority: savedTicket.priority,
        category: savedTicket.category,
        dateCreated: savedTicket.dateCreated
      }
    });
  } catch (error) {
    console.error('Create support ticket error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /api/support-tickets/:id
 * Get a specific support ticket
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    // Check if user has access to this ticket
    let hasAccess = false;
    if (req.user.userType === 'healthCareManager') {
      hasAccess = true;
    } else if (req.user.userType === 'patient') {
      hasAccess = ticket.patientID === req.user.patientId;
    } else {
      hasAccess = ticket.assignedStaffID === req.user.empID;
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      message: 'Support ticket retrieved successfully',
      ticket: {
        id: ticket._id,
        ticketID: ticket.ticketID,
        patient: ticket.patientID,
        issueDescription: ticket.issueDescription,
        status: ticket.status,
        priority: ticket.priority,
        assignedStaff: ticket.assignedStaffID,
        dateCreated: ticket.dateCreated,
        lastUpdated: ticket.lastUpdated,
        resolution: ticket.resolution
      }
    });
  } catch (error) {
    console.error('Get support ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * PUT /api/support-tickets/:id/assign
 * Assign a support ticket to staff (Health Care Manager only)
 */
router.put('/:id/assign', authenticateToken, async (req, res) => {
  try {
    // Check if user is a health care manager
    if (req.user.userType !== 'healthCareManager') {
      return res.status(403).json({
        success: false,
        message: 'Only Health Care Managers can assign tickets'
      });
    }

    const { staffId } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    ticket.assignedStaffID = staffId;
    ticket.status = 'in_progress';
    ticket.lastUpdated = new Date();

    await ticket.save();

    res.json({
      success: true,
      message: 'Support ticket assigned successfully',
      ticket: {
        id: ticket._id,
        ticketID: ticket.ticketID,
        status: ticket.status,
        assignedStaffID: ticket.assignedStaffID
      }
    });
  } catch (error) {
    console.error('Assign support ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * PUT /api/support-tickets/:id/status
 * Update support ticket status
 */
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status, resolution } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    // Check if user has permission to update status
    const hasPermission = req.user.userType === 'healthCareManager' || 
                         (ticket.assignedStaffID && ticket.assignedStaffID.toString() === req.user._id.toString());

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    ticket.status = status;
    ticket.lastUpdated = new Date();
    
    if (status === 'resolved' && resolution) {
      ticket.resolution = resolution;
    }

    await ticket.save();

    res.json({
      success: true,
      message: 'Support ticket status updated successfully',
      ticket: {
        id: ticket._id,
        ticketID: ticket.ticketID,
        status: ticket.status,
        resolution: ticket.resolution
      }
    });
  } catch (error) {
    console.error('Update support ticket status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
