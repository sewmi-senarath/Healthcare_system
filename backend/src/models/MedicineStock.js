import mongoose from 'mongoose';

/**
 * MedicineStock Model - Following Single Responsibility Principle
 * Responsible only for medicine inventory management functionality
 * Handles medicine stock tracking, availability, and supplier information
 */
const medicineStockSchema = new mongoose.Schema({
  medicineId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  genericName: {
    type: String,
    trim: true
  },
  quantityAvailable: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  expiryDate: {
    type: Date,
    required: true
  },
  supplierInfo: {
    supplierName: {
      type: String,
      required: true
    },
    supplierContact: {
      phone: String,
      email: String,
      address: String
    },
    supplierId: String,
    contractNumber: String,
    lastOrderDate: Date,
    nextOrderDate: Date
  },
  medicineDetails: {
    dosageForm: {
      type: String,
      enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'drops', 'inhaler', 'patch'],
      required: true
    },
    strength: String, // e.g., "500mg", "10ml"
    unit: {
      type: String,
      enum: ['mg', 'g', 'ml', 'l', 'units', 'pieces'],
      required: true
    },
    batchNumber: String,
    manufacturingDate: Date,
    category: {
      type: String,
      enum: ['prescription', 'over_the_counter', 'controlled_substance', 'vaccine', 'medical_device'],
      required: true
    },
    prescriptionRequired: {
      type: Boolean,
      default: true
    }
  },
  pricing: {
    costPrice: {
      type: Number,
      required: true,
      min: 0
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0
    },
    margin: Number,
    lastPriceUpdate: Date
  },
  stockManagement: {
    minimumStockLevel: {
      type: Number,
      required: true,
      default: 10
    },
    maximumStockLevel: {
      type: Number,
      required: true,
      default: 1000
    },
    reorderPoint: {
      type: Number,
      required: true,
      default: 20
    },
    reorderQuantity: {
      type: Number,
      required: true,
      default: 100
    },
    isLowStock: {
      type: Boolean,
      default: false
    },
    isOutOfStock: {
      type: Boolean,
      default: false
    },
    isExpired: {
      type: Boolean,
      default: false
    }
  },
  stockHistory: [{
    action: {
      type: String,
      enum: ['stock_in', 'stock_out', 'adjustment', 'expiry', 'damage', 'return'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    previousQuantity: Number,
    newQuantity: Number,
    performedBy: String,
    performedByName: String,
    reason: String,
    batchNumber: String,
    transactionDate: {
      type: Date,
      default: Date.now
    },
    notes: String,
    prescriptionId: String,
    patientId: String
  }],
  location: {
    shelfNumber: String,
    rackNumber: String,
    section: String,
    pharmacyId: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued', 'recalled'],
    default: 'active'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdBy: String,
  createdDate: {
    type: Date,
    default: Date.now
  }
});

// Instance methods - Interface Segregation Principle
medicineStockSchema.methods.updateStock = function(action, quantity, performedBy, performedByName, additionalData = {}) {
  const previousQuantity = this.quantityAvailable;
  let newQuantity = previousQuantity;
  
  // Calculate new quantity based on action
  switch (action) {
    case 'stock_in':
      newQuantity = previousQuantity + quantity;
      break;
    case 'stock_out':
      newQuantity = previousQuantity - quantity;
      if (newQuantity < 0) {
        throw new Error('Insufficient stock available');
      }
      break;
    case 'adjustment':
      newQuantity = quantity; // Direct adjustment
      break;
    case 'damage':
      newQuantity = previousQuantity - quantity;
      if (newQuantity < 0) {
        throw new Error('Cannot damage more than available stock');
      }
      break;
    case 'return':
      newQuantity = previousQuantity + quantity;
      break;
    case 'expiry':
      newQuantity = previousQuantity - quantity;
      if (newQuantity < 0) {
        throw new Error('Cannot expire more than available stock');
      }
      break;
    default:
      throw new Error('Invalid stock action');
  }
  
  // Create stock history record
  const stockRecord = {
    action: action,
    quantity: quantity,
    previousQuantity: previousQuantity,
    newQuantity: newQuantity,
    performedBy: performedBy,
    performedByName: performedByName,
    reason: additionalData.reason || '',
    batchNumber: additionalData.batchNumber || '',
    transactionDate: new Date(),
    notes: additionalData.notes || '',
    prescriptionId: additionalData.prescriptionId || '',
    patientId: additionalData.patientId || ''
  };
  
  // Update stock quantity
  this.quantityAvailable = newQuantity;
  this.lastUpdated = new Date();
  
  // Add to stock history
  this.stockHistory.push(stockRecord);
  
  // Update stock status flags
  this.updateStockStatus();
  
  return this.save().then(() => stockRecord);
};

medicineStockSchema.methods.checkAvailability = function(requiredQuantity = 1, checkExpiry = true) {
  const availability = {
    medicineId: this.medicineId,
    medicineName: this.name,
    requiredQuantity: requiredQuantity,
    availableQuantity: this.quantityAvailable,
    isAvailable: this.quantityAvailable >= requiredQuantity,
    isExpired: this.isExpired,
    isLowStock: this.isLowStock,
    isOutOfStock: this.isOutOfStock,
    expiryDate: this.expiryDate,
    daysUntilExpiry: this.getDaysUntilExpiry(),
    location: this.location,
    status: this.status
  };
  
  // Check if medicine is expired
  if (checkExpiry && this.isExpired) {
    availability.isAvailable = false;
    availability.reason = 'Medicine is expired';
  }
  
  // Check if medicine is active
  if (this.status !== 'active') {
    availability.isAvailable = false;
    availability.reason = `Medicine is ${this.status}`;
  }
  
  // Check if required quantity is available
  if (!availability.isAvailable && availability.reason === undefined) {
    availability.reason = `Insufficient stock. Available: ${this.quantityAvailable}, Required: ${requiredQuantity}`;
  }
  
  return availability;
};

medicineStockSchema.methods.recordMedicine = function(medicineData) {
  // Update medicine details
  const updates = {
    name: medicineData.name || this.name,
    genericName: medicineData.genericName || this.genericName,
    quantityAvailable: medicineData.quantityAvailable || this.quantityAvailable,
    expiryDate: medicineData.expiryDate || this.expiryDate,
    supplierInfo: { ...this.supplierInfo, ...medicineData.supplierInfo },
    medicineDetails: { ...this.medicineDetails, ...medicineData.medicineDetails },
    pricing: { ...this.pricing, ...medicineData.pricing },
    stockManagement: { ...this.stockManagement, ...medicineData.stockManagement },
    location: { ...this.location, ...medicineData.location },
    status: medicineData.status || this.status
  };
  
  // Update fields
  Object.assign(this, updates);
  this.lastUpdated = new Date();
  
  // Update stock status
  this.updateStockStatus();
  
  // Add to stock history if quantity changed
  if (medicineData.quantityAvailable !== undefined && medicineData.quantityAvailable !== this.quantityAvailable) {
    const quantityChange = medicineData.quantityAvailable - this.quantityAvailable;
    this.stockHistory.push({
      action: quantityChange > 0 ? 'stock_in' : 'adjustment',
      quantity: Math.abs(quantityChange),
      previousQuantity: this.quantityAvailable,
      newQuantity: medicineData.quantityAvailable,
      performedBy: medicineData.performedBy || 'system',
      performedByName: medicineData.performedByName || 'System',
      reason: 'Medicine record updated',
      transactionDate: new Date(),
      notes: medicineData.notes || 'Medicine details updated'
    });
  }
  
  return this.save();
};

medicineStockSchema.methods.updateStockStatus = function() {
  // Check if expired
  this.isExpired = new Date() > this.expiryDate;
  
  // Check if out of stock
  this.isOutOfStock = this.quantityAvailable <= 0;
  
  // Check if low stock
  this.isLowStock = this.quantityAvailable <= this.stockManagement.minimumStockLevel;
  
  // Update status based on conditions
  if (this.isExpired) {
    this.status = 'inactive';
  } else if (this.quantityAvailable <= 0) {
    this.status = 'active'; // Keep active even if out of stock
  } else if (this.status === 'inactive' && !this.isExpired) {
    this.status = 'active';
  }
};

medicineStockSchema.methods.getDaysUntilExpiry = function() {
  const today = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

medicineStockSchema.methods.addStock = function(quantity, performedBy, performedByName, additionalData = {}) {
  return this.updateStock('stock_in', quantity, performedBy, performedByName, {
    reason: 'Stock addition',
    ...additionalData
  });
};

medicineStockSchema.methods.reduceStock = function(quantity, performedBy, performedByName, additionalData = {}) {
  return this.updateStock('stock_out', quantity, performedBy, performedByName, {
    reason: 'Stock deduction',
    ...additionalData
  });
};

medicineStockSchema.methods.adjustStock = function(newQuantity, performedBy, performedByName, reason = '') {
  return this.updateStock('adjustment', newQuantity, performedBy, performedByName, {
    reason: reason
  });
};

medicineStockSchema.methods.markAsExpired = function(quantity, performedBy, performedByName) {
  return this.updateStock('expiry', quantity, performedBy, performedByName, {
    reason: 'Medicine expired'
  });
};

medicineStockSchema.methods.markAsDamaged = function(quantity, performedBy, performedByName, reason = '') {
  return this.updateStock('damage', quantity, performedBy, performedByName, {
    reason: `Damaged: ${reason}`
  });
};

medicineStockSchema.methods.returnStock = function(quantity, performedBy, performedByName, reason = '') {
  return this.updateStock('return', quantity, performedBy, performedByName, {
    reason: `Return: ${reason}`
  });
};

medicineStockSchema.methods.getStockHistory = function(filters = {}) {
  let history = this.stockHistory;
  
  // Apply filters
  if (filters.action) {
    history = history.filter(record => record.action === filters.action);
  }
  
  if (filters.performedBy) {
    history = history.filter(record => record.performedBy === filters.performedBy);
  }
  
  if (filters.dateFrom) {
    history = history.filter(record => record.transactionDate >= new Date(filters.dateFrom));
  }
  
  if (filters.dateTo) {
    history = history.filter(record => record.transactionDate <= new Date(filters.dateTo));
  }
  
  // Sort by transaction date (newest first)
  history.sort((a, b) => b.transactionDate - a.transactionDate);
  
  return history;
};

medicineStockSchema.methods.generateStockReport = function() {
  const totalStockIn = this.stockHistory
    .filter(record => record.action === 'stock_in')
    .reduce((sum, record) => sum + record.quantity, 0);
  
  const totalStockOut = this.stockHistory
    .filter(record => ['stock_out', 'expiry', 'damage'].includes(record.action))
    .reduce((sum, record) => sum + record.quantity, 0);
  
  const totalReturns = this.stockHistory
    .filter(record => record.action === 'return')
    .reduce((sum, record) => sum + record.quantity, 0);
  
  return {
    medicineId: this.medicineId,
    medicineName: this.name,
    currentStock: this.quantityAvailable,
    totalStockIn: totalStockIn,
    totalStockOut: totalStockOut,
    totalReturns: totalReturns,
    netStockMovement: totalStockIn - totalStockOut + totalReturns,
    isLowStock: this.isLowStock,
    isOutOfStock: this.isOutOfStock,
    isExpired: this.isExpired,
    daysUntilExpiry: this.getDaysUntilExpiry(),
    stockStatus: this.status,
    lastUpdated: this.lastUpdated
  };
};

medicineStockSchema.methods.getMedicineDetails = function() {
  return {
    medicineId: this.medicineId,
    name: this.name,
    genericName: this.genericName,
    quantityAvailable: this.quantityAvailable,
    expiryDate: this.expiryDate,
    supplierInfo: this.supplierInfo,
    medicineDetails: this.medicineDetails,
    pricing: this.pricing,
    stockManagement: this.stockManagement,
    location: this.location,
    status: this.status,
    lastUpdated: this.lastUpdated
  };
};

// Static methods
medicineStockSchema.statics.findByMedicineId = function(medicineId) {
  return this.findOne({ medicineId });
};

medicineStockSchema.statics.findByMedicineName = function(name) {
  return this.find({ name: { $regex: name, $options: 'i' } });
};

medicineStockSchema.statics.findLowStock = function() {
  return this.find({ isLowStock: true, status: 'active' });
};

medicineStockSchema.statics.findOutOfStock = function() {
  return this.find({ isOutOfStock: true, status: 'active' });
};

medicineStockSchema.statics.findExpired = function() {
  return this.find({ isExpired: true });
};

medicineStockSchema.statics.findExpiringSoon = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    expiryDate: { $lte: futureDate, $gte: new Date() },
    status: 'active'
  });
};

