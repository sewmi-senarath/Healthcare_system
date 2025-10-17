import Doctor from '../models/Doctor.js';
import Nurse from '../models/Nurse.js';
import Pharmacist from '../models/Pharmacist.js';
import HospitalStaff from '../models/HospitalStaff.js';
import HealthCareManager from '../models/HealthCareManager.js';
import SystemAdmin from '../models/SystemAdmin.js';

/**
 * EmployeeStatsController - Handles employee dashboard statistics and analytics
 * Following Single Responsibility Principle - Only handles statistics-related operations
 */
class EmployeeStatsController {
  /**
   * Get authority dashboard statistics
   * @param {string} employeeId 
   * @param {string} userType 
   * @returns {Promise<Object>}
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
          // Low stock medicines (< 10 quantity)
          const MedicineStock = (await import('../models/MedicineStock.js')).default;
          const lowStockMedicines = await MedicineStock.find({
            quantity: { $lt: 10 }
          }).countDocuments();

          // Pending prescriptions
          const pharmacistPendingPrescriptions = await Prescription.find({
            status: { $in: ['pending', 'active'] }
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

        case 'systemAdmin':
          // Active users
          const activeUsers = await User.find({
            isActive: true
          }).countDocuments();

          // Today's activity (appointments, prescriptions, etc.)
          const systemAdminToday = new Date();
          systemAdminToday.setHours(0, 0, 0, 0);
          const systemAdminTomorrow = new Date(systemAdminToday);
          systemAdminTomorrow.setDate(systemAdminTomorrow.getDate() + 1);

          const todaysActivity = await Appointment.find({
            createdAt: { $gte: systemAdminToday, $lt: systemAdminTomorrow }
          }).countDocuments();

          // System health (placeholder)
          const systemHealth = '99.8%';

          // Unread notifications
          const adminUnreadNotifications = await Notification.find({
            recipientId: employeeId,
            recipientType: 'systemAdmin',
            status: 'unread'
          }).countDocuments();

          stats.activeUsers = activeUsers;
          stats.todaysActivity = todaysActivity;
          stats.systemHealth = systemHealth;
          stats.unreadNotifications = adminUnreadNotifications;
          break;

        default:
          console.log(`Unknown user type: ${userType}`);
          break;
      }

      console.log(`Dashboard stats for ${userType}:`, stats);

      return {
        success: true,
        stats: stats
      };

    } catch (error) {
      console.error('Get authority dashboard stats error:', error);
      return {
        success: false,
        message: 'Failed to retrieve dashboard statistics'
      };
    }
  }

  /**
   * Get recent activity for authority users
   * @param {string} employeeId 
   * @param {string} userType 
   * @returns {Promise<Object>}
   */
  static async getAuthorityRecentActivity(employeeId, userType) {
    try {
      console.log(`Getting recent activity for employeeId: ${employeeId}, userType: ${userType}`);
      
      // Import models dynamically to avoid circular dependencies
      const Appointment = (await import('../models/Appointment.js')).default;
      const Prescription = (await import('../models/Prescription.js')).default;
      const SupportTicket = (await import('../models/SupportTicket.js')).default;

      const activities = [];

      // Get recent appointments
      const recentAppointments = await Appointment.find({
        $or: [
          { doctorID: employeeId },
          { patientID: employeeId }
        ]
      })
      .populate('patientID', 'name')
      .populate('doctorID', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

      recentAppointments.forEach(appointment => {
        activities.push({
          title: 'Appointment Update',
          description: `Appointment with ${appointment.doctorID?.name || appointment.patientID?.name} - ${appointment.status}`,
          date: appointment.dateTime,
          icon: 'CalendarIcon',
          type: 'appointment'
        });
      });

      // Get recent prescriptions (for doctors)
      if (userType === 'doctor') {
        const recentPrescriptions = await Prescription.find({
          doctorID: employeeId
        })
        .populate('patientID', 'name')
        .sort({ createdAt: -1 })
        .limit(3);

        recentPrescriptions.forEach(prescription => {
          activities.push({
            title: 'Prescription Created',
            description: `Prescription for ${prescription.patientID?.name}`,
            date: prescription.createdAt,
            icon: 'DocumentTextIcon',
            type: 'prescription'
          });
        });
      }

      // Get recent support tickets (for managers and admins)
      if (userType === 'healthCareManager' || userType === 'systemAdmin') {
        const recentTickets = await SupportTicket.find({})
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .limit(3);

        recentTickets.forEach(ticket => {
          activities.push({
            title: 'Support Ticket',
            description: `${ticket.subject} - ${ticket.status}`,
            date: ticket.createdAt,
            icon: 'TicketIcon',
            type: 'support_ticket'
          });
        });
      }

      // Sort all activities by date
      activities.sort((a, b) => new Date(b.date) - new Date(a.date));

      return {
        success: true,
        activities: activities.slice(0, 10) // Return top 10 activities
      };

    } catch (error) {
      console.error('Get authority recent activity error:', error);
      return {
        success: false,
        message: 'Failed to retrieve recent activity'
      };
    }
  }
}

export default EmployeeStatsController;
