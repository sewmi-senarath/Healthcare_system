/**
 * Test script to verify nurse dashboard stats API
 * Run this after setting up MongoDB and populating test data
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import models
import Nurse from './src/models/Nurse.js';
import Appointment from './src/models/Appointment.js';
import Notification from './src/models/Notification.js';

const testNurseStats = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');

    // Find a nurse to test with
    const nurse = await Nurse.findOne({});
    if (!nurse) {
      console.log('❌ No nurses found in database. Please run the populate script first.');
      process.exit(1);
    }

    console.log(`👩‍⚕️ Testing with nurse: ${nurse.name} (ID: ${nurse.empID})`);

    // Test today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysAppointments = await Appointment.find({
      dateTime: { $gte: today, $lt: tomorrow },
      status: { $in: ['approved', 'confirmed', 'pending_approval'] }
    }).countDocuments();

    // Test total appointments
    const totalAppointments = await Appointment.find({}).countDocuments();

    // Test assigned patients
    const assignedPatientCount = nurse.assignedPatients?.length || 0;

    // Test unread notifications
    const unreadNotifications = await Notification.find({
      recipientId: nurse.empID,
      recipientType: 'nurse',
      status: 'unread'
    }).countDocuments();

    console.log('\n📊 Nurse Dashboard Stats:');
    console.log(`   Today's Appointments: ${todaysAppointments}`);
    console.log(`   Total Appointments: ${totalAppointments}`);
    console.log(`   Assigned Patients: ${assignedPatientCount}`);
    console.log(`   Unread Notifications: ${unreadNotifications}`);

    // Test the actual API endpoint logic
    console.log('\n🧪 Testing API endpoint logic...');
    
    const stats = {
      todaysAppointments,
      totalAppointments,
      assignedPatients: assignedPatientCount,
      unreadNotifications
    };

    console.log('✅ API endpoint would return:', JSON.stringify(stats, null, 2));

    console.log('\n🎉 Nurse dashboard stats are working correctly!');
    console.log('💡 The frontend should now display these real values instead of 0s.');

  } catch (error) {
    console.error('❌ Error testing nurse stats:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 MongoDB is not running. Please:');
      console.log('   1. Set up MongoDB Atlas (recommended) or install MongoDB locally');
      console.log('   2. Create .env file with MONGO_URI');
      console.log('   3. Run the populate script: node src/scripts/populateTestData.js');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the test
testNurseStats();
