/**
 * PatientService - Single Responsibility: Patient business logic
 */
export class PatientService {
  constructor(patientRepo, appointmentRepo, prescriptionRepo) {
    this.patientRepo = patientRepo;
    this.appointmentRepo = appointmentRepo;
    this.prescriptionRepo = prescriptionRepo;
  }

  async registerPatient(patientData) {
    const existingPatient = await this.patientRepo.findOne({ email: patientData.email });
    if (existingPatient) {
      throw new Error('Email already registered');
    }

    const patientId = `PAT${Date.now().toString().substring(6)}${Math.random().toString(36).substring(2, 4).toUpperCase()}`;

    const patient = await this.patientRepo.create({
      ...patientData,
      patientId,
      dateOfBirth: new Date(patientData.dateOfBirth)
    });

    return patient;
  }

  async getPatientProfile(patientId) {
    const patient = await this.patientRepo.findById(patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }
    return patient;
  }

  async updatePatientProfile(patientId, updateData) {
    const patient = await this.patientRepo.findById(patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }

    const allowedUpdates = ['name', 'email', 'dateOfBirth', 'gender', 'contactInfo', 'address'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    return await this.patientRepo.update(patientId, updates);
  }

  async getDashboardStats(patientId) {
    const upcomingAppointments = await this.appointmentRepo.find({
      patientID: patientId,
      status: { $in: ['approved', 'confirmed', 'pending_approval'] },
      dateTime: { $gte: new Date() }
    });

    const prescriptions = await this.prescriptionRepo.find({
      patientID: patientId
    });

    const activePrescriptions = prescriptions.filter(p => 
      ['active', 'dispensed'].includes(p.status)
    );

    return {
      upcomingAppointments: upcomingAppointments.length,
      medicalRecords: prescriptions.length,
      activePrescriptions: activePrescriptions.length,
      unreadNotifications: 0 // Would get from notification service
    };
  }
}