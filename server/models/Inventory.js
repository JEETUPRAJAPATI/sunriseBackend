import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  itemCode: {
    type: String,
    required: true,
    unique: true
  },
  itemName: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    required: true,
    enum: ['Raw Material', 'Work in Progress', 'Finished Goods', 'Consumables', 'Tools']
  },
  unit: {
    type: String,
    required: true
  },
  currentStock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  minStockLevel: {
    type: Number,
    required: true,
    default: 10,
    min: 0
  },
  maxStockLevel: {
    type: Number,
    required: true,
    default: 1000,
    min: 0
  },
  reorderPoint: {
    type: Number,
    required: true,
    default: 20,
    min: 0
  },
  costPrice: {
    type: Number,
    required: true,
    min: 0
  },
  sellingPrice: {
    type: Number,
    min: 0
  },
  location: {
    warehouse: {
      type: String,
      required: true
    },
    rack: String,
    bin: String
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  unitName: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  batchTracking: {
    type: Boolean,
    default: false
  },
  expiryTracking: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const stockMovementSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true
  },
  movementType: {
    type: String,
    enum: ['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  previousStock: {
    type: Number,
    required: true
  },
  newStock: {
    type: Number,
    required: true
  },
  reference: {
    type: String,
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  batchNumber: {
    type: String
  },
  expiryDate: {
    type: Date
  },
  unit: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

export const Inventory = mongoose.model('Inventory', inventorySchema);
export const StockMovement = mongoose.model('StockMovement', stockMovementSchema);
