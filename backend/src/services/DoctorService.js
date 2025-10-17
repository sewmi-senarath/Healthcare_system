/**
 * DoctorService - Single Responsibility: Doctor-specific business logic
 */
export class DoctorService {
  constructor(doctorRepo, appointmentRepo, prescriptionRepo) {
    this.doctorRepo = doctorRepo;
    this.appointmentRepo = appointmentRepo;
    this.prescriptionRepo = prescriptionRepo;
  }

  async register(doctorData) {
    const existingDoctor = await this.doctorRepo.findOne({ email: doctorData.email });
    if (existingDoctor) {
      throw new Error('Email already registered');
    }

    const empID = `D${Date.now().toString().substring(6)}${Math.random().toString(36).substring(2, 4).toUpperCase()}`;

    return await this.doctorRepo.create({
      ...doctorData,
      empID,
      userType: 'doctor'
    });
  }

  async login(email, password) {
    // Implement authentication logic
    const doctor = await this.doctorRepo.findOne({ email });
    if (!doctor) {
      throw new Error('Invalid credentials');
    }
    
    // Password verification logic here
    return doctor;
  }

  async getProfile(doctorId) {
    return await this.doctorRepo.findById(doctorId);
  }

  async updateProfile(doctorId, updateData) {
    const allowedUpdates = ['name', 'phone', 'specialization', 'availability', 'consultationFee'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    return await this.doctorRepo.update(doctorId, updates);
  }

  async getDashboardStats(doctorId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysAppointments = await this.appointmentRepo.find({
      doctorID: doctorId,
      dateTime: { $gte: today, $lt: tomorrow },
      status: { $in: ['approved', 'confirmed', 'pending_approval'] }
    });

    const totalAppointments = await this.appointmentRepo.find({
      doctorID: doctorId
    });

    const pendingPrescriptions = await this.prescriptionRepo.find({
      doctorId: doctorId,
      status: { $in: ['pending', 'active'] }
    });

    return {
      todaysAppointments: todaysAppointments.length,
      totalAppointments: totalAppointments.length,
      pendingPrescriptions: pendingPrescriptions.length,
      activePatients: 0 // Calculate based on recent appointments
    };
  }
}