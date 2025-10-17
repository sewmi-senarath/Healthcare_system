# Healthcare System - MVC Architecture

This document outlines the MVC (Model-View-Controller) architecture implemented in the Healthcare System backend.

## 📁 Directory Structure

```
Healthcare_system/backend/src/
├── controllers/           # Business logic controllers
│   ├── UserController.js      # User authentication & management
│   ├── PatientController.js   # Patient-specific operations
│   └── EmployeeController.js  # Employee operations (all types)
├── models/               # Data models & schemas
│   ├── User.js               # Base user model
│   ├── Patient.js            # Patient model
│   ├── Doctor.js             # Doctor model
│   ├── Nurse.js              # Nurse model
│   ├── Pharmacist.js         # Pharmacist model
│   ├── HospitalStaff.js      # Hospital staff model
│   ├── HealthCareManager.js  # Healthcare manager model
│   └── SystemAdmin.js        # System admin model
├── routes/               # API route definitions
│   ├── auth.js               # Authentication routes
│   ├── userRoutes.js         # User management routes
│   ├── patientRoutes.js      # Patient-specific routes
│   └── employeeRoutes.js     # Employee-specific routes
├── middleware/           # Custom middleware
│   └── auth.js              # Authentication middleware
└── config/               # Configuration files
    └── db.js                # Database configuration
```

## 🎯 Controllers

### UserController

**Purpose**: Handles user authentication and general user operations
**Key Methods**:

- `authenticateUser()` - User login authentication
- `generateTokens()` - JWT token generation
- `verifyToken()` - Token verification
- `refreshToken()` - Token refresh
- `changePassword()` - Password change
- `getUserProfile()` - Get user profile
- `updateUserProfile()` - Update user profile

### PatientController

**Purpose**: Handles patient-specific operations
**Key Methods**:

- `registerPatient()` - Patient registration
- `loginPatient()` - Patient login
- `getPatientProfile()` - Get patient profile
- `updatePatientProfile()` - Update patient profile
- `viewMedicalRecords()` - View medical records
- `updateMedicalHistory()` - Update medical history
- `updateAllergies()` - Update allergies
- `getAllPatients()` - Get all patients (admin use)

### EmployeeController

**Purpose**: Handles all employee types (Doctor, Nurse, Pharmacist, etc.)
**Key Methods**:

- `registerEmployee()` - Employee registration
- `loginEmployee()` - Employee login
- `getEmployeeProfile()` - Get employee profile
- `updateEmployeeProfile()` - Update employee profile
- `getAllEmployees()` - Get employees by type
- `getEmployeeByEmpID()` - Get employee by ID
- `updateEmployeeStatus()` - Update employee status
- `getEmployeesByDepartment()` - Get employees by department

## 🛣️ Routes

### Authentication Routes (`/api/auth`)

- `POST /patient/register` - Patient registration
- `POST /patient/login` - Patient login
- `POST /authority/register` - Authority registration
- `POST /authority/login` - Authority login
- `POST /refresh-token` - Token refresh
- `POST /change-password` - Change password

### User Routes (`/api/user`)

- `POST /verify-token` - Verify JWT token
- `POST /refresh-token` - Refresh JWT token
- `POST /change-password` - Change password (authenticated)
- `GET /profile` - Get user profile (authenticated)
- `PUT /profile` - Update user profile (authenticated)
- `POST /logout` - Logout user

### Patient Routes (`/api/patient`)

- `POST /register` - Patient registration
- `POST /login` - Patient login
- `GET /profile` - Get patient profile (authenticated)
- `PUT /profile` - Update patient profile (authenticated)
- `GET /medical-records` - Get medical records (authenticated)
- `PUT /medical-history` - Update medical history (authenticated)
- `PUT /allergies` - Update allergies (authenticated)
- `GET /:patientId` - Get patient by ID (staff use)

### Employee Routes (`/api/employee`)

- `POST /doctor/register` - Doctor registration
- `POST /nurse/register` - Nurse registration
- `POST /pharmacist/register` - Pharmacist registration
- `POST /hospital-staff/register` - Hospital staff registration
- `POST /healthcare-manager/register` - Healthcare manager registration
- `POST /login` - Employee login (any type)
- `GET /profile` - Get employee profile (authenticated)
- `PUT /profile` - Update employee profile (authenticated)
- `GET /:employeeType` - Get all employees by type
- `GET /:employeeType/:empID` - Get employee by empID
- `PUT /:employeeType/:empID/status` - Update employee status

## 🔧 Models

### User Model (Base)

- Common properties: `name`, `email`, `password`, `userType`, `isActive`
- Authentication methods: password hashing, comparison
- Discriminator pattern for inheritance

### Patient Model

- Inherits from User
- Properties: `patientId`, `dateOfBirth`, `gender`, `contactInfo`, `address`, `medicalHistory`, `allergies`, `insuranceDetails`
- Methods: profile management, medical records

### Employee Models

All inherit from User and use `employeeBaseSchema`:

- **Doctor**: `specialization`, `availability`, `assignedHospitalID`, `phone`, `whatApp`, `preferredCommunicationMethod`
- **Nurse**: `assignedWard`, `shiftSchedule`
- **Pharmacist**: `licenseNumber`
- **HospitalStaff**: `role`, `assignedDepartment`, `shiftSchedule`
- **HealthCareManager**: `assignedHospital`
- **SystemAdmin**: Admin privileges

## 🔐 Authentication & Security

### JWT Implementation

- Access tokens (15 minutes)
- Refresh tokens (7 days)
- Secure token generation and verification
- Role-based access control

### Password Security

- bcrypt hashing with salt rounds
- Automatic password hashing in User model pre-save middleware
- Password validation requirements

### Route Protection

- `authenticateToken` middleware for protected routes
- Role-based route access
- Input validation and sanitization

## 🚀 Benefits of MVC Structure

1. **Separation of Concerns**: Clear separation between data (models), business logic (controllers), and routing (routes)
2. **Maintainability**: Easy to locate and modify specific functionality
3. **Scalability**: Easy to add new features without affecting existing code
4. **Testability**: Controllers can be easily unit tested
5. **Code Reusability**: Common functionality centralized in controllers
6. **SOLID Principles**: Follows Single Responsibility and other SOLID principles

## 📝 Usage Examples

### Register a Patient

```javascript
POST /api/patient/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "dateOfBirth": "1990-01-01",
  "gender": "male"
}
```

### Login as Doctor

```javascript
POST /api/employee/login
{
  "email": "doctor@hospital.com",
  "password": "SecurePass123",
  "userType": "doctor"
}
```

### Get Patient Profile (Authenticated)

```javascript
GET /api/patient/profile
Headers: { "Authorization": "Bearer <access_token>" }
```

## 🔄 Migration Notes

The old `auth.js` file has been simplified to maintain backward compatibility while new functionality uses the MVC structure. The system now supports:

- **Old routes**: `/api/auth/*` (simplified, for backward compatibility)
- **New routes**: `/api/user/*`, `/api/patient/*`, `/api/employee/*` (full MVC structure)

This allows for gradual migration and maintains existing functionality while providing the new organized structure.
