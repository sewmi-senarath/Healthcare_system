import { BaseRepository } from './BaseRepository.js';
import Doctor from '../models/Doctor.js';

export class DoctorRepository extends BaseRepository {
  async findById(id) {
    return await Doctor.findById(id).select('-password');
  }

  async findByEmpID(empID) {
    return await Doctor.findOne({ empID }).select('-password');
  }

  async findBySpecialization(specialization) {
    return await Doctor.find({ specialization, isActive: true }).select('-password');
  }

  async find(query) {
    return await Doctor.find(query).select('-password');
  }

  async create(data) {
    const doctor = new Doctor(data);
    return await doctor.save();
  }

  async update(id, data) {
    return await Doctor.findByIdAndUpdate(id, data, { new: true }).select('-password');
  }
}
