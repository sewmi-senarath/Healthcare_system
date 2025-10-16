import mongoose from 'mongoose';
import User from './User.js';
import employeeBaseSchema from './Employee.js';

/**
 * Pharmacist Model - Following Single Responsibility Principle
 * Responsible only for pharmacist-specific functionality
 * Inherits from Employee base class
 */
const pharmacistSchema = new mongoose.Schema({
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  pharmacyLicense: {
    licenseNumber: String,
    issueDate: Date,
    expiryDate: Date,
    state: String,
    status: {
      type: String,
      enum: ['active', 'expired', 'suspended'],
      default: 'active'
    }
  },
  specializations: [{
    type: String,
    enum: [
      'clinical_pharmacy', 'hospital_pharmacy', 'community_pharmacy',
      'pharmaceutical_care', 'medication_therapy_management',
      'pharmacotherapy', 'pharmacogenomics', 'compounding'
    ]
  }],
  certifications: [{
    name: String,
    issuer: String,
    issueDate: Date,
    expiryDate: Date,
    credentialNumber: String
  }],
  assignedPharmacy: {
    pharmacyId: String,
    pharmacyName: String,
    location: String,
    type: {
      type: String,
      enum: ['hospital', 'retail', 'mail_order', 'specialty'],
      default: 'hospital'
    }
  },
  inventoryManagement: {
    canOrderMedications: { type: Boolean, default: true },
    canDispenseControlledSubstances: { type: Boolean, default: false },
    canCompoundMedications: { type: Boolean, default: false },
    maxPrescriptionValue: { type: Number, default: 1000 }
  },
  prescriptionStats: {
    totalDispensed: { type: Number, default: 0 },
    accuracyRate: { type: Number, default: 100 },
    lastAccuracyReview: Date,
    errorCount: { type: Number, default: 0 }
  },
  consultationHours: {
    monday: [{ start: String, end: String }],
    tuesday: [{ start: String, end: String }],
    wednesday: [{ start: String, end: String }],
    thursday: [{ start: String, end: String }],
    friday: [{ start: String, end: String }],
    saturday: [{ start: String, end: String }],
    sunday: [{ start: String, end: String }]
  }
});

// Instance methods - Interface Segregation Principle
pharmacistSchema.methods.updateMedicineStock = async function(medicineId, action, quantity, additionalData = {}) {
  // Import MedicineStock model dynamically to avoid circular dependency
  const MedicineStock = (await import('./MedicineStock.js')).default;
  
  const medicine = await MedicineStock.findByMedicineId(medicineId);
  
  if (!medicine) {
    throw new Error('Medicine not found in stock');
  }
  
  const stockUpdate = await medicine.updateStock(
    action,
    quantity,
    this.empID,
    this.name,
    {
      reason: additionalData.reason || '',
      notes: additionalData.notes || '',
      batchNumber: additionalData.batchNumber || '',
      prescriptionId: additionalData.prescriptionId || '',
      patientId: additionalData.patientId || ''
    }
  );
  
  return stockUpdate;
};

pharmacistSchema.methods.checkMedicineAvailability = async function(medicineId, requiredQuantity = 1) {
  // Import MedicineStock model dynamically to avoid circular dependency
  const MedicineStock = (await import('./MedicineStock.js')).default;
  
  const medicine = await MedicineStock.findByMedicineId(medicineId);
  
  if (!medicine) {
    throw new Error('Medicine not found in stock');
  }
  
  return medicine.checkAvailability(requiredQuantity);
};

pharmacistSchema.methods.recordNewMedicine = async function(medicineData) {
  // Import MedicineStock model dynamically to avoid circular dependency
  const MedicineStock = (await import('./MedicineStock.js')).default;
  
  const medicine = new MedicineStock({
    name: medicineData.name,
    genericName: medicineData.genericName,
    quantityAvailable: medicineData.quantityAvailable || 0,
    expiryDate: medicineData.expiryDate,
    supplierInfo: medicineData.supplierInfo,
    medicineDetails: medicineData.medicineDetails,
    pricing: medicineData.pricing,
    stockManagement: medicineData.stockManagement,
    location: {
      ...medicineData.location,
      pharmacyId: this.assignedPharmacy.pharmacyId
    },
    createdBy: this.empID
  });
  
  await medicine.save();
  
  return medicine.getMedicineDetails();
};

