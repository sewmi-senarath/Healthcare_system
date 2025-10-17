import { PatientRepository } from './PatientRepository.js';
import { DoctorRepository } from './DoctorRepository.js';
import { AppointmentRepository } from './AppointmentRepository.js';
import { NotificationRepository } from './NotificationRepository.js';
import { PrescriptionRepository } from './PrescriptionRepository.js';

/**
 * Factory Pattern for Repository Creation
 * Open/Closed Principle - Open for extension, closed for modification
 */
export class RepositoryFactory {
  static repositories = new Map();

  static register(name, repository) {
    this.repositories.set(name, repository);
  }

  static get(name) {
    if (!this.repositories.has(name)) {
      throw new Error(`Repository ${name} not registered`);
    }
    return this.repositories.get(name);
  }
}