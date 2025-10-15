import Doctor from '../models/Doctor.js';
import Nurse from '../models/Nurse.js';
import Pharmacist from '../models/Pharmacist.js';
import HospitalStaff from '../models/HospitalStaff.js';
import HealthCareManager from '../models/HealthCareManager.js';
import SystemAdmin from '../models/SystemAdmin.js';
import UserController from './UserController.js';

/**
 * EmployeeController - Handles all employee-related operations
 * Following Single Responsibility Principle
 */
class EmployeeController {
  /**
   * Get employee model by type
   * @param {string} employeeType 
   * @returns {Object}
   */
  static getEmployeeModel(employeeType) {
    const models = {
      'doctor': Doctor,
      'nurse': Nurse,
      'pharmacist': Pharmacist,
      'hospitalStaff': HospitalStaff,
      'healthCareManager': HealthCareManager,
      'systemAdmin': SystemAdmin
    };
    
    return models[employeeType];
  }

  /**
   * Register a new employee
   * @param {Object} employeeData 
   * @param {string} employeeType 
   * @returns {Promise<Object>}
   */
  static async registerEmployee(employeeData, employeeType) {
    try {
      console.log(`=== ${employeeType.toUpperCase()} REGISTRATION DEBUG ===`);
      console.log('Request body:', employeeData);
      console.log('Raw password before saving:', employeeData.password);

      const { name, email, password, ...specificData } = employeeData;

      // Check if email already exists
      const existingUser = await UserController.checkEmailExists(email, employeeType);
      if (existingUser) {
        return {
          success: false,
          message: 'Email already registered'
        };
      }

      // Get the appropriate model
      const EmployeeModel = this.getEmployeeModel(employeeType);
      if (!EmployeeModel) {
        return {
          success: false,
          message: 'Invalid employee type'
        };
      }

      // Generate employee ID
      const empID = `${employeeType.charAt(0).toUpperCase()}${Date.now().toString().substring(6)}${Math.random().toString(36).substring(2, 4).toUpperCase()}`;

      // Create employee (password will be hashed by User model pre-save middleware)
      const employee = new EmployeeModel({
        name,
        email,
        password,
        empID,
        userType: employeeType,
        ...specificData
      });

      await employee.save();
      console.log('Employee saved successfully');
      console.log('Saved password hash:', employee.password.substring(0, 20) + '...');

      // Generate tokens
      const tokens = UserController.generateTokens(employee, employeeType);

      // Remove password from response
      const employeeResponse = employee.toObject();
      delete employeeResponse.password;

      return {
        success: true,
        message: `${employeeType} registered successfully`,
        user: employeeResponse,
        userType: employeeType,
        ...tokens
      };

    } catch (error) {
      console.error(`${employeeType} registration error:`, error);
      throw error;
    }
  }

  /**
   * Login employee
   * @param {string} email 
   * @param {string} password 
   * @param {string} employeeType 
   * @returns {Promise<Object>}
   */
  static async loginEmployee(email, password, employeeType) {
    return await UserController.authenticateUser(email, password, employeeType);
  }

  /**
   * Get employee profile
   * @param {string} employeeId 
   * @param {string} employeeType 
   * @returns {Promise<Object>}
   */
  static async getEmployeeProfile(employeeId, employeeType) {
    try {
      const EmployeeModel = this.getEmployeeModel(employeeType);
      if (!EmployeeModel) {
        return {
          success: false,
          message: 'Invalid employee type'
        };
      }

      const employee = await EmployeeModel.findById(employeeId).select('-password');
      
      if (!employee) {
        return {
          success: false,
          message: 'Employee not found'
        };
      }

      return {
        success: true,
        employee: employee.toObject()
      };
    } catch (error) {
      console.error('Get employee profile error:', error);
      throw error;
    }
  }

