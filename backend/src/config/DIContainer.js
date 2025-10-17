// config/DIContainer.js
import { PatientRepository } from '../repositories/PatientRepository.js';
import { DoctorRepository } from '../repositories/DoctorRepository.js';
import { AppointmentRepository } from '../repositories/AppointmentRepository.js';
import { NotificationRepository } from '../repositories/NotificationRepository.js';
import { PrescriptionRepository } from '../repositories/PrescriptionRepository.js';

import { NotificationService } from '../services/NotificationService.js';
import { PaymentService } from '../services/PaymentService.js';
import { AvailabilityService } from '../services/AvailabilityService.js';
import { AppointmentService } from '../services/AppointmentService.js';
import { PrescriptionService } from '../services/PrescriptionService.js';
import { PatientService } from '../services/PatientService.js';
import { EmployeeServiceFactory } from '../services/EmployeeServiceFactory.js';

import { AppointmentController } from '../controllers/AppointmentController.js';
import { PatientController } from '../controllers/PatientController.js';
import { EmployeeController } from '../controllers/EmployeeController.js';
import { PrescriptionController } from '../controllers/PrescriptionController.js';
import { UserController } from '../controllers/UserController.js';

export class DIContainer {
  constructor() {
    this.services = new Map();
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;

    // Repositories
    this.services.set('patientRepository', new PatientRepository());
    this.services.set('doctorRepository', new DoctorRepository());
    this.services.set('appointmentRepository', new AppointmentRepository());
    this.services.set('notificationRepository', new NotificationRepository());
    this.services.set('prescriptionRepository', new PrescriptionRepository());

    // Services
    this.services.set('notificationService', new NotificationService(this.get('notificationRepository')));
    this.services.set('paymentService', new PaymentService());
    this.services.set('availabilityService', new AvailabilityService());
    
    this.services.set('appointmentService', new AppointmentService(
      this.get('appointmentRepository'),
      this.get('doctorRepository'),
      this.get('patientRepository'),
      this.get('notificationService'),
      this.get('availabilityService')
    ));

    this.services.set('prescriptionService', new PrescriptionService(
      this.get('prescriptionRepository'),
      this.get('patientRepository'),
      this.get('doctorRepository'),
      this.get('notificationService')
    ));

    // FIX: Complete the patientService registration
    this.services.set('patientService', new PatientService(
      this.get('patientRepository'),
      this.get('appointmentRepository'),
      this.get('prescriptionRepository')
    ));

    this.services.set('employeeServiceFactory', new EmployeeServiceFactory({
      doctorRepo: this.get('doctorRepository'),
      appointmentRepo: this.get('appointmentRepository'),
      prescriptionRepo: this.get('prescriptionRepository')
    }));

    // Controllers
    this.services.set('appointmentController', new AppointmentController(
      this.get('appointmentService'),
      this.get('availabilityService'),
      this.get('paymentService')
    ));

    this.services.set('patientController', new PatientController(this.get('patientService')));
    
    this.services.set('employeeController', new EmployeeController(this.get('employeeServiceFactory')));
    
    this.services.set('prescriptionController', new PrescriptionController(this.get('prescriptionService')));
    
    this.services.set('userController', new UserController(this.get('patientService')));

    this.initialized = true;
  }

  get(serviceName) {
    if (!this.services.has(serviceName)) {
      throw new Error(`Service ${serviceName} not found`);
    }
    return this.services.get(serviceName);
  }
}

const container = new DIContainer();
export default container;