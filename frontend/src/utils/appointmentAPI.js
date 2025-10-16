import api from './api.js';

/**
 * Appointment API utility functions
 */
export const appointmentAPI = {
  /**
   * Get all available departments
   */
  getDepartments: async () => {
    try {
      const response = await api.get('/appointments/departments');
      return response.data;
    } catch (error) {
      console.error('Get departments error:', error);
      throw error;
    }
  },

  /**
   * Get doctors by department
   */
  getDoctorsByDepartment: async (department) => {
    try {
      const response = await api.get(`/appointments/doctors/${department}`);
      return response.data;
    } catch (error) {
      console.error('Get doctors by department error:', error);
      throw error;
    }
  },

  /**
   * Get available time slots for a doctor
   */
  getAvailableSlots: async (doctorId, date) => {
    try {
      const response = await api.get(`/appointments/available-slots/${doctorId}?date=${date}`);
      return response.data;
    } catch (error) {
      console.error('Get available slots error:', error);
      throw error;
    }
  },

  /**
   * Reserve a time slot temporarily
   */
  reserveSlot: async (doctorId, dateTime, patientId) => {
    try {
      const response = await api.post('/appointments/reserve-slot', {
        doctorId,
        dateTime,
        patientId
      });
      return response.data;
    } catch (error) {
      console.error('Reserve slot error:', error);
      throw error;
    }
  },

  /**
   * Book an appointment
   */
  bookAppointment: async (appointmentData) => {
    try {
      const response = await api.post('/appointments/book', appointmentData);
      return response.data;
    } catch (error) {
      console.error('Book appointment error:', error);
      throw error;
    }
  },

  /**
   * Process payment for an appointment
   */
  processPayment: async (appointmentId, paymentData) => {
    try {
      const response = await api.post(`/appointments/${appointmentId}/payment`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Process payment error:', error);
      throw error;
    }
  },

  /**
   * Get appointments for a patient
   */
  getPatientAppointments: async (patientId) => {
    try {
      const response = await api.get(`/appointments/patient/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Get patient appointments error:', error);
      throw error;
    }
  },

  /**
   * Cancel an appointment
   */
  cancelAppointment: async (appointmentId) => {
    try {
      const response = await api.delete(`/appointments/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error('Cancel appointment error:', error);
      throw error;
    }
  },

  /**
   * Get appointments pending Health Manager approval
   */
  getPendingApprovalAppointments: async () => {
    try {
      const response = await api.get('/appointments/pending-approval');
      return response.data;
    } catch (error) {
      console.error('Get pending approval appointments error:', error);
      throw error;
    }
  },

  /**
   * Approve an appointment (Health Manager only)
   */
  approveAppointment: async (appointmentId, approvalNotes) => {
    try {
      const response = await api.put(`/appointments/${appointmentId}/approve`, {
        approvalNotes
      });
      return response.data;
    } catch (error) {
      console.error('Approve appointment error:', error);
      throw error;
    }
  },

  /**
   * Decline an appointment (Health Manager only)
   */
  declineAppointment: async (appointmentId, declineReason) => {
    try {
      const response = await api.put(`/appointments/${appointmentId}/decline`, {
        declineReason
      });
      return response.data;
    } catch (error) {
      console.error('Decline appointment error:', error);
      throw error;
    }
  },

  /**
   * Get appointments for a specific doctor
   */
  getDoctorAppointments: async (doctorId) => {
    try {
      const response = await api.get(`/appointments/doctor/${doctorId}`);
      return response.data;
    } catch (error) {
      console.error('Get doctor appointments error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to fetch doctor appointments' };
    }
  },

  /**
   * Get all appointments for Health Manager
   */
  getAllAppointmentsForManager: async () => {
    try {
      const response = await api.get('/appointments/health-manager/all');
      return response.data;
    } catch (error) {
      console.error('Get all appointments for manager error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to fetch all appointments' };
    }
  }
};

export default appointmentAPI;
