/**
 * MedicineStock Usage Examples
 * Demonstrates how to use the MedicineStock system with Pharmacist integration
 */

import { MedicineStock, Pharmacist } from './index.js';

// Example: Creating and managing medicine stock
export async function createMedicineStockExample() {
  try {
    console.log('=== Creating Medicine Stock ===\n');

    // Create medicine stock record
    const medicineData = {
      name: 'Paracetamol',
      genericName: 'Acetaminophen',
      quantityAvailable: 100,
      expiryDate: new Date('2025-12-31'),
      supplierInfo: {
        supplierName: 'MedSupply Co.',
        supplierContact: {
          phone: '+1234567890',
          email: 'contact@medsupply.com',
          address: '123 Medical Supply St, City, State'
        },
        supplierId: 'SUPP001',
        contractNumber: 'CNT2024001'
      },
      medicineDetails: {
        dosageForm: 'tablet',
        strength: '500mg',
        unit: 'mg',
        batchNumber: 'BATCH001',
        manufacturingDate: new Date('2024-01-01'),
        category: 'over_the_counter',
        prescriptionRequired: false
      },
      pricing: {
        costPrice: 0.50,
        sellingPrice: 1.00
      },
      stockManagement: {
        minimumStockLevel: 20,
        maximumStockLevel: 500,
        reorderPoint: 30,
        reorderQuantity: 200
      },
      location: {
        shelfNumber: 'A1',
        rackNumber: 'R1',
        section: 'OTC'
      }
    };

    const medicine = new MedicineStock(medicineData);
    await medicine.save();

    console.log('✅ Medicine stock created:', medicine.medicineId);
    console.log('📦 Medicine:', medicine.name);
    console.log('📊 Quantity:', medicine.quantityAvailable);
    console.log('📅 Expiry:', medicine.expiryDate.toDateString());
    console.log('🏷️ Batch:', medicine.medicineDetails.batchNumber);

    return medicine;
  } catch (error) {
    console.error('❌ Error creating medicine stock:', error);
    throw error;
  }
}

// Example: Pharmacist managing medicine stock
export async function pharmacistStockManagementExample() {
  try {
    console.log('\n=== Pharmacist Stock Management ===\n');

    // Find or create a pharmacist
    let pharmacist = await Pharmacist.findOne({ email: 'robert.wilson@hospital.com' });
    
    if (!pharmacist) {
      pharmacist = new Pharmacist({
        name: 'Robert Wilson',
        email: 'robert.wilson@hospital.com',
        password: 'pharmacistPassword123',
        empID: 'PHARM001',
        assignedPharmacy: {
          pharmacyId: 'PHARM001',
          pharmacyName: 'Hospital Pharmacy',
          location: 'Main Building - Ground Floor',
          type: 'hospital'
        }
      });
      await pharmacist.save();
    }

    // Create medicine stock
    const medicine = await createMedicineStockExample();
    console.log('🎫 Medicine ID:', medicine.medicineId);

    // 1. Check medicine availability
    console.log('\n1. Checking medicine availability...');
    const availability = await pharmacist.checkMedicineAvailability(medicine.medicineId, 10);
    console.log('📋 Availability check:', availability.isAvailable ? '✅ Available' : '❌ Not available');
    console.log('📊 Available quantity:', availability.availableQuantity);
    console.log('📅 Days until expiry:', availability.daysUntilExpiry);

    // 2. Add more stock
    console.log('\n2. Adding more stock...');
    await pharmacist.addMedicineStock(
      medicine.medicineId, 
      50, 
      'BATCH002', 
      'New stock delivery'
    );
    console.log('✅ Added 50 units to stock');

    // 3. View updated stock
    console.log('\n3. Viewing updated stock...');
    const updatedStock = await pharmacist.viewMedicineStock(medicine.medicineId);
    console.log('📦 Updated quantity:', updatedStock.quantityAvailable);

    // 4. Reduce stock (dispense to patient)
    console.log('\n4. Dispensing medicine to patient...');
    await pharmacist.reduceMedicineStock(
      medicine.medicineId, 
      5, 
      'PRES001', 
      'PAT001'
    );
    console.log('✅ Dispensed 5 units to patient');

    // 5. View stock history
    console.log('\n5. Viewing stock history...');
    const stockHistory = await pharmacist.viewMedicineStockHistory(medicine.medicineId);
    console.log('📜 Stock history entries:', stockHistory.length);
    stockHistory.slice(0, 3).forEach((entry, index) => {
      console.log(`   ${index + 1}. ${entry.action}: ${entry.quantity} units (${entry.transactionDate.toDateString()})`);
    });

    // 6. Generate stock report
    console.log('\n6. Generating stock report...');
    const stockReport = await pharmacist.generateMedicineStockReport(medicine.medicineId);
    console.log('📊 Stock Report:');
    console.log('   Current Stock:', stockReport.currentStock);
    console.log('   Total Stock In:', stockReport.totalStockIn);
    console.log('   Total Stock Out:', stockReport.totalStockOut);
    console.log('   Low Stock Alert:', stockReport.isLowStock ? '⚠️ Yes' : '✅ No');

    return { pharmacist, medicine };
  } catch (error) {
    console.error('❌ Error in pharmacist stock management:', error);
    throw error;
  }
}

