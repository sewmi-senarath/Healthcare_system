import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setLoading(false);
          return;
        }

        // Verify token by getting user info
        const response = await authAPI.getCurrentUser();
        if (response.data.success) {
          setUser(response.data.user);
          setUserType(response.data.userType);
          setIsAuthenticated(true);
        } else {
          // Token is invalid, clear storage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email, password, userTypeOrIsAuthority = false) => {
    try {
      setLoading(true);
      
      // Handle both old boolean parameter and new userType parameter
      let endpoint, requestData;
      if (typeof userTypeOrIsAuthority === 'string') {
        // New format: userType provided
        endpoint = '/authority/login';
        requestData = { email, password, userType: userTypeOrIsAuthority };
      } else {
        // Old format: boolean isAuthority
        endpoint = userTypeOrIsAuthority ? '/authority/login' : '/patient/login';
        requestData = { email, password };
      }
      
      const response = await authAPI.login(email, password, endpoint, requestData);
      
      if (response.data.success) {
        const { user, userType, accessToken, refreshToken } = response.data;
        
        console.log('Login response:', response.data);
        console.log('User:', user);
        console.log('UserType:', userType);
        
        // Store tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        // Update state
        setUser(user);
        setUserType(userType);
        setIsAuthenticated(true);
        
        console.log('Auth state updated:', { user, userType, isAuthenticated: true });
        
        return { success: true, user, userType };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData, isAuthority = false) => {
    try {
      setLoading(true);
      const endpoint = isAuthority ? '/authority/register' : '/patient/register';
      const response = await authAPI.register(userData, endpoint);
      
      if (response.data.success) {
        const { user, userType, accessToken, refreshToken } = response.data;
        
        console.log('Registration response:', response.data);
        console.log('User:', user);
        console.log('UserType from backend:', userType);
        console.log('UserType type:', typeof userType);
        
        // Store tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        // Update state
        setUser(user);
        setUserType(userType);
        setIsAuthenticated(true);
        
        console.log('Auth state after registration:', { user, userType, isAuthenticated: true });
        
        return { success: true, user, userType };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens and state regardless of API call success
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setUserType(null);
      setIsAuthenticated(false);
      
      console.log('User logged out successfully');
    }
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authAPI.changePassword(currentPassword, newPassword);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Change password error:', error);
      const message = error.response?.data?.message || 'Failed to change password';
      return { success: false, message };
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken');
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await authAPI.refreshToken(refreshTokenValue);
      if (response.data.success) {
        localStorage.setItem('accessToken', response.data.accessToken);
        return { success: true, accessToken: response.data.accessToken };
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear tokens and logout user
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setUserType(null);
      setIsAuthenticated(false);
      return { success: false };
    }
  };

  // Check if user has specific role
  const hasRole = (roles) => {
    if (!userType) return false;
    if (Array.isArray(roles)) {
      return roles.includes(userType);
    }
    return userType === roles;
  };

  // Check if user is patient
  const isPatient = () => hasRole('patient');

  // Check if user is authority (any staff member)
  const isAuthority = () => hasRole(['doctor', 'hospitalStaff', 'nurse', 'pharmacist', 'healthCareManager', 'systemAdmin']);

  // Check if user is doctor
  const isDoctor = () => hasRole('doctor');

  // Check if user is pharmacist
  const isPharmacist = () => hasRole('pharmacist');

  // Check if user is health care manager
  const isHealthCareManager = () => hasRole('healthCareManager');

  // Check if user is system admin
  const isSystemAdmin = () => hasRole('systemAdmin');

  // Check if user can manage appointments
  const canManageAppointments = () => hasRole(['patient', 'doctor', 'healthCareManager', 'systemAdmin']);

  // Check if user can manage prescriptions
  const canManagePrescriptions = () => hasRole(['doctor', 'pharmacist', 'healthCareManager', 'systemAdmin']);

  // Check if user can manage support tickets
  const canManageSupportTickets = () => hasRole(['patient', 'healthCareManager', 'systemAdmin']);

  // Check if user can manage medicine stock
  const canManageMedicineStock = () => hasRole(['pharmacist', 'healthCareManager', 'systemAdmin']);

  const value = {
    user,
    userType,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    changePassword,
    refreshToken,
    hasRole,
    isPatient,
    isAuthority,
    isDoctor,
    isPharmacist,
    isHealthCareManager,
    isSystemAdmin,
    canManageAppointments,
    canManagePrescriptions,
    canManageSupportTickets,
    canManageMedicineStock
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
