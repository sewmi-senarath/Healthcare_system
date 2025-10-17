# Comprehensive Unit Tests for Healthcare System Controllers

This directory contains comprehensive unit tests for all controller files in the healthcare system. The tests are designed to achieve >80% code coverage and include positive, negative, edge, and error cases.

## Test Structure

```
src/__tests__/
├── setup.js                          # Jest setup configuration
├── mocks/                            # Mock implementations
│   ├── models.js                     # Database model mocks
│   └── controllers.js                # Controller dependency mocks
├── helpers/                          # Test utility functions
│   └── testUtils.js                  # Common test utilities
├── controllers/                      # Controller test files
│   ├── UserController.test.js        # User authentication tests
│   ├── PatientController.test.js     # Patient management tests
│   ├── AppointmentController.test.js # Appointment booking tests
│   ├── AppointmentBookingController.test.js # Detailed booking tests
│   ├── PrescriptionController.test.js # Prescription management tests
│   └── EmployeeController.test.js    # Employee management tests
└── README.md                         # This documentation
```

## Test Coverage

### UserController Tests

- ✅ User authentication (login/logout)
- ✅ Email existence checking
- ✅ Token generation and verification
- ✅ Password management
- ✅ Profile management
- ✅ User registration
- ✅ Error handling for all operations

### PatientController Tests

- ✅ Patient registration
- ✅ Patient login
- ✅ Profile management
- ✅ Medical records management
- ✅ Dashboard statistics
- ✅ Recent activity tracking
- ✅ Patient search functionality
- ✅ Error handling for all operations

### AppointmentController Tests

- ✅ Department and doctor retrieval
- ✅ Appointment booking workflow
- ✅ Slot availability checking
- ✅ Appointment approval/decline
- ✅ Payment processing
- ✅ Notification sending
- ✅ Status management
- ✅ Error handling for all operations

### AppointmentBookingController Tests

- ✅ Available slot generation
- ✅ Slot reservation logic
- ✅ Appointment creation
- ✅ Conflict detection
- ✅ Doctor availability checking
- ✅ Time validation
- ✅ Error handling for all operations

### PrescriptionController Tests

- ✅ Prescription creation
- ✅ Medicine list management
- ✅ Status updates (pending, sent_to_pharmacy, dispensed, completed)
- ✅ Doctor and patient validation
- ✅ Prescription statistics
- ✅ Search functionality
- ✅ Error handling for all operations

### EmployeeController Tests

- ✅ Employee registration (all types: doctor, nurse, pharmacist, etc.)
- ✅ Employee authentication
- ✅ Profile management
- ✅ Status updates
- ✅ Dashboard statistics
- ✅ Employee search and filtering
- ✅ Bulk operations
- ✅ Error handling for all operations

## Test Categories

### Positive Cases

- ✅ Successful operations with valid data
- ✅ Expected responses and data structures
- ✅ Proper database interactions
- ✅ Correct status codes and messages

### Negative Cases

- ✅ Invalid input data
- ✅ Missing required fields
- ✅ Non-existent resources
- ✅ Unauthorized access attempts
- ✅ Business logic violations

### Edge Cases

- ✅ Boundary value testing
- ✅ Empty data sets
- ✅ Maximum/minimum values
- ✅ Special characters and formats
- ✅ Concurrent operations

### Error Cases

- ✅ Database connection failures
- ✅ Network timeouts
- ✅ External service failures
- ✅ Validation errors
- ✅ Authentication/authorization failures

## Mock Strategy

### Database Mocks

- All Mongoose models are mocked using Jest
- Consistent mock data generators for all entities
- Support for different query methods (findOne, find, save, etc.)
- Error simulation capabilities

### Controller Mocks

- External controller dependencies are mocked
- Authentication and authorization mocks
- Token generation and verification mocks
- Payment processing mocks

### Utility Mocks

- Date and time functions
- File upload handling
- Email sending services
- External API calls

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Specific Test File

```bash
npm test -- UserController.test.js
```

### Run Tests for Specific Pattern

```bash
npm test -- --testNamePattern="should successfully"
```

## Test Configuration

### Jest Configuration

- **Test Environment**: Node.js
- **Coverage Threshold**: 80% for branches, functions, lines, and statements
- **Test Timeout**: 30 seconds
- **Setup Files**: Automatic setup with mocks and environment variables

### Coverage Reports

- HTML coverage reports generated in `coverage/` directory
- Coverage thresholds enforced for CI/CD
- Detailed coverage analysis for each controller

## Best Practices Implemented

### Test Organization

- ✅ Clear describe() and test() block structure
- ✅ Descriptive test names
- ✅ Logical grouping of related tests
- ✅ Consistent test data setup

### Assertions

- ✅ Meaningful assertions with clear error messages
- ✅ Response structure validation
- ✅ Data integrity checks
- ✅ Error message verification

### Mock Management

- ✅ Comprehensive mock setup
- ✅ Mock cleanup between tests
- ✅ Consistent mock data
- ✅ Realistic mock behavior

### Error Testing

- ✅ Database error simulation
- ✅ Network error handling
- ✅ Validation error testing
- ✅ Authentication error scenarios

## Continuous Integration

### GitHub Actions

- Tests run on every pull request
- Coverage reports generated
- Test results published
- Failure notifications sent

### Coverage Requirements

- Minimum 80% line coverage
- Minimum 80% branch coverage
- Minimum 80% function coverage
- Minimum 80% statement coverage

## Debugging Tests

### Common Issues

1. **Mock not working**: Check if mock is properly imported and reset
2. **Database errors**: Verify mock setup and data structure
3. **Timeout errors**: Increase timeout or check for infinite loops
4. **Coverage issues**: Add tests for uncovered code paths

### Debug Commands

```bash
# Run single test with debug output
npm test -- --verbose UserController.test.js

# Run tests with detailed coverage
npm run test:coverage -- --verbose

# Debug specific test
npm test -- --testNamePattern="should register patient" --verbose
```

## Adding New Tests

### Test File Structure

```javascript
describe("ControllerName", () => {
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
      test("should handle database errors", async () => {
        // Arrange
        // Act
        // Assert
      });
    });
  });
});
```

### Test Data Guidelines

- Use consistent test data generators
- Include edge cases and boundary values
- Test with realistic data structures
- Cover all possible input combinations

## Performance Considerations

### Test Execution Time

- Individual test files: < 5 seconds
- Full test suite: < 2 minutes
- Coverage generation: < 30 seconds

### Memory Usage

- Mocks are lightweight and don't consume excessive memory
- Test data is generated on-demand
- Proper cleanup prevents memory leaks

## Maintenance

### Regular Updates

- Update tests when controllers change
- Add tests for new features
- Review and update mock data
- Maintain coverage thresholds

### Code Quality

- Follow consistent naming conventions
- Use meaningful test descriptions
- Keep tests focused and atomic
- Regular code review of test files

## Troubleshooting

### Common Problems and Solutions

1. **Tests failing intermittently**

   - Check for race conditions
   - Verify mock cleanup
   - Ensure proper async/await usage

2. **Low coverage scores**

   - Add tests for error paths
   - Test edge cases
   - Cover all conditional branches

3. **Mock not working as expected**

   - Verify mock setup
   - Check import statements
   - Reset mocks between tests

4. **Database-related test failures**
   - Verify mock model setup
   - Check data structure matches
   - Ensure proper query mocking

For additional help or questions about the test suite, please refer to the main project documentation or contact the development team.
