/**
 * Appointment System Usage Examples
 * Demonstrates the complete appointment workflow with approval system
 */

import { Appointment, Patient, Doctor, HealthCareManager, Notification } from './index.js';

// Example: Complete appointment workflow
export async function completeAppointmentWorkflowExample() {
  try {
    console.log('=== Complete Appointment Workflow ===\n');

    // Step 1: Create or find users
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

    let manager = await HealthCareManager.findOne({ email: 'mike.wilson@hospital.com' });
    if (!manager) {
      manager = new HealthCareManager({
        name: 'Mike Wilson',
        email: 'mike.wilson@hospital.com',
        password: 'managerPassword123',
        empID: 'MGR001',
        assignedHospital: {
          hospitalId: 'HOSP001',
          hospitalName: 'General Hospital'
        }
      });
      await manager.save();
    }

    console.log('✅ Users created/found successfully');

    // Step 2: Patient schedules appointment
    console.log('\n1️⃣ Patient scheduling appointment...');
    const appointmentData = {
      doctorID: doctor.empID,
      dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      reasonForVisit: 'Regular checkup and blood pressure monitoring',
      appointmentDetails: {
        duration: 30,
        appointmentType: 'routine_checkup',
        priority: 'routine',
        location: {
          hospitalId: 'HOSP001',
          department: 'Cardiology',
          roomNumber: 'C101'
        },
        specialRequirements: ['wheelchair_access'],
        insuranceInfo: {
          provider: 'HealthPlus Insurance',
          policyNumber: 'HP123456789',
          coverageVerified: true
        }
      }
    };

    const scheduledAppointment = await patient.scheduleAppointment(appointmentData);
    console.log('✅ Appointment scheduled:', scheduledAppointment.appointmentID);
    console.log('📅 Status:', scheduledAppointment.status);

    // Step 3: HealthCareManager views pending appointments
    console.log('\n2️⃣ Manager viewing pending appointments...');
    const pendingAppointments = await manager.viewPendingAppointments();
    console.log('📋 Pending appointments:', pendingAppointments.length);

    if (pendingAppointments.length > 0) {
      const appointmentID = pendingAppointments[0].appointmentID;
      
      // Step 4: Manager approves appointment
      console.log('\n3️⃣ Manager approving appointment...');
      const approvalResult = await manager.approveAppointment(
        appointmentID,
        'Routine checkup approved - patient has valid insurance coverage'
      );
      console.log('✅ Appointment approved');
      console.log('📧 Notifications sent to:', approvalResult.notificationsSent);

      // Step 5: Patient confirms appointment
      console.log('\n4️⃣ Patient confirming appointment...');
      const confirmationResult = await patient.confirmAppointment(appointmentID);
      console.log('✅ Appointment confirmed');
      console.log('📊 Status:', confirmationResult.status);

      // Step 6: Doctor views appointment
      console.log('\n5️⃣ Doctor viewing appointment...');
      const appointmentView = await doctor.viewAppointment(appointmentID);
      console.log('✅ Appointment viewed by doctor');
      console.log('👤 Patient:', appointmentView.patientID);
      console.log('🩺 Reason:', appointmentView.reasonForVisit);

      // Step 7: Doctor starts appointment (simulated)
      console.log('\n6️⃣ Doctor starting appointment...');
      const startResult = await doctor.startAppointment(appointmentID);
      console.log('✅ Appointment started');
      console.log('⏰ Start time:', startResult.startTime);

      // Step 8: Doctor completes appointment
      console.log('\n7️⃣ Doctor completing appointment...');
      const completionData = {
        duration: 35, // Actual duration
        diagnosis: 'Normal blood pressure, healthy heart rate',
        treatmentPlan: 'Continue current medication, regular exercise',
        followUpRequired: true,
        followUpDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        prescriptionIssued: true
      };

      const completionResult = await doctor.completeAppointment(appointmentID, completionData);
      console.log('✅ Appointment completed');
      console.log('⏰ Completion time:', completionResult.completionTime);

      // Step 9: View appointment history
      console.log('\n8️⃣ Viewing appointment history...');
      const history = await patient.viewAppointmentHistory(appointmentID);
      console.log('📜 Appointment history entries:', history.length);
      history.slice(0, 5).forEach((entry, index) => {
        console.log(`   ${index + 1}. ${entry.action} by ${entry.performedByName} (${entry.timestamp.toDateString()})`);
      });

      // Step 10: Get statistics
      console.log('\n9️⃣ Getting appointment statistics...');
      const doctorStats = await doctor.getAppointmentStatistics();
      const managerStats = await manager.getAppointmentApprovalStatistics();
      
      console.log('📊 Doctor Statistics:');
      console.log('   Total Appointments:', doctorStats.totalAppointments);
      console.log('   Completed:', doctorStats.completedAppointments);
      
      console.log('\n📊 Manager Statistics:');
      console.log('   Total Reviewed:', managerStats.totalAppointments);
      console.log('   Approved:', managerStats.approvedAppointments);
      console.log('   Declined:', managerStats.declinedAppointments);

      console.log('\n🎉 Complete appointment workflow finished successfully!');

      return { patient, doctor, manager, appointmentID };
    } else {
      console.log('ℹ️ No pending appointments found');
      return { patient, doctor, manager };
    }
  } catch (error) {
    console.error('❌ Error in appointment workflow:', error);
    throw error;
  }
}