medicineStockSchema.statics.findBySupplier = function(supplierId) {
  return this.find({ 'supplierInfo.supplierId': supplierId });
};

medicineStockSchema.statics.findByCategory = function(category) {
  return this.find({ 'medicineDetails.category': category, status: 'active' });
};

medicineStockSchema.statics.findByDosageForm = function(dosageForm) {
  return this.find({ 'medicineDetails.dosageForm': dosageForm, status: 'active' });
};

medicineStockSchema.statics.getStockStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalMedicines: { $sum: 1 },
        totalStockValue: { $sum: { $multiply: ['$quantityAvailable', '$pricing.costPrice'] } },
        lowStockCount: { $sum: { $cond: ['$isLowStock', 1, 0] } },
        outOfStockCount: { $sum: { $cond: ['$isOutOfStock', 1, 0] } },
        expiredCount: { $sum: { $cond: ['$isExpired', 1, 0] } },
        activeMedicines: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } }
      }
    }
  ]);
};

// Pre-save middleware
medicineStockSchema.pre('save', function(next) {
  // Generate medicine ID if not provided
  if (!this.medicineId) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 6);
    this.medicineId = `MED${timestamp.substring(6)}${random}`.toUpperCase();
  }
  
  // Update stock status
  this.updateStockStatus();
  
  // Update last updated timestamp
  this.lastUpdated = new Date();
  
  // Calculate margin if not provided
  if (this.pricing.costPrice && this.pricing.sellingPrice && !this.pricing.margin) {
    this.pricing.margin = this.pricing.sellingPrice - this.pricing.costPrice;
  }
  
  next();
});

// Indexes for better query performance
medicineStockSchema.index({ medicineId: 1 });
medicineStockSchema.index({ name: 1 });
medicineStockSchema.index({ 'medicineDetails.category': 1 });
medicineStockSchema.index({ 'medicineDetails.dosageForm': 1 });
medicineStockSchema.index({ 'supplierInfo.supplierId': 1 });
medicineStockSchema.index({ expiryDate: 1 });
medicineStockSchema.index({ status: 1 });
medicineStockSchema.index({ isLowStock: 1 });
medicineStockSchema.index({ isOutOfStock: 1 });
medicineStockSchema.index({ isExpired: 1 });

const MedicineStock = mongoose.model('MedicineStock', medicineStockSchema);

export default MedicineStock;
