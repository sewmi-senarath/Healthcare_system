/**
 * Mock implementations for all database models
 * Provides consistent mock data and behavior for testing
 */

// Mock data generators
const generateMockUser = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439011',
  email: 'test@example.com',
  password: '$2a$10$hashedpassword',
  name: 'Test User',
  userType: 'patient',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  toObject: jest.fn().mockReturnThis(),
  save: jest.fn().mockResolvedValue(),
  ...overrides
});

const generateMockPatient = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439011',
  patientId: 'PAT123456789',
  email: 'patient@example.com',
  password: '$2a$10$hashedpassword',
  name: 'John Doe',
  dateOfBirth: new Date('1990-01-01'),
  gender: 'male',
  contactInfo: {
    phone: '+1234567890',
    address: '123 Main St'
  },
  medicalHistory: [],
  allergies: [],
  insuranceDetails: {},
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  toObject: jest.fn().mockReturnThis(),
  save: jest.fn().mockResolvedValue(),
  ...overrides
});

const generateMockDoctor = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439012',
  empID: 'DOC123456789',
  email: 'doctor@example.com',
  password: '$2a$10$hashedpassword',
  name: 'Dr. Jane Smith',
  specialization: 'Cardiology',
  department: 'Cardiology',
  phone: '+1234567891',
  consultationFee: 150,
  experience: '10 years',
  availability: {
    monday: { start: '09:00', end: '17:00', isAvailable: true },
    tuesday: { start: '09:00', end: '17:00', isAvailable: true },
    wednesday: { start: '09:00', end: '17:00', isAvailable: true },
    thursday: { start: '09:00', end: '17:00', isAvailable: true },
    friday: { start: '09:00', end: '17:00', isAvailable: true },
    saturday: { start: '09:00', end: '13:00', isAvailable: true },
    sunday: { start: '00:00', end: '00:00', isAvailable: false }
  },
  status: 'active',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  toObject: jest.fn().mockReturnThis(),
  save: jest.fn().mockResolvedValue(),
  ...overrides
});

const generateMockAppointment = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439013',
  appointmentID: 'APT123456789',
  patientID: 'PAT123456789',
  doctorID: 'DOC123456789',
  dateTime: new Date('2024-12-25T10:00:00Z'),
  duration: 30,
  reason: 'General consultation',
  symptoms: ['fever', 'headache'],
  urgency: 'normal',
  status: 'pending_approval',
  paymentStatus: 'pending',
  createdBy: 'PAT123456789',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  toObject: jest.fn().mockReturnThis(),
  save: jest.fn().mockResolvedValue(),
  ...overrides
});

const generateMockPrescription = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439014',
  prescriptionID: 'PRES123456789',
  patientID: 'PAT123456789',
  doctorId: 'DOC123456789',
  medicineList: [
    {
      medicineId: 'MED001',
      medicineName: 'Paracetamol',
      strength: '500mg',
      quantity: 30,
      dosageInstruction: 'Take 1 tablet twice daily',
      frequency: 'BID',
      duration: '7 days'
    }
  ],
  dosageInstruction: 'As directed by doctor',
  status: 'pending',
  dateIssued: new Date('2024-01-01'),
  expiryDate: new Date('2024-01-31'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  toObject: jest.fn().mockReturnThis(),
  save: jest.fn().mockResolvedValue(),
  sendToPharmacy: jest.fn().mockResolvedValue(),
  dispenseMedication: jest.fn().mockResolvedValue(),
  completePrescription: jest.fn().mockResolvedValue(),
  cancelPrescription: jest.fn().mockResolvedValue(),
  ...overrides
});

const generateMockNotification = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439015',
  recipientId: 'PAT123456789',
  recipientType: 'patient',
  message: 'Your appointment has been scheduled',
  type: 'appointment',
  status: 'unread',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  toObject: jest.fn().mockReturnThis(),
  save: jest.fn().mockResolvedValue(),
  ...overrides
});

// Mock model functions
const createMockModel = (mockData = []) => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
  deleteOne: jest.fn(),
  deleteMany: jest.fn(),
  updateOne: jest.fn(),
  updateMany: jest.fn(),
  countDocuments: jest.fn(),
  distinct: jest.fn(),
  aggregate: jest.fn(),
  populate: jest.fn(),
  select: jest.fn(),
  sort: jest.fn(),
  limit: jest.fn(),
  skip: jest.fn(),
  lean: jest.fn(),
  exec: jest.fn(),
  create: jest.fn(),
  insertMany: jest.fn(),
  save: jest.fn()
});

// Export mock models
export const mockModels = {
  User: createMockModel(),
  Patient: createMockModel(),
  Doctor: createMockModel(),
  Nurse: createMockModel(),
  Pharmacist: createMockModel(),
  HospitalStaff: createMockModel(),
  HealthCareManager: createMockModel(),
  SystemAdmin: createMockModel(),
  Appointment: createMockModel(),
  Prescription: createMockModel(),
  Notification: createMockModel(),
  SupportTicket: createMockModel(),
  MedicineStock: createMockModel()
};

// Export mock data generators
export const mockData = {
  generateMockUser,
  generateMockPatient,
  generateMockDoctor,
  generateMockAppointment,
  generateMockPrescription,
  generateMockNotification
};

// Helper function to setup mock responses
export const setupMockResponse = (model, method, response) => {
  if (Array.isArray(response)) {
    mockModels[model][method].mockResolvedValue(response);
  } else {
    mockModels[model][method].mockResolvedValue(response);
  }
};

// Helper function to setup mock errors
export const setupMockError = (model, method, error) => {
  mockModels[model][method].mockRejectedValue(error);
};

// Helper function to reset all mocks
export const resetAllMocks = () => {
  Object.values(mockModels).forEach(model => {
    Object.values(model).forEach(method => {
      if (jest.isMockFunction(method)) {
        method.mockReset();
      }
    });
  });
};