// Example: Appointment rescheduling workflow
export async function appointmentReschedulingExample() {
  try {
    console.log('\n=== Appointment Rescheduling Workflow ===\n');

    // Find an approved appointment
    const appointment = await Appointment.findOne({ 
      status: 'approved',
      'rescheduling.rescheduleCount': { $lt: 3 }
    });
    
    if (!appointment) {
      console.log('ℹ️ No reschedulable appointment found. Running complete workflow first...');
      await completeAppointmentWorkflowExample();
      return;
    }

    // Find the patient
    const patient = await Patient.findOne({ patientId: appointment.patientID });
    if (!patient) {
      throw new Error('Patient not found');
    }

    console.log('1. Checking reschedule eligibility...');
    const eligibility = appointment.checkRefillEligibility ? 
      appointment.checkRefillEligibility() : 
      { eligible: appointment.rescheduling.rescheduleCount < 3 };
    
    console.log('📋 Reschedule Eligibility:');
    console.log('   Eligible:', eligibility.eligible);
    console.log('   Current reschedule count:', appointment.rescheduling.rescheduleCount);

    if (eligibility.eligible) {
      console.log('\n2. Rescheduling appointment...');
      const newDateTime = new Date(appointment.dateTime);
      newDateTime.setDate(newDateTime.getDate() + 2); // Move 2 days later
      
      const rescheduleResult = await patient.rescheduleAppointment(
        appointment.appointmentID,
        newDateTime,
        'Need to change due to personal commitments'
      );
      
      console.log('✅ Appointment rescheduled');
      console.log('📅 New date/time:', rescheduleResult.newDateTime);
      console.log('🔄 Reschedule count:', rescheduleResult.rescheduleCount);
    } else {
      console.log('❌ Maximum reschedule limit reached');
    }

    console.log('\n🎉 Appointment rescheduling workflow completed!');

    return { appointment, patient, rescheduleResult };
  } catch (error) {
    console.error('❌ Error in appointment rescheduling:', error);
    throw error;
  }
}

