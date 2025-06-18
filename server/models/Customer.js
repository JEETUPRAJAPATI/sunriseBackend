import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  customerCode: {
    type: String,
    required: true,
    unique: true
  },
  customerName: {
    type: String,
    required: true
  },
  contactPerson: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  alternatePhone: {
    type: String
  },
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'India'
    }
  },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  gstNumber: {
    type: String
  },
  panNumber: {
    type: String
  },
  creditLimit: {
    type: Number,
    default: 0,
    min: 0
  },
  creditDays: {
    type: Number,
    default: 30,
    min: 0
  },
  unit: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  customerType: {
    type: String,
    enum: ['Regular', 'VIP', 'Wholesale', 'Retail'],
    default: 'Regular'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

customerSchema.pre('save', function(next) {
  if (!this.customerCode) {
    this.customerCode = `CUST-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  
  // Copy address to billing address if not provided
  if (!this.billingAddress.street) {
    this.billingAddress = { ...this.address };
  }
  
  next();
});

export default mongoose.model('Customer', customerSchema);
