import mongoose from 'mongoose';
import Patient from './src/models/Patient.js';

async function findPatient() {
  console.log('🔍 Looking for patient PAT7813837WW...');
  
  // Try different MongoDB connection strings
  const connectionStrings = [
    'mongodb://localhost:27017/healthcare_system',
    'mongodb://127.0.0.1:27017/healthcare_system',
    'mongodb://localhost:27017/healthcare',
    'mongodb://127.0.0.1:27017/healthcare',
    'mongodb://localhost:27017/healthcare_db',
    'mongodb://127.0.0.1:27017/healthcare_db',
    // Try with different ports
    'mongodb://localhost:27018/healthcare_system',
    'mongodb://localhost:27019/healthcare_system'
  ];
  
  for (const uri of connectionStrings) {
    try {
      console.log(`\n🔗 Trying: ${uri}`);
      
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000
      });
      
      console.log('✅ Connected successfully!');
      
      // Search for the patient
      const patient = await Patient.findOne({ patientId: 'PAT7813837WW' });
      
      if (patient) {
        console.log('\n🎉 PATIENT FOUND!');
        console.log('Patient Details:');
        console.log(`  ID: ${patient.patientId}`);
        console.log(`  Name: ${patient.name}`);
        console.log(`  Email: ${patient.email}`);
        console.log(`  DOB: ${patient.dateOfBirth}`);
        console.log(`  Gender: ${patient.gender}`);
        console.log(`  Created: ${patient.createdAt}`);
        
        // Count total patients
        const totalPatients = await Patient.countDocuments();
        console.log(`\n📊 Total patients in database: ${totalPatients}`);
        
        // Show first few patients
        const allPatients = await Patient.find({}).select('patientId name email').limit(5);
        console.log('\n📋 Sample patients:');
        allPatients.forEach(p => {
          console.log(`  ${p.patientId} - ${p.name} (${p.email})`);
        });
        
        console.log('\n✅ SUCCESS: Found your patient and database is working!');
        console.log('You can now use real data instead of mock data.');
        
      } else {
        console.log('❌ Patient PAT7813837WW not found in this database');
        
        // Show what patients exist
        const totalPatients = await Patient.countDocuments();
        console.log(`📊 Total patients in database: ${totalPatients}`);
        
        if (totalPatients > 0) {
          const allPatients = await Patient.find({}).select('patientId name email').limit(10);
          console.log('\n📋 Existing patients:');
          allPatients.forEach(p => {
            console.log(`  ${p.patientId} - ${p.name} (${p.email})`);
          });
        }
      }
      
      await mongoose.disconnect();
      console.log('\n🔌 Disconnected from database');
      
      if (patient) {
        process.exit(0); // Found the patient, exit successfully
      }
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      try {
        await mongoose.disconnect();
      } catch (disconnectError) {
        // Ignore disconnect errors
      }
    }
  }
  
  console.log('\n❌ Could not find patient PAT7813837WW in any database');
  console.log('\n💡 Possible solutions:');
  console.log('1. Make sure MongoDB is running');
  console.log('2. Check if the patient ID is correct');
  console.log('3. Verify the database name');
  console.log('4. Check if the patient exists in a different database');
  
  process.exit(1);
}

findPatient().catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
});
