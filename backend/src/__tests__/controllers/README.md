# Controller Tests - Reorganized Structure

This directory contains comprehensive unit tests for all controller files, organized into smaller, focused test files for better maintainability and easier debugging.

## New Test Structure

```
src/__tests__/controllers/
├── UserController/
│   ├── UserController.auth.test.js      # Authentication & login tests
│   ├── UserController.tokens.test.js    # JWT token management tests
│   └── UserController.profile.test.js   # Profile management tests
├── PatientController/
│   ├── PatientController.registration.test.js  # Registration & login tests
│   └── PatientController.profile.test.js       # Profile & medical records tests
├── AppointmentController/
│   ├── AppointmentController.core.test.js      # Department & doctor operations
│   └── AppointmentController.booking.test.js   # Booking & workflow tests
├── AppointmentBookingController/
│   └── AppointmentBookingController.test.js    # Detailed booking logic tests
├── PrescriptionController/
│   └── PrescriptionController.test.js          # Prescription management tests
├── EmployeeController/
│   └── EmployeeController.test.js              # Employee management tests
└── README.md                                   # This documentation
```

## Benefits of New Structure

### 🎯 **Focused Testing**

- Each test file focuses on a specific aspect of functionality
- Easier to identify and fix issues
- Better test organization and readability

### 🔍 **Easier Debugging**

- Smaller test files are easier to navigate
- Faster test execution for specific features
- Clear separation of concerns

### 📊 **Better Coverage Tracking**

- Individual coverage reports per feature area
- Easier to identify uncovered code paths
- Targeted test improvements

### 🚀 **Improved Performance**

- Run only relevant tests during development
- Faster feedback loops
- Parallel test execution

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Controller Tests

```bash
# UserController authentication tests only
npm test -- UserController.auth.test.js

# PatientController registration tests only
npm test -- PatientController.registration.test.js

# All UserController tests
npm test -- UserController/

# All PatientController tests
npm test -- PatientController/
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

## Test Categories

### UserController Tests

- **Authentication** (`UserController.auth.test.js`)

  - User login/logout
  - Email existence checking
  - Authentication flows
  - Error handling

- **Token Management** (`UserController.tokens.test.js`)

  - JWT token generation
  - Token verification
  - Token refresh
  - Security scenarios

- **Profile Management** (`UserController.profile.test.js`)
  - Password changes
  - Profile updates
  - User data retrieval
  - Validation

### PatientController Tests

- **Registration** (`PatientController.registration.test.js`)

  - Patient registration
  - Login functionality
  - Email validation
  - Data validation

- **Profile Management** (`PatientController.profile.test.js`)
  - Profile updates
  - Medical records
  - Allergies management
  - Patient search

### AppointmentController Tests

- **Core Operations** (`AppointmentController.core.test.js`)

  - Department retrieval
  - Doctor listings
  - Doctor details
  - Legacy mock methods

- **Booking Operations** (`AppointmentController.booking.test.js`)
  - Slot availability
  - Appointment booking
  - Approval workflows
  - Payment processing
  - Notifications

## Test File Guidelines

### File Naming Convention

- `ControllerName.feature.test.js` - Feature-specific tests
- Use descriptive names that indicate the test scope
- Group related functionality together

### Test Structure

```javascript
describe("ControllerName - Feature", () => {
  beforeEach(() => {
    // Setup mocks and test data
  });

  describe("Method Name", () => {
    describe("Positive Cases", () => {
      test("should handle valid input", async () => {
        // Arrange
        // Act
        // Assert
      });
    });

    describe("Negative Cases", () => {
      test("should handle invalid input", async () => {
        // Arrange
        // Act
        // Assert
      });
    });

    describe("Error Cases", () => {
      test("should handle errors gracefully", async () => {
        // Arrange
        // Act
        // Assert
      });
    });
  });
});
```

## Migration from Old Structure

The old large test files have been broken down as follows:

- `UserController.test.js` → 3 focused files
- `PatientController.test.js` → 2 focused files
- `AppointmentController.test.js` → 2 focused files
- Other files remain as single focused files

## Best Practices

### Test Organization

- ✅ One test file per major feature area
- ✅ Clear describe() and test() block structure
- ✅ Descriptive test names
- ✅ Logical grouping of related tests

### Mock Management

- ✅ Consistent mock setup across test files
- ✅ Proper mock cleanup between tests
- ✅ Realistic mock data and behavior

### Assertions

- ✅ Meaningful assertions with clear error messages
- ✅ Response structure validation
- ✅ Data integrity checks
- ✅ Error message verification

## Debugging Tips

### Common Issues

1. **Test file too large** - Break into smaller, focused files
2. **Mock not working** - Check import statements and mock setup
3. **Database errors** - Verify mock model configuration
4. **Timeout errors** - Check for infinite loops or async issues

### Debug Commands

```bash
# Run single test file with verbose output
npm test -- --verbose UserController.auth.test.js

# Run specific test pattern
npm test -- --testNamePattern="should authenticate user"

# Run with coverage for specific file
npm run test:coverage -- UserController.auth.test.js
```

## Future Improvements

- Add integration tests for cross-controller workflows
- Implement performance tests for critical paths
- Add visual regression tests for UI components
- Expand error scenario coverage
- Add stress testing for high-load scenarios

For additional help or questions about the test structure, please refer to the main project documentation.
