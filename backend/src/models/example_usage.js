/**
 * Example Usage of Healthcare System Models
 * Demonstrates how to use all the models following SOLID principles
 */

import {
  User,
  Patient,
  SystemAdmin,
  Employee,
  Doctor,
  HospitalStaff,
  Nurse,
  Pharmacist,
  HealthCareManager
} from './index.js';

// Example: Creating a Patient
export async function createPatientExample() {
  try {
    const patient = new Patient({
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
      },
      address: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345'
      },
      medicalHistory: [{
        condition: 'Diabetes Type 2',
        diagnosisDate: new Date('2020-01-15'),
        status: 'chronic',
        notes: 'Well controlled with medication'
      }],
      allergies: [{
        allergen: 'Penicillin',
        severity: 'severe',
        notes: 'Causes severe rash'
      }],
      insuranceDetails: {
        provider: 'Health Insurance Co',
        policyNumber: 'HI123456789',
        coverageType: 'primary'
      }
    });

    await patient.save();
    console.log('Patient created:', patient.patientId);
    return patient;
  } catch (error) {
    console.error('Error creating patient:', error);
    throw error;
  }
}

// Example: Creating a Doctor
export async function createDoctorExample() {
  try {
    const doctor = new Doctor({
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@hospital.com',
      password: 'doctorPassword123',
      empID: 'DOC001',
      specialization: 'cardiology',
      assignedHospitalID: 'HOSP001',
      phone: '+1234567892',
      whatsApp: '+1234567892',
      preferredCommunicationMethod: 'email',
      consultationFee: 150,
      availability: {
        monday: [{ start: '09:00', end: '17:00' }],
        tuesday: [{ start: '09:00', end: '17:00' }],
        wednesday: [{ start: '09:00', end: '17:00' }],
        thursday: [{ start: '09:00', end: '17:00' }],
        friday: [{ start: '09:00', end: '17:00' }]
      }
    });

    await doctor.save();
    console.log('Doctor created:', doctor.empID);
    return doctor;
  } catch (error) {
    console.error('Error creating doctor:', error);
    throw error;
  }
}

// Example: Creating a Nurse
export async function createNurseExample() {
  try {
    const nurse = new Nurse({
      name: 'Mary Smith',
      email: 'mary.smith@hospital.com',
      password: 'nursePassword123',
      empID: 'NURSE001',
      assignedWard: 'icu',
      specializations: ['critical_care'],
      maxPatientLoad: 4,
      shiftSchedule: {
        monday: { start: '07:00', end: '19:00', shift: 'day' },
        tuesday: { start: '07:00', end: '19:00', shift: 'day' },
        wednesday: { start: '07:00', end: '19:00', shift: 'day' },
        thursday: { start: '07:00', end: '19:00', shift: 'day' },
        friday: { start: '07:00', end: '19:00', shift: 'day' }
      }
    });

    await nurse.save();
    console.log('Nurse created:', nurse.empID);
    return nurse;
  } catch (error) {
    console.error('Error creating nurse:', error);
    throw error;
  }
}

// Example: Creating a Pharmacist
export async function createPharmacistExample() {
  try {
    const pharmacist = new Pharmacist({
      name: 'Robert Wilson',
      email: 'robert.wilson@hospital.com',
      password: 'pharmacistPassword123',
      empID: 'PHARM001',
      assignedPharmacy: {
        pharmacyId: 'PHARM001',
        pharmacyName: 'Hospital Pharmacy',
        location: 'Main Building - Ground Floor',
        type: 'hospital'
      },
      specializations: ['clinical_pharmacy', 'hospital_pharmacy'],
      inventoryManagement: {
        canOrderMedications: true,
        canDispenseControlledSubstances: true,
        canCompoundMedications: false
      }
    });

    await pharmacist.save();
    console.log('Pharmacist created:', pharmacist.empID);
    return pharmacist;
  } catch (error) {
    console.error('Error creating pharmacist:', error);
    throw error;
  }
}

// Example: Creating a HealthCareManager
export async function createHealthCareManagerExample() {
  try {
    const manager = new HealthCareManager({
      name: 'David Brown',
      email: 'david.brown@hospital.com',
      password: 'managerPassword123',
      empID: 'MGR001',
      assignedHospital: {
        hospitalId: 'HOSP001',
        hospitalName: 'General Hospital',
        type: 'general'
      },
      managementLevel: 'hospital',
      departmentsManaged: [{
        departmentId: 'CARDIO001',
        departmentName: 'Cardiology',
        startDate: new Date(),
        status: 'active'
      }],
      budgetResponsibilities: {
        annualBudget: 1000000,
        budgetCategories: [{
          category: 'staff_salaries',
          allocated: 600000
        }, {
          category: 'equipment',
          allocated: 200000
        }, {
          category: 'supplies',
          allocated: 200000
        }]
      }
    });

    await manager.save();
    console.log('HealthCareManager created:', manager.empID);
    return manager;
  } catch (error) {
    console.error('Error creating manager:', error);
    throw error;
  }
}

// Example: Creating a SystemAdmin
export async function createSystemAdminExample() {
  try {
    const admin = new SystemAdmin({
      name: 'Admin User',
      email: 'admin@healthcare.com',
      password: 'adminPassword123',
      privileges: [
        'user_management',
        'hospital_management',
        'system_configuration',
        'data_export',
        'audit_logs'
      ],
      adminLevel: 'super_admin'
    });

    await admin.save();
    console.log('SystemAdmin created');
    return admin;
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  }
}

