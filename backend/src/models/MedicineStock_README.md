# MedicineStock System Documentation

## Overview

The MedicineStock system is a comprehensive inventory management solution designed for healthcare pharmacies where pharmacists can manage medicine inventory, track stock levels, monitor expiry dates, and handle supplier information. The system follows SOLID principles and integrates seamlessly with the Pharmacist model.

## Model Structure

### MedicineStock Properties

| Property            | Type   | Required | Description                                    |
| ------------------- | ------ | -------- | ---------------------------------------------- |
| `medicineId`        | String | Yes      | Unique identifier (auto-generated)             |
| `name`              | String | Yes      | Medicine brand name                            |
| `genericName`       | String | No       | Generic name of the medicine                   |
| `quantityAvailable` | Number | Yes      | Current available quantity                     |
| `expiryDate`        | Date   | Yes      | Expiration date of the medicine                |
| `supplierInfo`      | Object | Yes      | Supplier information and contact details       |
| `medicineDetails`   | Object | Yes      | Medicine specifications and details            |
| `pricing`           | Object | Yes      | Cost and selling price information             |
| `stockManagement`   | Object | Yes      | Stock level thresholds and management settings |
| `stockHistory`      | Array  | No       | Complete history of stock transactions         |
| `location`          | Object | No       | Physical location within pharmacy              |
| `status`            | String | Yes      | Current status of the medicine                 |

### Supplier Information Structure

```javascript
supplierInfo: {
  supplierName: String,      // Name of the supplier
  supplierContact: {         // Contact details
    phone: String,
    email: String,
    address: String
  },
  supplierId: String,        // Unique supplier identifier
  contractNumber: String,    // Contract reference
  lastOrderDate: Date,       // Last order date
  nextOrderDate: Date        // Next expected order
}
```

### Medicine Details Structure

```javascript
medicineDetails: {
  dosageForm: String,        // tablet, capsule, syrup, etc.
  strength: String,          // e.g., "500mg"
  unit: String,             // mg, g, ml, l, units, pieces
  batchNumber: String,      // Manufacturing batch number
  manufacturingDate: Date,  // When medicine was manufactured
  category: String,         // prescription, over_the_counter, etc.
  prescriptionRequired: Boolean // Whether prescription is required
}
```

### Stock Management Structure

```javascript
stockManagement: {
  minimumStockLevel: Number, // Minimum quantity threshold
  maximumStockLevel: Number, // Maximum quantity threshold
  reorderPoint: Number,     // When to reorder
  reorderQuantity: Number,  // How much to reorder
  isLowStock: Boolean,      // Low stock flag
  isOutOfStock: Boolean,    // Out of stock flag
  isExpired: Boolean        // Expired flag
}
```

## Core Methods

### 1. updateStock(action, quantity, performedBy, performedByName, additionalData)

Updates medicine stock with comprehensive tracking and validation.

```javascript
const result = await medicine.updateStock(
  "stock_in",
  100,
  "PHARM001",
  "John Doe",
  {
    reason: "New stock delivery",
    batchNumber: "BATCH001",
    notes: "Received from supplier",
  }
);
```

**Supported Actions:**

- `stock_in` - Add stock to inventory
- `stock_out` - Remove stock (dispense to patient)
- `adjustment` - Direct quantity adjustment
- `damage` - Mark stock as damaged
- `return` - Return stock to inventory
- `expiry` - Mark stock as expired

### 2. checkAvailability(requiredQuantity, checkExpiry)

Checks if required quantity is available with comprehensive status information.

```javascript
const availability = await medicine.checkAvailability(10, true);
console.log(availability.isAvailable); // true/false
console.log(availability.availableQuantity); // Current quantity
console.log(availability.daysUntilExpiry); // Days until expiry
```

### 3. recordMedicine(medicineData)

Records new medicine or updates existing medicine details.

