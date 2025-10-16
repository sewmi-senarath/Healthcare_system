import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/auth/refresh-token`,
            { refreshToken }
          );

          if (response.data.success) {
            const { accessToken } = response.data;
            localStorage.setItem('accessToken', accessToken);
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  // Login
  login: async (email, password, endpoint, requestData = null) => {
    // Use requestData if provided, otherwise create default data
    const data = requestData || { email, password };
    
    // Handle both old and new route formats
    if (endpoint === '/patient/login') {
      return api.post('/patient/login', data);
    } else if (endpoint === '/authority/login') {
      return api.post('/auth/authority/login', data);
    } else {
      // Fallback to auth prefix for other routes
      return api.post(`/auth${endpoint}`, data);
    }
  },

  // Register
  register: async (userData, endpoint) => {
    // Handle both old and new route formats
    if (endpoint === '/patient/register') {
      return api.post('/patient/register', userData);
    } else if (endpoint === '/authority/register') {
      return api.post('/auth/authority/register', userData);
    } else {
      // Fallback to auth prefix for other routes
      return api.post(`/auth${endpoint}`, userData);
    }
  },

  // Logout
  logout: async () => {
    return api.post('/auth/logout');
  },

  // Get current user
  getCurrentUser: async () => {
    return api.get('/auth/me');
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    return api.post('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmNewPassword: newPassword
    });
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    return api.post('/auth/refresh-token', { refreshToken });
  }
};

// Appointment API
export const appointmentAPI = {
  // Get appointments
  getAppointments: async (params = {}) => {
    return api.get('/appointments', { params });
  },

  // Get appointment by ID
  getAppointment: async (id) => {
    return api.get(`/appointments/${id}`);
  },

  // Create appointment
  createAppointment: async (appointmentData) => {
    return api.post('/appointments', appointmentData);
  },

  // Update appointment
  updateAppointment: async (id, appointmentData) => {
    return api.put(`/appointments/${id}`, appointmentData);
  },

  // Cancel appointment
  cancelAppointment: async (id, reason) => {
    return api.delete(`/appointments/${id}`, { data: { reason } });
  },

  // Reschedule appointment
  rescheduleAppointment: async (id, newDateTime, reason) => {
    return api.patch(`/appointments/${id}/reschedule`, { newDateTime, reason });
  },

  // Approve appointment (HealthCareManager)
  approveAppointment: async (id, approvalNotes) => {
    return api.patch(`/appointments/${id}/approve`, { approvalNotes });
  },

  // Decline appointment (HealthCareManager)
  declineAppointment: async (id, declineReason) => {
    return api.patch(`/appointments/${id}/decline`, { declineReason });
  }
};

// Prescription API
export const prescriptionAPI = {
  // Get prescriptions
  getPrescriptions: async (params = {}) => {
    return api.get('/prescriptions', { params });
  },

  // Get prescription by ID
  getPrescription: async (id) => {
    return api.get(`/prescriptions/${id}`);
  },

  // Create prescription
  createPrescription: async (prescriptionData) => {
    return api.post('/prescriptions', prescriptionData);
  },

  // Update prescription
  updatePrescription: async (id, prescriptionData) => {
    return api.put(`/prescriptions/${id}`, prescriptionData);
  },

  // Send prescription to pharmacy
  sendToPharmacy: async (id, pharmacyId, pharmacistId) => {
    return api.patch(`/prescriptions/${id}/send-to-pharmacy`, { pharmacyId, pharmacistId });
  },

  // Dispense prescription
  dispensePrescription: async (id, dispensingData) => {
    return api.patch(`/prescriptions/${id}/dispense`, dispensingData);
  }
};

// Support Ticket API
export const supportTicketAPI = {
  // Get tickets
  getTickets: async (params = {}) => {
    return api.get('/support-tickets', { params });
  },

  // Get ticket by ID
  getTicket: async (id) => {
    return api.get(`/support-tickets/${id}`);
  },

  // Create ticket
  createTicket: async (ticketData) => {
    return api.post('/support-tickets', ticketData);
  },

  // Update ticket
  updateTicket: async (id, ticketData) => {
    return api.put(`/support-tickets/${id}`, ticketData);
  },

  // Assign ticket
  assignTicket: async (id, staffId, notes) => {
    return api.patch(`/support-tickets/${id}/assign`, { staffId, notes });
  },

  // Close ticket
  closeTicket: async (id, resolution) => {
    return api.patch(`/support-tickets/${id}/close`, { resolution });
  }
};

// Medicine Stock API
export const medicineStockAPI = {
  // Get medicine stock
  getMedicineStock: async (params = {}) => {
    return api.get('/medicine-stock', { params });
  },

  // Get medicine by ID
  getMedicine: async (id) => {
    return api.get(`/medicine-stock/${id}`);
  },

  // Update medicine stock
  updateStock: async (id, action, quantity, additionalData) => {
    return api.patch(`/medicine-stock/${id}/update-stock`, { action, quantity, additionalData });
  },

  // Add new medicine
  addMedicine: async (medicineData) => {
    return api.post('/medicine-stock', medicineData);
  },

  // Check availability
  checkAvailability: async (id, quantity) => {
    return api.get(`/medicine-stock/${id}/availability`, { params: { quantity } });
  }
};

// Notification API
export const notificationAPI = {
  // Get notifications
  getNotifications: async (params = {}) => {
    return api.get('/notifications', { params });
  },

  // Mark notification as read
  markAsRead: async (id) => {
    return api.patch(`/notifications/${id}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    return api.patch('/notifications/read-all');
  },

  // Delete notification
  deleteNotification: async (id) => {
    return api.delete(`/notifications/${id}`);
  }
};

// User API
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    return api.get('/users/profile');
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return api.put('/users/profile', profileData);
  },

  // Get user statistics
  getStatistics: async (type) => {
    return api.get(`/users/statistics/${type}`);
  }
};

// Error handler utility
export const handleAPIError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        toast.error(data.message || 'Bad request');
        break;
      case 401:
        toast.error('Unauthorized access');
        break;
      case 403:
        toast.error('Access forbidden');
        break;
      case 404:
        toast.error('Resource not found');
        break;
      case 500:
        toast.error('Server error. Please try again later.');
        break;
      default:
        toast.error(data.message || 'An error occurred');
    }
    
    return data.message || 'An error occurred';
  } else if (error.request) {
    // Request was made but no response received
    toast.error('Network error. Please check your connection.');
    return 'Network error';
  } else {
    // Something else happened
    toast.error('An unexpected error occurred');
    return 'Unexpected error';
  }
};

export default api;
