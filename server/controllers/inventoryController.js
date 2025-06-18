import { Inventory, StockMovement } from '../models/Inventory.js';
import { USER_ROLES } from '../../shared/schema.js';

export const getInventory = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, unitName, search, lowStock } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (req.user.role !== USER_ROLES.SUPER_USER) {
      query.unitName = req.user.unit;
    } else if (unitName) {
      query.unitName = unitName;
    }

    if (category) {
      query.category = category;
    }

    if (lowStock === 'true') {
      query.$expr = { $lte: ['$currentStock', '$minStockLevel'] };
    }

    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { itemCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await Inventory.find(query)
      .populate('supplier', 'supplierName contactPerson')
      .sort({ itemName: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Inventory.countDocuments(query);

    res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getInventoryItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Inventory.findById(id).populate('supplier', 'supplierName contactPerson email phone');

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    if (req.user.role !== USER_ROLES.SUPER_USER && item.unitName !== req.user.unit) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ item });
  } catch (error) {
    console.error('Get inventory item by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createInventoryItem = async (req, res) => {
  try {
    const {
      itemName,
      description,
      category,
      unit,
      currentStock,
      minStockLevel,
      maxStockLevel,
      reorderPoint,
      costPrice,
      sellingPrice,
      location,
      supplier,
      batchTracking,
      expiryTracking
    } = req.body;

    if (!itemName || !category || !unit || costPrice === undefined) {
      return res.status(400).json({ message: 'Item name, category, unit, and cost price are required' });
    }

    // Generate item code
    const itemCode = `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const itemData = {
      itemCode,
      itemName,
      description,
      category,
      unit,
      currentStock: currentStock || 0,
      minStockLevel: minStockLevel || 10,
      maxStockLevel: maxStockLevel || 1000,
      reorderPoint: reorderPoint || 20,
      costPrice,
      sellingPrice,
      location: location || { warehouse: 'Main' },
      supplier,
      unitName: req.user.role === USER_ROLES.SUPER_USER ? req.body.unitName : req.user.unit,
      batchTracking: batchTracking || false,
      expiryTracking: expiryTracking || false
    };

    const item = await Inventory.create(itemData);
    await item.populate('supplier', 'supplierName contactPerson');

    // Create initial stock movement if current stock > 0
    if (currentStock > 0) {
      await StockMovement.create({
        item: item._id,
        movementType: 'IN',
        quantity: currentStock,
        previousStock: 0,
        newStock: currentStock,
        reference: 'Initial Stock',
        unit: item.unitName,
        createdBy: req.user._id,
        notes: 'Initial stock entry'
      });
    }

    res.status(201).json({
      message: 'Inventory item created successfully',
      item
    });
  } catch (error) {
    console.error('Create inventory item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      itemName,
      description,
      category,
      unit,
      minStockLevel,
      maxStockLevel,
      reorderPoint,
      costPrice,
      sellingPrice,
      location,
      supplier,
      isActive,
      batchTracking,
      expiryTracking
    } = req.body;

    const item = await Inventory.findById(id);

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    if (req.user.role !== USER_ROLES.SUPER_USER && item.unitName !== req.user.unit) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData = {};
    if (itemName) updateData.itemName = itemName;
    if (description !== undefined) updateData.description = description;
    if (category) updateData.category = category;
    if (unit) updateData.unit = unit;
    if (minStockLevel !== undefined) updateData.minStockLevel = minStockLevel;
    if (maxStockLevel !== undefined) updateData.maxStockLevel = maxStockLevel;
    if (reorderPoint !== undefined) updateData.reorderPoint = reorderPoint;
    if (costPrice !== undefined) updateData.costPrice = costPrice;
    if (sellingPrice !== undefined) updateData.sellingPrice = sellingPrice;
    if (location) updateData.location = location;
    if (supplier) updateData.supplier = supplier;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (typeof batchTracking === 'boolean') updateData.batchTracking = batchTracking;
    if (typeof expiryTracking === 'boolean') updateData.expiryTracking = expiryTracking;

    const updatedItem = await Inventory.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('supplier', 'supplierName contactPerson');

    res.json({
      message: 'Inventory item updated successfully',
      item: updatedItem
    });
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Inventory.findById(id);

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    if (req.user.role !== USER_ROLES.SUPER_USER && item.unitName !== req.user.unit) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (item.currentStock > 0) {
      return res.status(400).json({ message: 'Cannot delete item with existing stock' });
    }

    await Inventory.findByIdAndDelete(id);

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const adjustStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, movementType, reference, batchNumber, expiryDate, notes } = req.body;

    if (!quantity || !movementType || !reference) {
      return res.status(400).json({ message: 'Quantity, movement type, and reference are required' });
    }

    const item = await Inventory.findById(id);

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    if (req.user.role !== USER_ROLES.SUPER_USER && item.unitName !== req.user.unit) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const previousStock = item.currentStock;
    let newStock;

    switch (movementType) {
      case 'IN':
        newStock = previousStock + quantity;
        break;
      case 'OUT':
        if (quantity > previousStock) {
          return res.status(400).json({ message: 'Insufficient stock' });
        }
        newStock = previousStock - quantity;
        break;
      case 'ADJUSTMENT':
        newStock = quantity;
        break;
      default:
        return res.status(400).json({ message: 'Invalid movement type' });
    }

    // Update item stock
    item.currentStock = newStock;
    await item.save();

    // Create stock movement record
    await StockMovement.create({
      item: id,
      movementType,
      quantity: movementType === 'ADJUSTMENT' ? Math.abs(quantity - previousStock) : quantity,
      previousStock,
      newStock,
      reference,
      batchNumber,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      unit: item.unitName,
      createdBy: req.user._id,
      notes
    });

    res.json({
      message: 'Stock adjusted successfully',
      item: {
        ...item.toJSON(),
        previousStock,
        newStock
      }
    });
  } catch (error) {
    console.error('Adjust stock error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getStockMovements = async (req, res) => {
  try {
    const { page = 1, limit = 10, itemId, movementType, unitName } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (req.user.role !== USER_ROLES.SUPER_USER) {
      query.unit = req.user.unit;
    } else if (unitName) {
      query.unit = unitName;
    }

    if (itemId) {
      query.item = itemId;
    }

    if (movementType) {
      query.movementType = movementType;
    }

    const movements = await StockMovement.find(query)
      .populate('item', 'itemName itemCode')
      .populate('createdBy', 'fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StockMovement.countDocuments(query);

    res.json({
      movements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get stock movements error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getInventoryStats = async (req, res) => {
  try {
    const { unitName } = req.query;
    let query = {};

    if (req.user.role !== USER_ROLES.SUPER_USER) {
      query.unitName = req.user.unit;
    } else if (unitName) {
      query.unitName = unitName;
    }

    const [totalItems, lowStockItems, outOfStockItems, totalValue] = await Promise.all([
      Inventory.countDocuments({ ...query, isActive: true }),
      Inventory.countDocuments({
        ...query,
        isActive: true,
        $expr: { $lte: ['$currentStock', '$minStockLevel'] }
      }),
      Inventory.countDocuments({
        ...query,
        isActive: true,
        currentStock: 0
      }),
      Inventory.aggregate([
        { $match: { ...query, isActive: true } },
        { $group: { _id: null, total: { $sum: { $multiply: ['$currentStock', '$costPrice'] } } } }
      ])
    ]);

    const categoryStats = await Inventory.aggregate([
      { $match: { ...query, isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalStock: { $sum: '$currentStock' },
          totalValue: { $sum: { $multiply: ['$currentStock', '$costPrice'] } }
        }
      }
    ]);

    res.json({
      totalItems,
      lowStockItems,
      outOfStockItems,
      totalValue: totalValue.length > 0 ? totalValue[0].total : 0,
      categoryStats
    });
  } catch (error) {
    console.error('Get inventory stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
