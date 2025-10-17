/**
 * PrescriptionService - Single Responsibility: Prescription business logic
 */
export class PrescriptionService {
  constructor(prescriptionRepo, patientRepo, doctorRepo, notificationService) {
    this.prescriptionRepo = prescriptionRepo;
    this.patientRepo = patientRepo;
    this.doctorRepo = doctorRepo;
    this.notificationService = notificationService;
  }

  async createPrescription(prescriptionData, doctorId) {
    const patient = await this.patientRepo.findOne({ patientId: prescriptionData.patientID });
    if (!patient) {
      throw new Error('Patient not found');
    }

    const doctor = await this.doctorRepo.findOne({ empID: doctorId });
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    const prescription = await this.prescriptionRepo.create({
      prescriptionID: `PRES${Date.now()}${Math.random().toString(36).substring(2, 6)}`.toUpperCase(),
      patientID: prescriptionData.patientID,
      doctorId: doctorId,
      medicineList: prescriptionData.medicineList,
      dosageInstruction: prescriptionData.dosageInstruction,
      prescriptionDetails: prescriptionData.prescriptionDetails,
      status: 'pending',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    await this.notificationService.sendPrescriptionNotification(prescription, patient, doctor);

    return prescription;
  }

  async getDoctorPrescriptions(doctorId) {
    return await this.prescriptionRepo.findByDoctorID(doctorId);
  }

  async updatePrescriptionStatus(prescriptionID, status, pharmacistId, pharmacistName) {
    const prescription = await this.prescriptionRepo.findByPrescriptionID(prescriptionID);
    if (!prescription) {
      throw new Error('Prescription not found');
    }

    switch (status) {
      case 'sent_to_pharmacy':
        await prescription.sendToPharmacy('PHARM001', pharmacistId, pharmacistId, pharmacistName);
        break;
      case 'dispensed':
        await prescription.dispenseMedication(pharmacistId, pharmacistName, {});
        break;
      case 'completed':
        await prescription.completePrescription(pharmacistId, pharmacistName);
        break;
      case 'cancelled':
        await prescription.cancelPrescription(pharmacistId, pharmacistName, 'Cancelled by pharmacist');
        break;
      default:
        throw new Error('Invalid status');
    }

    return prescription;
  }
}
