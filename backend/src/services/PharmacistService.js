/**
 * PharmacistService - Single Responsibility: Pharmacist-specific business logic
 */
export class PharmacistService {
  constructor(pharmacistRepo, prescriptionRepo, medicineStockRepo) {
    this.pharmacistRepo = pharmacistRepo;
    this.prescriptionRepo = prescriptionRepo;
    this.medicineStockRepo = medicineStockRepo;
  }

  async getPharmacistProfile(pharmacistId) {
    return await this.pharmacistRepo.findById(pharmacistId);
  }

  async updatePharmacistProfile(pharmacistId, updateData) {
    return await this.pharmacistRepo.update(pharmacistId, updateData);
  }

  async getPendingPrescriptions() {
    return await this.prescriptionRepo.findByStatus('pending');
  }

  async dispensePrescription(prescriptionId, pharmacistId) {
    const prescription = await this.prescriptionRepo.findById(prescriptionId);
    if (!prescription) {
      throw new Error('Prescription not found');
    }

    // Update prescription status
    return await this.prescriptionRepo.updateStatus(prescriptionId, 'dispensed');
  }

  async checkMedicineStock(medicineId) {
    return await this.medicineStockRepo.findById(medicineId);
  }

  // Add more pharmacist-specific methods as needed
}