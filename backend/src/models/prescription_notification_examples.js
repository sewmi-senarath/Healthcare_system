/**
 * Prescription and Notification Usage Examples
 * Demonstrates the complete prescription workflow with notifications
 */

import { Prescription, Notification, Doctor, Pharmacist, Patient } from './index.js';

// Example: Complete prescription workflow
export async function completePrescriptionWorkflowExample() {
  try {
    console.log('=== Complete Prescription Workflow ===\n');

    // Step 1: Create or find doctor, patient, and pharmacist
    let doctor = await Doctor.findOne({ email: 'sarah.johnson@hospital.com' });
    if (!doctor) {
      doctor = new Doctor({
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@hospital.com',
        password: 'doctorPassword123',
        empID: 'DOC001',
        specialization: 'cardiology',
        assignedHospitalID: 'HOSP001'
      });
      await doctor.save();
    }

    let patient = await Patient.findOne({ email: 'john.doe@email.com' });
    if (!patient) {
      patient = new Patient({
        name: 'John Doe',
        email: 'john.doe@email.com',
        password: 'patientPassword123',
        patientId: 'PAT001',
        dateOfBirth: new Date('1990-05-15'),
        gender: 'male'
      });
      await patient.save();
    }

    let pharmacist = await Pharmacist.findOne({ email: 'robert.wilson@hospital.com' });
    if (!pharmacist) {
      pharmacist = new Pharmacist({
        name: 'Robert Wilson',
        email: 'robert.wilson@hospital.com',
        password: 'pharmacistPassword123',
        empID: 'PHARM001',
        assignedPharmacy: {
          pharmacyId: 'PHARM001',
          pharmacyName: 'Hospital Pharmacy'
        }
      });
      await pharmacist.save();
    }

    console.log('✅ Users created/found successfully');

    // Step 2: Doctor generates prescription
    console.log('\n1️⃣ Doctor generating prescription...');
    const prescriptionData = {
      patientID: patient.patientId,
      medicineList: [
        {
          medicineId: 'MED001',
          medicineName: 'Lisinopril',
          strength: '10mg',
          dosageForm: 'tablet',
          quantity: 30,
          dosageInstruction: 'Take once daily',
          frequency: 'once daily',
          duration: '30 days',
          refillsAllowed: 2
        },
        {
          medicineId: 'MED002',
          medicineName: 'Metformin',
          strength: '500mg',
          dosageForm: 'tablet',
          quantity: 60,
          dosageInstruction: 'Take twice daily with meals',
          frequency: 'twice daily',
          duration: '30 days',
          refillsAllowed: 3
        }
      ],
      dosageInstruction: 'Take Lisinopril in the morning and Metformin with meals',
      prescriptionDetails: {
        diagnosis: 'Hypertension and Type 2 Diabetes',
        symptoms: ['high blood pressure', 'elevated glucose levels'],
        urgency: 'routine',
        followUpRequired: true,
        followUpDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
      validation: {
        isValid: true,
        drugInteractions: [],
        allergies: []
      },
      pricing: {
        totalCost: 45.50,
        insuranceCoverage: 35.50,
        patientCopay: 10.00
      }
    };

    const prescription = await doctor.generatePrescription(prescriptionData);
    console.log('✅ Prescription generated:', prescription.prescriptionID);

    // Step 3: Doctor sends prescription to pharmacy
    console.log('\n2️⃣ Doctor sending prescription to pharmacy...');
    const sendResult = await doctor.sendPrescriptionToPharmacy(
      prescription.prescriptionID,
      pharmacist.assignedPharmacy.pharmacyId,
      pharmacist.empID
    );
    console.log('✅ Prescription sent to pharmacy');
    console.log('📧 Notifications sent to:', sendResult.notificationsSent);

    // Step 4: Pharmacist views prescription
    console.log('\n3️⃣ Pharmacist viewing prescription...');
    const prescriptionView = await pharmacist.viewPrescription(prescription.prescriptionID);
    console.log('✅ Prescription viewed by pharmacist');
    console.log('💊 Medicines to dispense:', prescriptionView.medicineList.length);

    // Step 5: Pharmacist dispenses prescription
    console.log('\n4️⃣ Pharmacist dispensing prescription...');
    const dispensingResult = await pharmacist.dispensePrescription(
      prescription.prescriptionID,
      {
        dispensingNotes: 'Patient counseled on medication usage',
        sideEffects: 'May cause dizziness, monitor blood pressure'
      }
    );
    console.log('✅ Prescription dispensed');
    console.log('💊 Medicines dispensed:', dispensingResult.medicinesDispensed);

    // Step 6: View prescription history
    console.log('\n5️⃣ Viewing prescription history...');
    const history = await pharmacist.viewPrescriptionHistory(prescription.prescriptionID);
    console.log('📜 Prescription history entries:', history.length);
    history.slice(0, 3).forEach((entry, index) => {
      console.log(`   ${index + 1}. ${entry.action} by ${entry.performedByName} (${entry.timestamp.toDateString()})`);
    });

    // Step 7: Get statistics
    console.log('\n6️⃣ Getting prescription statistics...');
    const doctorStats = await doctor.getPrescriptionStatistics();
    const pharmacistStats = await pharmacist.getPharmacyPrescriptionStatistics();
    
    console.log('📊 Doctor Statistics:');
    console.log('   Total Prescriptions:', doctorStats.totalPrescriptions);
    console.log('   Dispensed:', doctorStats.dispensedPrescriptions);
    
    console.log('\n📊 Pharmacist Statistics:');
    console.log('   Total Prescriptions:', pharmacistStats.totalPrescriptions);
    console.log('   Dispensed:', pharmacistStats.dispensedPrescriptions);

    console.log('\n🎉 Complete prescription workflow finished successfully!');

    return { doctor, patient, pharmacist, prescription };
  } catch (error) {
    console.error('❌ Error in prescription workflow:', error);
    throw error;
  }
}

// Example: Notification system usage
export async function notificationSystemExample() {
  try {
    console.log('\n=== Notification System Example ===\n');

    // Create various notifications
    const notifications = [
      {
        recipientId: 'PAT001',
        recipientType: 'patient',
        message: 'Your appointment is scheduled for tomorrow at 2:00 PM',
        type: 'appointment_reminder',
        priority: 'medium',
        dataSent: {
          appointmentId: 'APT001',
          doctorName: 'Dr. Sarah Johnson',
          appointmentTime: '2024-01-15T14:00:00Z'
        },
        metadata: {
          category: 'medical',
          relatedEntityType: 'appointment'
        }
      },
      {
        recipientId: 'PHARM001',
        recipientType: 'pharmacist',
        message: 'Low stock alert: Paracetamol is below minimum level',
        type: 'low_stock_alert',
        priority: 'high',
        dataSent: {
          medicineId: 'MED001',
          medicineName: 'Paracetamol',
          currentStock: 5,
          minimumLevel: 10
        },
        metadata: {
          category: 'administrative',
          relatedEntityType: 'medicine_stock'
        }
      },
      {
        recipientId: 'DOC001',
        recipientType: 'doctor',
        message: 'New support ticket from patient requires your attention',
        type: 'support_ticket_created',
        priority: 'medium',
        dataSent: {
          ticketId: 'TICKET001',
          patientName: 'John Doe',
          issue: 'Cannot access medical records'
        },
        metadata: {
          category: 'administrative',
          relatedEntityType: 'support_ticket'
        }
      }
    ];

    console.log('1. Creating notifications...');
    const createdNotifications = [];
    
    for (const notifData of notifications) {
      const notification = new Notification(notifData);
      await notification.save();
      await notification.sendNotification('SYSTEM', 'system', ['in_app', 'email']);
      createdNotifications.push(notification);
      console.log(`✅ Created notification: ${notification.notificationId}`);
    }

    // View notification history
    console.log('\n2. Viewing notification history...');
    for (const notification of createdNotifications) {
      const history = notification.viewNotificationHistory('SYSTEM', 'system');
      console.log(`📋 Notification ${notification.notificationId}:`);
      console.log(`   Status: ${history.status}`);
      console.log(`   History entries: ${history.history.length}`);
    }

    // Update notification
    console.log('\n3. Updating notification...');
    const firstNotification = createdNotifications[0];
    await firstNotification.updateNotification({
      priority: 'high',
      message: 'URGENT: Your appointment is scheduled for tomorrow at 2:00 PM'
    }, 'SYSTEM', 'system');
    console.log('✅ Notification updated');

    // Mark as read
    console.log('\n4. Marking notification as read...');
    await firstNotification.markAsRead('PAT001', 'patient');
    console.log('✅ Notification marked as read');

    // Get notification statistics
    console.log('\n5. Getting notification statistics...');
    const stats = await Notification.getNotificationStatistics();
    console.log('📊 Notification Statistics:');
    console.log('   Total Notifications:', stats[0]?.totalNotifications || 0);
    console.log('   Read Notifications:', stats[0]?.readNotifications || 0);
    console.log('   Pending Notifications:', stats[0]?.pendingNotifications || 0);

    console.log('\n🎉 Notification system example completed!');

    return createdNotifications;
  } catch (error) {
    console.error('❌ Error in notification system:', error);
    throw error;
  }
}

// Example: Prescription refill workflow
export async function prescriptionRefillExample() {
  try {
    console.log('\n=== Prescription Refill Workflow ===\n');

    // Find existing prescription (assuming from previous example)
    const prescription = await Prescription.findOne({ status: 'dispensed' });
    if (!prescription) {
      console.log('ℹ️ No dispensed prescription found. Running complete workflow first...');
      await completePrescriptionWorkflowExample();
      return;
    }

    const pharmacist = await Pharmacist.findOne({ 
      'assignedPharmacy.pharmacyId': prescription.pharmacyInfo.pharmacyId 
    });

    if (!pharmacist) {
      throw new Error('Pharmacist not found');
    }

    console.log('1. Checking refill eligibility...');
    const refillEligibility = prescription.checkRefillEligibility();
    console.log('📋 Refill Eligibility:');
    console.log('   Eligible:', refillEligibility.eligible);
    console.log('   Remaining Refills:', refillEligibility.remainingRefills);
    console.log('   Total Refills Allowed:', refillEligibility.totalRefillsAllowed);

    if (refillEligibility.eligible) {
      console.log('\n2. Processing refill...');
      const refillResult = await pharmacist.addPrescriptionRefill(
        prescription.prescriptionID,
        {
          refillNotes: 'Patient requested refill',
          dispensingNotes: 'Same instructions as original prescription'
        }
      );
      console.log('✅ Refill processed successfully');
      console.log('🔄 Remaining refills:', refillResult.remainingRefills);
    } else {
      console.log('❌ No refills remaining for this prescription');
    }

    console.log('\n🎉 Prescription refill workflow completed!');

    return { prescription, refillEligibility };
  } catch (error) {
    console.error('❌ Error in prescription refill:', error);
    throw error;
  }
}

// Example: Prescription validation workflow
export async function prescriptionValidationExample() {
  try {
    console.log('\n=== Prescription Validation Workflow ===\n');

    // Find a pending prescription
    const prescription = await Prescription.findOne({ status: 'sent_to_pharmacy' });
    if (!prescription) {
      console.log('ℹ️ No prescription sent to pharmacy found.');
      return;
    }

    const pharmacist = await Pharmacist.findOne({ 
      'assignedPharmacy.pharmacyId': prescription.pharmacyInfo.pharmacyId 
    });

    if (!pharmacist) {
      throw new Error('Pharmacist not found');
    }

    console.log('1. Validating prescription...');
    const validationData = {
      isValid: true,
      errors: [],
      drugInteractions: [
        {
          medicine1: 'Lisinopril',
          medicine2: 'Potassium supplements',
          severity: 'moderate',
          description: 'May increase risk of hyperkalemia'
        }
      ],
      allergies: [
        {
          allergen: 'ACE inhibitors',
          severity: 'mild',
          notes: 'Patient reported mild rash with previous ACE inhibitor use'
        }
      ]
    };

    await pharmacist.validatePrescription(prescription.prescriptionID, validationData);
    console.log('✅ Prescription validated');
    console.log('⚠️ Drug interactions found:', validationData.drugInteractions.length);
    console.log('⚠️ Allergies identified:', validationData.allergies.length);

    // View updated prescription
    console.log('\n2. Viewing validated prescription...');
    const validatedPrescription = await pharmacist.viewPrescription(prescription.prescriptionID);
    console.log('✅ Validated prescription viewed');
    console.log('✅ Validation status:', validatedPrescription.validation.isValid);

    console.log('\n🎉 Prescription validation workflow completed!');

    return { prescription, validationData };
  } catch (error) {
    console.error('❌ Error in prescription validation:', error);
    throw error;
  }
}

// Example: Notification filtering and search
export async function notificationFilteringExample() {
  try {
    console.log('\n=== Notification Filtering and Search ===\n');

    // Find notifications by different criteria
    console.log('1. Finding notifications by recipient...');
    const patientNotifications = await Notification.findByRecipient('PAT001', 'patient');
    console.log('📧 Patient notifications:', patientNotifications.length);

    console.log('\n2. Finding notifications by type...');
    const prescriptionNotifications = await Notification.findByType('prescription_created');
    console.log('💊 Prescription notifications:', prescriptionNotifications.length);

    console.log('\n3. Finding notifications by status...');
    const unreadNotifications = await Notification.findUnreadNotifications('PAT001');
    console.log('📬 Unread notifications:', unreadNotifications.length);

    console.log('\n4. Finding notifications by priority...');
    const urgentNotifications = await Notification.findByPriority('urgent');
    console.log('🚨 Urgent notifications:', urgentNotifications.length);

    console.log('\n5. Finding failed notifications...');
    const failedNotifications = await Notification.findFailedNotifications();
    console.log('❌ Failed notifications:', failedNotifications.length);

    console.log('\n6. Finding expired notifications...');
    const expiredNotifications = await Notification.findExpiredNotifications();
    console.log('⏰ Expired notifications:', expiredNotifications.length);

    console.log('\n🎉 Notification filtering example completed!');

    return {
      patientNotifications,
      prescriptionNotifications,
      unreadNotifications,
      urgentNotifications,
      failedNotifications,
      expiredNotifications
    };
  } catch (error) {
    console.error('❌ Error in notification filtering:', error);
    throw error;
  }
}

// Run all examples
export async function runAllPrescriptionNotificationExamples() {
  try {
    console.log('🚀 Starting Prescription and Notification Examples...\n');
    
    await completePrescriptionWorkflowExample();
    await notificationSystemExample();
    await prescriptionRefillExample();
    await prescriptionValidationExample();
    await notificationFilteringExample();
    
    console.log('\n🎉 All Prescription and Notification examples completed successfully!');
  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
}

// Export all example functions
export default {
  completePrescriptionWorkflowExample,
  notificationSystemExample,
  prescriptionRefillExample,
  prescriptionValidationExample,
  notificationFilteringExample,
  runAllPrescriptionNotificationExamples
};
