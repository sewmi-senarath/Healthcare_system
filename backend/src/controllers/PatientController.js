import Patient from '../models/Patient.js';
import UserController from './UserController.js';

/**
 * PatientController - Handles all patient-specific operations
 * Following Single Responsibility Principle
 */
class PatientController {
  /**
   * Register a new patient
   * @param {Object} patientData 
   * @returns {Promise<Object>}
   */
  static async registerPatient(patientData) {
    try {
      console.log('=== PATIENT REGISTRATION DEBUG ===');
      console.log('Request body:', patientData);
      console.log('Raw password before saving:', patientData.password);

      const { name, email, password, dateOfBirth, gender, contactInfo } = patientData;

      // Check if email already exists
      const existingUser = await UserController.checkEmailExists(email, 'patient');
      if (existingUser) {
        return {
          success: false,
          message: 'Email already registered'
        };
      }

      // Generate patient ID
      const patientId = `PAT${Date.now().toString().substring(6)}${Math.random().toString(36).substring(2, 4).toUpperCase()}`;

      // Create patient (password will be hashed by User model pre-save middleware)
      const patient = new Patient({
        name,
        email,
        password,
        patientId,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        contactInfo: contactInfo || {}
      });

      await patient.save();
      console.log('Patient saved successfully');
      console.log('Saved password hash:', patient.password.substring(0, 20) + '...');

      // Generate tokens
      const tokens = UserController.generateTokens(patient, 'patient');

      // Remove password from response
      const patientResponse = patient.toObject();
      delete patientResponse.password;

      return {
        success: true,
        message: 'Patient registered successfully',
        user: patientResponse,
        userType: 'patient',
        ...tokens
      };

    } catch (error) {
      console.error('Patient registration error:', error);
      throw error;
    }
  }

  /**
   * Login patient
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<Object>}
   */
  static async loginPatient(email, password) {
    return await UserController.authenticateUser(email, password, 'patient');
  }

  /**
   * Get patient profile
   * @param {string} patientId 
   * @returns {Promise<Object>}
   */
  static async getPatientProfile(patientId) {
    try {
      const patient = await Patient.findById(patientId).select('-password');
      
      if (!patient) {
        return {
          success: false,
          message: 'Patient not found'
        };
      }

      return {
        success: true,
        patient: patient.toObject()
      };
    } catch (error) {
      console.error('Get patient profile error:', error);
      throw error;
    }
  }

  /**
   * Update patient profile
   * @param {string} patientId 
   * @param {Object} updateData 
   * @returns {Promise<Object>}
   */
  static async updatePatientProfile(patientId, updateData) {
    try {
      const patient = await Patient.findById(patientId);
      
      if (!patient) {
        return {
          success: false,
          message: 'Patient not found'
        };
      }

      // Update allowed fields
      const allowedUpdates = [
        'name', 
        'email', 
        'dateOfBirth', 
        'gender', 
        'contactInfo', 
        'address', 
        'medicalHistory', 
        'allergies', 
        'insuranceDetails'
      ];
      
      const updates = {};
      allowedUpdates.forEach(field => {
        if (updateData[field] !== undefined) {
          updates[field] = updateData[field];
        }
      });

      Object.assign(patient, updates);
      await patient.save();

      // Remove password from response
      const patientResponse = patient.toObject();
      delete patientResponse.password;

      return {
        success: true,
        message: 'Patient profile updated successfully',
        patient: patientResponse
      };
    } catch (error) {
      console.error('Update patient profile error:', error);
      throw error;
    }
  }

  /**
   * View medical records
   * @param {string} patientId 
   * @returns {Promise<Object>}
   */
  static async viewMedicalRecords(patientId) {
    try {
      const patient = await Patient.findById(patientId);
      
      if (!patient) {
        return {
          success: false,
          message: 'Patient not found'
        };
      }

      return {
        success: true,
        medicalRecords: {
          medicalHistory: patient.medicalHistory,
          allergies: patient.allergies,
          insuranceDetails: patient.insuranceDetails
        }
      };
    } catch (error) {
      console.error('View medical records error:', error);
      throw error;
    }
  }

  /**
   * Update medical history
   * @param {string} patientId 
   * @param {Array} medicalHistory 
   * @returns {Promise<Object>}
   */
  static async updateMedicalHistory(patientId, medicalHistory) {
    try {
      const patient = await Patient.findById(patientId);
      
      if (!patient) {
        return {
          success: false,
          message: 'Patient not found'
        };
      }

      patient.medicalHistory = medicalHistory;
      await patient.save();

      return {
        success: true,
        message: 'Medical history updated successfully',
        medicalHistory: patient.medicalHistory
      };
    } catch (error) {
      console.error('Update medical history error:', error);
      throw error;
    }
  }