pharmacistSchema.methods.addMedicineStock = async function(medicineId, quantity, batchNumber = '', notes = '') {
  return await this.updateMedicineStock(medicineId, 'stock_in', quantity, {
    reason: 'Stock addition',
    batchNumber: batchNumber,
    notes: notes
  });
};

pharmacistSchema.methods.reduceMedicineStock = async function(medicineId, quantity, prescriptionId = '', patientId = '') {
  return await this.updateMedicineStock(medicineId, 'stock_out', quantity, {
    reason: 'Dispensed to patient',
    prescriptionId: prescriptionId,
    patientId: patientId
  });
};

pharmacistSchema.methods.adjustMedicineStock = async function(medicineId, newQuantity, reason = '') {
  return await this.updateMedicineStock(medicineId, 'adjustment', newQuantity, {
    reason: reason
  });
};

pharmacistSchema.methods.markMedicineAsExpired = async function(medicineId, quantity) {
  return await this.updateMedicineStock(medicineId, 'expiry', quantity, {
    reason: 'Medicine expired'
  });
};

pharmacistSchema.methods.markMedicineAsDamaged = async function(medicineId, quantity, reason = '') {
  return await this.updateMedicineStock(medicineId, 'damage', quantity, {
    reason: `Damaged: ${reason}`
  });
};

pharmacistSchema.methods.returnMedicineStock = async function(medicineId, quantity, reason = '') {
  return await this.updateMedicineStock(medicineId, 'return', quantity, {
    reason: `Return: ${reason}`
  });
};

pharmacistSchema.methods.viewMedicineStock = async function(medicineId) {
  // Import MedicineStock model dynamically to avoid circular dependency
  const MedicineStock = (await import('./MedicineStock.js')).default;
  
  const medicine = await MedicineStock.findByMedicineId(medicineId);
  
  if (!medicine) {
    throw new Error('Medicine not found in stock');
  }
  
  return medicine.getMedicineDetails();
};

pharmacistSchema.methods.viewMedicineStockHistory = async function(medicineId, filters = {}) {
  // Import MedicineStock model dynamically to avoid circular dependency
  const MedicineStock = (await import('./MedicineStock.js')).default;
  
  const medicine = await MedicineStock.findByMedicineId(medicineId);
  
  if (!medicine) {
    throw new Error('Medicine not found in stock');
  }
  
  return medicine.getStockHistory(filters);
};

pharmacistSchema.methods.generateMedicineStockReport = async function(medicineId) {
  // Import MedicineStock model dynamically to avoid circular dependency
  const MedicineStock = (await import('./MedicineStock.js')).default;
  
  const medicine = await MedicineStock.findByMedicineId(medicineId);
  
  if (!medicine) {
    throw new Error('Medicine not found in stock');
  }
  
  return medicine.generateStockReport();
};

pharmacistSchema.methods.viewLowStockMedicines = async function() {
  // Import MedicineStock model dynamically to avoid circular dependency
  const MedicineStock = (await import('./MedicineStock.js')).default;
  
  const lowStockMedicines = await MedicineStock.findLowStock();
  return lowStockMedicines.map(medicine => medicine.getMedicineDetails());
};

pharmacistSchema.methods.viewOutOfStockMedicines = async function() {
  // Import MedicineStock model dynamically to avoid circular dependency
  const MedicineStock = (await import('./MedicineStock.js')).default;
  
  const outOfStockMedicines = await MedicineStock.findOutOfStock();
  return outOfStockMedicines.map(medicine => medicine.getMedicineDetails());
};

pharmacistSchema.methods.viewExpiredMedicines = async function() {
  // Import MedicineStock model dynamically to avoid circular dependency
  const MedicineStock = (await import('./MedicineStock.js')).default;
  
  const expiredMedicines = await MedicineStock.findExpired();
  return expiredMedicines.map(medicine => medicine.getMedicineDetails());
};

