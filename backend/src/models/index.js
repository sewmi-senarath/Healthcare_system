/**
 * Models Index - Centralized export of all healthcare system models
 * Following Single Responsibility Principle by providing a single point of access
 */

import User from './User.js';
import Patient from './Patient.js';
import SystemAdmin from './SystemAdmin.js';
import Employee from './Employee.js';
import Doctor from './Doctor.js';
import HospitalStaff from './HospitalStaff.js';
import Nurse from './Nurse.js';
import Pharmacist from './Pharmacist.js';
import HealthCareManager from './HealthCareManager.js';
import SupportTicket from './SupportTicket.js';
import MedicineStock from './MedicineStock.js';
import Prescription from './Prescription.js';
import Notification from './Notification.js';
import Appointment from './Appointment.js';

// Export all models
export {
  User,
  Patient,
  SystemAdmin,
  Employee,
  Doctor,
  HospitalStaff,
  Nurse,
  Pharmacist,
  HealthCareManager,
  SupportTicket,
  MedicineStock,
  Prescription,
  Notification,
  Appointment
};

// Export default as an object containing all models
export default {
  User,
  Patient,
  SystemAdmin,
  Employee,
  Doctor,
  HospitalStaff,
  Nurse,
  Pharmacist,
  HealthCareManager,
  SupportTicket,
  MedicineStock,
  Prescription,
  Notification,
  Appointment
};
