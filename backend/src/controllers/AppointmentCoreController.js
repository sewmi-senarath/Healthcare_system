import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';

/**
 * AppointmentCoreController - Handles core appointment CRUD operations
 * Following Single Responsibility Principle - Only handles basic appointment data operations
 */
class AppointmentCoreController {
  /**
   * Get all available departments
   * @returns {Promise<Object>}
   */
  static async getDepartments() {
    try {
      // In a real application, this would come from a departments collection
      const departments = [
        {
          id: 'cardiology',
          name: 'Cardiology',
          description: 'Heart and cardiovascular care',
          icon: 'heart',
          color: 'red'
        },
        {
          id: 'neurology',
          name: 'Neurology',
          description: 'Brain and nervous system care',
          icon: 'brain',
          color: 'blue'
        },
        {
          id: 'orthopedics',
          name: 'Orthopedics',
          description: 'Bone and joint care',
          icon: 'bone',
          color: 'green'
        },
        {
          id: 'pediatrics',
          name: 'Pediatrics',
          description: 'Children\'s healthcare',
          icon: 'baby',
          color: 'yellow'
        },
        {
          id: 'emergency',
          name: 'Emergency Medicine',
          description: 'Urgent care and emergencies',
          icon: 'ambulance',
          color: 'orange'
        },
        {
          id: 'dermatology',
          name: 'Dermatology',
          description: 'Skin care and treatment',
          icon: 'hand',
          color: 'pink'
        },
        {
          id: 'oncology',
          name: 'Oncology',
          description: 'Cancer treatment and care',
          icon: 'shield',
          color: 'purple'
        },
        {
          id: 'psychiatry',
          name: 'Psychiatry',
          description: 'Mental health and wellness',
          icon: 'head-side-brain',
          color: 'indigo'
        }
      ];

      return {
        success: true,
        departments
      };
    } catch (error) {
      console.error('Error getting departments:', error);
      return {
        success: false,
        message: 'Failed to retrieve departments'
      };
    }
  }

  /**
   * Get doctors by department
   * @param {string} department 
   * @returns {Promise<Object>}
   */
  static async getDoctorsByDepartment(department) {
    try {
      const doctors = await Doctor.find({
        specialization: department,
        status: 'active'
      }).select('-password -__v');

      if (doctors.length === 0) {
        return {
          success: true,
          doctors: [],
          message: 'No doctors found for this department'
        };
      }

      const doctorsWithAvailability = await Promise.all(
        doctors.map(async (doctor) => {
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          const todayAppointments = await Appointment.find({
            doctorID: doctor.empID,
            dateTime: { $gte: today, $lt: tomorrow },
            status: { $in: ['approved', 'confirmed', 'pending_approval'] }
          }).countDocuments();

          return {
            empID: doctor.empID,
            name: doctor.name,
            specialization: doctor.specialization,
            department: doctor.department,
            phone: doctor.phone,
            whatApp: doctor.whatApp,
            preferredCommunicationMethod: doctor.preferredCommunicationMethod,
            profilePicture: doctor.profilePicture,
            consultationFee: doctor.consultationFee,
            experience: doctor.experience,
            education: doctor.education,
            todayAppointments: todayAppointments,
            maxAppointmentsPerDay: doctor.maxAppointmentsPerDay || 10
          };
        })
      );

      return {
        success: true,
        doctors: doctorsWithAvailability
      };
    } catch (error) {
      console.error('Error getting doctors by department:', error);
      return {
        success: false,
        message: 'Failed to retrieve doctors'
      };
    }
  }

  /**
   * Get doctor by ID with availability info
   * @param {string} doctorId 
   * @returns {Promise<Object>}
   */
  static async getDoctorById(doctorId) {
    try {
      const doctor = await Doctor.findOne({ empID: doctorId }).select('-password -__v');
      
      if (!doctor) {
        return {
          success: false,
          message: 'Doctor not found'
        };
      }

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayAppointments = await Appointment.find({
        doctorID: doctorId,
        dateTime: { $gte: today, $lt: tomorrow },
        status: { $in: ['approved', 'confirmed', 'pending_approval'] }
      }).countDocuments();

      const doctorWithAvailability = {
        empID: doctor.empID,
        name: doctor.name,
        specialization: doctor.specialization,
        department: doctor.department,
        phone: doctor.phone,
        whatApp: doctor.whatApp,
        preferredCommunicationMethod: doctor.preferredCommunicationMethod,
        profilePicture: doctor.profilePicture,
        consultationFee: doctor.consultationFee,
        experience: doctor.experience,
        education: doctor.education,
        todayAppointments: todayAppointments,
        maxAppointmentsPerDay: doctor.maxAppointmentsPerDay || 10,
        availability: doctor.availability || {
          monday: { start: '09:00', end: '17:00', isAvailable: true },
          tuesday: { start: '09:00', end: '17:00', isAvailable: true },
          wednesday: { start: '09:00', end: '17:00', isAvailable: true },
          thursday: { start: '09:00', end: '17:00', isAvailable: true },
          friday: { start: '09:00', end: '17:00', isAvailable: true },
          saturday: { start: '09:00', end: '13:00', isAvailable: true },
          sunday: { start: '00:00', end: '00:00', isAvailable: false }
        }
      };

      return {
        success: true,
        doctor: doctorWithAvailability
      };
    } catch (error) {
      console.error('Error getting doctor by ID:', error);
      return {
        success: false,
        message: 'Failed to retrieve doctor information'
      };
    }
  }

