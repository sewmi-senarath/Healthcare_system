/**
 * SupportTicket Usage Examples
 * Demonstrates how to use the SupportTicket system with Patient and HealthCareManager
 */

import { SupportTicket, Patient, HealthCareManager } from './index.js';

// Example: Patient creating a support ticket
export async function createPatientTicketExample() {
  try {
    console.log('=== Patient Creating Support Ticket ===\n');

    // Find or create a patient
    let patient = await Patient.findOne({ email: 'john.doe@email.com' });
    
    if (!patient) {
      patient = new Patient({
        name: 'John Doe',
        email: 'john.doe@email.com',
        password: 'securePassword123',
        dateOfBirth: new Date('1990-05-15'),
        gender: 'male',
        contactInfo: {
          phone: '+1234567890',
          emergencyContact: {
            name: 'Jane Doe',
            phone: '+1234567891',
            relationship: 'spouse'
          }
        }
      });
      await patient.save();
    }

    // Patient raises a support ticket
    const ticketData = {
      issueDescription: 'I cannot access my medical records online. The system keeps showing an error message.',
      priority: 'high',
      category: 'medical_record_access',
      tags: ['urgent', 'technical_issue']
    };

    const ticket = await patient.raiseSupportTicket(ticketData);
    console.log('✅ Patient created support ticket:', ticket.ticketID);
    console.log('📋 Issue:', ticket.issueDescription);
    console.log('⚡ Priority:', ticket.priority);
    console.log('📂 Category:', ticket.category);
    
    return { patient, ticket };
  } catch (error) {
    console.error('❌ Error creating patient ticket:', error);
    throw error;
  }
}

// Example: HealthCareManager handling support tickets
export async function handleTicketAsManagerExample() {
  try {
    console.log('\n=== HealthCareManager Handling Support Ticket ===\n');

    // Find or create a healthcare manager
    let manager = await HealthCareManager.findOne({ email: 'david.brown@hospital.com' });
    
    if (!manager) {
      manager = new HealthCareManager({
        name: 'David Brown',
        email: 'david.brown@hospital.com',
        password: 'managerPassword123',
        empID: 'MGR001',
        assignedHospital: {
          hospitalId: 'HOSP001',
          hospitalName: 'General Hospital',
          type: 'general'
        },
        managementLevel: 'hospital'
      });
      await manager.save();
    }

    // Get open tickets
    const openTickets = await manager.viewSupportTickets({ status: 'open' });
    console.log('📊 Open tickets found:', openTickets.length);

    if (openTickets.length > 0) {
      const ticket = openTickets[0];
      console.log('🎫 Processing ticket:', ticket.ticketID);

      // Manager assigns ticket to staff
      console.log('\n1. Assigning ticket to staff...');
      const assignment = await manager.assignTicketToStaff(
        ticket.ticketID, 
        'STAFF001', 
        'Assigning to IT department for technical issue resolution'
      );
      console.log('✅ Ticket assigned to:', assignment.staffID);

      // Manager adds internal communication
      console.log('\n2. Adding internal communication...');
      await manager.addTicketCommunication(
        ticket.ticketID,
        'Internal note: Patient experiencing login issues with medical portal. Escalate to IT team.',
        true // isInternal
      );
      console.log('✅ Internal communication added');

      // Manager updates ticket status
      console.log('\n3. Updating ticket status...');
      await manager.updateTicketStatus(
        ticket.ticketID,
        'in_progress',
        'Ticket assigned to IT team for investigation'
      );
      console.log('✅ Status updated to in_progress');

      // Manager escalates ticket if needed
      console.log('\n4. Escalating ticket...');
      await manager.escalateSupportTicket(
        ticket.ticketID,
        'Patient unable to access critical medical information'
      );
      console.log('✅ Ticket escalated');

      // Manager closes ticket with resolution
      console.log('\n5. Closing ticket with resolution...');
      await manager.closeSupportTicket(ticket.ticketID, {
        description: 'Fixed login issue by resetting patient credentials',
        notes: 'Patient can now access medical records successfully'
      });
      console.log('✅ Ticket closed with resolution');

      // Get ticket statistics
      console.log('\n6. Getting ticket statistics...');
      const stats = await manager.getTicketStatistics();
      console.log('📈 Ticket Statistics:');
      console.log('   Total Tickets:', stats.totalTickets);
      console.log('   Open Tickets:', stats.openTickets);
      console.log('   Closed Tickets:', stats.closedTickets);
      console.log('   Average Resolution Time:', stats.averageResolutionTime?.toFixed(2), 'hours');
      console.log('   Average Satisfaction Rating:', stats.averageSatisfactionRating?.toFixed(2));

      return { manager, ticket };
    } else {
      console.log('ℹ️ No open tickets found');
      return { manager, ticket: null };
    }
  } catch (error) {
    console.error('❌ Error handling ticket as manager:', error);
    throw error;
  }
}

