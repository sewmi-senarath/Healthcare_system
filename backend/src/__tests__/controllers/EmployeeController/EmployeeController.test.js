/**
 * EmployeeController Tests
 * Tests the facade controller that delegates to specialized controllers
 */

import { jest } from '@jest/globals';
import EmployeeController from '../../../controllers/EmployeeController.js';
import { resetControllerMocks } from '../../mocks/controllers.js';

// Mock all dependencies
jest.unstable_mockModule('../../../controllers/EmployeeAuthController.js', () => ({
  default: {
    registerEmployee: jest.fn(),
    loginEmployee: jest.fn()
  }
}));

jest.unstable_mockModule('../../../controllers/EmployeeProfileController.js', () => ({
  default: {
    getEmployeeProfile: jest.fn(),
    updateEmployeeProfile: jest.fn(),
    getEmployeeByEmpID: jest.fn(),
    updateEmployeeStatus: jest.fn(),
    getEmployeesByDepartment: jest.fn()
  }
}));

jest.unstable_mockModule('../../../controllers/EmployeeStatsController.js', () => ({
  default: {
    getAuthorityDashboardStats: jest.fn(),
    getAuthorityRecentActivity: jest.fn()
  }
}));

jest.unstable_mockModule('../../../controllers/EmployeeManagementController.js', () => ({
  default: {
    getAllEmployees: jest.fn(),
    deleteEmployee: jest.fn(),
    bulkUpdateEmployeeStatus: jest.fn(),
    getEmployeeStatistics: jest.fn(),
    searchEmployees: jest.fn()
  }
}));