// Example: Advanced stock operations
export async function advancedStockOperationsExample() {
  try {
    console.log('\n=== Advanced Stock Operations ===\n');

    const pharmacist = await Pharmacist.findOne({ email: 'robert.wilson@hospital.com' });
    if (!pharmacist) {
      throw new Error('Pharmacist not found');
    }

    // Create another medicine for advanced operations
    const medicineData = {
      name: 'Ibuprofen',
      genericName: 'Ibuprofen',
      quantityAvailable: 200,
      expiryDate: new Date('2025-06-30'),
      supplierInfo: {
        supplierName: 'PharmaSupply Ltd.',
        supplierContact: {
          phone: '+1987654321',
          email: 'orders@pharmasupply.com'
        },
        supplierId: 'SUPP002'
      },
      medicineDetails: {
        dosageForm: 'tablet',
        strength: '400mg',
        unit: 'mg',
        category: 'prescription',
        prescriptionRequired: true
      },
      pricing: {
        costPrice: 0.75,
        sellingPrice: 1.50
      },
      stockManagement: {
        minimumStockLevel: 50,
        maximumStockLevel: 1000,
        reorderPoint: 75,
        reorderQuantity: 300
      }
    };

    const medicine = await pharmacist.recordNewMedicine(medicineData);
    console.log('✅ Created new medicine:', medicine.medicineId);

    // 1. Stock adjustment
    console.log('\n1. Adjusting stock...');
    await pharmacist.adjustMedicineStock(medicine.medicineId, 150, 'Inventory count adjustment');
    console.log('✅ Adjusted stock to 150 units');

    // 2. Mark some medicine as damaged
    console.log('\n2. Marking damaged medicine...');
    await pharmacist.markMedicineAsDamaged(medicine.medicineId, 5, 'Broken tablets during transport');
    console.log('✅ Marked 5 units as damaged');

    // 3. Return some medicine
    console.log('\n3. Processing medicine return...');
    await pharmacist.returnMedicineStock(medicine.medicineId, 3, 'Patient returned unused medicine');
    console.log('✅ Returned 3 units to stock');

    // 4. Check final availability
    console.log('\n4. Checking final availability...');
    const finalAvailability = await pharmacist.checkMedicineAvailability(medicine.medicineId, 10);
    console.log('📋 Final availability:', finalAvailability.isAvailable ? '✅ Available' : '❌ Not available');
    console.log('📊 Final quantity:', finalAvailability.availableQuantity);

    return { pharmacist, medicine };
  } catch (error) {
    console.error('❌ Error in advanced stock operations:', error);
    throw error;
  }
}

