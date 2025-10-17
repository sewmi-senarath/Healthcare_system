/**
 * DoctorPrescriptionMethods - Prescription-related methods for Doctor model
 * Following Single Responsibility Principle - Only handles prescription operations
 */

export const doctorPrescriptionMethods = {
  /**
   * Create a prescription (simple version)
   * @param {Object} prescriptionData 
   * @returns {Object}
   */
  createPrescription: function(prescriptionData) {
    const prescription = {
      prescriptionId: `PRES${Date.now()}`,
      doctorId: this.empID,
      doctorName: this.name,
      doctorSpecialization: this.specialization,
      patientId: prescriptionData.patientId,
      patientName: prescriptionData.patientName,
      medications: prescriptionData.medications || [],
      instructions: prescriptionData.instructions || '',
      diagnosis: prescriptionData.diagnosis || '',
      prescribedDate: new Date(),
      status: 'pending',
      notes: prescriptionData.notes || ''
    };
    
    return prescription;
  },

  /**
   * Generate a prescription and save to database
   * @param {Object} prescriptionData 
   * @returns {Promise<Object>}
   */
  generatePrescription: async function(prescriptionData) {
    // Import Prescription and Notification models dynamically to avoid circular dependency
    const Prescription = (await import('../Prescription.js')).default;
    const Notification = (await import('../Notification.js')).default;
    
    const prescription = new Prescription({
      prescriptionID: `PRES${Date.now()}${Math.random().toString(36).substring(2, 4).toUpperCase()}`,
      doctorID: this.empID,
      doctorName: this.name,
      doctorSpecialization: this.specialization,
      patientID: prescriptionData.patientId,
      patientName: prescriptionData.patientName,
      medications: prescriptionData.medications || [],
      dosage: prescriptionData.dosage || '',
      instructions: prescriptionData.instructions || '',
      diagnosis: prescriptionData.diagnosis || '',
      prescribedDate: new Date(),
      status: 'pending',
      notes: prescriptionData.notes || '',
      createdBy: this.empID,
      createdAt: new Date()
    });
    
    await prescription.save();
    
    // Send notification to patient
    const notification = new Notification({
      notificationId: `NOTIF${Date.now()}${Math.random().toString(36).substring(2, 4)}`,
      recipientId: prescriptionData.patientId,
      recipientType: 'patient',
      title: 'New Prescription',
      message: `Dr. ${this.name} has prescribed new medication for you.`,
      type: 'prescription',
      status: 'unread',
      priority: 'high',
      data: {
        prescriptionId: prescription.prescriptionID,
        doctorName: this.name,
        prescribedDate: prescription.prescribedDate,
        medications: prescription.medications
      },
      createdAt: new Date()
    });
    
    await notification.save();
    
    return {
      success: true,
      message: 'Prescription generated successfully',
      prescription: prescription
    };
  },

  /**
   * Send prescription to pharmacy
   * @param {string} prescriptionID 
   * @param {string} pharmacyId 
   * @param {string} pharmacistId 
   * @returns {Promise<Object>}
   */
  sendPrescriptionToPharmacy: async function(prescriptionID, pharmacyId, pharmacistId) {
    // Import Prescription and Notification models dynamically to avoid circular dependency
    const Prescription = (await import('../Prescription.js')).default;
    const Notification = (await import('../Notification.js')).default;
    
    const prescription = await Prescription.findByPrescriptionID(prescriptionID);
    
    if (!prescription) {
      return {
        success: false,
        message: 'Prescription not found'
      };
    }
    
    if (prescription.doctorID !== this.empID) {
      return {
        success: false,
        message: 'Unauthorized to send this prescription'
      };
    }
    
    prescription.pharmacyID = pharmacyId;
    prescription.pharmacistID = pharmacistId;
    prescription.status = 'sent_to_pharmacy';
    prescription.sentToPharmacyAt = new Date();
    prescription.lastUpdatedBy = this.empID;
    prescription.lastUpdatedAt = new Date();
    
    await prescription.save();
    
    // Send notification to pharmacist
    const notification = new Notification({
      notificationId: `NOTIF${Date.now()}${Math.random().toString(36).substring(2, 4)}`,
      recipientId: pharmacistId,
      recipientType: 'pharmacist',
      title: 'New Prescription',
      message: `Dr. ${this.name} has sent a new prescription for ${prescription.patientName}.`,
      type: 'prescription',
      status: 'unread',
      priority: 'high',
      data: {
        prescriptionId: prescription.prescriptionID,
        doctorName: this.name,
        patientName: prescription.patientName,
        medications: prescription.medications,
        pharmacyId: pharmacyId
      },
      createdAt: new Date()
    });
    
    await notification.save();
    
    return {
      success: true,
      message: 'Prescription sent to pharmacy successfully',
      prescription: prescription
    };
  },

  /**
   * View a prescription
   * @param {string} prescriptionID 
   * @returns {Promise<Object>}
   */
  viewPrescription: async function(prescriptionID) {
    // Import Prescription model dynamically to avoid circular dependency
    const Prescription = (await import('../Prescription.js')).default;
    
    const prescription = await Prescription.findByPrescriptionID(prescriptionID);
    
    if (!prescription) {
      return {
        success: false,
        message: 'Prescription not found'
      };
    }
    
    if (prescription.doctorID !== this.empID) {
      return {
        success: false,
        message: 'Unauthorized to view this prescription'
      };
    }
    
    return {
      success: true,
      prescription: prescription
    };
  },

  /**
   * Update a prescription
   * @param {string} prescriptionID 
   * @param {Object} updateData 
   * @returns {Promise<Object>}
   */
  updatePrescription: async function(prescriptionID, updateData) {
    // Import Prescription model dynamically to avoid circular dependency
    const Prescription = (await import('../Prescription.js')).default;
    
    const prescription = await Prescription.findByPrescriptionID(prescriptionID);
    
    if (!prescription) {
      return {
        success: false,
        message: 'Prescription not found'
      };
    }
    
    if (prescription.doctorID !== this.empID) {
      return {
        success: false,
        message: 'Unauthorized to update this prescription'
      };
    }
    
    if (prescription.status === 'dispensed') {
      return {
        success: false,
        message: 'Cannot update dispensed prescription'
      };
    }
    
    // Update allowed fields
    const allowedFields = ['medications', 'dosage', 'instructions', 'diagnosis', 'notes'];
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        prescription[field] = updateData[field];
      }
    });
    
    prescription.lastUpdatedBy = this.empID;
    prescription.lastUpdatedAt = new Date();
    
    await prescription.save();
    
    return {
      success: true,
      message: 'Prescription updated successfully',
      prescription: prescription
    };
  },

  /**
   * View patient prescriptions
   * @param {string} patientID 
   * @returns {Promise<Object>}
   */
  viewPatientPrescriptions: async function(patientID) {
    // Import Prescription model dynamically to avoid circular dependency
    const Prescription = (await import('../Prescription.js')).default;
    
    const prescriptions = await Prescription.find({ 
      patientID: patientID, 
      doctorID: this.empID 
    }).sort({ prescribedDate: -1 });
    
    return {
      success: true,
      prescriptions: prescriptions,
      count: prescriptions.length
    };
  },

  /**
   * View doctor's prescriptions
   * @param {Object} filters 
   * @returns {Promise<Object>}
   */
  viewDoctorPrescriptions: async function(filters = {}) {
    // Import Prescription model dynamically to avoid circular dependency
    const Prescription = (await import('../Prescription.js')).default;
    
    let query = { doctorID: this.empID };
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    if (filters.patientID) {
      query.patientID = filters.patientID;
    }
    
    if (filters.startDate && filters.endDate) {
      query.prescribedDate = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    }
    
    const prescriptions = await Prescription.find(query)
      .sort({ prescribedDate: -1 })
      .limit(filters.limit || 50);
    
    return {
      success: true,
      prescriptions: prescriptions,
      count: prescriptions.length
    };
  },

  /**
   * Cancel a prescription
   * @param {string} prescriptionID 
   * @param {string} reason 
   * @returns {Promise<Object>}
   */
  cancelPrescription: async function(prescriptionID, reason = '') {
    // Import Prescription and Notification models dynamically to avoid circular dependency
    const Prescription = (await import('../Prescription.js')).default;
    const Notification = (await import('../Notification.js')).default;
    
    const prescription = await Prescription.findByPrescriptionID(prescriptionID);
    
    if (!prescription) {
      return {
        success: false,
        message: 'Prescription not found'
      };
    }
    
    if (prescription.doctorID !== this.empID) {
      return {
        success: false,
        message: 'Unauthorized to cancel this prescription'
      };
    }
    
    if (prescription.status === 'dispensed') {
      return {
        success: false,
        message: 'Cannot cancel dispensed prescription'
      };
    }
    
    prescription.status = 'cancelled';
    prescription.cancellationReason = reason;
    prescription.cancelledBy = this.empID;
    prescription.cancelledAt = new Date();
    prescription.lastUpdatedBy = this.empID;
    prescription.lastUpdatedAt = new Date();
    
    await prescription.save();
    
    // Send notification to patient
    const notification = new Notification({
      notificationId: `NOTIF${Date.now()}${Math.random().toString(36).substring(2, 4)}`,
      recipientId: prescription.patientID,
      recipientType: 'patient',
      title: 'Prescription Cancelled',
      message: `Dr. ${this.name} has cancelled your prescription.`,
      type: 'prescription_update',
      status: 'unread',
      priority: 'medium',
      data: {
        prescriptionId: prescription.prescriptionID,
        doctorName: this.name,
        reason: reason,
        status: 'cancelled'
      },
      createdAt: new Date()
    });
    
    await notification.save();
    
    return {
      success: true,
      message: 'Prescription cancelled successfully',
      prescription: prescription
    };
  },

  /**
   * Get prescription statistics
   * @param {Object} filters 
   * @returns {Promise<Object>}
   */
  getPrescriptionStatistics: async function(filters = {}) {
    // Import Prescription model dynamically to avoid circular dependency
    const Prescription = (await import('../Prescription.js')).default;
    
    const stats = await Prescription.getPrescriptionStatistics({
      ...filters,
      doctorId: this.empID
    });
    
    return {
      success: true,
      statistics: stats
    };
  }
};
