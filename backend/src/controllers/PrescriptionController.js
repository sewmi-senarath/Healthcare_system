// import Prescription from '../models/Prescription.js';
// import Patient from '../models/Patient.js';
// import Doctor from '../models/Doctor.js';

// /**
//  * Prescription Controller - Following Single Responsibility Principle
//  * Handles all prescription-related operations
//  */
// class PrescriptionController {
//   /**
//    * Create a new prescription
//    */
//   static async createPrescription(prescriptionData, doctorId) {
//     try {
//       console.log('Creating prescription:', prescriptionData);
      
//       // Validate required fields
//       if (!prescriptionData.patientID || !prescriptionData.medicineList || prescriptionData.medicineList.length === 0) {
//         return {
//           success: false,
//           message: 'Patient ID and medicine list are required'
//         };
//       }

//       // Check if patient exists
//       const patient = await Patient.findOne({ patientId: prescriptionData.patientID });
//       if (!patient) {
//         return {
//           success: false,
//           message: 'Patient not found'
//         };
//       }

//       // Check if doctor exists
//       const doctor = await Doctor.findOne({ empID: doctorId });
//       if (!doctor) {
//         return {
//           success: false,
//           message: 'Doctor not found'
//         };
//       }

//       // Create prescription
//       const prescription = new Prescription({
//         prescriptionID: `PRES${Date.now()}${Math.random().toString(36).substring(2, 6)}`.toUpperCase(),
//         patientID: prescriptionData.patientID,
//         doctorId: doctorId,
//         medicineList: prescriptionData.medicineList.map(medicine => ({
//           medicineId: medicine.medicineId || `MED${Date.now()}${Math.random().toString(36).substring(2, 4)}`.toUpperCase(),
//           medicineName: medicine.medicineName,
//           strength: medicine.strength || '',
//           dosageForm: medicine.dosageForm || '',
//           quantity: medicine.quantity,
//           dosageInstruction: medicine.dosageInstruction,
//           frequency: medicine.frequency,
//           duration: medicine.duration,
//           specialInstructions: medicine.specialInstructions || '',
//           refillsAllowed: medicine.refillsAllowed || 0
//         })),
//         dosageInstruction: prescriptionData.dosageInstruction || 'As directed by doctor',
//         prescriptionDetails: {
//           diagnosis: prescriptionData.diagnosis || '',
//           symptoms: prescriptionData.symptoms || [],
//           notes: prescriptionData.notes || '',
//           followUpRequired: prescriptionData.followUpRequired || false,
//           followUpDate: prescriptionData.followUpDate || null,
//           urgency: prescriptionData.urgency || 'routine'
//         },
//         status: 'pending',
//         expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
//       });

//       await prescription.save();

//       return {
//         success: true,
//         message: 'Prescription created successfully',
//         prescription: {
//           prescriptionID: prescription.prescriptionID,
//           patientID: prescription.patientID,
//           doctorId: prescription.doctorId,
//           dateIssued: prescription.dateIssued,
//           medicineList: prescription.medicineList,
//           dosageInstruction: prescription.dosageInstruction,
//           status: prescription.status,
//           prescriptionDetails: prescription.prescriptionDetails,
//           expiryDate: prescription.expiryDate
//         }
//       };
//     } catch (error) {
//       console.error('Create prescription error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get prescriptions for a doctor
//    */
//   static async getDoctorPrescriptions(doctorId) {
//     try {
//       console.log(`Getting prescriptions for doctor: ${doctorId}`);
      
//       const prescriptions = await Prescription.find({ doctorId: doctorId })
//         .sort({ dateIssued: -1 });

//       return {
//         success: true,
//         prescriptions: prescriptions.map(prescription => ({
//           prescriptionID: prescription.prescriptionID,
//           patientID: prescription.patientID,
//           dateIssued: prescription.dateIssued,
//           medicineList: prescription.medicineList,
//           dosageInstruction: prescription.dosageInstruction,
//           status: prescription.status,
//           prescriptionDetails: prescription.prescriptionDetails,
//           expiryDate: prescription.expiryDate,
//           lastUpdated: prescription.lastUpdated
//         }))
//       };
//     } catch (error) {
//       console.error('Get doctor prescriptions error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get all prescriptions for pharmacist
//    */
//   static async getPharmacistPrescriptions() {
//     try {
//       console.log('Getting all prescriptions for pharmacist');
      
//       const prescriptions = await Prescription.find({
//         status: { $in: ['pending', 'sent_to_pharmacy'] }
//       }).sort({ dateIssued: -1 });

//       return {
//         success: true,
//         prescriptions: prescriptions.map(prescription => ({
//           prescriptionID: prescription.prescriptionID,
//           patientID: prescription.patientID,
//           doctorId: prescription.doctorId,
//           dateIssued: prescription.dateIssued,
//           medicineList: prescription.medicineList,
//           dosageInstruction: prescription.dosageInstruction,
//           status: prescription.status,
//           prescriptionDetails: prescription.prescriptionDetails,
//           pharmacyInfo: prescription.pharmacyInfo,
//           expiryDate: prescription.expiryDate,
//           lastUpdated: prescription.lastUpdated
//         }))
//       };
//     } catch (error) {
//       console.error('Get pharmacist prescriptions error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get prescription by ID
//    */
//   static async getPrescriptionById(prescriptionId) {
//     try {
//       console.log(`Getting prescription: ${prescriptionId}`);
      
//       const prescription = await Prescription.findOne({ prescriptionID: prescriptionId });
      
//       if (!prescription) {
//         return {
//           success: false,
//           message: 'Prescription not found'
//         };
//       }

