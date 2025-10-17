import Doctor from '../models/Doctor.js';
import Nurse from '../models/Nurse.js';
import Pharmacist from '../models/Pharmacist.js';
import HospitalStaff from '../models/HospitalStaff.js';
import HealthCareManager from '../models/HealthCareManager.js';
import SystemAdmin from '../models/SystemAdmin.js';
import UserController from './UserController.js';

/**
 * EmployeeAuthController - Handles employee authentication operations
 * Following Single Responsibility Principle - Only handles authentication-related operations
 */
class EmployeeAuthController {
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

      const EmployeeModel = this.getEmployeeModel(employeeType);
      if (!EmployeeModel) {
        return {
          success: false,
          message: 'Invalid employee type'
        };
      }

      // Generate employee ID based on type
      const empId = this.generateEmployeeId(employeeType);

      // Create employee (password will be hashed by User model pre-save middleware)
      const employee = new EmployeeModel({
        name,
        email,
        password,
        empID: empId,
        userType: employeeType,
        ...specificData
      });

      await employee.save();
      console.log(`${employeeType} saved successfully`);
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
   * Generate employee ID based on type
   * @param {string} employeeType 
   * @returns {string}
   */
  static generateEmployeeId(employeeType) {
    const timestamp = Date.now().toString();
    const randomSuffix = Math.random().toString(36).substring(2, 4).toUpperCase();
    
    const prefixes = {
      'doctor': 'DOC',
      'nurse': 'N',
      'pharmacist': 'P',
      'hospitalStaff': 'HS',
      'healthCareManager': 'HCM',
      'systemAdmin': 'SA'
    };

    const prefix = prefixes[employeeType] || 'EMP';
    return `${prefix}${timestamp.substring(6)}${randomSuffix}`;
  }
}

export default EmployeeAuthController;
