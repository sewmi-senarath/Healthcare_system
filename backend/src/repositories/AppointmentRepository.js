import { BaseRepository } from './BaseRepository.js';
import Appointment from '../models/Appointment.js';

export class AppointmentRepository extends BaseRepository {
  async findById(id) {
    return await Appointment.findById(id);
  }

  async findByAppointmentID(appointmentID) {
    return await Appointment.findOne({ appointmentID });
  }

  async findByPatientID(patientID) {
    return await Appointment.find({ patientID }).sort({ dateTime: -1 });
  }

  async findByDoctorID(doctorID, date = null) {
    const query = { doctorID };
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.dateTime = { $gte: startOfDay, $lte: endOfDay };
    }
    return await Appointment.find(query).sort({ dateTime: 1 });
  }

  async findPendingApproval() {
    return await Appointment.find({ 
      status: 'pending_approval',
      'approvalWorkflow.approvalStatus': 'pending'
    }).sort({ dateTime: 1 });
  }

  async create(data) {
    const appointment = new Appointment(data);
    return await appointment.save();
  }

  async update(id, data) {
    return await Appointment.findByIdAndUpdate(id, data, { new: true });
  }

  async findConflicting(doctorID, dateTime) {
    return await Appointment.findOne({
      doctorID,
      dateTime: new Date(dateTime),
      status: { $in: ['confirmed', 'reserved'] }
    });
  }
}