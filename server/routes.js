import express from 'express';
import cookieParser from 'cookie-parser';
import corsMiddleware from './middleware/cors.js';

// Import middleware
import { authenticateToken, authorizeRoles, checkUnitAccess } from './middleware/auth.js';

// Import controllers
import * as authController from './controllers/authController.js';
import * as userController from './controllers/userController.js';
import * as dashboardController from './controllers/dashboardController.js';
import * as orderController from './controllers/orderController.js';
import * as manufacturingController from './controllers/manufacturingController.js';
import * as dispatchController from './controllers/dispatchController.js';
import * as salesController from './controllers/salesController.js';
import * as accountController from './controllers/accountController.js';
import * as inventoryController from './controllers/inventoryController.js';
import * as customerController from './controllers/customerController.js';
import * as supplierController from './controllers/supplierController.js';
import * as purchaseController from './controllers/purchaseController.js';
import * as settingsController from './controllers/settingsController.js';

import { USER_ROLES } from '../shared/schema.js';

async function registerRoutes(app) {
  // Apply global middleware
  app.use(corsMiddleware);
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  // Debug logging for this API instance
  app.use((req, res, next) => {
    console.log(`API Request: ${req.method} ${req.originalUrl}`);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    next();
  });

  // Auth routes (public) - note: /api prefix will be added by mounting
  app.post('/auth/login', authController.login);
  app.post('/auth/logout', authController.logout);
  app.get('/auth/me', authenticateToken, authController.getCurrentUser);

  // Protected routes
  app.post('/auth/change-password', authenticateToken, authController.changePassword);

  // User management routes
  app.get('/users', authenticateToken, authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD), userController.getUsers);
  app.get('/users/:id', authenticateToken, authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD), userController.getUserById);
  app.post('/users', authenticateToken, authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD), userController.createUser);
  app.put('/users/:id', authenticateToken, authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD), userController.updateUser);
  app.delete('/users/:id', authenticateToken, authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD), userController.deleteUser);
  app.post('/users/:id/reset-password', authenticateToken, authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD), userController.resetUserPassword);

  // Dashboard routes
  app.get('/dashboard/metrics', dashboardController.getDashboardMetrics);
  app.get('/dashboard/production-chart', dashboardController.getProductionChart);
  app.get('/dashboard/sales-chart', dashboardController.getSalesChart);
  app.get('/dashboard/recent-orders', dashboardController.getRecentOrders);
  app.get('/dashboard/alerts', dashboardController.getAlerts);

  // Order routes
  app.get('/orders', checkUnitAccess, orderController.getOrders);
  app.get('/orders/stats', checkUnitAccess, orderController.getOrderStats);
  app.get('/orders/:id', checkUnitAccess, orderController.getOrderById);
  app.post('/orders', checkUnitAccess, orderController.createOrder);
  app.put('/orders/:id', checkUnitAccess, orderController.updateOrder);
  app.delete('/orders/:id', checkUnitAccess, orderController.deleteOrder);

  // Manufacturing routes
  app.get('/manufacturing', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.PRODUCTION), checkUnitAccess, manufacturingController.getManufacturingJobs);
  app.get('/manufacturing/stats', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.PRODUCTION), checkUnitAccess, manufacturingController.getManufacturingStats);
  app.get('/manufacturing/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.PRODUCTION), checkUnitAccess, manufacturingController.getManufacturingJobById);
  app.post('/manufacturing', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.PRODUCTION), checkUnitAccess, manufacturingController.createManufacturingJob);
  app.put('/manufacturing/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.PRODUCTION), checkUnitAccess, manufacturingController.updateManufacturingJob);
  app.delete('/manufacturing/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.PRODUCTION), checkUnitAccess, manufacturingController.deleteManufacturingJob);

  // Dispatch routes
  app.get('/dispatches', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.DISPATCH, USER_ROLES.PACKING), checkUnitAccess, dispatchController.getDispatches);
  app.get('/dispatches/stats', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.DISPATCH), checkUnitAccess, dispatchController.getDispatchStats);
  app.get('/dispatches/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.DISPATCH, USER_ROLES.PACKING), checkUnitAccess, dispatchController.getDispatchById);
  app.post('/dispatches', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.DISPATCH), checkUnitAccess, dispatchController.createDispatch);
  app.put('/dispatches/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.DISPATCH), checkUnitAccess, dispatchController.updateDispatch);
  app.delete('/dispatches/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.DISPATCH), checkUnitAccess, dispatchController.deleteDispatch);

  // Sales routes
  app.get('/sales', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.ACCOUNTS), checkUnitAccess, salesController.getSales);
  app.get('/sales/stats', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.ACCOUNTS), checkUnitAccess, salesController.getSalesStats);
  app.get('/sales/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.ACCOUNTS), checkUnitAccess, salesController.getSaleById);
  app.post('/sales', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.ACCOUNTS), checkUnitAccess, salesController.createSale);
  app.put('/sales/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.ACCOUNTS), checkUnitAccess, salesController.updateSale);
  app.delete('/sales/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.ACCOUNTS), checkUnitAccess, salesController.deleteSale);

  // Account routes
  app.get('/accounts', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.ACCOUNTS), checkUnitAccess, accountController.getAccounts);
  app.get('/accounts/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.ACCOUNTS), checkUnitAccess, accountController.getAccountById);
  app.post('/accounts', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.ACCOUNTS), checkUnitAccess, accountController.createAccount);
  app.put('/accounts/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.ACCOUNTS), checkUnitAccess, accountController.updateAccount);
  app.delete('/accounts/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.ACCOUNTS), checkUnitAccess, accountController.deleteAccount);

  // Transaction routes
  app.get('/transactions', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.ACCOUNTS), checkUnitAccess, accountController.getTransactions);
  app.post('/transactions', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.ACCOUNTS), checkUnitAccess, accountController.createTransaction);
  app.post('/transactions/:id/approve', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD), checkUnitAccess, accountController.approveTransaction);

  // Inventory routes
  app.get('/inventory', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.PRODUCTION), checkUnitAccess, inventoryController.getInventory);
  app.get('/inventory/stats', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.PRODUCTION), checkUnitAccess, inventoryController.getInventoryStats);
  app.get('/inventory/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.PRODUCTION), checkUnitAccess, inventoryController.getInventoryItemById);
  app.post('/inventory', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.PRODUCTION), checkUnitAccess, inventoryController.createInventoryItem);
  app.put('/inventory/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.PRODUCTION), checkUnitAccess, inventoryController.updateInventoryItem);
  app.delete('/inventory/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD), checkUnitAccess, inventoryController.deleteInventoryItem);
  app.post('/inventory/:id/adjust', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.PRODUCTION), checkUnitAccess, inventoryController.adjustStock);

  // Stock movement routes
  app.get('/stock-movements', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.PRODUCTION), checkUnitAccess, inventoryController.getStockMovements);

  // Customer routes
  app.get('/customers', checkUnitAccess, customerController.getCustomers);
  app.get('/customers/stats', checkUnitAccess, customerController.getCustomerStats);
  app.get('/customers/:id', checkUnitAccess, customerController.getCustomerById);
  app.post('/customers', checkUnitAccess, customerController.createCustomer);
  app.put('/customers/:id', checkUnitAccess, customerController.updateCustomer);
  app.delete('/customers/:id', checkUnitAccess, customerController.deleteCustomer);

  // Supplier routes
  app.get('/suppliers', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.ACCOUNTS), checkUnitAccess, supplierController.getSuppliers);
  app.get('/suppliers/stats', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.ACCOUNTS), checkUnitAccess, supplierController.getSupplierStats);
  app.get('/suppliers/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.ACCOUNTS), checkUnitAccess, supplierController.getSupplierById);
  app.post('/suppliers', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.ACCOUNTS), checkUnitAccess, supplierController.createSupplier);
  app.put('/suppliers/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.ACCOUNTS), checkUnitAccess, supplierController.updateSupplier);
  app.delete('/suppliers/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD), checkUnitAccess, supplierController.deleteSupplier);

  // Purchase routes
  app.get('/purchases', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.ACCOUNTS), checkUnitAccess, purchaseController.getPurchases);
  app.get('/purchases/stats', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.ACCOUNTS), checkUnitAccess, purchaseController.getPurchaseStats);
  app.get('/purchases/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.ACCOUNTS), checkUnitAccess, purchaseController.getPurchaseById);
  app.post('/purchases', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.ACCOUNTS), checkUnitAccess, purchaseController.createPurchase);
  app.put('/purchases/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.ACCOUNTS), checkUnitAccess, purchaseController.updatePurchase);
  app.delete('/purchases/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD), checkUnitAccess, purchaseController.deletePurchase);
  app.post('/purchases/:id/receive', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.ACCOUNTS), checkUnitAccess, purchaseController.receivePurchase);

  // Settings routes (Super User only)
  app.get('/settings', authorizeRoles(USER_ROLES.SUPER_USER), settingsController.getSettings);
  app.put('/settings', authorizeRoles(USER_ROLES.SUPER_USER), settingsController.updateSettings);
  app.put('/settings/company', authorizeRoles(USER_ROLES.SUPER_USER), settingsController.updateCompanySettings);
  app.put('/settings/system', authorizeRoles(USER_ROLES.SUPER_USER), settingsController.updateSystemSettings);
  app.put('/settings/email', authorizeRoles(USER_ROLES.SUPER_USER), settingsController.updateEmailSettings);
  app.put('/settings/modules', authorizeRoles(USER_ROLES.SUPER_USER), settingsController.updateModuleSettings);
  app.put('/settings/notifications', authorizeRoles(USER_ROLES.SUPER_USER), settingsController.updateNotificationSettings);
  app.put('/settings/backup', authorizeRoles(USER_ROLES.SUPER_USER), settingsController.updateBackupSettings);
  app.put('/settings/theme', authorizeRoles(USER_ROLES.SUPER_USER), settingsController.updateThemeSettings);

  // Add a test route to verify API routing works
  app.get('/test', (req, res) => {
    res.json({ message: 'API is working', timestamp: new Date().toISOString() });
  });

  // Return the app
  return app;
}

export { registerRoutes };
