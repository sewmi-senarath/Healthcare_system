import Patient from '../models/Patient.js';
import UserController from './UserController.js';

/**
 * PatientController - Handles all patient-specific operations
 * Following Single Responsibility Principle
 */
class PatientController {
  /**
   * Register a new patient
   * @param {Object} patientData 
   * @returns {Promise<Object>}
   */
  static async registerPatient(patientData) {
    try {
      console.log('=== PATIENT REGISTRATION DEBUG ===');
      console.log('Request body:', patientData);
      console.log('Raw password before saving:', patientData.password);

      const { name, email, password, dateOfBirth, gender, contactInfo } = patientData;

      // Check if email already exists
      const existingUser = await UserController.checkEmailExists(email, 'patient');
      if (existingUser) {
        return {
          success: false,
          message: 'Email already registered'
        };
      }

      // Generate patient ID
      const patientId = `PAT${Date.now().toString().substring(6)}${Math.random().toString(36).substring(2, 4).toUpperCase()}`;

      // Create patient (password will be hashed by User model pre-save middleware)
      const patient = new Patient({
        name,
        email,
        password,
        patientId,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        contactInfo: contactInfo || {}
      });

      await patient.save();
      console.log('Patient saved successfully');
      console.log('Saved password hash:', patient.password.substring(0, 20) + '...');

      // Generate tokens
      const tokens = UserController.generateTokens(patient, 'patient');

      // Remove password from response
      const patientResponse = patient.toObject();
      delete patientResponse.password;

      return {
        success: true,
        message: 'Patient registered successfully',
        user: patientResponse,
        userType: 'patient',
        ...tokens
      };

    } catch (error) {
      console.error('Patient registration error:', error);
      throw error;
    }
  }

  /**
   * Login patient
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<Object>}
   */
  static async loginPatient(email, password) {
    return await UserController.authenticateUser(email, password, 'patient');
  }

  /**
   * Get patient profile
   * @param {string} patientId 
   * @returns {Promise<Object>}
   */
  static async getPatientProfile(patientId) {
    try {
      const patient = await Patient.findById(patientId).select('-password');
      
      if (!patient) {
        return {
          success: false,
          message: 'Patient not found'
        };
      }

      return {
        success: true,
        patient: patient.toObject()
      };
    } catch (error) {
      console.error('Get patient profile error:', error);
      throw error;
    }
  }

  /**
   * Update patient profile
   * @param {string} patientId 
   * @param {Object} updateData 
   * @returns {Promise<Object>}
   */
  static async updatePatientProfile(patientId, updateData) {
    try {
      const patient = await Patient.findById(patientId);
      
      if (!patient) {
        return {
          success: false,
          message: 'Patient not found'
        };
      }

      // Update allowed fields
      const allowedUpdates = [
        'name', 
        'email', 
        'dateOfBirth', 
        'gender', 
        'contactInfo', 
        'address', 
        'medicalHistory', 
        'allergies', 
        'insuranceDetails'
      ];
      
      const updates = {};
      allowedUpdates.forEach(field => {
        if (updateData[field] !== undefined) {
          updates[field] = updateData[field];
        }
      });

      Object.assign(patient, updates);
      await patient.save();

      // Remove password from response
      const patientResponse = patient.toObject();
      delete patientResponse.password;

      return {
        success: true,
        message: 'Patient profile updated successfully',
        patient: patientResponse
      };
    } catch (error) {
      console.error('Update patient profile error:', error);
      throw error;
    }
  }

  /**
   * View medical records
   * @param {string} patientId 
   * @returns {Promise<Object>}
   */
  static async viewMedicalRecords(patientId) {
    try {
      const patient = await Patient.findById(patientId);
      
      if (!patient) {
        return {
          success: false,
          message: 'Patient not found'
        };
      }

      return {
        success: true,
        medicalRecords: {
          medicalHistory: patient.medicalHistory,
          allergies: patient.allergies,
          insuranceDetails: patient.insuranceDetails
        }
      };
    } catch (error) {
      console.error('View medical records error:', error);
      throw error;
    }
  }

  /**
   * Update medical history
   * @param {string} patientId 
   * @param {Array} medicalHistory 
   * @returns {Promise<Object>}
   */
  static async updateMedicalHistory(patientId, medicalHistory) {
    try {
      const patient = await Patient.findById(patientId);
      
      if (!patient) {
        return {
          success: false,
          message: 'Patient not found'
        };
      }

      patient.medicalHistory = medicalHistory;
      await patient.save();

      return {
        success: true,
        message: 'Medical history updated successfully',
        medicalHistory: patient.medicalHistory
      };
    } catch (error) {
      console.error('Update medical history error:', error);
      throw error;
    }
  }

  /**
   * Update allergies
   * @param {string} patientId 
   * @param {Array} allergies 
   * @returns {Promise<Object>}
   */
  static async updateAllergies(patientId, allergies) {
    try {
      const patient = await Patient.findById(patientId);
      
      if (!patient) {
        return {
          success: false,
          message: 'Patient not found'
        };
      }

      patient.allergies = allergies;
      await patient.save();

      return {
        success: true,
        message: 'Allergies updated successfully',
        allergies: patient.allergies
      };
    } catch (error) {
      console.error('Update allergies error:', error);
      throw error;
    }
  }

  /**
   * Get patient by ID
   * @param {string} patientId 
   * @returns {Promise<Object>}
   */
  static async getPatientById(patientId) {
    try {
      const patient = await Patient.findOne({ patientId });
      
      if (!patient) {
        return {
          success: false,
          message: 'Patient not found'
        };
      }

      return {
        success: true,
        patient: patient.toObject()
      };
    } catch (error) {
      console.error('Get patient by ID error:', error);
      throw error;
    }
  }

  /**
   * Get all patients (for admin/staff use)
   * @param {Object} filters 
   * @returns {Promise<Object>}
   */
  static async getAllPatients(filters = {}) {
    try {
      const query = {};
      
      if (filters.gender) {
        query.gender = filters.gender;
      }
      
      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive;
      }

      const patients = await Patient.find(query)
        .select('-password')
        .sort({ createdAt: -1 });

      return {
        success: true,
        patients: patients.map(patient => patient.toObject()),
        count: patients.length
      };
    } catch (error) {
      console.error('Get all patients error:', error);
      throw error;
    }
  }
}

export default PatientController;