```javascript
const medicine = await medicine.recordMedicine({
  name: "Updated Medicine Name",
  quantityAvailable: 150,
  pricing: {
    costPrice: 1.5,
    sellingPrice: 3.0,
  },
});
```

## Integration with Pharmacist Model

### Pharmacist Methods for Medicine Stock Management

#### updateMedicineStock(medicineId, action, quantity, additionalData)

Universal method for updating medicine stock through pharmacist actions.

```javascript
const pharmacist = await Pharmacist.findOne({
  email: "pharmacist@hospital.com",
});
await pharmacist.updateMedicineStock("MED123", "stock_out", 5, {
  prescriptionId: "PRES001",
  patientId: "PAT001",
  reason: "Dispensed to patient",
});
```

#### checkMedicineAvailability(medicineId, requiredQuantity)

Checks medicine availability before dispensing.

```javascript
const availability = await pharmacist.checkMedicineAvailability("MED123", 10);
if (availability.isAvailable) {
  // Proceed with dispensing
}
```

#### recordNewMedicine(medicineData)

Records a new medicine in the inventory system.

```javascript
const newMedicine = await pharmacist.recordNewMedicine({
  name: "New Medicine",
  genericName: "Generic Name",
  quantityAvailable: 100,
  expiryDate: new Date("2025-12-31"),
  supplierInfo: {
    supplierName: "Supplier Co.",
    supplierContact: { phone: "+1234567890" },
  },
  medicineDetails: {
    dosageForm: "tablet",
    strength: "500mg",
    unit: "mg",
    category: "prescription",
  },
  pricing: {
    costPrice: 1.0,
    sellingPrice: 2.0,
  },
});
```

#### Stock Management Methods

- `addMedicineStock(medicineId, quantity, batchNumber, notes)`
- `reduceMedicineStock(medicineId, quantity, prescriptionId, patientId)`
- `adjustMedicineStock(medicineId, newQuantity, reason)`
- `markMedicineAsExpired(medicineId, quantity)`
- `markMedicineAsDamaged(medicineId, quantity, reason)`
- `returnMedicineStock(medicineId, quantity, reason)`

#### Monitoring and Reporting Methods

- `viewMedicineStock(medicineId)` - View current stock details
- `viewMedicineStockHistory(medicineId, filters)` - View stock transaction history
- `generateMedicineStockReport(medicineId)` - Generate comprehensive stock report
- `viewLowStockMedicines()` - Get medicines below minimum threshold
- `viewOutOfStockMedicines()` - Get medicines with zero quantity
- `viewExpiredMedicines()` - Get expired medicines
- `viewExpiringSoonMedicines(days)` - Get medicines expiring within specified days

#### Categorization and Search Methods

- `viewMedicinesByCategory(category)` - Filter by medicine category
- `viewMedicinesBySupplier(supplierId)` - Filter by supplier
- `getPharmacyStockStatistics()` - Get overall pharmacy statistics

## Advanced Features

### Stock History Tracking

- Complete audit trail of all stock movements
- Transaction details including performer, reason, and timestamps
- Support for batch tracking and prescription linking
- Filterable history based on action, performer, date range

### Automated Status Management

- Automatic low stock detection based on minimum thresholds
- Expiry date monitoring and flagging
- Out of stock status tracking
- Status-based filtering and reporting

### Supplier Management

- Comprehensive supplier information tracking
- Contract and order date management
- Supplier-based medicine filtering
- Contact information management

### Pricing Management

- Cost price and selling price tracking
- Automatic margin calculation
- Price history and update tracking
- Financial reporting capabilities

### Location Management

- Physical location tracking within pharmacy
- Shelf, rack, and section organization
- Location-based inventory management
- Pharmacy-specific organization

## Database Indexes

The MedicineStock model includes optimized indexes for:

- `medicineId` (unique)
- `name` (for search functionality)
- `medicineDetails.category` (category filtering)
- `medicineDetails.dosageForm` (dosage form filtering)
- `supplierInfo.supplierId` (supplier filtering)
- `expiryDate` (expiry monitoring)
- `status` (status filtering)
- `isLowStock`, `isOutOfStock`, `isExpired` (alert flags)

