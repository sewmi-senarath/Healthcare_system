import Doctor from '../models/Doctor.js';
import Nurse from '../models/Nurse.js';
import Pharmacist from '../models/Pharmacist.js';
import HospitalStaff from '../models/HospitalStaff.js';
import HealthCareManager from '../models/HealthCareManager.js';
import SystemAdmin from '../models/SystemAdmin.js';

/**
 * EmployeeProfileController - Handles employee profile management operations
 * Following Single Responsibility Principle - Only handles profile-related operations
 */
class EmployeeProfileController {
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
        employee: employee
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

      // Define allowed fields for update based on employee type
      let allowedUpdates = [
        'name', 'email', 'phone', 'contactInfo', 'emergencyContact',
        'department', 'position', 'salary', 'status'
      ];

      // Add type-specific allowed fields
      switch (employeeType) {
        case 'doctor':
          allowedUpdates.push('specialization', 'licenseNumber', 'experience', 'education', 'availability');
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

      const employee = await EmployeeModel.findOne({ empID: empID }).select('-password');
      
      if (!employee) {
        return {
          success: false,
          message: 'Employee not found'
        };
      }

      return {
        success: true,
        employee: employee
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

      employee.status = newStatus;
      if (reason) {
        employee.statusChangeReason = reason;
      }
      employee.statusChangedAt = new Date();

      await employee.save();

      // Remove password from response
      const employeeResponse = employee.toObject();
      delete employeeResponse.password;

      return {
        success: true,
        message: 'Employee status updated successfully',
        employee: employeeResponse
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

      const employees = await EmployeeModel.find({ 
        department: department,
        status: 'active'
      }).select('-password');

      return {
        success: true,
        employees: employees
      };
    } catch (error) {
      console.error('Get employees by department error:', error);
      throw error;
    }
  }
}

export default EmployeeProfileController;
