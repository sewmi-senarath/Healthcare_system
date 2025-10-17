/**
 * Test utility functions for comprehensive testing
 * Provides helper functions for common test scenarios
 */

import { mockModels, mockData } from '../mocks/models.js';

/**
 * Create a mock request object
 */
export const createMockRequest = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  user: {},
  headers: {},
  ...overrides
});

/**
 * Create a mock response object
 */
export const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    locals: {}
  };
  return res;
};

/**
 * Create a mock next function
 */
export const createMockNext = () => jest.fn();

/**
 * Generate test data for different user types
 */
export const generateTestData = {
  patient: () => ({
    name: 'John Patient',
    email: 'patient@example.com',
    password: 'password123',
    dateOfBirth: '1990-01-01',
    gender: 'male',
    contactInfo: {
      phone: '+1234567890',
      address: '123 Patient St'
    }
  }),

  doctor: () => ({
    name: 'Dr. Jane Doctor',
    email: 'doctor@example.com',
    password: 'password123',
    specialization: 'Cardiology',
    department: 'Cardiology',
    licenseNumber: 'LIC123456',
    consultationFee: 150
  }),

  nurse: () => ({
    name: 'Nurse Mary Smith',
    email: 'nurse@example.com',
    password: 'password123',
    department: 'Emergency',
    assignedWard: 'Ward A'
  }),

  pharmacist: () => ({
    name: 'Pharmacist Bob Johnson',
    email: 'pharmacist@example.com',
    password: 'password123',
    department: 'Pharmacy',
    licenseNumber: 'PHARM123456'
  }),

  appointment: () => ({
    doctorId: 'DOC001',
    patientId: 'PAT001',
    dateTime: '2024-12-25T10:00:00Z',
    duration: 30,
    reason: 'General consultation',
    symptoms: ['fever', 'headache'],
    urgency: 'normal'
  }),

  prescription: () => ({
    patientID: 'PAT001',
    medicineList: [
      {
        medicineName: 'Paracetamol',
        strength: '500mg',
        quantity: 30,
        dosageInstruction: 'Take 1 tablet twice daily',
        frequency: 'BID',
        duration: '7 days'
      }
    ],
    dosageInstruction: 'Take as directed',
    diagnosis: 'Fever',
    symptoms: ['fever'],
    urgency: 'routine'
  })
};

/**
 * Create mock user objects for authentication
 */
