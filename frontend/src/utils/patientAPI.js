import api from './api';

const patientAPI = {
  /**
   * Get patient dashboard statistics
   */
  getDashboardStats: async () => {
    try {
      const response = await api.get('/patient/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to fetch dashboard stats' };
    }
  },

  /**
   * Get patient recent activity
   */
  getRecentActivity: async () => {
    try {
      const response = await api.get('/patient/dashboard/recent-activity');
      return response.data;
    } catch (error) {
      console.error('Get recent activity error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to fetch recent activity' };
    }
  },

  /**
   * Get patient appointments
   */
  getPatientAppointments: async () => {
    try {
      const response = await api.get('/patient/appointments');
      return response.data;
    } catch (error) {
      console.error('Get patient appointments error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to fetch appointments' };
    }
  },

  /**
   * Get patient notifications
   */
  getPatientNotifications: async () => {
    try {
      const response = await api.get('/patient/notifications');
      return response.data;
    } catch (error) {
      console.error('Get patient notifications error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to fetch notifications' };
    }
  },

  /**
   * Update patient profile
   */
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/patient/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to update profile' };
    }
  },

  /**
   * Get patient medical records
   */
  getMedicalRecords: async () => {
    try {
      const response = await api.get('/patient/medical-records');
      return response.data;
    } catch (error) {
      console.error('Get medical records error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to fetch medical records' };
    }
  },

  /**
   * Search patient by ID
   */
  searchPatientById: async (patientId) => {
    try {
      const response = await api.get(`/patient/search/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Search patient by ID error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to search patient' };
    }
  }
};

export default patientAPI;
