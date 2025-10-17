/**
 * EmployeeServiceFactory - Strategy Pattern
 * Open/Closed Principle: Open for extension, closed for modification
 */

import { DoctorService } from './DoctorService.js';
import { NurseService } from './NurseService.js';
import { PharmacistService } from './PharmacistService.js';
import { HealthCareManagerService } from './HealthCareManagerService.js';

export class EmployeeServiceFactory {
  constructor(repositories) {
    this.services = new Map();
    this.repositories = repositories;
    this.initialize();
  }

  initialize() {
    // Register all employee services
    this.register('doctor', new DoctorService(
      this.repositories.doctorRepo,
      this.repositories.appointmentRepo,
      this.repositories.prescriptionRepo
    ));

    this.register('nurse', new NurseService(
      this.repositories.nurseRepo
    ));

    this.register('pharmacist', new PharmacistService(
      this.repositories.pharmacistRepo,
      this.repositories.prescriptionRepo,
      this.repositories.medicineStockRepo
    ));

    this.register('healthCareManager', new HealthCareManagerService(
      this.repositories.healthCareManagerRepo,
      this.repositories.appointmentRepo
    ));
  }

  register(employeeType, service) {
    this.services.set(employeeType, service);
  }

  getService(employeeType) {
    if (!this.services.has(employeeType)) {
      throw new Error(`Service for employee type '${employeeType}' not found`);
    }
    return this.services.get(employeeType);
  }

  hasService(employeeType) {
    return this.services.has(employeeType);
  }
}

