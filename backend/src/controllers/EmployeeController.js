import EmployeeAuthController from './EmployeeAuthController.js';
import EmployeeProfileController from './EmployeeProfileController.js';
import EmployeeStatsController from './EmployeeStatsController.js';
import EmployeeManagementController from './EmployeeManagementController.js';

/**
 * EmployeeController - Main controller that delegates to specialized controllers
 * Following Single Responsibility Principle and Facade Pattern
 * This controller acts as a facade to the specialized employee controllers
 */
class EmployeeController {
  // Authentication Operations - delegated to EmployeeAuthController
  static getEmployeeModel(employeeType) {
    return EmployeeAuthController.getEmployeeModel(employeeType);
  }

  static async registerEmployee(employeeData, employeeType) {
    return await EmployeeAuthController.registerEmployee(employeeData, employeeType);
  }

  static async loginEmployee(email, password, employeeType) {
    return await EmployeeAuthController.loginEmployee(email, password, employeeType);
  }

  // Profile Operations - delegated to EmployeeProfileController
  static async getEmployeeProfile(employeeId, employeeType) {
    return await EmployeeProfileController.getEmployeeProfile(employeeId, employeeType);
  }

  static async updateEmployeeProfile(employeeId, employeeType, updateData) {
    return await EmployeeProfileController.updateEmployeeProfile(employeeId, employeeType, updateData);
  }

  static async getEmployeeByEmpID(empID, employeeType) {
    return await EmployeeProfileController.getEmployeeByEmpID(empID, employeeType);
  }

  static async updateEmployeeStatus(employeeId, employeeType, newStatus, reason) {
    return await EmployeeProfileController.updateEmployeeStatus(employeeId, employeeType, newStatus, reason);
  }

  static async getEmployeesByDepartment(department, employeeType) {
    return await EmployeeProfileController.getEmployeesByDepartment(department, employeeType);
  }

  // Statistics Operations - delegated to EmployeeStatsController
  static async getAuthorityDashboardStats(employeeId, userType) {
    return await EmployeeStatsController.getAuthorityDashboardStats(employeeId, userType);
  }

  static async getAuthorityRecentActivity(employeeId, userType) {
    return await EmployeeStatsController.getAuthorityRecentActivity(employeeId, userType);
  }

  // Management Operations - delegated to EmployeeManagementController
  static async getAllEmployees(employeeType, filters) {
    return await EmployeeManagementController.getAllEmployees(employeeType, filters);
  }

  static async deleteEmployee(employeeId, employeeType) {
    return await EmployeeManagementController.deleteEmployee(employeeId, employeeType);
  }

  static async bulkUpdateEmployeeStatus(employeeIds, employeeType, newStatus, reason) {
    return await EmployeeManagementController.bulkUpdateEmployeeStatus(employeeIds, employeeType, newStatus, reason);
  }

  static async getEmployeeStatistics(employeeType) {
    return await EmployeeManagementController.getEmployeeStatistics(employeeType);
  }

  static async searchEmployees(employeeType, searchTerm, filters) {
    return await EmployeeManagementController.searchEmployees(employeeType, searchTerm, filters);
  }
}

export default EmployeeController;