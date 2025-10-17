import Doctor from '../models/Doctor.js';
import Nurse from '../models/Nurse.js';
import Pharmacist from '../models/Pharmacist.js';
import HospitalStaff from '../models/HospitalStaff.js';
import HealthCareManager from '../models/HealthCareManager.js';
import SystemAdmin from '../models/SystemAdmin.js';

/**
 * EmployeeManagementController - Handles employee management operations
 * Following Single Responsibility Principle - Only handles employee management operations
 */
class EmployeeManagementController {
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

      // Build query based on filters
      const query = {};
      
      if (filters.department) {
        query.department = filters.department;
      }
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.position) {
        query.position = { $regex: filters.position, $options: 'i' };
      }
      
      if (filters.name) {
        query.name = { $regex: filters.name, $options: 'i' };
      }

      // Add type-specific filters
      if (employeeType === 'doctor' && filters.specialization) {
        query.specialization = filters.specialization;
      }
      
      if (employeeType === 'nurse' && filters.assignedWard) {
        query.assignedWard = filters.assignedWard;
      }

      const employees = await EmployeeModel.find(query)
        .select('-password -__v')
        .sort({ createdAt: -1 });

      return {
        success: true,
        employees: employees,
        total: employees.length
      };
    } catch (error) {
      console.error('Get all employees error:', error);
      return {
        success: false,
        message: 'Failed to retrieve employees'
      };
    }
  }

  /**
   * Delete employee
   * @param {string} employeeId 
   * @param {string} employeeType 
   * @returns {Promise<Object>}
   */
  static async deleteEmployee(employeeId, employeeType) {
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

      // Soft delete - update status to terminated
      employee.status = 'terminated';
      employee.terminatedAt = new Date();
      await employee.save();

      return {
        success: true,
        message: 'Employee terminated successfully'
      };
    } catch (error) {
      console.error('Delete employee error:', error);
      return {
        success: false,
        message: 'Failed to delete employee'
      };
    }
  }

  /**
   * Bulk update employee status
   * @param {Array} employeeIds 
   * @param {string} employeeType 
   * @param {string} newStatus 
   * @param {string} reason 
   * @returns {Promise<Object>}
   */
  static async bulkUpdateEmployeeStatus(employeeIds, employeeType, newStatus, reason = '') {
    try {
      const EmployeeModel = this.getEmployeeModel(employeeType);
      if (!EmployeeModel) {
        return {
          success: false,
          message: 'Invalid employee type'
        };
      }

      const updateData = {
        status: newStatus,
        statusChangedAt: new Date()
      };

      if (reason) {
        updateData.statusChangeReason = reason;
      }

      const result = await EmployeeModel.updateMany(
        { _id: { $in: employeeIds } },
        updateData
      );

      return {
        success: true,
        message: `${result.modifiedCount} employees updated successfully`,
        modifiedCount: result.modifiedCount
      };
    } catch (error) {
      console.error('Bulk update employee status error:', error);
      return {
        success: false,
        message: 'Failed to update employee status'
      };
    }
  }

  /**
   * Get employee statistics
   * @param {string} employeeType 
   * @returns {Promise<Object>}
   */
  static async getEmployeeStatistics(employeeType) {
    try {
      const EmployeeModel = this.getEmployeeModel(employeeType);
      if (!EmployeeModel) {
        return {
          success: false,
          message: 'Invalid employee type'
        };
      }

      const totalEmployees = await EmployeeModel.countDocuments();
      const activeEmployees = await EmployeeModel.countDocuments({ status: 'active' });
      const inactiveEmployees = await EmployeeModel.countDocuments({ status: 'inactive' });
      const terminatedEmployees = await EmployeeModel.countDocuments({ status: 'terminated' });
      const onLeaveEmployees = await EmployeeModel.countDocuments({ status: 'on_leave' });

      // Get department distribution
      const departmentStats = await EmployeeModel.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      // Get position distribution
      const positionStats = await EmployeeModel.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: '$position', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      return {
        success: true,
        statistics: {
          total: totalEmployees,
          active: activeEmployees,
          inactive: inactiveEmployees,
          terminated: terminatedEmployees,
          onLeave: onLeaveEmployees,
          departments: departmentStats,
          positions: positionStats
        }
      };
    } catch (error) {
      console.error('Get employee statistics error:', error);
      return {
        success: false,
        message: 'Failed to retrieve employee statistics'
      };
    }
  }

  /**
   * Search employees
   * @param {string} employeeType 
   * @param {string} searchTerm 
   * @param {Object} filters 
   * @returns {Promise<Object>}
   */
  static async searchEmployees(employeeType, searchTerm, filters = {}) {
    try {
      const EmployeeModel = this.getEmployeeModel(employeeType);
      if (!EmployeeModel) {
        return {
          success: false,
          message: 'Invalid employee type'
        };
      }

      const query = {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
          { empID: { $regex: searchTerm, $options: 'i' } },
          { department: { $regex: searchTerm, $options: 'i' } },
          { position: { $regex: searchTerm, $options: 'i' } }
        ]
      };

      // Add type-specific search fields
      if (employeeType === 'doctor') {
        query.$or.push({ specialization: { $regex: searchTerm, $options: 'i' } });
      }
      
      if (employeeType === 'nurse') {
        query.$or.push({ assignedWard: { $regex: searchTerm, $options: 'i' } });
      }

      // Apply additional filters
      if (filters.department) {
        query.department = filters.department;
      }
      
      if (filters.status) {
        query.status = filters.status;
      }

      const employees = await EmployeeModel.find(query)
        .select('-password -__v')
        .sort({ createdAt: -1 })
        .limit(50); // Limit results for performance

      return {
        success: true,
        employees: employees,
        total: employees.length
      };
    } catch (error) {
      console.error('Search employees error:', error);
      return {
        success: false,
        message: 'Failed to search employees'
      };
    }
  }
}

export default EmployeeManagementController;