// Example: Patient interacting with their ticket
export async function patientTicketInteractionExample() {
  try {
    console.log('\n=== Patient Ticket Interaction ===\n');

    // Find patient
    const patient = await Patient.findOne({ email: 'john.doe@email.com' });
    if (!patient) {
      throw new Error('Patient not found');
    }

    // Patient views their tickets
    console.log('1. Patient viewing their tickets...');
    const patientTickets = await patient.viewSupportTickets();
    console.log('📋 Patient tickets:', patientTickets.length);

    if (patientTickets.length > 0) {
      const ticket = patientTickets[0];
      console.log('🎫 Viewing ticket:', ticket.ticketID);

      // Patient adds communication to ticket
      console.log('\n2. Patient adding communication...');
      await patient.addTicketCommunication(
        ticket.ticketID,
        'Thank you for the quick response. I can now access my records successfully!'
      );
      console.log('✅ Communication added by patient');

      // Patient rates the ticket after it's closed
      if (ticket.status === 'closed') {
        console.log('\n3. Patient rating the ticket...');
        await patient.rateSupportTicket(
          ticket.ticketID,
          5, // rating out of 5
          'Excellent service! The issue was resolved quickly and professionally.'
        );
        console.log('⭐ Patient rated ticket 5/5 stars');
      }

      return { patient, ticket };
    } else {
      console.log('ℹ️ No tickets found for patient');
      return { patient, ticket: null };
    }
  } catch (error) {
    console.error('❌ Error in patient ticket interaction:', error);
    throw error;
  }
}

// Example: Advanced ticket management
export async function advancedTicketManagementExample() {
  try {
    console.log('\n=== Advanced Ticket Management ===\n');

    // Create multiple tickets with different categories
    const ticketCategories = [
      {
        issueDescription: 'Billing discrepancy in my last visit charges',
        category: 'billing_inquiry',
        priority: 'medium'
      },
      {
        issueDescription: 'Need to reschedule my appointment for next week',
        category: 'appointment_issue',
        priority: 'low'
      },
      {
        issueDescription: 'System down - cannot access patient portal',
        category: 'technical_issue',
        priority: 'urgent'
      }
    ];

    const patient = await Patient.findOne({ email: 'john.doe@email.com' });
    if (!patient) {
      throw new Error('Patient not found');
    }

    const createdTickets = [];
    
    console.log('1. Creating multiple tickets...');
    for (const ticketData of ticketCategories) {
      const ticket = await patient.raiseSupportTicket(ticketData);
      createdTickets.push(ticket);
      console.log(`✅ Created ${ticket.category} ticket:`, ticket.ticketID);
    }

    // Manager views tickets by different filters
    const manager = await HealthCareManager.findOne({ email: 'david.brown@hospital.com' });
    if (!manager) {
      throw new Error('Manager not found');
    }

    console.log('\n2. Filtering tickets by category...');
    const billingTickets = await manager.viewSupportTickets({ category: 'billing_inquiry' });
    console.log('💰 Billing tickets:', billingTickets.length);

    console.log('\n3. Filtering tickets by priority...');
    const urgentTickets = await manager.viewSupportTickets({ priority: 'urgent' });
    console.log('🚨 Urgent tickets:', urgentTickets.length);

    console.log('\n4. Filtering tickets by status...');
    const openTickets = await manager.viewSupportTickets({ status: 'open' });
    console.log('📂 Open tickets:', openTickets.length);

    // Bulk operations
    console.log('\n5. Performing bulk operations...');
    for (const ticket of openTickets.slice(0, 2)) { // Process first 2 tickets
      await manager.assignTicketToStaff(ticket.ticketID, 'STAFF002', 'Auto-assignment');
      await manager.updateTicketStatus(ticket.ticketID, 'in_progress', 'Processing');
      console.log(`✅ Processed ticket: ${ticket.ticketID}`);
    }

    return { createdTickets, manager };
  } catch (error) {
    console.error('❌ Error in advanced ticket management:', error);
    throw error;
  }
}