// Example: Stock monitoring and alerts
export async function stockMonitoringExample() {
  try {
    console.log('\n=== Stock Monitoring and Alerts ===\n');

    const pharmacist = await Pharmacist.findOne({ email: 'robert.wilson@hospital.com' });
    if (!pharmacist) {
      throw new Error('Pharmacist not found');
    }

    // 1. Check low stock medicines
    console.log('1. Checking low stock medicines...');
    const lowStockMedicines = await pharmacist.viewLowStockMedicines();
    console.log('⚠️ Low stock medicines:', lowStockMedicines.length);
    lowStockMedicines.forEach((medicine, index) => {
      console.log(`   ${index + 1}. ${medicine.name}: ${medicine.quantityAvailable} units`);
    });

    // 2. Check out of stock medicines
    console.log('\n2. Checking out of stock medicines...');
    const outOfStockMedicines = await pharmacist.viewOutOfStockMedicines();
    console.log('❌ Out of stock medicines:', outOfStockMedicines.length);
    outOfStockMedicines.forEach((medicine, index) => {
      console.log(`   ${index + 1}. ${medicine.name}: ${medicine.quantityAvailable} units`);
    });

    // 3. Check expired medicines
    console.log('\n3. Checking expired medicines...');
    const expiredMedicines = await pharmacist.viewExpiredMedicines();
    console.log('💀 Expired medicines:', expiredMedicines.length);
    expiredMedicines.forEach((medicine, index) => {
      console.log(`   ${index + 1}. ${medicine.name}: Expired on ${medicine.expiryDate.toDateString()}`);
    });

    // 4. Check medicines expiring soon
    console.log('\n4. Checking medicines expiring soon (30 days)...');
    const expiringSoonMedicines = await pharmacist.viewExpiringSoonMedicines(30);
    console.log('⏰ Medicines expiring soon:', expiringSoonMedicines.length);
    expiringSoonMedicines.forEach((medicine, index) => {
      const daysUntilExpiry = Math.ceil((new Date(medicine.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      console.log(`   ${index + 1}. ${medicine.name}: ${daysUntilExpiry} days until expiry`);
    });

    // 5. Get pharmacy stock statistics
    console.log('\n5. Getting pharmacy stock statistics...');
    const statistics = await pharmacist.getPharmacyStockStatistics();
    console.log('📊 Pharmacy Stock Statistics:');
    console.log('   Total Medicines:', statistics.totalMedicines);
    console.log('   Total Stock Value: $', statistics.totalStockValue?.toFixed(2));
    console.log('   Low Stock Count:', statistics.lowStockCount);
    console.log('   Out of Stock Count:', statistics.outOfStockCount);
    console.log('   Expired Count:', statistics.expiredCount);
    console.log('   Active Medicines:', statistics.activeMedicines);

    return { pharmacist, statistics };
  } catch (error) {
    console.error('❌ Error in stock monitoring:', error);
    throw error;
  }
}

// Example: Medicine categorization and search
export async function medicineCategorizationExample() {
  try {
    console.log('\n=== Medicine Categorization and Search ===\n');

    const pharmacist = await Pharmacist.findOne({ email: 'robert.wilson@hospital.com' });
    if (!pharmacist) {
      throw new Error('Pharmacist not found');
    }

    // 1. View medicines by category
    console.log('1. Viewing prescription medicines...');
    const prescriptionMedicines = await pharmacist.viewMedicinesByCategory('prescription');
    console.log('💊 Prescription medicines:', prescriptionMedicines.length);
    prescriptionMedicines.forEach((medicine, index) => {
      console.log(`   ${index + 1}. ${medicine.name} (${medicine.medicineDetails.strength})`);
    });

    // 2. View over-the-counter medicines
    console.log('\n2. Viewing over-the-counter medicines...');
    const otcMedicines = await pharmacist.viewMedicinesByCategory('over_the_counter');
    console.log('🏪 OTC medicines:', otcMedicines.length);
    otcMedicines.forEach((medicine, index) => {
      console.log(`   ${index + 1}. ${medicine.name} (${medicine.medicineDetails.strength})`);
    });

    // 3. View medicines by supplier
    console.log('\n3. Viewing medicines by supplier...');
    const supplierMedicines = await pharmacist.viewMedicinesBySupplier('SUPP001');
    console.log('🚚 Medicines from supplier SUPP001:', supplierMedicines.length);
    supplierMedicines.forEach((medicine, index) => {
      console.log(`   ${index + 1}. ${medicine.name}`);
    });

    return { pharmacist };
  } catch (error) {
    console.error('❌ Error in medicine categorization:', error);
    throw error;
  }
}

// Example: Complete medicine lifecycle
export async function completeMedicineLifecycleExample() {
  try {
    console.log('\n=== Complete Medicine Lifecycle ===\n');

    const pharmacist = await Pharmacist.findOne({ email: 'robert.wilson@hospital.com' });
    if (!pharmacist) {
      throw new Error('Pharmacist not found');
    }

    // Step 1: Record new medicine
    console.log('1️⃣ Recording new medicine...');
    const medicineData = {
      name: 'Amoxicillin',
      genericName: 'Amoxicillin',
      quantityAvailable: 100,
      expiryDate: new Date('2025-03-31'),
      supplierInfo: {
        supplierName: 'Antibiotics Supply Co.',
        supplierContact: {
          phone: '+1555123456',
          email: 'orders@antibiotics.com'
        },
        supplierId: 'SUPP003'
      },
      medicineDetails: {
        dosageForm: 'capsule',
        strength: '500mg',
        unit: 'mg',
        category: 'prescription',
        prescriptionRequired: true
      },
      pricing: {
        costPrice: 2.00,
        sellingPrice: 4.00
      },
      stockManagement: {
        minimumStockLevel: 25,
        maximumStockLevel: 500,
        reorderPoint: 40,
        reorderQuantity: 200
      }
    };

    const medicine = await pharmacist.recordNewMedicine(medicineData);
    console.log('✅ Medicine recorded:', medicine.medicineId);

    // Step 2: Add initial stock
    console.log('\n2️⃣ Adding initial stock...');
    await pharmacist.addMedicineStock(medicine.medicineId, 200, 'BATCH003', 'Initial stock delivery');
    console.log('✅ Initial stock added');

    // Step 3: Dispense to patients
    console.log('\n3️⃣ Dispensing to patients...');
    await pharmacist.reduceMedicineStock(medicine.medicineId, 15, 'PRES002', 'PAT002');
    await pharmacist.reduceMedicineStock(medicine.medicineId, 10, 'PRES003', 'PAT003');
    console.log('✅ Dispensed to 2 patients');

    // Step 4: Handle returns
    console.log('\n4️⃣ Processing returns...');
    await pharmacist.returnMedicineStock(medicine.medicineId, 2, 'Patient had allergic reaction');
    console.log('✅ Processed return');

    // Step 5: Handle damage
    console.log('\n5️⃣ Handling damaged stock...');
    await pharmacist.markMedicineAsDamaged(medicine.medicineId, 3, 'Capsules damaged in storage');
    console.log('✅ Marked damaged stock');

    // Step 6: Check final status
    console.log('\n6️⃣ Checking final status...');
    const finalStock = await pharmacist.viewMedicineStock(medicine.medicineId);
    const finalReport = await pharmacist.generateMedicineStockReport(medicine.medicineId);
    
    console.log('📊 Final Medicine Status:');
    console.log('   Current Stock:', finalStock.quantityAvailable);
    console.log('   Low Stock Alert:', finalReport.isLowStock ? '⚠️ Yes' : '✅ No');
    console.log('   Total Stock In:', finalReport.totalStockIn);
    console.log('   Total Stock Out:', finalReport.totalStockOut);
    console.log('   Net Movement:', finalReport.netStockMovement);

    console.log('\n🎉 Complete medicine lifecycle finished successfully!');

    return { pharmacist, medicine, finalReport };
  } catch (error) {
    console.error('❌ Error in complete medicine lifecycle:', error);
    throw error;
  }
}

// Run all examples
export async function runAllMedicineStockExamples() {
  try {
    console.log('🚀 Starting MedicineStock Examples...\n');
    
    await createMedicineStockExample();
    await pharmacistStockManagementExample();
    await advancedStockOperationsExample();
    await stockMonitoringExample();
    await medicineCategorizationExample();
    await completeMedicineLifecycleExample();
    
    console.log('\n🎉 All MedicineStock examples completed successfully!');
  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
}

// Export all example functions
export default {
  createMedicineStockExample,
  pharmacistStockManagementExample,
  advancedStockOperationsExample,
  stockMonitoringExample,
  medicineCategorizationExample,
  completeMedicineLifecycleExample,
  runAllMedicineStockExamples
};
