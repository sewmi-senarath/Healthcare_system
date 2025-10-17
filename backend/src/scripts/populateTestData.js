/**
 * Script to populate the database with test data for dashboard statistics
 */

import mongoose from 'mongoose';
import { Appointment, Patient, Doctor, HealthCareManager, Notification, Prescription, MedicineStock, Employee } from '../models/index.js';

const MONGODB_URI = 'mongodb://localhost:27017/healthcare_system';

async function populateTestData() {
  try {
    console.log('🚀 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing test data
    console.log('\n🧹 Clearing existing test data...');
    await Appointment.deleteMany({});
    await Prescription.deleteMany({});
    await Notification.deleteMany({});
    await MedicineStock.deleteMany({});
    console.log('✅ Cleared existing test data');

    // Create test users
    console.log('\n👥 Creating test users...');
    
    // Create a doctor
    const doctor = new Doctor({
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@hospital.com',
      password: 'doctorPassword123',
      empID: 'DOC001',
      specialization: 'cardiology',
      assignedHospitalID: 'HOSP001'
    });
    await doctor.save();
    console.log('✅ Created doctor:', doctor.name);

    // Create a nurse
    const nurse = new Doctor({
      name: 'Nurse Emma Wilson',
      email: 'emma.wilson@hospital.com',
      password: 'nursePassword123',
      empID: 'NUR001',
      userType: 'nurse',
      specialization: 'general',
      assignedHospitalID: 'HOSP001'
    });
    await nurse.save();
    console.log('✅ Created nurse:', nurse.name);

    // Create a healthcare manager
    const manager = new HealthCareManager({
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
    console.log('✅ Created healthcare manager:', manager.name);

    // Create a pharmacist
    const pharmacist = new Doctor({
      name: 'John Smith',
      email: 'john.smith@hospital.com',
      password: 'pharmacistPassword123',
      empID: 'PHA001',
      userType: 'pharmacist',
      specialization: 'pharmacy',
      assignedHospitalID: 'HOSP001'
    });
    await pharmacist.save();
    console.log('✅ Created pharmacist:', pharmacist.name);

    // Create patients
    const patients = [];
    for (let i = 1; i <= 5; i++) {
      const patient = new Patient({
        name: `Patient ${i}`,
        email: `patient${i}@email.com`,
        password: 'patientPassword123',
        patientId: `PAT${i.toString().padStart(3, '0')}`,
        dateOfBirth: new Date(1990 + i, 0, 1),
        gender: i % 2 === 0 ? 'female' : 'male'
      });
      await patient.save();
      patients.push(patient);
    }
    console.log('✅ Created 5 patients');

    // Create appointments with different statuses
    console.log('\n📅 Creating appointments...');
    const appointments = [];
    const today = new Date();
    
    // Today's appointments (2 approved, 1 pending)
    for (let i = 0; i < 3; i++) {
      const appointment = new Appointment({
        appointmentID: `APT${Date.now()}${i}`,
        patientID: patients[i].patientId,
        doctorID: doctor.empID,
        dateTime: new Date(today.getTime() + i * 2 * 60 * 60 * 1000), // 2 hours apart
        reasonForVisit: `Checkup ${i + 1}`,
        status: i < 2 ? 'approved' : 'pending_approval',
        appointmentDetails: {
          duration: 30,
          appointmentType: 'routine_checkup',
          priority: 'routine'
        }
      });
      await appointment.save();
      appointments.push(appointment);
    }

    // Completed appointments (3)
    for (let i = 0; i < 3; i++) {
      const appointment = new Appointment({
        appointmentID: `APT${Date.now()}${i + 10}`,
        patientID: patients[i].patientId,
        doctorID: doctor.empID,
        dateTime: new Date(today.getTime() - (i + 1) * 24 * 60 * 60 * 1000), // Past dates
        reasonForVisit: `Completed checkup ${i + 1}`,
        status: 'completed',
        appointmentDetails: {
          duration: 30,
          appointmentType: 'routine_checkup',
          priority: 'routine'
        }
      });
      await appointment.save();
      appointments.push(appointment);
    }

    // Upcoming appointments (next 7 days)
    for (let i = 0; i < 4; i++) {
      const appointment = new Appointment({
        appointmentID: `APT${Date.now()}${i + 20}`,
        patientID: patients[i % patients.length].patientId,
        doctorID: doctor.empID,
        dateTime: new Date(today.getTime() + (i + 1) * 24 * 60 * 60 * 1000), // Future dates
        reasonForVisit: `Future checkup ${i + 1}`,
        status: 'approved',
        appointmentDetails: {
          duration: 30,
          appointmentType: 'routine_checkup',
          priority: 'routine'
        }
      });
      await appointment.save();
      appointments.push(appointment);
    }

    console.log(`✅ Created ${appointments.length} appointments`);

    // Create prescriptions
    console.log('\n💊 Creating prescriptions...');
    const prescriptions = [];
    
    // Pending prescriptions (2)
    for (let i = 0; i < 2; i++) {
      const prescription = new Prescription({
        prescriptionID: `PRES${Date.now()}${i}`,
        patientID: patients[i].patientId,
        doctorID: doctor.empID,
        medications: [{
          name: `Medication ${i + 1}`,
          dosage: '10mg',
          frequency: 'twice daily',
          duration: '7 days'
        }],
        status: 'pending',
        prescriptionDate: new Date()
      });
      await prescription.save();
      prescriptions.push(prescription);
    }

    // Active prescriptions (3)
    for (let i = 0; i < 3; i++) {
      const prescription = new Prescription({
        prescriptionID: `PRES${Date.now()}${i + 10}`,
        patientID: patients[i].patientId,
        doctorID: doctor.empID,
        medications: [{
          name: `Active Medication ${i + 1}`,
          dosage: '5mg',
          frequency: 'once daily',
          duration: '14 days'
        }],
        status: 'active',
        prescriptionDate: new Date()
      });
      await prescription.save();
      prescriptions.push(prescription);
    }

    console.log(`✅ Created ${prescriptions.length} prescriptions`);

    // Create medicine stock
    console.log('\n🏥 Creating medicine stock...');
    const medicines = [];
    
    // Low stock medicines (3)
    for (let i = 0; i < 3; i++) {
      const medicine = new MedicineStock({
        medicineID: `MED${Date.now()}${i}`,
        name: `Low Stock Medicine ${i + 1}`,
        quantityAvailable: 5 + i, // Low stock (5, 6, 7)
        expiryDate: new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        supplier: `Supplier ${i + 1}`
      });
      await medicine.save();
      medicines.push(medicine);
    }

    // Normal stock medicines (7)
    for (let i = 0; i < 7; i++) {
      const medicine = new MedicineStock({
        medicineID: `MED${Date.now()}${i + 10}`,
        name: `Normal Stock Medicine ${i + 1}`,
        quantityAvailable: 50 + i * 10, // Normal stock (50, 60, 70, etc.)
        expiryDate: new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000),
        supplier: `Supplier ${i + 4}`
      });
      await medicine.save();
      medicines.push(medicine);
    }

    console.log(`✅ Created ${medicines.length} medicines`);

    // Create notifications
    console.log('\n🔔 Creating notifications...');
    const notifications = [];
    
    // Unread notifications for doctor (3)
    for (let i = 0; i < 3; i++) {
      const notification = new Notification({
        recipientId: doctor.empID,
        recipientType: 'doctor',
        title: `Doctor Notification ${i + 1}`,
        message: `You have a new appointment request ${i + 1}`,
        type: 'appointment',
        status: 'unread',
        createdAt: new Date()
      });
      await notification.save();
      notifications.push(notification);
    }

    // Unread notifications for nurse (2)
    for (let i = 0; i < 2; i++) {
      const notification = new Notification({
        recipientId: nurse.empID,
        recipientType: 'nurse',
        title: `Nurse Notification ${i + 1}`,
        message: `New patient assignment ${i + 1}`,
        type: 'assignment',
        status: 'unread',
        createdAt: new Date()
      });
      await notification.save();
      notifications.push(notification);
    }

    // Unread notifications for healthcare manager (4)
    for (let i = 0; i < 4; i++) {
      const notification = new Notification({
        recipientId: manager.empID,
        recipientType: 'healthCareManager',
        title: `Manager Notification ${i + 1}`,
        message: `Appointment approval required ${i + 1}`,
        type: 'approval',
        status: 'unread',
        createdAt: new Date()
      });
      await notification.save();
      notifications.push(notification);
    }

    // Unread notifications for pharmacist (2)
    for (let i = 0; i < 2; i++) {
      const notification = new Notification({
        recipientId: pharmacist.empID,
        recipientType: 'pharmacist',
        title: `Pharmacist Notification ${i + 1}`,
        message: `New prescription to process ${i + 1}`,
        type: 'prescription',
        status: 'unread',
        createdAt: new Date()
      });
      await notification.save();
      notifications.push(notification);
    }

    console.log(`✅ Created ${notifications.length} notifications`);

    // Create employees for staff count
    console.log('\n👨‍💼 Creating additional employees...');
    const employees = [];
    
    for (let i = 0; i < 5; i++) {
      const employee = new Employee({
        name: `Employee ${i + 1}`,
        email: `employee${i + 1}@hospital.com`,
        empID: `EMP${(i + 1).toString().padStart(3, '0')}`,
        userType: 'hospitalStaff',
        assignedHospitalID: 'HOSP001'
      });
      await employee.save();
      employees.push(employee);
    }

    console.log(`✅ Created ${employees.length} additional employees`);

    console.log('\n🎉 Test data population completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${appointments.length} appointments (3 today, 3 completed, 4 upcoming, 1 pending)`);
    console.log(`   - ${prescriptions.length} prescriptions (2 pending, 3 active)`);
    console.log(`   - ${medicines.length} medicines (3 low stock, 7 normal stock)`);
    console.log(`   - ${notifications.length} notifications (3 doctor, 2 nurse, 4 manager, 2 pharmacist)`);
    console.log(`   - ${employees.length + 4} total employees (4 authority + 5 staff)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating test data:', error);
    process.exit(1);
  }
}

// Run the script
populateTestData();
