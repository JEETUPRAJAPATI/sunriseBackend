import Order from '../models/Order.js';
import Customer from '../models/Customer.js';
import { USER_ROLES } from '../../shared/schema.js';

export const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, unit, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Apply unit filter for non-super users
    if (req.user.role !== USER_ROLES.SUPER_USER) {
      query.unit = req.user.unit;
    } else if (unit) {
      query.unit = unit;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'items.productName': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .populate('customer', 'customerName contactPerson email phone')
      .populate('assignedTo', 'fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate('customer')
      .populate('assignedTo', 'fullName');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check unit access
    if (req.user.role !== USER_ROLES.SUPER_USER && order.unit !== req.user.unit) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { customer, items, expectedDeliveryDate, notes, priority } = req.body;

    // Validate required fields
    if (!customer || !items || !Array.isArray(items) || items.length === 0 || !expectedDeliveryDate) {
      return res.status(400).json({ message: 'Customer, items, and expected delivery date are required' });
    }

    // Validate customer exists
    const customerDoc = await Customer.findById(customer);
    if (!customerDoc) {
      return res.status(400).json({ message: 'Customer not found' });
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = items.map(item => {
      const itemTotal = item.quantity * item.unitPrice;
      totalAmount += itemTotal;
      return {
        ...item,
        totalPrice: itemTotal
      };
    });

    const orderData = {
      customer,
      items: orderItems,
      totalAmount,
      expectedDeliveryDate: new Date(expectedDeliveryDate),
      unit: req.user.role === USER_ROLES.SUPER_USER ? req.body.unit : req.user.unit,
      notes,
      priority: priority || 'Medium'
    };

    const order = await Order.create(orderData);
    await order.populate('customer', 'customerName contactPerson email phone');

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, expectedDeliveryDate, status, assignedTo, notes, priority } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check unit access
    if (req.user.role !== USER_ROLES.SUPER_USER && order.unit !== req.user.unit) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData = {};

    if (items && Array.isArray(items)) {
      let totalAmount = 0;
      const orderItems = items.map(item => {
        const itemTotal = item.quantity * item.unitPrice;
        totalAmount += itemTotal;
        return {
          ...item,
          totalPrice: itemTotal
        };
      });
      updateData.items = orderItems;
      updateData.totalAmount = totalAmount;
    }

    if (expectedDeliveryDate) {
      updateData.expectedDeliveryDate = new Date(expectedDeliveryDate);
    }

    if (status) {
      updateData.status = status;
      if (status === 'Dispatched') {
        updateData.actualDeliveryDate = new Date();
      }
    }

    if (assignedTo) updateData.assignedTo = assignedTo;
    if (notes) updateData.notes = notes;
    if (priority) updateData.priority = priority;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('customer', 'customerName contactPerson email phone')
     .populate('assignedTo', 'fullName');

    res.json({
      message: 'Order updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check unit access
    if (req.user.role !== USER_ROLES.SUPER_USER && order.unit !== req.user.unit) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Prevent deletion if order is in progress or completed
    if (['In Progress', 'Completed', 'Dispatched'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot delete order that is in progress or completed' });
    }

    await Order.findByIdAndDelete(id);

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const { unit } = req.query;
    let query = {};

    if (req.user.role !== USER_ROLES.SUPER_USER) {
      query.unit = req.user.unit;
    } else if (unit) {
      query.unit = unit;
    }

    const stats = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments(query);
    const totalRevenue = await Order.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      stats,
      totalOrders,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