  /**
   * Update allergies
   * @param {string} patientId 
   * @param {Array} allergies 
   * @returns {Promise<Object>}
   */
  static async updateAllergies(patientId, allergies) {
    try {
      const patient = await Patient.findById(patientId);
      
      if (!patient) {
        return {
          success: false,
          message: 'Patient not found'
        };
      }

      patient.allergies = allergies;
      await patient.save();

      return {
        success: true,
        message: 'Allergies updated successfully',
        allergies: patient.allergies
      };
    } catch (error) {
      console.error('Update allergies error:', error);
      throw error;
    }
  }

  /**
   * Get patient by ID
   * @param {string} patientId 
   * @returns {Promise<Object>}
   */
  static async getPatientById(patientId) {
    try {
      const patient = await Patient.findOne({ patientId });
      
      if (!patient) {
        return {
          success: false,
          message: 'Patient not found'
        };
      }

      return {
        success: true,
        patient: patient.toObject()
      };
    } catch (error) {
      console.error('Get patient by ID error:', error);
      throw error;
    }
  }

  /**
   * Get all patients (for admin/staff use)
   * @param {Object} filters 
   * @returns {Promise<Object>}
   */
  static async getAllPatients(filters = {}) {
    try {
      const query = {};
      
      if (filters.gender) {
        query.gender = filters.gender;
      }
      
      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive;
      }

      const patients = await Patient.find(query)
        .select('-password')
        .sort({ createdAt: -1 });

      return {
        success: true,
        patients: patients.map(patient => patient.toObject()),
        count: patients.length
      };
    } catch (error) {
      console.error('Get all patients error:', error);
      throw error;
    }
  }

  /**
   * Get patient dashboard statistics
   */
  static async getDashboardStats(patientId) {
    try {
      // Import models dynamically to avoid circular dependencies
      const Appointment = (await import('../models/Appointment.js')).default;
      const Prescription = (await import('../models/Prescription.js')).default;
      const SupportTicket = (await import('../models/SupportTicket.js')).default;
      const Notification = (await import('../models/Notification.js')).default;

      // Get upcoming appointments
      const upcomingAppointments = await Appointment.find({
        patientID: patientId,
        status: { $in: ['approved', 'confirmed', 'pending_approval'] },
        dateTime: { $gte: new Date() }
      }).countDocuments();

      // Get total medical records (prescriptions count as medical records)
      const medicalRecords = await Prescription.find({
        patientID: patientId
      }).countDocuments();

      // Get active prescriptions
      const activePrescriptions = await Prescription.find({
        patientID: patientId,
        status: { $in: ['active', 'dispensed'] }
      }).countDocuments();

      // Get unread notifications
      const unreadNotifications = await Notification.find({
        recipientId: patientId,
        recipientType: 'patient',
        status: 'unread'
      }).countDocuments();

      return {
        success: true,
        stats: {
          upcomingAppointments,
          medicalRecords,
          activePrescriptions,
          unreadNotifications
        }
      };
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  }

  /**
   * Get patient recent activity
   */
  static async getRecentActivity(patientId) {
    try {
      console.log('Getting recent activity for patient:', patientId);
      
      // Import models dynamically
      const Appointment = (await import('../models/Appointment.js')).default;
      const Prescription = (await import('../models/Prescription.js')).default;
      const SupportTicket = (await import('../models/SupportTicket.js')).default;
      const Notification = (await import('../models/Notification.js')).default;

      const activities = [];

      // Get recent appointments
      const recentAppointments = await Appointment.find({
        patientID: patientId
      })
      .populate('doctorID', 'name specialization')
      .sort({ createdAt: -1 })
      .limit(3)
      .catch(err => {
        console.log('Error fetching appointments:', err.message);
        return [];
      });

      recentAppointments.forEach(appointment => {
        activities.push({
          type: 'appointment',
          title: `Appointment ${appointment.status === 'approved' ? 'approved' : appointment.status === 'declined' ? 'declined' : 'scheduled'}`,
          description: appointment.status === 'declined' 
            ? `Appointment with Dr. ${appointment.doctorID?.name || 'Unknown'} was declined. Reason: ${appointment.approvalWorkflow?.declineReason || 'Not specified'}`
            : `Appointment with Dr. ${appointment.doctorID?.name || 'Unknown'} scheduled for ${appointment.dateTime.toLocaleDateString()}`,
          date: appointment.createdAt,
          icon: 'CalendarIcon'
        });
      });

      // Get recent prescriptions
      const recentPrescriptions = await Prescription.find({
        patientID: patientId
      })
      .populate('doctorID', 'name')
      .sort({ dateIssued: -1 })
      .limit(2)
      .catch(err => {
        console.log('Error fetching prescriptions:', err.message);
        return [];
      });

      recentPrescriptions.forEach(prescription => {
        activities.push({
          type: 'prescription',
          title: 'New prescription received',
          description: `Prescription from Dr. ${prescription.doctorID?.name || 'Unknown'} with ${prescription.medicineList.length} medications`,
          date: prescription.dateIssued,
          icon: 'HeartIcon'
        });
      });

      // Get recent notifications
      const recentNotifications = await Notification.find({
        recipientId: patientId,
        recipientType: 'patient'
      })
      .sort({ createdAt: -1 })
      .limit(2)
      .catch(err => {
        console.log('Error fetching notifications:', err.message);
        return [];
      });

      recentNotifications.forEach(notification => {
        activities.push({
          type: 'notification',
          title: 'New notification',
          description: notification.message,
          date: notification.createdAt,
          icon: 'BellIcon'
        });
      });

      // Sort all activities by date (most recent first)
      activities.sort((a, b) => new Date(b.date) - new Date(a.date));

      return {
        success: true,
        activities: activities.slice(0, 6), // Return top 6 most recent activities
        message: activities.length === 0 ? 'No recent activity found' : 'Recent activity retrieved successfully'
      };
    } catch (error) {
      console.error('Get recent activity error:', error);
      throw error;
    }
  }

  /**
   * Get patient appointments
   */
  static async getPatientAppointments(patientId) {
    try {
      const Appointment = (await import('../models/Appointment.js')).default;

      const appointments = await Appointment.find({
        patientID: patientId
      })
      .populate('doctorID', 'name specialization')
      .sort({ dateTime: -1 });

      return {
        success: true,
        appointments: appointments.map(appointment => ({
          id: appointment._id,
          appointmentID: appointment.appointmentID,
          doctor: appointment.doctorID,
          dateTime: appointment.dateTime,
          status: appointment.status,
          reasonForVisit: appointment.reasonForVisit,
          consultationFee: appointment.consultationFee,
          department: appointment.appointmentDetails?.location?.department
        }))
      };
    } catch (error) {
      console.error('Get patient appointments error:', error);
      throw error;
    }
  }

  /**
   * Get patient notifications
   */
  static async getPatientNotifications(patientId) {
    try {
      const Notification = (await import('../models/Notification.js')).default;

      const notifications = await Notification.find({
        recipientId: patientId,
        recipientType: 'patient'
      })
      .sort({ createdAt: -1 });

      return {
        success: true,
        notifications: notifications.map(notification => ({
          id: notification._id,
          message: notification.message,
          type: notification.type,
          status: notification.status,
          createdAt: notification.createdAt
        }))
      };
    } catch (error) {
      console.error('Get patient notifications error:', error);
      throw error;
    }
  }

  /**
   * Update patient profile
   */
  static async updatePatientProfile(patientId, profileData) {
    try {
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return {
          success: false,
          message: 'Patient not found'
        };
      }

      // Update profile fields
      if (profileData.name) patient.name = profileData.name;
      if (profileData.email) patient.email = profileData.email;
      if (profileData.dateOfBirth) patient.dateOfBirth = new Date(profileData.dateOfBirth);
      if (profileData.gender) patient.gender = profileData.gender;

      // Update contact info
      if (profileData.contactInfo) {
        patient.contactInfo = {
          ...patient.contactInfo,
          ...profileData.contactInfo
        };
      }

      // Update address
      if (profileData.address) {
        patient.address = {
          ...patient.address,
          ...profileData.address
        };
      }

      await patient.save();

      return {
        success: true,
        message: 'Profile updated successfully',
        patient: {
          id: patient._id,
          name: patient.name,
          email: patient.email,
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender,
          contactInfo: patient.contactInfo,
          address: patient.address
        }
      };
    } catch (error) {
      console.error('Update patient profile error:', error);
      throw error;
    }
  }

  /**
   * Get patient medical records
   */
  static async getPatientMedicalRecords(patientId) {
    try {
      // Import models dynamically
      const Prescription = (await import('../models/Prescription.js')).default;
      const Appointment = (await import('../models/Appointment.js')).default;

      // Get prescriptions (medical records)
      const prescriptions = await Prescription.find({
        patientID: patientId
      })
      .populate('doctorID', 'name specialization')
      .sort({ dateIssued: -1 });

      // Get completed appointments
      const appointments = await Appointment.find({
        patientID: patientId,
        status: 'completed'
      })
      .populate('doctorID', 'name specialization')
      .sort({ dateTime: -1 });

      const medicalRecords = [
        ...prescriptions.map(prescription => ({
          type: 'prescription',
          id: prescription._id,
          date: prescription.dateIssued,
          doctor: prescription.doctorID,
          description: `Prescription with ${prescription.medicineList.length} medications`,
          details: {
            medicineList: prescription.medicineList,
            dosageInstruction: prescription.dosageInstruction,
            status: prescription.status
          }
        })),
        ...appointments.map(appointment => ({
          type: 'appointment',
          id: appointment._id,
          date: appointment.dateTime,
          doctor: appointment.doctorID,
          description: `Appointment - ${appointment.reasonForVisit}`,
          details: {
            department: appointment.appointmentDetails?.location?.department,
            duration: appointment.appointmentDetails?.duration,
            consultationFee: appointment.consultationFee
          }
        }))
      ];

      // Sort by date (most recent first)
      medicalRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

      return {
        success: true,
        medicalRecords: medicalRecords.slice(0, 50) // Limit to 50 most recent records
      };
    } catch (error) {
      console.error('Get patient medical records error:', error);
      throw error;
    }
  }
}

export default PatientController;
