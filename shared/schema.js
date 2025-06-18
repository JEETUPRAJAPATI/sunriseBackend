// User roles and permissions
export const USER_ROLES = {
  SUPER_USER: 'Super User',
  UNIT_HEAD: 'Unit Head',
  PRODUCTION: 'Production',
  PACKING: 'Packing',
  DISPATCH: 'Dispatch',
  ACCOUNTS: 'Accounts'
};

export const MODULES = {
  DASHBOARD: 'Dashboard',
  ORDERS: 'Orders',
  MANUFACTURING: 'Manufacturing',
  DISPATCHES: 'Dispatches',
  SALES: 'Sales',
  ACCOUNTS: 'Accounts',
  INVENTORY: 'Inventory',
  CUSTOMERS: 'Customers',
  SUPPLIERS: 'Suppliers',
  PURCHASES: 'Purchases',
  SETTINGS: 'Settings'
};

export const PERMISSIONS = {
  VIEW: 'view',
  EDIT: 'edit',
  ALTER: 'alter'
};

export const ORDER_STATUS = {
  NEW: 'New',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  DISPATCHED: 'Dispatched'
};

export const PRODUCTION_STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold'
};

export const DISPATCH_STATUS = {
  PENDING: 'Pending',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled'
};

export const PAYMENT_STATUS = {
  PENDING: 'Pending',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  CANCELLED: 'Cancelled'
};