// Example: Demonstrating SOLID Principles
export async function demonstrateSOLIDPrinciples() {
  console.log('=== SOLID Principles Demonstration ===\n');

  // Single Responsibility Principle
  console.log('1. Single Responsibility Principle:');
  console.log('- Each model has a single, well-defined responsibility');
  console.log('- User: authentication, Patient: medical data, Doctor: medical operations\n');

  // Open/Closed Principle
  console.log('2. Open/Closed Principle:');
  console.log('- Models are open for extension, closed for modification');
  console.log('- New user types can be added by extending existing classes\n');

  // Liskov Substitution Principle
  console.log('3. Liskov Substitution Principle:');
  console.log('- All Employee subclasses can be used interchangeably');
  const employees = await Employee.find({ status: 'active' });
  employees.forEach(emp => console.log(`Employee ${emp.empID} can be substituted as Employee`));
  console.log();

  // Interface Segregation Principle
  console.log('4. Interface Segregation Principle:');
  console.log('- Each model only exposes relevant methods');
  console.log('- Doctor has medical methods, Pharmacist has pharmaceutical methods\n');

  // Dependency Inversion Principle
  console.log('5. Dependency Inversion Principle:');
  console.log('- Models depend on service abstractions, not concrete implementations');
  console.log('- External service calls are abstracted\n');
}

// Example: Using model methods
export async function demonstrateModelMethods() {
  console.log('=== Model Methods Demonstration ===\n');

  try {
    // Create a patient and demonstrate methods
    const patient = await createPatientExample();
    
    console.log('Patient Methods:');
    console.log('Patient ID:', patient.getPatientID());
    console.log('Patient Name:', patient.getName());
    
    // Update profile
    await patient.updateProfile({
      contactInfo: { phone: '+1987654321' }
    });
    
    // View medical records
    const records = patient.viewMedicalRecords();
    console.log('Medical Records:', records);
    
    // Book appointment
    const appointment = await patient.bookAppointment({
      doctorId: 'DOC001',
      date: '2024-01-15',
      time: '10:00'
    });
    console.log('Appointment booked:', appointment);

    // Create a doctor and demonstrate methods
    const doctor = await createDoctorExample();
    
    console.log('\nDoctor Methods:');
    console.log('Doctor ID:', doctor.getEmpID());
    
    // Check availability
    const isAvailable = doctor.checkAvailability('2024-01-15', '10:00');
    console.log('Available on 2024-01-15 at 10:00:', isAvailable);
    
    // Create prescription
    const prescription = doctor.createPrescription({
      patientId: patient.patientId,
      medications: ['Metformin 500mg'],
      instructions: 'Take twice daily with meals'
    });
    console.log('Prescription created:', prescription);

    // Create a nurse and demonstrate methods
    const nurse = await createNurseExample();
    
    console.log('\nNurse Methods:');
    console.log('Can accept new patient:', nurse.canAcceptNewPatient());
    
    // Assign patient
    await nurse.assignPatient(patient.patientId, 'basic');
    console.log('Patient assigned to nurse');
    
    // Update patient info
    const updateRecord = nurse.updatePatientInfo(patient.patientId, {
      vitalSigns: { temperature: 98.6, bloodPressure: '120/80' }
    });
    console.log('Patient info updated:', updateRecord);

    // Create a pharmacist and demonstrate methods
    const pharmacist = await createPharmacistExample();
    
    console.log('\nPharmacist Methods:');
    
    // Dispense medication
    const dispensing = pharmacist.dispenseMedication({
      prescriptionId: prescription.prescriptionId,
      patientId: patient.patientId,
      medication: 'Metformin 500mg',
      dosage: '1 tablet',
      quantity: 30,
      instructions: 'Take twice daily with meals'
    });
    console.log('Medication dispensed:', dispensing);
    
    // Update medicine stock
    const stockUpdate = pharmacist.updateMedicineStock({
      medicineId: 'MED001',
      medicineName: 'Metformin 500mg',
      action: 'add',
      quantity: 100,
      batchNumber: 'BATCH001'
    });
    console.log('Medicine stock updated:', stockUpdate);

    // Create a manager and demonstrate methods
    const manager = await createHealthCareManagerExample();
    
    console.log('\nManager Methods:');
    
    // View reports
    const report = manager.viewReports('financial', { month: 'January', year: 2024 });
    console.log('Report generated:', report);
    
    // Manage staff
    const staffAction = manager.manageStaff('hire', {
      employeeId: 'EMP002',
      employeeName: 'New Employee',
      position: 'Receptionist',
      details: { department: 'Administration' }
    });
    console.log('Staff management action:', staffAction);
    
    // Analyze service utilization
    const analysis = manager.analyzeServiceUtilization({
      department: 'Cardiology',
      period: 'monthly'
    });
    console.log('Service utilization analysis:', analysis);

    console.log('\n=== All Examples Completed Successfully ===');

  } catch (error) {
    console.error('Error in demonstration:', error);
  }
}

// Export all example functions
export default {
  createPatientExample,
  createDoctorExample,
  createNurseExample,
  createPharmacistExample,
  createHealthCareManagerExample,
  createSystemAdminExample,
  demonstrateSOLIDPrinciples,
  demonstrateModelMethods
};
