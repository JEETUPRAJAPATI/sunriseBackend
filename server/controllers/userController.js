import User from '../models/User.js';
import { USER_ROLES } from '../../shared/schema.js';
import { getUserModules } from '../utils/permissions.js';

export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, unit, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Non-super users can only see users from their unit
    if (req.user.role !== USER_ROLES.SUPER_USER) {
      query.unit = req.user.unit;
    }

    if (role) {
      query.role = role;
    }

    if (unit) {
      query.unit = unit;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Non-super users can only access users from their unit
    if (req.user.role !== USER_ROLES.SUPER_USER && user.unit !== req.user.unit) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { username, email, password, fullName, role, unit, permissions } = req.body;

    // Validate required fields
    if (!username || !email || !password || !fullName || !role) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Validate role
    if (!Object.values(USER_ROLES).includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Unit is required for all roles except Super User
    if (role !== USER_ROLES.SUPER_USER && !unit) {
      return res.status(400).json({ message: 'Unit is required for this role' });
    }

    // Check if username or email already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const userData = {
      username,
      email: email.toLowerCase(),
      password,
      fullName,
      role,
      unit: role === USER_ROLES.SUPER_USER ? undefined : unit,
      permissions: permissions || []
    };

    const user = await User.create(userData);
    const userModules = getUserModules(user.role);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        unit: user.unit,
        modules: userModules,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, role, unit, permissions, isActive } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Non-super users can only update users from their unit
    if (req.user.role !== USER_ROLES.SUPER_USER && user.unit !== req.user.unit) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Validate role if provided
    if (role && !Object.values(USER_ROLES).includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (role) updateData.role = role;
    if (unit) updateData.unit = unit;
    if (permissions) updateData.permissions = permissions;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password');

    const userModules = getUserModules(updatedUser.role);

    res.json({
      message: 'User updated successfully',
      user: {
        ...updatedUser.toJSON(),
        modules: userModules
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Non-super users can only delete users from their unit
    if (req.user.role !== USER_ROLES.SUPER_USER && user.unit !== req.user.unit) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Non-super users can only reset passwords for users from their unit
    if (req.user.role !== USER_ROLES.SUPER_USER && user.unit !== req.user.unit) {
      return res.status(403).json({ message: 'Access denied' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