//       return {
//         success: true,
//         prescription: {
//           prescriptionID: prescription.prescriptionID,
//           patientID: prescription.patientID,
//           doctorId: prescription.doctorId,
//           dateIssued: prescription.dateIssued,
//           medicineList: prescription.medicineList,
//           dosageInstruction: prescription.dosageInstruction,
//           status: prescription.status,
//           prescriptionDetails: prescription.prescriptionDetails,
//           pharmacyInfo: prescription.pharmacyInfo,
//           validation: prescription.validation,
//           pricing: prescription.pricing,
//           expiryDate: prescription.expiryDate,
//           lastUpdated: prescription.lastUpdated,
//           history: prescription.history
//         }
//       };
//     } catch (error) {
//       console.error('Get prescription by ID error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Update prescription status (for pharmacist)
//    */
//   static async updatePrescriptionStatus(prescriptionId, status, pharmacistId, pharmacistName) {
//     try {
//       console.log(`Updating prescription ${prescriptionId} status to ${status}`);
      
//       const prescription = await Prescription.findOne({ prescriptionID: prescriptionId });
      
//       if (!prescription) {
//         return {
//           success: false,
//           message: 'Prescription not found'
//         };
//       }

//       // Update status based on action
//       switch (status) {
//         case 'sent_to_pharmacy':
//           await prescription.sendToPharmacy('PHARM001', pharmacistId, pharmacistId, pharmacistName);
//           break;
//         case 'dispensed':
//           await prescription.dispenseMedication(pharmacistId, pharmacistName, {});
//           break;
//         case 'completed':
//           await prescription.completePrescription(pharmacistId, pharmacistName);
//           break;
//         case 'cancelled':
//           await prescription.cancelPrescription(pharmacistId, pharmacistName, 'Cancelled by pharmacist');
//           break;
//         default:
//           return {
//             success: false,
//             message: 'Invalid status'
//           };
//       }

//       return {
//         success: true,
//         message: `Prescription ${status} successfully`,
//         prescription: {
//           prescriptionID: prescription.prescriptionID,
//           status: prescription.status,
//           lastUpdated: prescription.lastUpdated
//         }
//       };
//     } catch (error) {
//       console.error('Update prescription status error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get prescription statistics
//    */
//   static async getPrescriptionStats() {
//     try {
//       const stats = await Prescription.getPrescriptionStatistics();
      
//       return {
//         success: true,
//         stats: stats[0] || {
//           totalPrescriptions: 0,
//           pendingPrescriptions: 0,
//           sentToPharmacy: 0,
//           dispensedPrescriptions: 0,
//           completedPrescriptions: 0,
//           cancelledPrescriptions: 0,
//           expiredPrescriptions: 0,
//           averageMedicinesPerPrescription: 0
//         }
//       };
//     } catch (error) {
//       console.error('Get prescription stats error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Search prescriptions by patient ID
//    */
//   static async searchPrescriptionsByPatient(patientId) {
//     try {
//       console.log(`Searching prescriptions for patient: ${patientId}`);
      
//       const prescriptions = await Prescription.find({ patientID: patientId })
//         .sort({ dateIssued: -1 });

//       return {
//         success: true,
//         prescriptions: prescriptions.map(prescription => ({
//           prescriptionID: prescription.prescriptionID,
//           dateIssued: prescription.dateIssued,
//           medicineList: prescription.medicineList,
//           dosageInstruction: prescription.dosageInstruction,
//           status: prescription.status,
//           prescriptionDetails: prescription.prescriptionDetails,
//           expiryDate: prescription.expiryDate
//         }))
//       };
//     } catch (error) {
//       console.error('Search prescriptions by patient error:', error);
//       throw error;
//     }
//   }
// }

// export default PrescriptionController;

export class PrescriptionController {
  constructor(prescriptionService) {
    this.prescriptionService = prescriptionService;
  }

  async createPrescription(req, res) {
    try {
      const doctorId = req.user.empID;
      const result = await this.prescriptionService.createPrescription(req.body, doctorId);
      res.status(201).json(result);
    } catch (error) {
      console.error('Create prescription error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getDoctorPrescriptions(req, res) {
    try {
      const doctorId = req.user.empID;
      const prescriptions = await this.prescriptionService.getDoctorPrescriptions(doctorId);
      res.json({ success: true, prescriptions });
    } catch (error) {
      console.error('Get doctor prescriptions error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async getPharmacistPrescriptions(req, res) {
    try {
      const prescriptions = await this.prescriptionService.getPharmacistPrescriptions();
      res.json({ success: true, prescriptions });
    } catch (error) {
      console.error('Get pharmacist prescriptions error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async getPrescriptionById(req, res) {
    try {
      const { prescriptionId } = req.params;
      const result = await this.prescriptionService.getPrescriptionById(prescriptionId);
      res.json(result);
    } catch (error) {
      console.error('Get prescription error:', error);
      res.status(404).json({ success: false, message: 'Prescription not found' });
    }
  }

  async updatePrescriptionStatus(req, res) {
    try {
      const { prescriptionId } = req.params;
      const { status } = req.body;
      const pharmacistId = req.user.empID;
      const pharmacistName = req.user.name;
      
      const result = await this.prescriptionService.updatePrescriptionStatus(prescriptionId, status, pharmacistId, pharmacistName);
      res.json(result);
    } catch (error) {
      console.error('Update prescription status error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getPrescriptionStats(req, res) {
    try {
      const stats = await this.prescriptionService.getPrescriptionStats();
      res.json({ success: true, stats });
    } catch (error) {
      console.error('Get prescription stats error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async searchPrescriptionsByPatient(req, res) {
    try {
      const { patientId } = req.params;
      const prescriptions = await this.prescriptionService.searchPrescriptionsByPatient(patientId);
      res.json({ success: true, prescriptions });
    } catch (error) {
      console.error('Search prescriptions error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

export default PrescriptionController;