pharmacistSchema.methods.viewExpiringSoonMedicines = async function(days = 30) {
  // Import MedicineStock model dynamically to avoid circular dependency
  const MedicineStock = (await import('./MedicineStock.js')).default;
  
  const expiringSoonMedicines = await MedicineStock.findExpiringSoon(days);
  return expiringSoonMedicines.map(medicine => medicine.getMedicineDetails());
};

pharmacistSchema.methods.viewMedicinesByCategory = async function(category) {
  // Import MedicineStock model dynamically to avoid circular dependency
  const MedicineStock = (await import('./MedicineStock.js')).default;
  
  const medicines = await MedicineStock.findByCategory(category);
  return medicines.map(medicine => medicine.getMedicineDetails());
};

pharmacistSchema.methods.viewMedicinesBySupplier = async function(supplierId) {
  // Import MedicineStock model dynamically to avoid circular dependency
  const MedicineStock = (await import('./MedicineStock.js')).default;
  
  const medicines = await MedicineStock.findBySupplier(supplierId);
  return medicines.map(medicine => medicine.getMedicineDetails());
};

pharmacistSchema.methods.getPharmacyStockStatistics = async function() {
  // Import MedicineStock model dynamically to avoid circular dependency
  const MedicineStock = (await import('./MedicineStock.js')).default;
  
  const stats = await MedicineStock.getStockStatistics();
  return stats[0] || {
    totalMedicines: 0,
    totalStockValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    expiredCount: 0,
    activeMedicines: 0
  };
};

// Prescription Management Methods
pharmacistSchema.methods.viewPrescription = async function(prescriptionID) {
  // Import Prescription model dynamically to avoid circular dependency
  const Prescription = (await import('./Prescription.js')).default;
  
  const prescription = await Prescription.findByPrescriptionID(prescriptionID);
  
  if (!prescription) {
    throw new Error('Prescription not found');
  }
  
  if (prescription.pharmacyInfo.pharmacyId !== this.assignedPharmacy.pharmacyId) {
    throw new Error('This prescription is not assigned to your pharmacy');
  }
  
  return prescription.viewPrescription(this.empID, 'pharmacist');
};

pharmacistSchema.methods.viewPrescriptionsSentToPharmacy = async function(filters = {}) {
  // Import Prescription model dynamically to avoid circular dependency
  const Prescription = (await import('./Prescription.js')).default;
  
  let query = { 
    'pharmacyInfo.pharmacyId': this.assignedPharmacy.pharmacyId,
    status: { $in: ['sent_to_pharmacy', 'dispensed'] }
  };
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.urgency) {
    query['prescriptionDetails.urgency'] = filters.urgency;
  }
  
  if (filters.dateFrom || filters.dateTo) {
    query.dateIssued = {};
    if (filters.dateFrom) query.dateIssued.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.dateIssued.$lte = new Date(filters.dateTo);
  }
  
  const prescriptions = await Prescription.find(query).sort({ dateIssued: 1 });
  return prescriptions.map(prescription => prescription.viewPrescription(this.empID, 'pharmacist'));
};

