// repositories/PrescriptionRepository.js
import { BaseRepository } from './BaseRepository.js';
import Prescription from '../models/Prescription.js';

export class PrescriptionRepository extends BaseRepository {
  async findById(id) {
    return await Prescription.findById(id);
  }

  async findByPrescriptionID(prescriptionID) {
    return await Prescription.findOne({ prescriptionID });
  }

  async findByPatientID(patientID) {
    return await Prescription.find({ patientID }).sort({ dateIssued: -1 });
  }

  async findByDoctorID(doctorId) {
    return await Prescription.find({ doctorId }).sort({ dateIssued: -1 });
  }

  async findByStatus(status) {
    return await Prescription.find({ status }).sort({ dateIssued: -1 });
  }

  async create(data) {
    const prescription = new Prescription(data);
    return await prescription.save();
  }

  async update(id, data) {
    return await Prescription.findByIdAndUpdate(id, data, { new: true });
  }
}