// Example: Complete ticket lifecycle
export async function completeTicketLifecycleExample() {
  try {
    console.log('\n=== Complete Ticket Lifecycle ===\n');

    // Step 1: Patient creates ticket
    console.log('1️⃣ Patient creates ticket...');
    const patient = await Patient.findOne({ email: 'john.doe@email.com' });
    if (!patient) {
      throw new Error('Patient not found');
    }

    const ticket = await patient.raiseSupportTicket({
      issueDescription: 'Prescription refill request - medication running low',
      category: 'prescription_issue',
      priority: 'high'
    });
    console.log('✅ Ticket created:', ticket.ticketID);

    // Step 2: Manager assigns and processes
    console.log('\n2️⃣ Manager processes ticket...');
    const manager = await HealthCareManager.findOne({ email: 'david.brown@hospital.com' });
    if (!manager) {
      throw new Error('Manager not found');
    }

    await manager.assignTicketToStaff(ticket.ticketID, 'PHARM001', 'Assign to pharmacy team');
    await manager.updateTicketStatus(ticket.ticketID, 'in_progress', 'Processing prescription refill');

    // Step 3: Staff resolves issue
    console.log('\n3️⃣ Staff resolves issue...');
    const supportTicket = await SupportTicket.findOne({ ticketID: ticket.ticketID });
    await supportTicket.updateStatus('resolved', 'PHARM001', 'Prescription refilled and ready for pickup');

    // Step 4: Manager closes ticket
    console.log('\n4️⃣ Manager closes ticket...');
    await manager.closeSupportTicket(ticket.ticketID, {
      description: 'Prescription refilled successfully',
      notes: 'Patient can pick up medication from pharmacy'
    });

    // Step 5: Patient rates service
    console.log('\n5️⃣ Patient rates service...');
    await patient.rateSupportTicket(ticket.ticketID, 5, 'Quick and efficient service!');

    console.log('🎉 Complete ticket lifecycle finished successfully!');
    
    return { patient, manager, ticket };
  } catch (error) {
    console.error('❌ Error in complete ticket lifecycle:', error);
    throw error;
  }
}

// Run all examples
export async function runAllSupportTicketExamples() {
  try {
    console.log('🚀 Starting SupportTicket Examples...\n');
    
    await createPatientTicketExample();
    await handleTicketAsManagerExample();
    await patientTicketInteractionExample();
    await advancedTicketManagementExample();
    await completeTicketLifecycleExample();
    
    console.log('\n🎉 All SupportTicket examples completed successfully!');
  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
}

// Export all example functions
export default {
  createPatientTicketExample,
  handleTicketAsManagerExample,
  patientTicketInteractionExample,
  advancedTicketManagementExample,
  completeTicketLifecycleExample,
  runAllSupportTicketExamples
};