pharmacistSchema.methods.dispensePrescription = async function(prescriptionID, dispensingData = {}) {
  // Import Prescription and Notification models dynamically to avoid circular dependency
  const Prescription = (await import('./Prescription.js')).default;
  const Notification = (await import('./Notification.js')).default;
  const MedicineStock = (await import('./MedicineStock.js')).default;
  
  const prescription = await Prescription.findByPrescriptionID(prescriptionID);
  
  if (!prescription) {
    throw new Error('Prescription not found');
  }
  
  if (prescription.pharmacyInfo.pharmacyId !== this.assignedPharmacy.pharmacyId) {
    throw new Error('This prescription is not assigned to your pharmacy');
  }
  
  if (prescription.status !== 'sent_to_pharmacy') {
    throw new Error('Prescription must be sent to pharmacy before dispensing');
  }
  
  // Check medicine availability and reduce stock
  for (const medicine of prescription.medicineList) {
    const stockMedicine = await MedicineStock.findByMedicineId(medicine.medicineId);
    
    if (!stockMedicine) {
      throw new Error(`Medicine ${medicine.medicineName} not found in stock`);
    }
    
    const availability = stockMedicine.checkAvailability(medicine.quantity);
    if (!availability.isAvailable) {
      throw new Error(`Insufficient stock for ${medicine.medicineName}. Available: ${availability.availableQuantity}, Required: ${medicine.quantity}`);
    }
    
    // Reduce stock
    await stockMedicine.reduceStock(medicine.quantity, this.empID, this.name, {
      prescriptionId: prescriptionID,
      patientId: prescription.patientID,
      reason: 'Prescription dispensing'
    });
  }
  
  // Update prescription status
  await prescription.dispenseMedication(this.empID, this.name, dispensingData);
  
  // Send notification to patient
  const patientNotification = new Notification({
    recipientId: prescription.patientID,
    recipientType: 'patient',
    message: `Your prescription is ready for pickup at the pharmacy`,
    type: 'prescription_ready_for_pickup',
    priority: 'medium',
    dataSent: {
      prescriptionID: prescription.prescriptionID,
      pharmacyId: this.assignedPharmacy.pharmacyId,
      pharmacyName: this.assignedPharmacy.pharmacyName
    },
    metadata: {
      senderId: this.empID,
      senderType: 'pharmacist',
      relatedEntityId: prescription.prescriptionID,
      relatedEntityType: 'prescription',
      category: 'medical'
    }
  });
  
  await patientNotification.save();
  await patientNotification.sendNotification(this.empID, 'pharmacist', ['in_app', 'email', 'sms']);
  
  return {
    prescriptionID: prescription.prescriptionID,
    status: prescription.status,
    dispensedAt: prescription.pharmacyInfo.dispensedDate,
    medicinesDispensed: prescription.medicineList.length
  };
};

pharmacistSchema.methods.updatePrescription = async function(prescriptionID, updateData) {
  // Import Prescription model dynamically to avoid circular dependency
  const Prescription = (await import('./Prescription.js')).default;
  
  const prescription = await Prescription.findByPrescriptionID(prescriptionID);
  
  if (!prescription) {
    throw new Error('Prescription not found');
  }
  
  if (prescription.pharmacyInfo.pharmacyId !== this.assignedPharmacy.pharmacyId) {
    throw new Error('This prescription is not assigned to your pharmacy');
  }
  
  return await prescription.updatePrescription(updateData, this.empID, this.name);
};

pharmacistSchema.methods.validatePrescription = async function(prescriptionID, validationData) {
  // Import Prescription model dynamically to avoid circular dependency
  const Prescription = (await import('./Prescription.js')).default;
  
  const prescription = await Prescription.findByPrescriptionID(prescriptionID);
  
  if (!prescription) {
    throw new Error('Prescription not found');
  }
  
  if (prescription.pharmacyInfo.pharmacyId !== this.assignedPharmacy.pharmacyId) {
    throw new Error('This prescription is not assigned to your pharmacy');
  }
  
  return await prescription.validatePrescription(this.empID, this.name, validationData);
};

pharmacistSchema.methods.addPrescriptionRefill = async function(prescriptionID, refillData = {}) {
  // Import Prescription and Notification models dynamically to avoid circular dependency
  const Prescription = (await import('./Prescription.js')).default;
  const Notification = (await import('./Notification.js')).default;
  
  const prescription = await Prescription.findByPrescriptionID(prescriptionID);
  
  if (!prescription) {
    throw new Error('Prescription not found');
  }
  
  if (prescription.pharmacyInfo.pharmacyId !== this.assignedPharmacy.pharmacyId) {
    throw new Error('This prescription is not assigned to your pharmacy');
  }
  
  const refillEligibility = prescription.checkRefillEligibility();
  if (!refillEligibility.eligible) {
    throw new Error('No refills remaining for this prescription');
  }
  
  // Add refill
  await prescription.addRefill(this.empID, this.name, refillData);
  
  // Send notification to patient
  const patientNotification = new Notification({
    recipientId: prescription.patientID,
    recipientType: 'patient',
    message: `Your prescription refill is ready for pickup`,
    type: 'prescription_ready_for_pickup',
    priority: 'medium',
    dataSent: {
      prescriptionID: prescription.prescriptionID,
      refillNumber: refillEligibility.totalRefillsUsed + 1,
      remainingRefills: refillEligibility.remainingRefills - 1
    },
    metadata: {
      senderId: this.empID,
      senderType: 'pharmacist',
      relatedEntityId: prescription.prescriptionID,
      relatedEntityType: 'prescription',
      category: 'medical'
    }
  });
  
  await patientNotification.save();
  await patientNotification.sendNotification(this.empID, 'pharmacist', ['in_app', 'email']);
  
  return {
    prescriptionID: prescription.prescriptionID,
    refillAdded: true,
    remainingRefills: refillEligibility.remainingRefills - 1
  };
};