  /**
   * Get patient appointments
   * @param {string} patientId 
   * @param {Object} user 
   * @returns {Promise<Object>}
   */
  static async getPatientAppointments(patientId, user) {
    try {
      const appointments = await Appointment.find({ patientID: patientId })
        .populate('doctorID', 'name specialization department')
        .sort({ dateTime: -1 });

      return {
        success: true,
        appointments: appointments
      };
    } catch (error) {
      console.error('Error getting patient appointments:', error);
      return {
        success: false,
        message: 'Failed to retrieve appointments'
      };
    }
  }

  /**
   * Get doctor appointments
   * @param {string} doctorId 
   * @param {Object} user 
   * @returns {Promise<Object>}
   */
  static async getDoctorAppointments(doctorId, user) {
    try {
      const appointments = await Appointment.find({ doctorID: doctorId })
        .populate('patientID', 'name email phone')
        .sort({ dateTime: -1 });

      return {
        success: true,
        appointments: appointments
      };
    } catch (error) {
      console.error('Error getting doctor appointments:', error);
      return {
        success: false,
        message: 'Failed to retrieve appointments'
      };
    }
  }

  /**
   * Get all appointments for manager
   * @param {Object} user 
   * @returns {Promise<Object>}
   */
  static async getAllAppointmentsForManager(user) {
    try {
      const appointments = await Appointment.find({})
        .populate('patientID', 'name email phone')
        .populate('doctorID', 'name specialization department')
        .sort({ dateTime: -1 });

      return {
        success: true,
        appointments: appointments
      };
    } catch (error) {
      console.error('Error getting all appointments:', error);
      return {
        success: false,
        message: 'Failed to retrieve appointments'
      };
    }
  }

  /**
   * Update appointment status
   * @param {string} appointmentId 
   * @param {string} status 
   * @param {string} reason 
   * @param {Object} user 
   * @returns {Promise<Object>}
   */
  static async updateAppointmentStatus(appointmentId, status, reason, user) {
    try {
      const appointment = await Appointment.findById(appointmentId);
      
      if (!appointment) {
        return {
          success: false,
          message: 'Appointment not found'
        };
      }

      appointment.status = status;
      if (reason) {
        appointment.statusReason = reason;
      }
      appointment.lastUpdatedBy = user.userType === 'patient' ? user.patientId : user.empID;
      appointment.lastUpdatedAt = new Date();

      await appointment.save();

      return {
        success: true,
        message: 'Appointment status updated successfully',
        appointment: appointment
      };
    } catch (error) {
      console.error('Error updating appointment status:', error);
      return {
        success: false,
        message: 'Failed to update appointment status'
      };
    }
  }

  /**
   * Cancel appointment
   * @param {string} appointmentId 
   * @param {Object} user 
   * @returns {Promise<Object>}
   */
  static async cancelAppointment(appointmentId, user) {
    try {
      const appointment = await Appointment.findById(appointmentId);
      
      if (!appointment) {
        return {
          success: false,
          message: 'Appointment not found'
        };
      }

      appointment.status = 'cancelled';
      appointment.cancellationReason = 'Cancelled by patient';
      appointment.cancelledBy = user.userType === 'patient' ? user.patientId : user.empID;
      appointment.cancelledAt = new Date();
      appointment.lastUpdatedBy = user.userType === 'patient' ? user.patientId : user.empID;
      appointment.lastUpdatedAt = new Date();

      await appointment.save();

      return {
        success: true,
        message: 'Appointment cancelled successfully',
        appointment: appointment
      };
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      return {
        success: false,
        message: 'Failed to cancel appointment'
      };
    }
  }
}

export default AppointmentCoreController;
