import express from 'express';
import { authenticateToken as auth } from '../middleware/auth.js';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
  exportCustomersToExcel,
  importCustomersFromExcel
} from '../controllers/customerController.js';

const router = express.Router();

// Customer CRUD routes
router.get('/customers', auth, getCustomers);
router.get('/customers/:id', auth, getCustomerById);
router.post('/customers', auth, createCustomer);
router.put('/customers/:id', auth, updateCustomer);
router.delete('/customers/:id', auth, deleteCustomer);

// Customer stats
router.get('/customers/stats', auth, getCustomerStats);

// Excel import/export routes
router.get('/customers/export', auth, exportCustomersToExcel);
router.post('/customers/import', auth, importCustomersFromExcel);

export default router;