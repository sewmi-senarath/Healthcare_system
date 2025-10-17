import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';

/**
 * AppointmentBookingController - Handles appointment booking and scheduling
 * Following Single Responsibility Principle - Only handles booking-related operations
 */
class AppointmentBookingController {
  /**
   * Get available time slots for a doctor on a specific date
   * @param {string} doctorId 
   * @param {Date} date 
   * @returns {Promise<Object>}
   */
  static async getAvailableSlots(doctorId, date) {
    try {
      const doctor = await Doctor.findOne({ empID: doctorId });
      
      if (!doctor) {
        return {
          success: false,
          message: 'Doctor not found'
        };
      }

      const requestedDate = new Date(date);
      const startOfDay = new Date(requestedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(requestedDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Get existing appointments for the day
      const existingAppointments = await Appointment.find({
        doctorID: doctorId,
        dateTime: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['approved', 'confirmed', 'pending_approval'] }
      });

      // Get doctor's availability for the day of week
      const dayOfWeek = requestedDate.toLocaleLowerCase();
      const dayAvailability = doctor.availability?.[dayOfWeek] || {
        start: '09:00',
        end: '17:00',
        isAvailable: true
      };

      if (!dayAvailability.isAvailable) {
        return {
          success: true,
          slots: [],
          message: 'Doctor is not available on this day'
        };
      }

      // Generate time slots (30-minute intervals)
      const slots = [];
      const startTime = dayAvailability.start;
      const endTime = dayAvailability.end;
      const slotDuration = 30; // minutes

      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);

      let currentTime = new Date(requestedDate);
      currentTime.setHours(startHour, startMin, 0, 0);

      const endDateTime = new Date(requestedDate);
      endDateTime.setHours(endHour, endMin, 0, 0);

      while (currentTime < endDateTime) {
        const slotEndTime = new Date(currentTime);
        slotEndTime.setMinutes(slotEndTime.getMinutes() + slotDuration);

        // Check if slot conflicts with existing appointments
        const hasConflict = existingAppointments.some(appointment => {
          const appointmentStart = new Date(appointment.dateTime);
          const appointmentEnd = new Date(appointment.dateTime);
          appointmentEnd.setMinutes(appointmentEnd.getMinutes() + 30);

          return (currentTime < appointmentEnd && slotEndTime > appointmentStart);
        });

        if (!hasConflict) {
          slots.push({
            time: currentTime.toISOString(),
            formattedTime: currentTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }),
            available: true
          });
        }

        currentTime.setMinutes(currentTime.getMinutes() + slotDuration);
      }

      return {
        success: true,
        slots: slots,
        doctor: {
          empID: doctor.empID,
          name: doctor.name,
          consultationFee: doctor.consultationFee
        }
      };
    } catch (error) {
      console.error('Error getting available slots:', error);
      return {
        success: false,
        message: 'Failed to retrieve available slots'
      };
    }
  }

  /**
   * Reserve a time slot
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  static async reserveSlot(data) {
    try {
      const { doctorId, patientId, dateTime, duration = 30 } = data;

      const doctor = await Doctor.findOne({ empID: doctorId });
      const patient = await Patient.findOne({ patientId: patientId });

      if (!doctor) {
        return {
          success: false,
          message: 'Doctor not found'
        };
      }

      if (!patient) {
        return {
          success: false,
          message: 'Patient not found'
        };
      }

      const appointmentDateTime = new Date(dateTime);
      
      // Check if slot is still available
      const conflictingAppointment = await Appointment.findOne({
        doctorID: doctorId,
        dateTime: appointmentDateTime,
        status: { $in: ['approved', 'confirmed', 'pending_approval'] }
      });

      if (conflictingAppointment) {
        return {
          success: false,
          message: 'This time slot is no longer available'
        };
      }

      // Check doctor's availability for this time
      const dayOfWeek = appointmentDateTime.toLocaleLowerCase();
      const dayAvailability = doctor.availability?.[dayOfWeek];

      if (!dayAvailability || !dayAvailability.isAvailable) {
        return {
          success: false,
          message: 'Doctor is not available at this time'
        };
      }

      const appointmentTime = appointmentDateTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      if (appointmentTime < dayAvailability.start || appointmentTime >= dayAvailability.end) {
        return {
          success: false,
          message: 'Selected time is outside doctor\'s availability'
        };
      }

      return {
        success: true,
        message: 'Time slot is available for booking',
        appointmentData: {
          doctorId,
          patientId,
          dateTime: appointmentDateTime,
          duration,
          doctor: {
            name: doctor.name,
            specialization: doctor.specialization,
            consultationFee: doctor.consultationFee
          },
          patient: {
            name: patient.name,
            email: patient.email
          }
        }
      };
    } catch (error) {
      console.error('Error reserving slot:', error);
      return {
        success: false,
        message: 'Failed to reserve time slot'
      };
    }
  }

  /**
   * Book an appointment
   * @param {Object} appointmentData 
   * @param {Object} user 
   * @returns {Promise<Object>}
   */
  static async bookAppointment(appointmentData, user) {
    try {
      const {
        doctorId,
        dateTime,
        duration = 30,
        reason,
        symptoms,
        urgency = 'normal',
        preferredCommunicationMethod = 'email'
      } = appointmentData;

      const doctor = await Doctor.findOne({ empID: doctorId });
      const patient = await Patient.findOne({ 
        patientId: user.userType === 'patient' ? user.patientId : appointmentData.patientId 
      });

      if (!doctor) {
        return {
          success: false,
          message: 'Doctor not found'
        };
      }

      if (!patient) {
        return {
          success: false,
          message: 'Patient not found'
        };
      }

      // Generate appointment ID
      const appointmentId = `APT${Date.now().toString().substring(6)}${Math.random().toString(36).substring(2, 4).toUpperCase()}`;

      // Create appointment
      const appointment = new Appointment({
        appointmentID: appointmentId,
        patientID: patient.patientId,
        doctorID: doctorId,
        dateTime: new Date(dateTime),
        duration: duration,
        reason: reason || 'General consultation',
        symptoms: symptoms || [],
        urgency: urgency,
        status: 'pending_approval',
        preferredCommunicationMethod: preferredCommunicationMethod,
        paymentStatus: 'pending',
        createdBy: user.userType === 'patient' ? user.patientId : user.empID,
        createdAt: new Date()
      });

      await appointment.save();

      // Populate the appointment with patient and doctor details
      const populatedAppointment = await Appointment.findById(appointment._id)
        .populate('patientID', 'name email phone')
        .populate('doctorID', 'name specialization department');

      return {
        success: true,
        message: 'Appointment booked successfully',
        appointment: populatedAppointment
      };
    } catch (error) {
      console.error('Error booking appointment:', error);
      return {
        success: false,
        message: 'Failed to book appointment'
      };
    }
  }
}

export default AppointmentBookingController;
