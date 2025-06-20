import Supplier from '../models/Supplier.js';
import { USER_ROLES } from '../shared/schema.js';

export const getSuppliers = async (req, res) => {
  try {
    const { page = 1, limit = 10, supplierType, unit, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (req.user.role !== USER_ROLES.SUPER_USER) {
      query.unit = req.user.unit;
    } else if (unit) {
      query.unit = unit;
    }

    if (supplierType) {
      query.supplierType = supplierType;
    }

    if (search) {
      query.$or = [
        { supplierName: { $regex: search, $options: 'i' } },
        { supplierCode: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const suppliers = await Supplier.find(query)
      .sort({ supplierName: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Supplier.countDocuments(query);

    res.json({
      suppliers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id);

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    if (req.user.role !== USER_ROLES.SUPER_USER && supplier.unit !== req.user.unit) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ supplier });
  } catch (error) {
    console.error('Get supplier by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createSupplier = async (req, res) => {
  try {
    const {
      supplierName,
      contactPerson,
      email,
      phone,
      alternatePhone,
      address,
      gstNumber,
      panNumber,
      bankDetails,
      paymentTerms,
      supplierType,
      rating,
      notes
    } = req.body;

    if (!supplierName || !contactPerson || !email || !phone || !address) {
      return res.status(400).json({ message: 'Supplier name, contact person, email, phone, and address are required' });
    }

    // Check if email already exists
    const existingSupplier = await Supplier.findOne({ email: email.toLowerCase() });
    if (existingSupplier) {
      return res.status(400).json({ message: 'Supplier with this email already exists' });
    }

    const supplierData = {
      supplierName,
      contactPerson,
      email: email.toLowerCase(),
      phone,
      alternatePhone,
      address,
      gstNumber,
      panNumber,
      bankDetails,
      paymentTerms: paymentTerms || 'Net 30',
      unit: req.user.role === USER_ROLES.SUPER_USER ? req.body.unit : req.user.unit,
      supplierType: supplierType || 'Raw Material',
      rating: rating || 3,
      notes
    };

    const supplier = await Supplier.create(supplierData);

    res.status(201).json({
      message: 'Supplier created successfully',
      supplier
    });
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      supplierName,
      contactPerson,
      email,
      phone,
      alternatePhone,
      address,
      gstNumber,
      panNumber,
      bankDetails,
      paymentTerms,
      supplierType,
      rating,
      isActive,
      notes
    } = req.body;

    const supplier = await Supplier.findById(id);

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    if (req.user.role !== USER_ROLES.SUPER_USER && supplier.unit !== req.user.unit) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if email already exists (excluding current supplier)
    if (email && email !== supplier.email) {
      const existingSupplier = await Supplier.findOne({
        email: email.toLowerCase(),
        _id: { $ne: id }
      });
      if (existingSupplier) {
        return res.status(400).json({ message: 'Supplier with this email already exists' });
      }
    }

    const updateData = {};
    if (supplierName) updateData.supplierName = supplierName;
    if (contactPerson) updateData.contactPerson = contactPerson;
    if (email) updateData.email = email.toLowerCase();
    if (phone) updateData.phone = phone;
    if (alternatePhone !== undefined) updateData.alternatePhone = alternatePhone;
    if (address) updateData.address = address;
    if (gstNumber !== undefined) updateData.gstNumber = gstNumber;
    if (panNumber !== undefined) updateData.panNumber = panNumber;
    if (bankDetails) updateData.bankDetails = bankDetails;
    if (paymentTerms) updateData.paymentTerms = paymentTerms;
    if (supplierType) updateData.supplierType = supplierType;
    if (rating !== undefined) updateData.rating = rating;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (notes !== undefined) updateData.notes = notes;

    const updatedSupplier = await Supplier.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    res.json({
      message: 'Supplier updated successfully',
      supplier: updatedSupplier
    });
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findById(id);

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    if (req.user.role !== USER_ROLES.SUPER_USER && supplier.unit !== req.user.unit) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if supplier has purchases
    const Purchase = (await import('../models/Purchase.js')).default;
    const hasPurchases = await Purchase.findOne({ supplier: id });

    if (hasPurchases) {
      return res.status(400).json({ message: 'Cannot delete supplier with existing purchases' });
    }

    await Supplier.findByIdAndDelete(id);

    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSupplierStats = async (req, res) => {
  try {
    const { unit } = req.query;
    let query = {};

    if (req.user.role !== USER_ROLES.SUPER_USER) {
      query.unit = req.user.unit;
    } else if (unit) {
      query.unit = unit;
    }

    const [totalSuppliers, activeSuppliers, suppliersByType, avgRating] = await Promise.all([
      Supplier.countDocuments(query),
      Supplier.countDocuments({ ...query, isActive: true }),
      Supplier.aggregate([
        { $match: { ...query, isActive: true } },
        {
          $group: {
            _id: '$supplierType',
            count: { $sum: 1 }
          }
        }
      ]),
      Supplier.aggregate([
        { $match: { ...query, isActive: true } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ])
    ]);

    res.json({
      totalSuppliers,
      activeSuppliers,
      suppliersByType,
      avgRating: avgRating.length > 0 ? avgRating[0].avgRating : 0
    });
  } catch (error) {
    console.error('Get supplier stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