pharmacistSchema.methods.viewPrescriptionHistory = async function(prescriptionID) {
  // Import Prescription model dynamically to avoid circular dependency
  const Prescription = (await import('./Prescription.js')).default;
  
  const prescription = await Prescription.findByPrescriptionID(prescriptionID);
  
  if (!prescription) {
    throw new Error('Prescription not found');
  }
  
  if (prescription.pharmacyInfo.pharmacyId !== this.assignedPharmacy.pharmacyId) {
    throw new Error('This prescription is not assigned to your pharmacy');
  }
  
  return prescription.getPrescriptionHistory();
};

pharmacistSchema.methods.getPharmacyPrescriptionStatistics = async function(filters = {}) {
  // Import Prescription model dynamically to avoid circular dependency
  const Prescription = (await import('./Prescription.js')).default;
  
  const stats = await Prescription.getPrescriptionStatistics({
    ...filters,
    'pharmacyInfo.pharmacyId': this.assignedPharmacy.pharmacyId
  });
  
  return stats[0] || {
    totalPrescriptions: 0,
    pendingPrescriptions: 0,
    sentToPharmacy: 0,
    dispensedPrescriptions: 0,
    completedPrescriptions: 0,
    cancelledPrescriptions: 0
  };
};


pharmacistSchema.methods.dispenseMedication = function(prescriptionData) {
  const dispensing = {
    dispensingId: `DISP${Date.now()}`,
    prescriptionId: prescriptionData.prescriptionId,
    patientId: prescriptionData.patientId,
    medication: prescriptionData.medication,
    dosage: prescriptionData.dosage,
    quantity: prescriptionData.quantity,
    dispensedBy: this.empID,
    dispensedByPharmacist: this.name,
    pharmacyId: this.assignedPharmacy.pharmacyId,
    dispensingDate: new Date(),
    instructions: prescriptionData.instructions,
    sideEffects: prescriptionData.sideEffects,
    interactions: prescriptionData.interactions,
    status: 'dispensed'
  };
  
  // Update prescription stats
  this.prescriptionStats.totalDispensed++;
  
  return dispensing;
};

pharmacistSchema.methods.verifyPrescription = function(prescriptionData) {
  const verification = {
    prescriptionId: prescriptionData.prescriptionId,
    verifiedBy: this.empID,
    verifiedByPharmacist: this.name,
    verificationDate: new Date(),
    isSafe: prescriptionData.isSafe,
    interactions: prescriptionData.interactions,
    allergies: prescriptionData.allergies,
    dosageAppropriate: prescriptionData.dosageAppropriate,
    notes: prescriptionData.notes,
    status: prescriptionData.isSafe ? 'approved' : 'rejected'
  };
  
  return verification;
};

pharmacistSchema.methods.provideConsultation = function(consultationData) {
  const consultation = {
    consultationId: `CONS${Date.now()}`,
    patientId: consultationData.patientId,
    providedBy: this.empID,
    providedByPharmacist: this.name,
    pharmacyId: this.assignedPharmacy.pharmacyId,
    consultationDate: new Date(),
    type: consultationData.type, // 'medication_review', 'drug_interaction', 'side_effects'
    topic: consultationData.topic,
    advice: consultationData.advice,
    followUpRequired: consultationData.followUpRequired,
    duration: consultationData.duration
  };
  
  return consultation;
};

