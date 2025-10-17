/**
 * DoctorAppointmentMethods - Appointment-related methods for Doctor model
 * Following Single Responsibility Principle - Only handles appointment operations
 */

export const doctorAppointmentMethods = {
  /**
   * View appointments for a doctor
   * @param {string} status - Filter by appointment status
   * @param {Date} date - Filter by specific date
   * @returns {Promise<Object>}
   */
  viewAppointments: async function(status = null, date = null) {
    // Import Appointment model dynamically to avoid circular dependency
    const Appointment = (await import('../Appointment.js')).default;
    
    let query = { doctorID: this.empID };
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.dateTime = { $gte: startOfDay, $lte: endOfDay };
    }
    
    const appointments = await Appointment.find(query)
      .populate('patientID', 'name email phone')
      .sort({ dateTime: 1 });
    
    return {
      success: true,
      appointments: appointments,
      count: appointments.length
    };
  },

  /**
   * View a specific appointment
   * @param {string} appointmentID 
   * @returns {Promise<Object>}
   */
  viewAppointment: async function(appointmentID) {
    // Import Appointment model dynamically to avoid circular dependency
    const Appointment = (await import('../Appointment.js')).default;
    
    const appointment = await Appointment.findByAppointmentID(appointmentID);
    
    if (!appointment) {
      return {
        success: false,
        message: 'Appointment not found'
      };
    }
    
    return {
      success: true,
      appointment: appointment
    };
  },

  /**
   * Start an appointment
   * @param {string} appointmentID 
   * @returns {Promise<Object>}
   */
  startAppointment: async function(appointmentID) {
    // Import Appointment and Notification models dynamically to avoid circular dependency
    const Appointment = (await import('../Appointment.js')).default;
    const Notification = (await import('../Notification.js')).default;
    
    const appointment = await Appointment.findByAppointmentID(appointmentID);
    
    if (!appointment) {
      return {
        success: false,
        message: 'Appointment not found'
      };
    }
    
    if (appointment.doctorID !== this.empID) {
      return {
        success: false,
        message: 'Unauthorized to start this appointment'
      };
    }
    
    if (appointment.status !== 'confirmed') {
      return {
        success: false,
        message: 'Appointment must be confirmed to start'
      };
    }
    
    appointment.status = 'in_progress';
    appointment.startedAt = new Date();
    appointment.lastUpdatedBy = this.empID;
    appointment.lastUpdatedAt = new Date();
    
    await appointment.save();
    
    // Send notification to patient
    const notification = new Notification({
      notificationId: `NOTIF${Date.now()}${Math.random().toString(36).substring(2, 4)}`,
      recipientId: appointment.patientID,
      recipientType: 'patient',
      title: 'Appointment Started',
      message: `Dr. ${this.name} has started your appointment.`,
      type: 'appointment_update',
      status: 'unread',
      priority: 'high',
      data: {
        appointmentId: appointment.appointmentID,
        doctorName: this.name,
        appointmentDate: appointment.dateTime,
        status: 'in_progress'
      },
      createdAt: new Date()
    });
    
    await notification.save();
    
    return {
      success: true,
      message: 'Appointment started successfully',
      appointment: appointment
    };
  },

  /**
   * Complete an appointment
   * @param {string} appointmentID 
   * @param {Object} completionData 
   * @returns {Promise<Object>}
   */
  completeAppointment: async function(appointmentID, completionData) {
    // Import Appointment and Notification models dynamically to avoid circular dependency
    const Appointment = (await import('../Appointment.js')).default;
    const Notification = (await import('../Notification.js')).default;
    
    const appointment = await Appointment.findByAppointmentID(appointmentID);
    
    if (!appointment) {
      return {
        success: false,
        message: 'Appointment not found'
      };
    }
    
    if (appointment.doctorID !== this.empID) {
      return {
        success: false,
        message: 'Unauthorized to complete this appointment'
      };
    }
    
    if (appointment.status !== 'in_progress') {
      return {
        success: false,
        message: 'Appointment must be in progress to complete'
      };
    }
    
    appointment.status = 'completed';
    appointment.completedAt = new Date();
    appointment.completionNotes = completionData.notes || '';
    appointment.diagnosis = completionData.diagnosis || '';
    appointment.treatmentPlan = completionData.treatmentPlan || '';
    appointment.followUpRequired = completionData.followUpRequired || false;
    appointment.followUpDate = completionData.followUpDate || null;
    appointment.lastUpdatedBy = this.empID;
    appointment.lastUpdatedAt = new Date();
    
    await appointment.save();
    
    // Send notification to patient
    const notification = new Notification({
      notificationId: `NOTIF${Date.now()}${Math.random().toString(36).substring(2, 4)}`,
      recipientId: appointment.patientID,
      recipientType: 'patient',
      title: 'Appointment Completed',
      message: `Your appointment with Dr. ${this.name} has been completed.`,
      type: 'appointment_update',
      status: 'unread',
      priority: 'high',
      data: {
        appointmentId: appointment.appointmentID,
        doctorName: this.name,
        appointmentDate: appointment.dateTime,
        status: 'completed',
        diagnosis: appointment.diagnosis,
        followUpRequired: appointment.followUpRequired
      },
      createdAt: new Date()
    });
    
    await notification.save();
    
    return {
      success: true,
      message: 'Appointment completed successfully',
      appointment: appointment
    };
  },

  /**
   * Mark appointment as no show
   * @param {string} appointmentID 
   * @param {string} reason 
   * @returns {Promise<Object>}
   */
  markAppointmentAsNoShow: async function(appointmentID, reason = '') {
    // Import Appointment and Notification models dynamically to avoid circular dependency
    const Appointment = (await import('../Appointment.js')).default;
    const Notification = (await import('../Notification.js')).default;
    
    const appointment = await Appointment.findByAppointmentID(appointmentID);
    
    if (!appointment) {
      return {
        success: false,
        message: 'Appointment not found'
      };
    }
    
    if (appointment.doctorID !== this.empID) {
      return {
        success: false,
        message: 'Unauthorized to mark this appointment'
      };
    }
    
    appointment.status = 'no_show';
    appointment.noShowReason = reason;
    appointment.noShowAt = new Date();
    appointment.lastUpdatedBy = this.empID;
    appointment.lastUpdatedAt = new Date();
    
    await appointment.save();
    
    // Send notification to patient
    const notification = new Notification({
      notificationId: `NOTIF${Date.now()}${Math.random().toString(36).substring(2, 4)}`,
      recipientId: appointment.patientID,
      recipientType: 'patient',
      title: 'Appointment Marked as No Show',
      message: `Your appointment with Dr. ${this.name} has been marked as no show.`,
      type: 'appointment_update',
      status: 'unread',
      priority: 'medium',
      data: {
        appointmentId: appointment.appointmentID,
        doctorName: this.name,
        appointmentDate: appointment.dateTime,
        status: 'no_show',
        reason: reason
      },
      createdAt: new Date()
    });
    
    await notification.save();
    
    return {
      success: true,
      message: 'Appointment marked as no show',
      appointment: appointment
    };
  },

  /**
   * Get today's appointments
   * @returns {Promise<Object>}
   */
  getTodaysAppointments: async function() {
    // Import Appointment model dynamically to avoid circular dependency
    const Appointment = (await import('../Appointment.js')).default;
    
    const today = new Date();
    const appointments = await Appointment.findByDoctorAndDate(this.empID, today);
    
    return {
      success: true,
      appointments: appointments,
      count: appointments.length
    };
  },

  /**
   * Get upcoming appointments
   * @param {number} days - Number of days to look ahead
   * @returns {Promise<Object>}
   */
  getUpcomingAppointments: async function(days = 7) {
    // Import Appointment model dynamically to avoid circular dependency
    const Appointment = (await import('../Appointment.js')).default;
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    const appointments = await Appointment.find({
      doctorID: this.empID,
      dateTime: { $gte: new Date(), $lte: futureDate },
      status: { $in: ['confirmed', 'approved'] }
    })
    .populate('patientID', 'name email phone')
    .sort({ dateTime: 1 });
    
    return {
      success: true,
      appointments: appointments,
      count: appointments.length
    };
  },

  /**
   * View appointment history
   * @param {string} appointmentID 
   * @returns {Promise<Object>}
   */
  viewAppointmentHistory: async function(appointmentID) {
    // Import Appointment model dynamically to avoid circular dependency
    const Appointment = (await import('../Appointment.js')).default;
    
    const appointment = await Appointment.findByAppointmentID(appointmentID);
    
    if (!appointment) {
      return {
        success: false,
        message: 'Appointment not found'
      };
    }
    
    // Get appointment history/audit trail
    const history = appointment.auditTrail || [];
    
    return {
      success: true,
      appointment: appointment,
      history: history
    };
  },

  /**
   * Get appointment statistics
   * @param {Object} filters 
   * @returns {Promise<Object>}
   */
  getAppointmentStatistics: async function(filters = {}) {
    // Import Appointment model dynamically to avoid circular dependency
    const Appointment = (await import('../Appointment.js')).default;
    
    const stats = await Appointment.getAppointmentStatistics({
      ...filters,
      doctorId: this.empID
    });
    
    return {
      success: true,
      statistics: stats
    };
  },

  /**
   * Check doctor availability
   * @param {string} date 
   * @param {string} time 
   * @returns {Promise<Object>}
   */
  checkAvailability: async function(date, time) {
    // Import Appointment model dynamically to avoid circular dependency
    const Appointment = (await import('../Appointment.js')).default;
    
    const requestedDateTime = new Date(date);
    const [hours, minutes] = time.split(':');
    requestedDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // Check if doctor is available at this time
    const dayOfWeek = requestedDateTime.toLocaleLowerCase();
    const dayAvailability = this.availability[dayOfWeek];
    
    if (!dayAvailability || dayAvailability.length === 0) {
      return {
        success: false,
        available: false,
        message: 'Doctor not available on this day'
      };
    }
    
    // Check for conflicting appointments
    const conflictingAppointment = await Appointment.findOne({
      doctorID: this.empID,
      dateTime: requestedDateTime,
      status: { $in: ['confirmed', 'approved', 'in_progress'] }
    });
    
    if (conflictingAppointment) {
      return {
        success: false,
        available: false,
        message: 'Time slot already booked'
      };
    }
    
    // Check if time falls within available hours
    const timeString = time;
    const isTimeAvailable = dayAvailability.some(slot => 
      timeString >= slot.start && timeString < slot.end
    );
    
    return {
      success: true,
      available: isTimeAvailable && !conflictingAppointment,
      message: isTimeAvailable ? 'Time slot is available' : 'Time slot not available'
    };
  }
};