// Example: Appointment cancellation workflow
export async function appointmentCancellationExample() {
  try {
    console.log('\n=== Appointment Cancellation Workflow ===\n');

    // Find an approved or confirmed appointment
    const appointment = await Appointment.findOne({ 
      status: { $in: ['approved', 'confirmed'] }
    });
    
    if (!appointment) {
      console.log('ℹ️ No cancellable appointment found.');
      return;
    }

    // Find the patient
    const patient = await Patient.findOne({ patientId: appointment.patientID });
    if (!patient) {
      throw new Error('Patient not found');
    }

    console.log('1. Checking refund eligibility...');
    const refundEligible = appointment.getRefundEligibility();
    console.log('💰 Refund Eligibility:', refundEligible);

    console.log('\n2. Cancelling appointment...');
    const cancellationResult = await patient.cancelAppointment(
      appointment.appointmentID,
      'Unexpected emergency - need to reschedule'
    );
    
    console.log('✅ Appointment cancelled');
    console.log('💰 Refund eligible:', cancellationResult.refundEligible);

    console.log('\n🎉 Appointment cancellation workflow completed!');

    return { appointment, patient, cancellationResult };
  } catch (error) {
    console.error('❌ Error in appointment cancellation:', error);
    throw error;
  }
}

// Example: Appointment decline workflow
export async function appointmentDeclineExample() {
  try {
    console.log('\n=== Appointment Decline Workflow ===\n');

    // Find a pending appointment
    const appointment = await Appointment.findOne({ status: 'pending_approval' });
    
    if (!appointment) {
      console.log('ℹ️ No pending appointment found.');
      return;
    }

    // Find the manager
    const manager = await HealthCareManager.findOne({ 
      'assignedHospital.hospitalId': 'HOSP001' 
    });
    if (!manager) {
      throw new Error('HealthCareManager not found');
    }

    console.log('1. Viewing appointment details...');
    const appointmentDetails = await manager.viewAppointment(appointment.appointmentID);
    console.log('📋 Appointment Details:');
    console.log('   Patient:', appointmentDetails.patientID);
    console.log('   Doctor:', appointmentDetails.doctorID);
    console.log('   Reason:', appointmentDetails.reasonForVisit);

    console.log('\n2. Declining appointment...');
    const declineReason = 'Requested time slot is not available - doctor has prior commitments';
    
    const declineResult = await manager.declineAppointment(
      appointment.appointmentID,
      declineReason
    );
    
    console.log('❌ Appointment declined');
    console.log('📝 Decline reason:', declineResult.declineReason);
    console.log('📧 Notifications sent to:', declineResult.notificationsSent);

    console.log('\n🎉 Appointment decline workflow completed!');

    return { appointment, manager, declineResult };
  } catch (error) {
    console.error('❌ Error in appointment decline:', error);
    throw error;
  }
}

