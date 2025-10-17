import api from './api';

const authorityAPI = {
  /**
   * Get dashboard statistics for authority users
   */
  getDashboardStats: async (userType, userId) => {
    try {
      const response = await api.get(`/employee/dashboard/stats?userType=${userType}&userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get authority dashboard stats error:', error);
      // Return success with empty stats instead of error for better UX
      return { 
        success: true, 
        stats: {},
        message: 'No data found'
      };
    }
  },

  /**
   * Get recent activity for authority users
   */
  getRecentActivity: async (userType, userId) => {
    try {
      const response = await api.get(`/employee/dashboard/recent-activity?userType=${userType}&userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get authority recent activity error:', error);
      // Return success with empty activities instead of error for better UX
      return { 
        success: true, 
        activities: [],
        message: 'No activity found'
      };
    }
  },

  /**
   * Get appointments for doctor
   */
  getDoctorAppointments: async (doctorId) => {
    try {
      const response = await api.get(`/appointments/doctor/${doctorId}`);
      return response.data;
    } catch (error) {
      console.error('Get doctor appointments error:', error);
      // Return success with empty appointments instead of error for better UX
      return { 
        success: true, 
        appointments: [],
        message: 'No appointments found'
      };
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
      // Return success with empty appointments instead of error for better UX
      return { 
        success: true, 
        appointments: [],
        message: 'No appointments found'
      };
    }
  },

  /**
   * Get pending approval appointments
   */
  getPendingApprovalAppointments: async () => {
    try {
      const response = await api.get('/appointments/pending-approval');
      return response.data;
    } catch (error) {
      console.error('Get pending approval appointments error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to fetch pending appointments' };
    }
  },

  /**
   * Approve appointment
   */
  approveAppointment: async (appointmentId, approvalNotes) => {
    try {
      const response = await api.put(`/appointments/${appointmentId}/approve`, {
        approvalNotes
      });
      return response.data;
    } catch (error) {
      console.error('Approve appointment error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to approve appointment' };
    }
  },

  /**
   * Decline appointment
   */
  declineAppointment: async (appointmentId, declineReason) => {
    try {
      const response = await api.put(`/appointments/${appointmentId}/decline`, {
        declineReason
      });
      return response.data;
    } catch (error) {
      console.error('Decline appointment error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to decline appointment' };
    }
  }
};

export default authorityAPI;
