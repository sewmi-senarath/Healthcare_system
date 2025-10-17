# SOLID Principles Implementation in Healthcare System Models

This document explains how the SOLID principles are implemented throughout the healthcare system models.

## 1. Single Responsibility Principle (SRP)

Each model has a single, well-defined responsibility:

- **User**: Manages core user authentication and basic profile information
- **Patient**: Handles patient-specific data and medical-related operations
- **SystemAdmin**: Manages system administration and user management
- **Employee**: Base class for all employee-related functionality
- **Doctor**: Handles doctor-specific operations like appointments and prescriptions
- **HospitalStaff**: Manages hospital staff operations and permissions
- **Nurse**: Handles nursing-specific operations and patient care
- **Pharmacist**: Manages pharmaceutical operations and medication dispensing
- **HealthCareManager**: Handles management operations and reporting

## 2. Open/Closed Principle (OCP)

The models are open for extension but closed for modification:

- **Inheritance Hierarchy**: New user types can be added by extending existing classes
- **Discriminator Pattern**: MongoDB discriminators allow adding new user types without modifying existing schemas
- **Method Extensions**: New functionality can be added through method overriding in subclasses
- **Plugin Architecture**: Additional features can be added through middleware functions

## 3. Liskov Substitution Principle (LSP)

Subclasses can be substituted for their base classes:

- **User Subclasses**: Patient, SystemAdmin, and Employee can all be used wherever User is expected
- **Employee Subclasses**: Doctor, HospitalStaff, Nurse, Pharmacist, and HealthCareManager can be used interchangeably as Employee instances
- **Method Compatibility**: All inherited methods maintain the same interface and behavior
- **Property Inheritance**: All subclasses properly inherit and extend base class properties

## 4. Interface Segregation Principle (ISP)

Clients are not forced to depend on interfaces they don't use:

- **Specific Methods**: Each model only exposes methods relevant to its functionality
- **No Fat Interfaces**: No model has methods that are not applicable to its specific use case
- **Focused APIs**: Each model provides a focused set of methods for its specific domain
- **Optional Dependencies**: Models don't require dependencies on unrelated functionality

## 5. Dependency Inversion Principle (DIP)

High-level modules don't depend on low-level modules:

- **Service Abstraction**: Models depend on service abstractions rather than concrete implementations
- **External Service Calls**: References to external services (appointments, payments, etc.) are abstracted
- **Configuration Injection**: Database connections and configurations are injected rather than hardcoded
- **Interface Dependencies**: Models depend on interfaces rather than concrete implementations

## Implementation Examples

### SRP Example - User Model

```javascript
// User model only handles core user functionality
userSchema.methods.login = async function (password) {
  // Only authentication logic
};

userSchema.methods.logout = function () {
  // Only logout logic
};
```

### OCP Example - Employee Inheritance

```javascript
// Employee base class
const employeeSchema = new mongoose.Schema({...});

// Doctor extends Employee without modifying Employee
const Doctor = Employee.discriminator('doctor', doctorSchema);
```

### LSP Example - Polymorphism

```javascript
// Any Employee subclass can be used as Employee
const employees = [new Doctor(), new Nurse(), new Pharmacist()];
employees.forEach((emp) => emp.getEmpID()); // Works for all
```

### ISP Example - Doctor Model

```javascript
// Doctor only has doctor-specific methods
doctorSchema.methods.createPrescription = function() {...};
doctorSchema.methods.viewAppointment = function() {...};
// No unrelated methods like manageInventory()
```

### DIP Example - Service Abstraction

```javascript
// Models depend on service abstractions, not concrete implementations
patientSchema.methods.bookAppointment = async function (appointmentData) {
  // Would call appointment service abstraction
  return appointmentService.create(appointmentData);
};
```

## Benefits of SOLID Implementation

1. **Maintainability**: Each model has a clear, single purpose
2. **Extensibility**: New user types can be added without modifying existing code
3. **Testability**: Each model can be tested independently
4. **Flexibility**: Models can be substituted and extended as needed
5. **Reduced Coupling**: Models depend on abstractions, not concrete implementations

## Best Practices Followed

- **Clear Separation of Concerns**: Each model handles only its specific domain
- **Consistent Interface Design**: All models follow similar patterns
- **Proper Inheritance**: Clean inheritance hierarchy without breaking contracts
- **Service Abstraction**: External dependencies are abstracted
- **Error Handling**: Consistent error handling patterns across models
- **Validation**: Proper data validation at the schema level
- **Documentation**: Clear documentation of methods and their purposes