  /**
   * Update employee profile
   * @param {string} employeeId 
   * @param {string} employeeType 
   * @param {Object} updateData 
   * @returns {Promise<Object>}
   */
  static async updateEmployeeProfile(employeeId, employeeType, updateData) {
    try {
      const EmployeeModel = this.getEmployeeModel(employeeType);
      if (!EmployeeModel) {
        return {
          success: false,
          message: 'Invalid employee type'
        };
      }

      const employee = await EmployeeModel.findById(employeeId);
      
      if (!employee) {
        return {
          success: false,
          message: 'Employee not found'
        };
      }

      // Update allowed fields based on employee type
      let allowedUpdates = ['name', 'email', 'contactInfo', 'department', 'position'];
      
      // Add type-specific fields
      switch (employeeType) {
        case 'doctor':
          allowedUpdates.push('specialization', 'availability', 'assignedHospitalID', 'phone', 'whatApp', 'preferredCommunicationMethod');
          break;
        case 'nurse':
          allowedUpdates.push('assignedWard', 'shiftSchedule');
          break;
        case 'pharmacist':
          allowedUpdates.push('licenseNumber');
          break;
        case 'hospitalStaff':
          allowedUpdates.push('role', 'assignedDepartment', 'shiftSchedule');
          break;
        case 'healthCareManager':
          allowedUpdates.push('assignedHospital');
          break;
      }

      const updates = {};
      allowedUpdates.forEach(field => {
        if (updateData[field] !== undefined) {
          updates[field] = updateData[field];
        }
      });

      Object.assign(employee, updates);
      await employee.save();

      // Remove password from response
      const employeeResponse = employee.toObject();
      delete employeeResponse.password;

      return {
        success: true,
        message: 'Employee profile updated successfully',
        employee: employeeResponse
      };
    } catch (error) {
      console.error('Update employee profile error:', error);
      throw error;
    }
  }

  /**
   * Get all employees by type
   * @param {string} employeeType 
   * @param {Object} filters 
   * @returns {Promise<Object>}
   */
  static async getAllEmployees(employeeType, filters = {}) {
    try {
      const EmployeeModel = this.getEmployeeModel(employeeType);
      if (!EmployeeModel) {
        return {
          success: false,
          message: 'Invalid employee type'
        };
      }

      const query = { userType: employeeType };
      
      if (filters.department) {
        query.department = filters.department;
      }
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive;
      }

      const employees = await EmployeeModel.find(query)
        .select('-password')
        .sort({ createdAt: -1 });

      return {
        success: true,
        employees: employees.map(employee => employee.toObject()),
        count: employees.length
      };
    } catch (error) {
      console.error('Get all employees error:', error);
      throw error;
    }
  }

  /**
   * Get employee by empID
   * @param {string} empID 
   * @param {string} employeeType 
   * @returns {Promise<Object>}
   */
  static async getEmployeeByEmpID(empID, employeeType) {
    try {
      const EmployeeModel = this.getEmployeeModel(employeeType);
      if (!EmployeeModel) {
        return {
          success: false,
          message: 'Invalid employee type'
        };
      }

      const employee = await EmployeeModel.findOne({ empID });
      
      if (!employee) {
        return {
          success: false,
          message: 'Employee not found'
        };
      }

      return {
        success: true,
        employee: employee.toObject()
      };
    } catch (error) {
      console.error('Get employee by empID error:', error);
      throw error;
    }
  }

  /**
   * Update employee status
   * @param {string} employeeId 
   * @param {string} employeeType 
   * @param {string} newStatus 
   * @param {string} reason 
   * @returns {Promise<Object>}
   */
  static async updateEmployeeStatus(employeeId, employeeType, newStatus, reason = '') {
    try {
      const EmployeeModel = this.getEmployeeModel(employeeType);
      if (!EmployeeModel) {
        return {
          success: false,
          message: 'Invalid employee type'
        };
      }

      const employee = await EmployeeModel.findById(employeeId);
      
      if (!employee) {
        return {
          success: false,
          message: 'Employee not found'
        };
      }

      const result = await employee.updateStatus(newStatus, reason);

      return {
        success: true,
        message: 'Employee status updated successfully',
        employee: result
      };
    } catch (error) {
      console.error('Update employee status error:', error);
      throw error;
    }
  }

  /**
   * Get employees by department
   * @param {string} department 
   * @param {string} employeeType 
   * @returns {Promise<Object>}
   */
  static async getEmployeesByDepartment(department, employeeType) {
    try {
      const EmployeeModel = this.getEmployeeModel(employeeType);
      if (!EmployeeModel) {
        return {
          success: false,
          message: 'Invalid employee type'
        };
      }

      const employees = await EmployeeModel.findByDepartment(department);

      return {
        success: true,
        employees: employees.map(employee => employee.toObject()),
        count: employees.length
      };
    } catch (error) {
      console.error('Get employees by department error:', error);
      throw error;
    }
  }
}

export default EmployeeController;
