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
      // switch (employeeType) {
      //   case 'doctor':
      //     allowedUpdates.push('specialization', 'availability', 'assignedHospitalID', 'phone', 'whatApp', 'preferredCommunicationMethod');
      //     break;
      //   case 'nurse':
      //     allowedUpdates.push('assignedWard', 'shiftSchedule');
      //     break;
      //   case 'pharmacist':
      //     allowedUpdates.push('licenseNumber');
      //     break;
      //   case 'hospitalStaff':
      //     allowedUpdates.push('role', 'assignedDepartment', 'shiftSchedule');
      //     break;
      //   case 'healthCareManager':
      //     allowedUpdates.push('assignedHospital');
      //     break;
      // }

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

  /**
   * Get authority dashboard statistics
   */
  static async getAuthorityDashboardStats(employeeId, userType) {
    try {
      console.log(`Getting dashboard stats for employeeId: ${employeeId}, userType: ${userType}`);
      
      // Import models dynamically to avoid circular dependencies
      const Appointment = (await import('../models/Appointment.js')).default;
      const Prescription = (await import('../models/Prescription.js')).default;
      const SupportTicket = (await import('../models/SupportTicket.js')).default;
      const Notification = (await import('../models/Notification.js')).default;

      const stats = {};

      switch (userType) {
        case 'doctor':
          // Today's appointments
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          const todaysAppointments = await Appointment.find({
            doctorID: employeeId,
            dateTime: { $gte: today, $lt: tomorrow },
            status: { $in: ['approved', 'confirmed', 'pending_approval'] }
          }).countDocuments();

          // Total appointments for this doctor
          const totalAppointments = await Appointment.find({
            doctorID: employeeId
          }).countDocuments();
          
          console.log(`Total appointments for doctor ${employeeId}: ${totalAppointments}`);

          // Pending approval appointments
          const pendingApprovalAppointments = await Appointment.find({
            doctorID: employeeId,
            status: 'pending_approval'
          }).countDocuments();

          // Upcoming appointments (next 7 days)
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          const upcomingAppointments = await Appointment.find({
            doctorID: employeeId,
            dateTime: { $gte: new Date(), $lte: nextWeek },
            status: { $in: ['approved', 'confirmed'] }
          }).countDocuments();

          // Completed appointments
          const completedAppointments = await Appointment.find({
            doctorID: employeeId,
            status: 'completed'
          }).countDocuments();

          // Active patients (patients with appointments in last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const activePatients = await Appointment.find({
            doctorID: employeeId,
            dateTime: { $gte: thirtyDaysAgo },
            status: { $in: ['approved', 'confirmed', 'completed'] }
          }).distinct('patientID').length;

          // Pending prescriptions
          const pendingPrescriptions = await Prescription.find({
            doctorID: employeeId,
            status: { $in: ['pending', 'active'] }
          }).countDocuments();

          // Unread notifications
          const unreadNotifications = await Notification.find({
            recipientId: employeeId,
            recipientType: 'doctor',
            status: 'unread'
          }).countDocuments();

          stats.todaysAppointments = todaysAppointments;
          stats.totalAppointments = totalAppointments;
          stats.pendingApprovalAppointments = pendingApprovalAppointments;
          stats.upcomingAppointments = upcomingAppointments;
          stats.completedAppointments = completedAppointments;
          stats.activePatients = activePatients;
          stats.pendingPrescriptions = pendingPrescriptions;
          stats.unreadNotifications = unreadNotifications;
          break;

        case 'nurse':
          // Today's appointments
          const nurseToday = new Date();
          nurseToday.setHours(0, 0, 0, 0);
          const nurseTomorrow = new Date(nurseToday);
          nurseTomorrow.setDate(nurseTomorrow.getDate() + 1);

          const nurseTodaysAppointments = await Appointment.find({
            dateTime: { $gte: nurseToday, $lt: nurseTomorrow },
            status: { $in: ['approved', 'confirmed', 'pending_approval'] }
          }).countDocuments();

          // Total appointments
          const nurseTotalAppointments = await Appointment.find({}).countDocuments();

          // Assigned patients (nurse-specific)
          const Nurse = (await import('../models/Nurse.js')).default;
          const nurse = await Nurse.findOne({ empID: employeeId });
          const assignedPatientCount = nurse?.assignedPatients?.length || 0;

          // Unread notifications
          const nurseUnreadNotifications = await Notification.find({
            recipientId: employeeId,
            recipientType: 'nurse',
            status: 'unread'
          }).countDocuments();

          stats.todaysAppointments = nurseTodaysAppointments;
          stats.totalAppointments = nurseTotalAppointments;
          stats.assignedPatients = assignedPatientCount;
          stats.unreadNotifications = nurseUnreadNotifications;
          break;

        case 'healthCareManager':
          // Pending approvals
          const pendingApprovals = await Appointment.find({
            status: 'pending_approval',
            'approvalWorkflow.approvalStatus': 'pending'
          }).countDocuments();

          // Active support tickets
          const activeTickets = await SupportTicket.find({
            status: { $in: ['open', 'in_progress'] }
          }).countDocuments();

          // Total staff (count all employees)
          const Employee = (await import('../models/Employee.js')).default;
          const totalStaff = await Employee.find({}).countDocuments();

          // Unread notifications
          const managerUnreadNotifications = await Notification.find({
            recipientId: employeeId,
            recipientType: 'healthCareManager',
            status: 'unread'
          }).countDocuments();

          stats.pendingApprovals = pendingApprovals;
          stats.activeTickets = activeTickets;
          stats.totalStaff = totalStaff;
          stats.unreadNotifications = managerUnreadNotifications;
          break;

        case 'pharmacist':
          // Low stock medicines (assuming quantity < 10 is low)
          const MedicineStock = (await import('../models/MedicineStock.js')).default;
          const lowStockMedicines = await MedicineStock.find({
            quantityAvailable: { $lt: 10 }
          }).countDocuments();

          // Pending prescriptions
          const pharmacistPendingPrescriptions = await Prescription.find({
            status: { $in: ['pending', 'sent_to_pharmacy'] }
          }).countDocuments();

          // Total medicines
          const totalMedicines = await MedicineStock.find({}).countDocuments();

          // Unread notifications
          const pharmacistUnreadNotifications = await Notification.find({
            recipientId: employeeId,
            recipientType: 'pharmacist',
            status: 'unread'
          }).countDocuments();

          stats.lowStockMedicines = lowStockMedicines;
          stats.pendingPrescriptions = pharmacistPendingPrescriptions;
          stats.totalMedicines = totalMedicines;
          stats.unreadNotifications = pharmacistUnreadNotifications;
          break;

        default:
          // Default stats for other roles
          const defaultUnreadNotifications = await Notification.find({
            recipientId: employeeId,
            status: 'unread'
          }).countDocuments();

          stats.activeUsers = 0; // This would need to be calculated based on active sessions
          stats.todaysActivity = 0; // This would need activity tracking
          stats.systemHealth = '99%';
          stats.unreadNotifications = defaultUnreadNotifications;
          break;
      }

      return {
        success: true,
        stats
      };
    } catch (error) {
      console.error('Get authority dashboard stats error:', error);
      throw error;
    }
  }

  /**
   * Get authority recent activity
   */
  static async getAuthorityRecentActivity(employeeId, userType) {
    try {
      // Import models dynamically
      const Appointment = (await import('../models/Appointment.js')).default;
      const Prescription = (await import('../models/Prescription.js')).default;
      const SupportTicket = (await import('../models/SupportTicket.js')).default;
      const Notification = (await import('../models/Notification.js')).default;

      const activities = [];

      switch (userType) {
        case 'doctor':
          // Recent appointments
          const recentDoctorAppointments = await Appointment.find({
            doctorID: employeeId
          })
          .populate('patientID', 'name')
          .sort({ createdAt: -1 })
          .limit(3);

          recentDoctorAppointments.forEach(appointment => {
            activities.push({
              type: 'appointment',
              title: `Appointment with ${appointment.patientID?.name || 'Patient'}`,
              description: `Appointment ${appointment.status} - ${appointment.reasonForVisit}`,
              date: appointment.createdAt,
              icon: 'CalendarIcon'
            });
          });

          // Recent prescriptions
          const recentDoctorPrescriptions = await Prescription.find({
            doctorID: employeeId
          })
          .populate('patientID', 'name')
          .sort({ dateIssued: -1 })
          .limit(2);

          recentDoctorPrescriptions.forEach(prescription => {
            activities.push({
              type: 'prescription',
              title: `Prescription for ${prescription.patientID?.name || 'Patient'}`,
              description: `${prescription.medicineList.length} medications prescribed`,
              date: prescription.dateIssued,
              icon: 'DocumentTextIcon'
            });
          });
          break;

        case 'healthCareManager':
          // Recent appointment approvals/declines
          const recentManagerAppointments = await Appointment.find({
            'approvalWorkflow.reviewedBy': employeeId
          })
          .populate('patientID', 'name')
          .populate('doctorID', 'name')
          .sort({ 'approvalWorkflow.reviewedDate': -1 })
          .limit(3);

          recentManagerAppointments.forEach(appointment => {
            const action = appointment.approvalWorkflow.approvalStatus === 'approved' ? 'approved' : 'declined';
            activities.push({
              type: 'appointment',
              title: `${action.charAt(0).toUpperCase() + action.slice(1)} appointment`,
              description: `Appointment with ${appointment.patientID?.name || 'Patient'} and Dr. ${appointment.doctorID?.name || 'Unknown'}`,
              date: appointment.approvalWorkflow.reviewedDate,
              icon: 'CalendarIcon'
            });
          });

          // Recent support ticket resolutions
          const recentTickets = await SupportTicket.find({
            status: 'resolved'
          })
          .sort({ lastUpdated: -1 })
          .limit(2);

          recentTickets.forEach(ticket => {
            activities.push({
              type: 'support',
              title: `Resolved support ticket #${ticket.ticketID}`,
              description: ticket.resolution || 'Support ticket resolved',
              date: ticket.lastUpdated,
              icon: 'TicketIcon'
            });
          });
          break;

        case 'pharmacist':
          // Recent prescription dispensing
          const recentPharmacistPrescriptions = await Prescription.find({
            status: 'dispensed'
          })
          .populate('patientID', 'name')
          .populate('doctorID', 'name')
          .sort({ dispensedDate: -1 })
          .limit(3);

          recentPharmacistPrescriptions.forEach(prescription => {
            activities.push({
              type: 'prescription',
              title: `Dispensed prescription`,
              description: `Prescription for ${prescription.patientID?.name || 'Patient'} from Dr. ${prescription.doctorID?.name || 'Unknown'}`,
              date: prescription.dispensedDate,
              icon: 'BeakerIcon'
            });
          });
          break;
      }

      // Add recent notifications for all types
      const recentNotifications = await Notification.find({
        recipientId: employeeId,
        recipientType: userType
      })
      .sort({ createdAt: -1 })
      .limit(2);

      recentNotifications.forEach(notification => {
        activities.push({
          type: 'notification',
          title: 'System notification',
          description: notification.message,
          date: notification.createdAt,
          icon: 'BellIcon'
        });
      });

      // Sort all activities by date (most recent first)
      activities.sort((a, b) => new Date(b.date) - new Date(a.date));

      return {
        success: true,
        activities: activities.slice(0, 6) // Return top 6 most recent activities
      };
    } catch (error) {
      console.error('Get authority recent activity error:', error);
      throw error;
    }
  }
}

export default EmployeeController;
