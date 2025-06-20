import express from 'express';
import { authenticateToken as auth } from '../middleware/auth.js';
import {
  // Item routes
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  adjustStock,
  
  // Category routes
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  
  // Customer category routes
  getCustomerCategories,
  createCustomerCategory,
  updateCustomerCategory,
  deleteCustomerCategory,
  
  // Utility routes
  getLowStockItems,
  getInventoryStats
} from '../controllers/inventoryController.js';

const router = express.Router();

// Item routes
router.get('/items', auth, getItems);
router.get('/items/:id', auth, getItemById);
router.post('/items', auth, createItem);
router.put('/items/:id', auth, updateItem);
router.delete('/items/:id', auth, deleteItem);
router.post('/items/:id/adjust-stock', auth, adjustStock);

// Category routes
router.get('/categories', auth, getCategories);
router.post('/categories', auth, createCategory);
router.put('/categories/:id', auth, updateCategory);
router.delete('/categories/:id', auth, deleteCategory);

// Customer category routes
router.get('/customer-categories', auth, getCustomerCategories);
router.post('/customer-categories', auth, createCustomerCategory);
router.put('/customer-categories/:id', auth, updateCustomerCategory);
router.delete('/customer-categories/:id', auth, deleteCustomerCategory);

// Utility routes
router.get('/inventory/low-stock', auth, getLowStockItems);
router.get('/inventory/stats', auth, getInventoryStats);

export default router;