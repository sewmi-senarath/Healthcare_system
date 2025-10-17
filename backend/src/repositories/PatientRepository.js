// repositories/PatientRepository.js
import { BaseRepository } from './BaseRepository.js';
import Patient from '../models/Patient.js';

export class PatientRepository extends BaseRepository {
  async findById(id) {
    return await Patient.findById(id).select('-password');
  }

  async findOne(query) {
    return await Patient.findOne(query).select('-password');
  }

  async findByPatientId(patientId) {
    return await Patient.findOne({ patientId }).select('-password');
  }

  async find(query) {
    return await Patient.find(query).select('-password');
  }

  async create(data) {
    const patient = new Patient(data);
    return await patient.save();
  }

  async update(id, data) {
    return await Patient.findByIdAndUpdate(id, data, { new: true }).select('-password');
  }

  async delete(id) {
    return await Patient.findByIdAndDelete(id);
  }
}