describe('EmployeeController - Facade Operations', () => {
  let mockEmployeeAuthController;
  let mockEmployeeProfileController;
  let mockEmployeeStatsController;
  let mockEmployeeManagementController;

  beforeEach(async () => {
    jest.clearAllMocks();
    resetControllerMocks();
    
    // Import mocked controllers
    const authModule = await import('../../../controllers/EmployeeAuthController.js');
    mockEmployeeAuthController = authModule.default;
    
    const profileModule = await import('../../../controllers/EmployeeProfileController.js');
    mockEmployeeProfileController = profileModule.default;
    
    const statsModule = await import('../../../controllers/EmployeeStatsController.js');
    mockEmployeeStatsController = statsModule.default;
    
    const managementModule = await import('../../../controllers/EmployeeManagementController.js');
    mockEmployeeManagementController = managementModule.default;
  });

  describe('Authentication Delegation', () => {
    describe('Positive Cases', () => {
      test('should delegate registerEmployee to EmployeeAuthController', async () => {
        // Arrange
        const employeeData = {
          name: 'Dr. John Smith',
          email: 'john@example.com',
          password: 'password123',
          userType: 'doctor',
          specialization: 'Cardiology'
        };

        const expectedResult = {
          success: true,
          message: 'Employee registered successfully',
          employee: { empID: 'DOC001', ...employeeData }
        };

        mockEmployeeAuthController.registerEmployee.mockResolvedValue(expectedResult);

        // Act
        const result = await EmployeeController.registerEmployee(employeeData);

        // Assert
        expect(mockEmployeeAuthController.registerEmployee).toHaveBeenCalledWith(employeeData);
        expect(result).toEqual(expectedResult);
      });

      test('should delegate loginEmployee to EmployeeAuthController', async () => {
        // Arrange
        const loginData = {
          email: 'john@example.com',
          password: 'password123',
          userType: 'doctor'
        };

        const expectedResult = {
          success: true,
          message: 'Employee logged in successfully',
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh-token'
        };

        mockEmployeeAuthController.loginEmployee.mockResolvedValue(expectedResult);

        // Act
        const result = await EmployeeController.loginEmployee(loginData);

        // Assert
        expect(mockEmployeeAuthController.loginEmployee).toHaveBeenCalledWith(loginData);
        expect(result).toEqual(expectedResult);
      });
    });

    describe('Negative Cases', () => {
      test('should handle authentication failures', async () => {
        // Arrange
        const loginData = {
          email: 'invalid@example.com',
          password: 'wrongpassword',
          userType: 'doctor'
        };

        const expectedResult = {
          success: false,
          message: 'Invalid credentials'
        };

        mockEmployeeAuthController.loginEmployee.mockResolvedValue(expectedResult);

        // Act
        const result = await EmployeeController.loginEmployee(loginData);

        // Assert
        expect(result).toEqual(expectedResult);
      });
    });
  });

  describe('Profile Management Delegation', () => {
    describe('Positive Cases', () => {
      test('should delegate getEmployeeProfile to EmployeeProfileController', async () => {
        // Arrange
        const empID = 'DOC001';
        const expectedResult = {
          success: true,
          employee: {
            empID: 'DOC001',
            name: 'Dr. John Smith',
            specialization: 'Cardiology'
          }
        };

        mockEmployeeProfileController.getEmployeeProfile.mockResolvedValue(expectedResult);

        // Act
        const result = await EmployeeController.getEmployeeProfile(empID);

        // Assert
        expect(mockEmployeeProfileController.getEmployeeProfile).toHaveBeenCalledWith(empID);
        expect(result).toEqual(expectedResult);
      });

      test('should delegate updateEmployeeProfile to EmployeeProfileController', async () => {
        // Arrange
        const empID = 'DOC001';
        const updateData = {
          name: 'Dr. John Smith Updated',
          specialization: 'Neurology'
        };

        const expectedResult = {
          success: true,
          message: 'Profile updated successfully'
        };

        mockEmployeeProfileController.updateEmployeeProfile.mockResolvedValue(expectedResult);

        // Act
        const result = await EmployeeController.updateEmployeeProfile(empID, updateData);

        // Assert
        expect(mockEmployeeProfileController.updateEmployeeProfile).toHaveBeenCalledWith(empID, updateData);
        expect(result).toEqual(expectedResult);
      });

      test('should delegate getEmployeesByDepartment to EmployeeProfileController', async () => {
        // Arrange
        const department = 'Cardiology';
        const expectedResult = {
          success: true,
          employees: [
            { empID: 'DOC001', name: 'Dr. John Smith', department: 'Cardiology' },
            { empID: 'DOC002', name: 'Dr. Jane Doe', department: 'Cardiology' }
          ]
        };

        mockEmployeeProfileController.getEmployeesByDepartment.mockResolvedValue(expectedResult);

        // Act
        const result = await EmployeeController.getEmployeesByDepartment(department);

        // Assert
        expect(mockEmployeeProfileController.getEmployeesByDepartment).toHaveBeenCalledWith(department);
        expect(result).toEqual(expectedResult);
      });
    });
  });

  describe('Statistics Delegation', () => {
    describe('Positive Cases', () => {
      test('should delegate getAuthorityDashboardStats to EmployeeStatsController', async () => {
        // Arrange
        const userType = 'doctor';
        const empID = 'DOC001';
        const expectedResult = {
          success: true,
          stats: {
            totalAppointments: 50,
            todayAppointments: 5,
            pendingAppointments: 3,
            completedAppointments: 47
          }
        };

        mockEmployeeStatsController.getAuthorityDashboardStats.mockResolvedValue(expectedResult);

        // Act
        const result = await EmployeeController.getAuthorityDashboardStats(userType, empID);

        // Assert
        expect(mockEmployeeStatsController.getAuthorityDashboardStats).toHaveBeenCalledWith(userType, empID);
        expect(result).toEqual(expectedResult);
      });

      test('should delegate getAuthorityRecentActivity to EmployeeStatsController', async () => {
        // Arrange
        const userType = 'doctor';
        const empID = 'DOC001';
        const expectedResult = {
          success: true,
          activities: [
            { type: 'appointment', description: 'New appointment scheduled', timestamp: new Date() },
            { type: 'prescription', description: 'Prescription created', timestamp: new Date() }
          ]
        };

        mockEmployeeStatsController.getAuthorityRecentActivity.mockResolvedValue(expectedResult);

        // Act
        const result = await EmployeeController.getAuthorityRecentActivity(userType, empID);

        // Assert
        expect(mockEmployeeStatsController.getAuthorityRecentActivity).toHaveBeenCalledWith(userType, empID);
        expect(result).toEqual(expectedResult);
      });
    });
  });

  describe('Management Delegation', () => {
    describe('Positive Cases', () => {
      test('should delegate getAllEmployees to EmployeeManagementController', async () => {
        // Arrange
        const filters = { department: 'Cardiology', status: 'active' };
        const expectedResult = {
          success: true,
          employees: [
            { empID: 'DOC001', name: 'Dr. John Smith', department: 'Cardiology' },
            { empID: 'DOC002', name: 'Dr. Jane Doe', department: 'Cardiology' }
          ]
        };

        mockEmployeeManagementController.getAllEmployees.mockResolvedValue(expectedResult);

        // Act
        const result = await EmployeeController.getAllEmployees(filters);

        // Assert
        expect(mockEmployeeManagementController.getAllEmployees).toHaveBeenCalledWith(filters);
        expect(result).toEqual(expectedResult);
      });

      test('should delegate deleteEmployee to EmployeeManagementController', async () => {
        // Arrange
        const empID = 'DOC001';
        const expectedResult = {
          success: true,
          message: 'Employee deleted successfully'
        };

        mockEmployeeManagementController.deleteEmployee.mockResolvedValue(expectedResult);

        // Act
        const result = await EmployeeController.deleteEmployee(empID);

        // Assert
        expect(mockEmployeeManagementController.deleteEmployee).toHaveBeenCalledWith(empID);
        expect(result).toEqual(expectedResult);
      });

      test('should delegate searchEmployees to EmployeeManagementController', async () => {
        // Arrange
        const searchCriteria = { name: 'John', department: 'Cardiology' };
        const expectedResult = {
          success: true,
          employees: [
            { empID: 'DOC001', name: 'Dr. John Smith', department: 'Cardiology' }
          ]
        };

        mockEmployeeManagementController.searchEmployees.mockResolvedValue(expectedResult);

        // Act
        const result = await EmployeeController.searchEmployees(searchCriteria);

        // Assert
        expect(mockEmployeeManagementController.searchEmployees).toHaveBeenCalledWith(searchCriteria);
        expect(result).toEqual(expectedResult);
      });
    });
  });

  describe('Error Handling', () => {
    describe('Error Cases', () => {
      test('should propagate errors from delegated controllers', async () => {
        // Arrange
        const employeeData = { name: 'Test Employee' };
        const error = new Error('Registration failed');

        mockEmployeeAuthController.registerEmployee.mockRejectedValue(error);

        // Act & Assert
        await expect(
          EmployeeController.registerEmployee(employeeData)
        ).rejects.toThrow('Registration failed');
      });

      test('should handle profile update errors', async () => {
        // Arrange
        const empID = 'DOC001';
        const updateData = { name: 'Updated Name' };
        const error = new Error('Profile update failed');

        mockEmployeeProfileController.updateEmployeeProfile.mockRejectedValue(error);

        // Act & Assert
        await expect(
          EmployeeController.updateEmployeeProfile(empID, updateData)
        ).rejects.toThrow('Profile update failed');
      });
    });
  });
});
