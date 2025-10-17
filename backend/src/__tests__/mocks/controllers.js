/**
 * Mock implementations for controller dependencies
 * Provides consistent mock behavior for testing controller interactions
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Mock JWT functions
export const mockJWT = {
  sign: jest.fn().mockImplementation((payload, secret, options) => {
    return `mock-jwt-token-${payload.userId}`;
  }),
  verify: jest.fn().mockImplementation((token, secret) => {
    return {
      userId: '507f1f77bcf86cd799439011',
      userType: 'patient',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    };
  })
};

// Mock bcrypt functions
export const mockBcrypt = {
  compare: jest.fn().mockImplementation((plaintext, hash) => {
    // Mock successful password comparison
    return Promise.resolve(plaintext === 'correctpassword');
  }),
  hash: jest.fn().mockImplementation((password, saltRounds) => {
    return Promise.resolve('$2a$10$hashedpassword');
  }),
  hashSync: jest.fn().mockImplementation((password, saltRounds) => {
    return '$2a$10$hashedpassword';
  })
};

// Mock token generation
export const mockTokenGeneration = {
  generateTokenPair: jest.fn().mockReturnValue({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token'
  })
};

// Mock UserController methods
export const mockUserController = {
  checkEmailExists: jest.fn(),
  authenticateUser: jest.fn(),
  generateTokens: jest.fn().mockReturnValue({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token'
  }),
  verifyToken: jest.fn(),
  refreshToken: jest.fn(),
  changePassword: jest.fn(),
  getUserProfile: jest.fn(),
  updateUserProfile: jest.fn()
};

// Mock AppointmentNotificationController
export const mockAppointmentNotificationController = {
  sendAppointmentNotifications: jest.fn().mockResolvedValue({
    success: true,
    message: 'Notifications sent successfully'
  }),
  sendAppointmentReminders: jest.fn().mockResolvedValue({
    success: true,
    message: 'Reminders sent successfully'
  }),
  sendStatusChangeNotifications: jest.fn().mockResolvedValue({
    success: true,
    message: 'Status change notifications sent successfully'
  })
};

// Mock AppointmentPaymentController
export const mockAppointmentPaymentController = {
  processPayment: jest.fn().mockResolvedValue({
    success: true,
    message: 'Payment processed successfully',
    transactionId: 'TXN123456789'
  }),
  simulatePayment: jest.fn().mockResolvedValue({
    success: true,
    message: 'Payment simulation completed',
    transactionId: 'TXN123456789'
  })
};

// Mock AppointmentApprovalController
export const mockAppointmentApprovalController = {
  getPendingApprovalAppointments: jest.fn().mockResolvedValue({
    success: true,
    appointments: []
  }),
  approveAppointment: jest.fn().mockResolvedValue({
    success: true,
    message: 'Appointment approved successfully'
  }),
  declineAppointment: jest.fn().mockResolvedValue({
    success: true,
    message: 'Appointment declined successfully'
  })
};

// Helper function to setup successful authentication
export const setupSuccessfulAuth = (userType = 'patient') => {
  mockUserController.authenticateUser.mockResolvedValue({
    success: true,
    message: `${userType} logged in successfully`,
    user: { _id: '507f1f77bcf86cd799439011', userType },
    userType,
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token'
  });
};

// Helper function to setup failed authentication
export const setupFailedAuth = (message = 'Invalid email or password') => {
  mockUserController.authenticateUser.mockResolvedValue({
    success: false,
    message
  });
};

// Helper function to setup email exists check
export const setupEmailExists = (exists = false) => {
  mockUserController.checkEmailExists.mockResolvedValue(exists ? { _id: '507f1f77bcf86cd799439011' } : null);
};

// Helper function to setup successful token verification
export const setupSuccessfulTokenVerification = (userData = {}) => {
  mockUserController.verifyToken.mockResolvedValue({
    success: true,
    user: { _id: '507f1f77bcf86cd799439011', ...userData }
  });
};

// Helper function to setup failed token verification
export const setupFailedTokenVerification = (message = 'Invalid token') => {
  mockUserController.verifyToken.mockResolvedValue({
    success: false,
    message
  });
};

// Helper function to reset all controller mocks
export const resetControllerMocks = () => {
  Object.values(mockUserController).forEach(mockFn => {
    if (jest.isMockFunction(mockFn)) {
      mockFn.mockReset();
    }
  });
  
  Object.values(mockAppointmentNotificationController).forEach(mockFn => {
    if (jest.isMockFunction(mockFn)) {
      mockFn.mockReset();
    }
  });
  
  Object.values(mockAppointmentPaymentController).forEach(mockFn => {
    if (jest.isMockFunction(mockFn)) {
      mockFn.mockReset();
    }
  });
  
  Object.values(mockAppointmentApprovalController).forEach(mockFn => {
    if (jest.isMockFunction(mockFn)) {
      mockFn.mockReset();
    }
  });
};