pharmacistSchema.methods.manageInventory = function(inventoryAction) {
  const inventoryRecord = {
    inventoryId: `INV${Date.now()}`,
    action: inventoryAction.action, // 'reorder', 'dispose', 'transfer', 'audit'
    managedBy: this.empID,
    managedByPharmacist: this.name,
    pharmacyId: this.assignedPharmacy.pharmacyId,
    date: new Date(),
    items: inventoryAction.items,
    notes: inventoryAction.notes
  };
  
  return inventoryRecord;
};

pharmacistSchema.methods.generateInventoryReport = function(reportFilters = {}) {
  const report = {
    reportId: `RPT${Date.now()}`,
    reportType: 'inventory',
    generatedBy: this.empID,
    generatedByPharmacist: this.name,
    pharmacyId: this.assignedPharmacy.pharmacyId,
    generatedDate: new Date(),
    filters: reportFilters,
    status: 'generated'
  };
  
  return report;
};

pharmacistSchema.methods.addSpecialization = function(specialization) {
  if (!this.specializations.includes(specialization)) {
    this.specializations.push(specialization);
    return this.save();
  }
  return this;
};

pharmacistSchema.methods.addCertification = function(certification) {
  this.certifications.push(certification);
  return this.save();
};

pharmacistSchema.methods.updateConsultationHours = function(day, hours) {
  if (this.consultationHours[day]) {
    this.consultationHours[day] = hours;
  }
  return this.save();
};

pharmacistSchema.methods.updateAccuracyStats = function(isAccurate) {
  if (!isAccurate) {
    this.prescriptionStats.errorCount++;
  }
  
  // Recalculate accuracy rate
  const total = this.prescriptionStats.totalDispensed;
  const errors = this.prescriptionStats.errorCount;
  this.prescriptionStats.accuracyRate = total > 0 ? ((total - errors) / total) * 100 : 100;
  this.prescriptionStats.lastAccuracyReview = new Date();
  
  return this.save();
};

pharmacistSchema.methods.getPharmacistProfile = function() {
  return {
    empID: this.empID,
    name: this.name,
    email: this.email,
    licenseNumber: this.licenseNumber,
    pharmacyLicense: this.pharmacyLicense,
    specializations: this.specializations,
    certifications: this.certifications,
    assignedPharmacy: this.assignedPharmacy,
    inventoryManagement: this.inventoryManagement,
    prescriptionStats: this.prescriptionStats,
    consultationHours: this.consultationHours
  };
};

// Static methods
pharmacistSchema.statics.findByLicenseNumber = function(licenseNumber) {
  return this.findOne({ licenseNumber });
};

pharmacistSchema.statics.findByPharmacy = function(pharmacyId) {
  return this.find({ 'assignedPharmacy.pharmacyId': pharmacyId, status: 'active' });
};

pharmacistSchema.statics.findBySpecialization = function(specialization) {
  return this.find({ specializations: specialization, status: 'active' });
};

pharmacistSchema.statics.findAvailableForConsultation = function(date, time) {
  return this.find({
    status: 'active',
    'consultationHours': { $exists: true }
  });
};

// Pre-save middleware
pharmacistSchema.pre('save', function(next) {
  // Generate license number if not provided
  if (!this.licenseNumber) {
    const timestamp = Date.now().toString();
    this.licenseNumber = `PHARM${timestamp.substring(6)}`;
  }
  next();
});

// Merge employee base schema with pharmacist schema
const mergedPharmacistSchema = new mongoose.Schema({
  ...employeeBaseSchema.obj,
  ...pharmacistSchema.obj
});

// Copy methods from employee base schema
Object.assign(mergedPharmacistSchema.methods, employeeBaseSchema.methods);
Object.assign(mergedPharmacistSchema.statics, employeeBaseSchema.statics);

// Add pharmacist-specific methods
Object.assign(mergedPharmacistSchema.methods, pharmacistSchema.methods);

// Create Pharmacist model using discriminator pattern on User
const Pharmacist = User.discriminator('pharmacist', mergedPharmacistSchema);

export default Pharmacist;
