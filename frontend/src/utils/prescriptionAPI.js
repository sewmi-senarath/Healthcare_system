import api from './api';

const prescriptionAPI = {
  /**
   * Create a new prescription
   */
  createPrescription: async (prescriptionData) => {
    try {
      const response = await api.post('/prescriptions', prescriptionData);
      return response.data;
    } catch (error) {
      console.error('Create prescription error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to create prescription' };
    }
  },

  /**
   * Get prescriptions for doctor
   */
  getDoctorPrescriptions: async () => {
    try {
      const response = await api.get('/prescriptions/doctor');
      return response.data;
    } catch (error) {
      console.error('Get doctor prescriptions error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to fetch prescriptions' };
    }
  },

  /**
   * Get prescriptions for pharmacist
   */
  getPharmacistPrescriptions: async () => {
    try {
      const response = await api.get('/prescriptions/pharmacist');
      return response.data;
    } catch (error) {
      console.error('Get pharmacist prescriptions error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to fetch prescriptions' };
    }
  },

  /**
   * Get prescription by ID
   */
  getPrescriptionById: async (prescriptionId) => {
    try {
      const response = await api.get(`/prescriptions/${prescriptionId}`);
      return response.data;
    } catch (error) {
      console.error('Get prescription by ID error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to fetch prescription' };
    }
  },

  /**
   * Update prescription status
   */
  updatePrescriptionStatus: async (prescriptionId, status) => {
    try {
      const response = await api.put(`/prescriptions/${prescriptionId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Update prescription status error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to update prescription status' };
    }
  },

  /**
   * Get prescription statistics
   */
  getPrescriptionStats: async () => {
    try {
      const response = await api.get('/prescriptions/stats');
      return response.data;
    } catch (error) {
      console.error('Get prescription stats error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to fetch prescription stats' };
    }
  },

  /**
   * Search prescriptions by patient ID (for staff/doctor use)
   */
  searchPrescriptionsByPatient: async (patientId) => {
    try {
      const response = await api.get(`/prescriptions/patient/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Search prescriptions by patient error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to search prescriptions' };
    }
  },

  /**
   * Get prescriptions for the authenticated patient
   */
  getPatientPrescriptions: async () => {
    try {
      const response = await api.get('/prescriptions/patient/my-prescriptions');
      return response.data;
    } catch (error) {
      console.error('Get patient prescriptions error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to fetch prescriptions' };
    }
  }
};

export default prescriptionAPI;