export const createMockUser = (userType = 'patient', overrides = {}) => {
  const baseUser = {
    _id: '507f1f77bcf86cd799439011',
    email: `${userType}@example.com`,
    name: `${userType.charAt(0).toUpperCase() + userType.slice(1)} User`,
    userType,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  // Add type-specific fields
  switch (userType) {
    case 'patient':
      return {
        ...baseUser,
        patientId: 'PAT001',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male',
        ...overrides
      };
    case 'doctor':
      return {
        ...baseUser,
        empID: 'DOC001',
        specialization: 'Cardiology',
        department: 'Cardiology',
        consultationFee: 150,
        ...overrides
      };
    case 'nurse':
      return {
        ...baseUser,
        empID: 'N001',
        department: 'Emergency',
        assignedWard: 'Ward A',
        ...overrides
      };
    case 'pharmacist':
      return {
        ...baseUser,
        empID: 'P001',
        department: 'Pharmacy',
        licenseNumber: 'PHARM123456',
        ...overrides
      };
    case 'healthCareManager':
      return {
        ...baseUser,
        empID: 'HCM001',
        department: 'Management',
        assignedHospital: 'Main Hospital',
        ...overrides
      };
    case 'systemAdmin':
      return {
        ...baseUser,
        empID: 'SA001',
        department: 'IT',
        ...overrides
      };
    default:
      return { ...baseUser, ...overrides };
  }
};

/**
 * Create mock JWT tokens
 */
export const createMockTokens = () => ({
  accessToken: 'mock-access-token-' + Date.now(),
  refreshToken: 'mock-refresh-token-' + Date.now()
});

/**
 * Create mock error responses
 */
export const createMockErrors = {
  notFound: (resource = 'Resource') => ({
    success: false,
    message: `${resource} not found`
  }),

  unauthorized: () => ({
    success: false,
    message: 'Unauthorized access'
  }),

  forbidden: () => ({
    success: false,
    message: 'Forbidden access'
  }),

  validationError: (field = 'field') => ({
    success: false,
    message: `Validation error for ${field}`
  }),

  databaseError: () => ({
    success: false,
    message: 'Database operation failed'
  }),

  serverError: () => ({
    success: false,
    message: 'Internal server error'
  })
};

/**
 * Create mock success responses
 */
export const createMockSuccess = (data = {}, message = 'Operation successful') => ({
  success: true,
  message,
  ...data
});

/**
 * Assert response structure
 */
export const assertResponseStructure = (response, expectedFields = []) => {
  expect(response).toHaveProperty('success');
  expect(typeof response.success).toBe('boolean');
  
  if (response.success) {
    expect(response).toHaveProperty('message');
    expectedFields.forEach(field => {
      expect(response).toHaveProperty(field);
    });
  } else {
    expect(response).toHaveProperty('message');
  }
};

/**
 * Assert error response structure
 */
export const assertErrorResponse = (response, expectedMessage = null) => {
  expect(response.success).toBe(false);
  expect(response).toHaveProperty('message');
  expect(typeof response.message).toBe('string');
  
  if (expectedMessage) {
    expect(response.message).toBe(expectedMessage);
  }
};

/**
 * Assert success response structure
 */
export const assertSuccessResponse = (response, expectedMessage = null) => {
  expect(response.success).toBe(true);
  expect(response).toHaveProperty('message');
  expect(typeof response.message).toBe('string');
  
  if (expectedMessage) {
    expect(response.message).toBe(expectedMessage);
  }
};

/**
 * Mock database operations
 */
export const mockDatabaseOperations = {
  findOne: (model, data = null) => {
    mockModels[model].findOne.mockResolvedValue(data);
  },

  find: (model, data = []) => {
    mockModels[model].find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(data),
        limit: jest.fn().mockResolvedValue(data),
        populate: jest.fn().mockResolvedValue(data)
      })
    });
  },

  save: (instance) => {
    instance.save.mockResolvedValue();
  },

  countDocuments: (model, count = 0) => {
    mockModels[model].countDocuments.mockResolvedValue(count);
  },

  updateMany: (model, result = { modifiedCount: 1 }) => {
    mockModels[model].updateMany.mockResolvedValue(result);
  },

  aggregate: (model, data = []) => {
    mockModels[model].aggregate.mockResolvedValue(data);
  }
};

/**
 * Reset all mocks
 */
export const resetAllMocks = () => {
  Object.values(mockModels).forEach(model => {
    Object.values(model).forEach(method => {
      if (jest.isMockFunction(method)) {
        method.mockReset();
      }
    });
  });
};

/**
 * Create mock middleware
 */
export const createMockMiddleware = (implementation) => {
  return jest.fn().mockImplementation(implementation);
};

/**
 * Mock authentication middleware
 */
export const mockAuthMiddleware = (user = null, error = null) => {
  return createMockMiddleware((req, res, next) => {
    if (error) {
      return res.status(401).json({ success: false, message: error });
    }
    
    req.user = user || createMockUser('patient');
    next();
  });
};

/**
 * Mock authorization middleware
 */
export const mockAuthzMiddleware = (allowedRoles = []) => {
  return createMockMiddleware((req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.userType)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    
    next();
  });
};

/**
 * Test data cleanup
 */
export const cleanupTestData = () => {
  jest.clearAllMocks();
  resetAllMocks();
};

/**
 * Create test suite with common setup
 */
export const createTestSuite = (name, setupFn, teardownFn) => {
  return {
    name,
    setup: setupFn || (() => {}),
    teardown: teardownFn || cleanupTestData
  };
};

/**
 * Mock file upload
 */
export const createMockFile = (overrides = {}) => ({
  fieldname: 'file',
  originalname: 'test.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  size: 1024,
  buffer: Buffer.from('fake image data'),
  ...overrides
});

/**
 * Mock request with file upload
 */
export const createMockRequestWithFile = (file, overrides = {}) => ({
  ...createMockRequest(overrides),
  file,
  files: [file]
});

/**
 * Assert database call
 */
export const assertDatabaseCall = (model, method, expectedArgs) => {
  expect(mockModels[model][method]).toHaveBeenCalledWith(...expectedArgs);
};

/**
 * Assert database call count
 */
export const assertDatabaseCallCount = (model, method, expectedCount) => {
  expect(mockModels[model][method]).toHaveBeenCalledTimes(expectedCount);
};

/**
 * Create mock pagination response
 */
export const createMockPaginatedResponse = (data, page = 1, limit = 10, total = 100) => ({
  success: true,
  data,
  pagination: {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1
  }
});
