import Customer from '../models/Customer.js';
import { USER_ROLES } from '../../shared/schema.js';

export const getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, customerType, unit, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (req.user.role !== USER_ROLES.SUPER_USER) {
      query.unit = req.user.unit;
    } else if (unit) {
      query.unit = unit;
    }

    if (customerType) {
      query.customerType = customerType;
    }

    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerCode: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(query)
      .sort({ customerName: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Customer.countDocuments(query);

    res.json({
      customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (req.user.role !== USER_ROLES.SUPER_USER && customer.unit !== req.user.unit) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ customer });
  } catch (error) {
    console.error('Get customer by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const {
      customerName,
      contactPerson,
      email,
      phone,
      alternatePhone,
      address,
      billingAddress,
      gstNumber,
      panNumber,
      creditLimit,
      creditDays,
      customerType,
      notes
    } = req.body;

    if (!customerName || !contactPerson || !email || !phone || !address) {
      return res.status(400).json({ message: 'Customer name, contact person, email, phone, and address are required' });
    }

    // Check if email already exists
    const existingCustomer = await Customer.findOne({ email: email.toLowerCase() });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Customer with this email already exists' });
    }

    const customerData = {
      customerName,
      contactPerson,
      email: email.toLowerCase(),
      phone,
      alternatePhone,
      address,
      billingAddress: billingAddress || address,
      gstNumber,
      panNumber,
      creditLimit: creditLimit || 0,
      creditDays: creditDays || 30,
      unit: req.user.role === USER_ROLES.SUPER_USER ? req.body.unit : req.user.unit,
      customerType: customerType || 'Regular',
      notes
    };

    const customer = await Customer.create(customerData);

    res.status(201).json({
      message: 'Customer created successfully',
      customer
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customerName,
      contactPerson,
      email,
      phone,
      alternatePhone,
      address,
      billingAddress,
      gstNumber,
      panNumber,
      creditLimit,
      creditDays,
      customerType,
      isActive,
      notes
    } = req.body;

    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (req.user.role !== USER_ROLES.SUPER_USER && customer.unit !== req.user.unit) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if email already exists (excluding current customer)
    if (email && email !== customer.email) {
      const existingCustomer = await Customer.findOne({
        email: email.toLowerCase(),
        _id: { $ne: id }
      });
      if (existingCustomer) {
        return res.status(400).json({ message: 'Customer with this email already exists' });
      }
    }

    const updateData = {};
    if (customerName) updateData.customerName = customerName;
    if (contactPerson) updateData.contactPerson = contactPerson;
    if (email) updateData.email = email.toLowerCase();
    if (phone) updateData.phone = phone;
    if (alternatePhone !== undefined) updateData.alternatePhone = alternatePhone;
    if (address) updateData.address = address;
    if (billingAddress) updateData.billingAddress = billingAddress;
    if (gstNumber !== undefined) updateData.gstNumber = gstNumber;
    if (panNumber !== undefined) updateData.panNumber = panNumber;
    if (creditLimit !== undefined) updateData.creditLimit = creditLimit;
    if (creditDays !== undefined) updateData.creditDays = creditDays;
    if (customerType) updateData.customerType = customerType;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (notes !== undefined) updateData.notes = notes;

    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    res.json({
      message: 'Customer updated successfully',
      customer: updatedCustomer
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (req.user.role !== USER_ROLES.SUPER_USER && customer.unit !== req.user.unit) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if customer has orders
    const Order = (await import('../models/Order.js')).default;
    const hasOrders = await Order.findOne({ customer: id });

    if (hasOrders) {
      return res.status(400).json({ message: 'Cannot delete customer with existing orders' });
    }

    await Customer.findByIdAndDelete(id);

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCustomerStats = async (req, res) => {
  try {
    const { unit } = req.query;
    let query = {};

    if (req.user.role !== USER_ROLES.SUPER_USER) {
      query.unit = req.user.unit;
    } else if (unit) {
      query.unit = unit;
    }

    const [totalCustomers, activeCustomers, customersByType] = await Promise.all([
      Customer.countDocuments(query),
      Customer.countDocuments({ ...query, isActive: true }),
      Customer.aggregate([
        { $match: { ...query, isActive: true } },
        {
          $group: {
            _id: '$customerType',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    res.json({
      totalCustomers,
      activeCustomers,
      customersByType
    });
  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