## SOLID Principles Implementation

### Single Responsibility Principle (SRP)

- MedicineStock model handles only inventory management functionality
- Pharmacist model handles pharmacist-specific inventory operations
- Clear separation of concerns between stock management and user management

### Open/Closed Principle (OCP)

- New stock actions can be added without modifying existing code
- New medicine categories and dosage forms can be added through configuration
- Extensible stock management system

### Liskov Substitution Principle (LSP)

- All stock management methods maintain consistent interfaces
- Subclasses can be substituted without breaking functionality
- Consistent error handling and return types

### Interface Segregation Principle (ISP)

- Each model only exposes methods relevant to its specific role
- Pharmacist has focused methods for stock management
- No unnecessary dependencies between models

### Dependency Inversion Principle (DIP)

- Models depend on abstractions rather than concrete implementations
- Dynamic imports prevent circular dependencies
- Service abstraction for external integrations

## Usage Examples

### Complete Stock Management Workflow

```javascript
// 1. Record new medicine
const pharmacist = await Pharmacist.findOne({
  email: "pharmacist@hospital.com",
});
const medicine = await pharmacist.recordNewMedicine({
  name: "Paracetamol",
  quantityAvailable: 100,
  expiryDate: new Date("2025-12-31"),
  supplierInfo: { supplierName: "MedSupply Co." },
  medicineDetails: { dosageForm: "tablet", category: "over_the_counter" },
  pricing: { costPrice: 0.5, sellingPrice: 1.0 },
});

// 2. Add more stock
await pharmacist.addMedicineStock(
  medicine.medicineId,
  200,
  "BATCH001",
  "New delivery"
);

// 3. Check availability before dispensing
const availability = await pharmacist.checkMedicineAvailability(
  medicine.medicineId,
  10
);

// 4. Dispense to patient
if (availability.isAvailable) {
  await pharmacist.reduceMedicineStock(
    medicine.medicineId,
    5,
    "PRES001",
    "PAT001"
  );
}

// 5. Generate stock report
const report = await pharmacist.generateMedicineStockReport(
  medicine.medicineId
);

// 6. Monitor low stock
const lowStockMedicines = await pharmacist.viewLowStockMedicines();
```

### Stock Monitoring and Alerts

```javascript
// Check expiring medicines
const expiringSoon = await pharmacist.viewExpiringSoonMedicines(30);
console.log(`Medicines expiring in 30 days: ${expiringSoon.length}`);

// Check low stock
const lowStock = await pharmacist.viewLowStockMedicines();
console.log(`Low stock medicines: ${lowStock.length}`);

// Get overall statistics
const stats = await pharmacist.getPharmacyStockStatistics();
console.log(`Total medicines: ${stats.totalMedicines}`);
console.log(`Total stock value: $${stats.totalStockValue}`);
```

## Error Handling

The system includes comprehensive error handling:

- Insufficient stock validation before dispensing
- Expired medicine detection and blocking
- Invalid action prevention
- Comprehensive error messages for debugging
- Graceful handling of edge cases

## Best Practices

1. **Always check availability** before dispensing medicines
2. **Use appropriate stock levels** based on demand patterns
3. **Monitor expiry dates** regularly to prevent expired dispensing
4. **Maintain accurate stock history** for audit purposes
5. **Regular stock audits** to ensure accuracy
6. **Proper supplier management** for procurement
7. **Location organization** for efficient inventory management
8. **Regular monitoring** of low stock and expiring medicines

## Performance Considerations

- Indexed fields for fast queries
- Efficient aggregation pipelines for statistics
- Optimized stock history filtering
- Batch operations for bulk updates
- Cached status flags for quick checks

This MedicineStock system provides a robust, scalable solution for managing pharmaceutical inventory in healthcare environments while maintaining high code quality through SOLID principles and comprehensive functionality for pharmacists.