// Example: Bulk appointment approval
export async function bulkAppointmentApprovalExample() {
  try {
    console.log('\n=== Bulk Appointment Approval Workflow ===\n');

    // Find multiple pending appointments
    const pendingAppointments = await Appointment.find({ 
      status: 'pending_approval' 
    }).limit(3);
    
    if (pendingAppointments.length === 0) {
      console.log('ℹ️ No pending appointments found for bulk approval.');
      return;
    }

    // Find the manager
    const manager = await HealthCareManager.findOne({ 
      'assignedHospital.hospitalId': 'HOSP001' 
    });
    if (!manager) {
      throw new Error('HealthCareManager not found');
    }

    console.log('1. Found pending appointments:', pendingAppointments.length);

    const appointmentIDs = pendingAppointments.map(apt => apt.appointmentID);
    console.log('📋 Appointment IDs:', appointmentIDs);

    console.log('\n2. Bulk approving appointments...');
    const bulkResult = await manager.bulkApproveAppointments(
      appointmentIDs,
      'Bulk approval for routine appointments with valid insurance'
    );
    
    console.log('📊 Bulk Approval Results:');
    bulkResult.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.appointmentID}: ${result.status} - ${result.message}`);
    });

    const approvedCount = bulkResult.filter(r => r.status === 'approved').length;
    console.log(`\n✅ Successfully approved ${approvedCount} out of ${bulkResult.length} appointments`);

    console.log('\n🎉 Bulk appointment approval workflow completed!');

    return { manager, bulkResult };
  } catch (error) {
    console.error('❌ Error in bulk appointment approval:', error);
    throw error;
  }
}

// Example: Doctor availability checking
export async function doctorAvailabilityExample() {
  try {
    console.log('\n=== Doctor Availability Checking ===\n');

    // Find a doctor
    const doctor = await Doctor.findOne({ specialization: 'cardiology' });
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    console.log('1. Checking doctor availability...');
    
    // Check availability for tomorrow at 10:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const availability = await doctor.checkAvailability(
      tomorrow.toDateString(),
      '10:00'
    );
    
    console.log('📅 Availability Check:');
    console.log('   Requested time:', availability.requestedDateTime);
    console.log('   Available:', availability.available);
    console.log('   Conflicting appointments:', availability.conflictingAppointments);
    console.log('   Doctor schedule:', availability.doctorSchedule);

    console.log('\n2. Getting upcoming appointments...');
    const upcomingAppointments = await doctor.getUpcomingAppointments(7); // Next 7 days
    console.log('📋 Upcoming appointments (next 7 days):', upcomingAppointments.length);

    console.log('\n3. Getting today\'s appointments...');
    const todaysAppointments = await doctor.getTodaysAppointments();
    console.log('📅 Today\'s appointments:', todaysAppointments.length);

    console.log('\n🎉 Doctor availability checking completed!');

    return { doctor, availability, upcomingAppointments, todaysAppointments };
  } catch (error) {
    console.error('❌ Error in doctor availability checking:', error);
    throw error;
  }
}

// Example: No-show appointment handling
export async function noShowAppointmentExample() {
  try {
    console.log('\n=== No-Show Appointment Handling ===\n');

    // Find a confirmed appointment that should have started
    const appointment = await Appointment.findOne({ 
      status: 'confirmed',
      dateTime: { $lt: new Date() } // Past appointment
    });
    
    if (!appointment) {
      console.log('ℹ️ No past confirmed appointment found for no-show example.');
      return;
    }

    // Find the doctor
    const doctor = await Doctor.findOne({ empID: appointment.doctorID });
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    console.log('1. Marking appointment as no-show...');
    const noShowResult = await doctor.markAppointmentAsNoShow(
      appointment.appointmentID,
      'Patient did not arrive for scheduled appointment'
    );
    
    console.log('❌ Appointment marked as no-show');
    console.log('📊 Status:', noShowResult.status);

    console.log('\n2. Viewing appointment history...');
    const history = await doctor.viewAppointmentHistory(appointment.appointmentID);
    console.log('📜 Latest history entry:', history[0]);

    console.log('\n🎉 No-show appointment handling completed!');

    return { appointment, doctor, noShowResult };
  } catch (error) {
    console.error('❌ Error in no-show appointment handling:', error);
    throw error;
  }
}

// Example: Appointment filtering and search
export async function appointmentFilteringExample() {
  try {
    console.log('\n=== Appointment Filtering and Search ===\n');

    console.log('1. Finding appointments by status...');
    const pendingAppointments = await Appointment.findByStatus('pending_approval');
    const approvedAppointments = await Appointment.findByStatus('approved');
    const completedAppointments = await Appointment.findByStatus('completed');
    
    console.log('📋 Appointments by Status:');
    console.log('   Pending Approval:', pendingAppointments.length);
    console.log('   Approved:', approvedAppointments.length);
    console.log('   Completed:', completedAppointments.length);

    console.log('\n2. Finding appointments by date range...');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // 30 days ago
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // 30 days from now
    
    const dateRangeAppointments = await Appointment.findByDateRange(startDate, endDate);
    console.log('📅 Appointments in date range:', dateRangeAppointments.length);

    console.log('\n3. Finding upcoming appointments...');
    const upcomingAppointments = await Appointment.findUpcomingAppointments(14); // Next 14 days
    console.log('🔮 Upcoming appointments (next 14 days):', upcomingAppointments.length);

    console.log('\n4. Finding appointments by patient...');
    const patientAppointments = await Appointment.findByPatientID('PAT001');
    console.log('👤 Patient PAT001 appointments:', patientAppointments.length);

    console.log('\n5. Finding appointments by doctor...');
    const doctorAppointments = await Appointment.findByDoctorID('DOC001');
    console.log('👨‍⚕️ Doctor DOC001 appointments:', doctorAppointments.length);

    console.log('\n🎉 Appointment filtering example completed!');

    return {
      pendingAppointments,
      approvedAppointments,
      completedAppointments,
      dateRangeAppointments,
      upcomingAppointments,
      patientAppointments,
      doctorAppointments
    };
  } catch (error) {
    console.error('❌ Error in appointment filtering:', error);
    throw error;
  }
}

// Example: Appointment statistics and analytics
export async function appointmentStatisticsExample() {
  try {
    console.log('\n=== Appointment Statistics and Analytics ===\n');

    console.log('1. Getting overall appointment statistics...');
    const overallStats = await Appointment.getAppointmentStatistics();
    console.log('📊 Overall Statistics:');
    if (overallStats[0]) {
      const stats = overallStats[0];
      console.log('   Total Appointments:', stats.totalAppointments);
      console.log('   Pending Approval:', stats.pendingApproval);
      console.log('   Approved:', stats.approvedAppointments);
      console.log('   Completed:', stats.completedAppointments);
      console.log('   Cancelled:', stats.cancelledAppointments);
      console.log('   No-Show:', stats.noShowAppointments);
      console.log('   Average Reschedule Count:', stats.averageRescheduleCount?.toFixed(2));
    }

    console.log('\n2. Getting statistics by date range...');
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const monthStats = await Appointment.getAppointmentStatistics({
      dateFrom: lastMonth,
      dateTo: new Date()
    });
    console.log('📅 Last Month Statistics:');
    if (monthStats[0]) {
      const stats = monthStats[0];
      console.log('   Total Appointments:', stats.totalAppointments);
      console.log('   Completed:', stats.completedAppointments);
      console.log('   Cancelled:', stats.cancelledAppointments);
    }

    console.log('\n3. Getting doctor-specific statistics...');
    const doctor = await Doctor.findOne({ empID: 'DOC001' });
    if (doctor) {
      const doctorStats = await doctor.getAppointmentStatistics();
      console.log('👨‍⚕️ Doctor Statistics:');
      console.log('   Total Appointments:', doctorStats.totalAppointments);
      console.log('   Completed:', doctorStats.completedAppointments);
      console.log('   No-Show Rate:', doctorStats.noShowAppointments);
    }

    console.log('\n🎉 Appointment statistics example completed!');

    return { overallStats, monthStats, doctorStats };
  } catch (error) {
    console.error('❌ Error in appointment statistics:', error);
    throw error;
  }
}

// Run all examples
export async function runAllAppointmentExamples() {
  try {
    console.log('🚀 Starting Appointment System Examples...\n');
    
    await completeAppointmentWorkflowExample();
    await appointmentReschedulingExample();
    await appointmentCancellationExample();
    await appointmentDeclineExample();
    await bulkAppointmentApprovalExample();
    await doctorAvailabilityExample();
    await noShowAppointmentExample();
    await appointmentFilteringExample();
    await appointmentStatisticsExample();
    
    console.log('\n🎉 All Appointment examples completed successfully!');
  } catch (error) {
    console.error('❌ Error running appointment examples:', error);
  }
}

// Export all example functions
export default {
  completeAppointmentWorkflowExample,
  appointmentReschedulingExample,
  appointmentCancellationExample,
  appointmentDeclineExample,
  bulkAppointmentApprovalExample,
  doctorAvailabilityExample,
  noShowAppointmentExample,
  appointmentFilteringExample,
  appointmentStatisticsExample,
  runAllAppointmentExamples
};
