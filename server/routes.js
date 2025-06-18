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

  // API-specific middleware that runs before Vite
  app.use('/api', (req, res, next) => {
    console.log(`API Request: ${req.method} ${req.originalUrl}`);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    next();
  });

  // Auth routes (public)
  app.post('/api/auth/login', authController.login);
  app.post('/api/auth/logout', authController.logout);
  app.get('/api/auth/me', authenticateToken, authController.getCurrentUser);

  // Protected routes
  app.post('/api/auth/change-password', authenticateToken, authController.changePassword);

  // User management routes
  app.get('/api/users', authenticateToken, authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD), userController.getUsers);
  app.get('/api/users/:id', authenticateToken, authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD), userController.getUserById);
  app.post('/api/users', authenticateToken, authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD), userController.createUser);
  app.put('/api/users/:id', authenticateToken, authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD), userController.updateUser);
  app.delete('/api/users/:id', authenticateToken, authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD), userController.deleteUser);
  app.post('/api/users/:id/reset-password', authenticateToken, authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD), userController.resetUserPassword);

  // Dashboard routes
  app.get('/api/dashboard/metrics', dashboardController.getDashboardMetrics);
  app.get('/api/dashboard/production-chart', dashboardController.getProductionChart);
  app.get('/api/dashboard/sales-chart', dashboardController.getSalesChart);
  app.get('/api/dashboard/recent-orders', dashboardController.getRecentOrders);
  app.get('/api/dashboard/alerts', dashboardController.getAlerts);

  // Order routes
  app.get('/api/orders', checkUnitAccess, orderController.getOrders);
  app.get('/api/orders/stats', checkUnitAccess, orderController.getOrderStats);
  app.get('/api/orders/:id', checkUnitAccess, orderController.getOrderById);
  app.post('/api/orders', checkUnitAccess, orderController.createOrder);
  app.put('/api/orders/:id', checkUnitAccess, orderController.updateOrder);
  app.delete('/api/orders/:id', checkUnitAccess, orderController.deleteOrder);

  // Manufacturing routes
  app.get('/api/manufacturing', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.PRODUCTION), checkUnitAccess, manufacturingController.getManufacturingJobs);
  app.get('/api/manufacturing/stats', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.PRODUCTION), checkUnitAccess, manufacturingController.getManufacturingStats);
  app.get('/api/manufacturing/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.PRODUCTION), checkUnitAccess, manufacturingController.getManufacturingJobById);
  app.post('/api/manufacturing', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.PRODUCTION), checkUnitAccess, manufacturingController.createManufacturingJob);
  app.put('/api/manufacturing/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.PRODUCTION), checkUnitAccess, manufacturingController.updateManufacturingJob);
  app.delete('/api/manufacturing/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.PRODUCTION), checkUnitAccess, manufacturingController.deleteManufacturingJob);

  // Dispatch routes
  app.get('/api/dispatches', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.DISPATCH, USER_ROLES.PACKING), checkUnitAccess, dispatchController.getDispatches);
  app.get('/api/dispatches/stats', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.DISPATCH), checkUnitAccess, dispatchController.getDispatchStats);
  app.get('/api/dispatches/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.DISPATCH, USER_ROLES.PACKING), checkUnitAccess, dispatchController.getDispatchById);
  app.post('/api/dispatches', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.DISPATCH), checkUnitAccess, dispatchController.createDispatch);
  app.put('/api/dispatches/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.DISPATCH), checkUnitAccess, dispatchController.updateDispatch);
  app.delete('/api/dispatches/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.DISPATCH), checkUnitAccess, dispatchController.deleteDispatch);

  // Sales routes
  app.get('/api/sales', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.ACCOUNTS), checkUnitAccess, salesController.getSales);
  app.get('/api/sales/stats', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.ACCOUNTS), checkUnitAccess, salesController.getSalesStats);
  app.get('/api/sales/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.ACCOUNTS), checkUnitAccess, salesController.getSaleById);
  app.post('/api/sales', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.ACCOUNTS), checkUnitAccess, salesController.createSale);
  app.put('/api/sales/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.ACCOUNTS), checkUnitAccess, salesController.updateSale);
  app.delete('/api/sales/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.ACCOUNTS), checkUnitAccess, salesController.deleteSale);

  // Account routes
  app.get('/api/accounts', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.ACCOUNTS), checkUnitAccess, accountController.getAccounts);
  app.get('/api/accounts/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.ACCOUNTS), checkUnitAccess, accountController.getAccountById);
  app.post('/api/accounts', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.ACCOUNTS), checkUnitAccess, accountController.createAccount);
  app.put('/api/accounts/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.ACCOUNTS), checkUnitAccess, accountController.updateAccount);
  app.delete('/api/accounts/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.ACCOUNTS), checkUnitAccess, accountController.deleteAccount);

  // Transaction routes
  app.get('/api/transactions', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.ACCOUNTS), checkUnitAccess, accountController.getTransactions);
  app.post('/api/transactions', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.ACCOUNTS), checkUnitAccess, accountController.createTransaction);
  app.post('/api/transactions/:id/approve', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD), checkUnitAccess, accountController.approveTransaction);

  // Inventory routes
  app.get('/api/inventory', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.PRODUCTION), checkUnitAccess, inventoryController.getInventory);
  app.get('/api/inventory/stats', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.PRODUCTION), checkUnitAccess, inventoryController.getInventoryStats);
  app.get('/api/inventory/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.PRODUCTION), checkUnitAccess, inventoryController.getInventoryItemById);
  app.post('/api/inventory', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.PRODUCTION), checkUnitAccess, inventoryController.createInventoryItem);
  app.put('/api/inventory/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.PRODUCTION), checkUnitAccess, inventoryController.updateInventoryItem);
  app.delete('/api/inventory/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD), checkUnitAccess, inventoryController.deleteInventoryItem);
  app.post('/api/inventory/:id/adjust', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.PRODUCTION), checkUnitAccess, inventoryController.adjustStock);

  // Stock movement routes
  app.get('/api/stock-movements', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.PRODUCTION), checkUnitAccess, inventoryController.getStockMovements);

  // Customer routes
  app.get('/api/customers', checkUnitAccess, customerController.getCustomers);
  app.get('/api/customers/stats', checkUnitAccess, customerController.getCustomerStats);
  app.get('/api/customers/:id', checkUnitAccess, customerController.getCustomerById);
  app.post('/api/customers', checkUnitAccess, customerController.createCustomer);
  app.put('/api/customers/:id', checkUnitAccess, customerController.updateCustomer);
  app.delete('/api/customers/:id', checkUnitAccess, customerController.deleteCustomer);

  // Supplier routes
  app.get('/api/suppliers', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.ACCOUNTS), checkUnitAccess, supplierController.getSuppliers);
  app.get('/api/suppliers/stats', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.ACCOUNTS), checkUnitAccess, supplierController.getSupplierStats);
  app.get('/api/suppliers/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.ACCOUNTS), checkUnitAccess, supplierController.getSupplierById);
  app.post('/api/suppliers', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.ACCOUNTS), checkUnitAccess, supplierController.createSupplier);
  app.put('/api/suppliers/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.ACCOUNTS), checkUnitAccess, supplierController.updateSupplier);
  app.delete('/api/suppliers/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD), checkUnitAccess, supplierController.deleteSupplier);

  // Purchase routes
  app.get('/api/purchases', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.ACCOUNTS), checkUnitAccess, purchaseController.getPurchases);
  app.get('/api/purchases/stats', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.ACCOUNTS), checkUnitAccess, purchaseController.getPurchaseStats);
  app.get('/api/purchases/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.ACCOUNTS), checkUnitAccess, purchaseController.getPurchaseById);
  app.post('/api/purchases', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.ACCOUNTS), checkUnitAccess, purchaseController.createPurchase);
  app.put('/api/purchases/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.ACCOUNTS), checkUnitAccess, purchaseController.updatePurchase);
  app.delete('/api/purchases/:id', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD), checkUnitAccess, purchaseController.deletePurchase);
  app.post('/api/purchases/:id/receive', authorizeRoles(USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD, USER_ROLES.ACCOUNTS), checkUnitAccess, purchaseController.receivePurchase);

  // Settings routes (Super User only)
  app.get('/api/settings', authorizeRoles(USER_ROLES.SUPER_USER), settingsController.getSettings);
  app.put('/api/settings', authorizeRoles(USER_ROLES.SUPER_USER), settingsController.updateSettings);
  app.put('/api/settings/company', authorizeRoles(USER_ROLES.SUPER_USER), settingsController.updateCompanySettings);
  app.put('/api/settings/system', authorizeRoles(USER_ROLES.SUPER_USER), settingsController.updateSystemSettings);
  app.put('/api/settings/email', authorizeRoles(USER_ROLES.SUPER_USER), settingsController.updateEmailSettings);
  app.put('/api/settings/modules', authorizeRoles(USER_ROLES.SUPER_USER), settingsController.updateModuleSettings);
  app.put('/api/settings/notifications', authorizeRoles(USER_ROLES.SUPER_USER), settingsController.updateNotificationSettings);
  app.put('/api/settings/backup', authorizeRoles(USER_ROLES.SUPER_USER), settingsController.updateBackupSettings);
  app.put('/api/settings/theme', authorizeRoles(USER_ROLES.SUPER_USER), settingsController.updateThemeSettings);

  // Add a test route to verify API routing works
  app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working', timestamp: new Date().toISOString() });
  });

  // Return the app
  return app;
}

export { registerRoutes };
