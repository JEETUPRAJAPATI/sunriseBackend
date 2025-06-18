import { useAuth } from './useAuth';
import { USER_ROLES, MODULES } from '@/utils/constants';

export const usePermissions = () => {
  const { user } = useAuth();

  const rolePermissions = {
    [USER_ROLES.SUPER_USER]: Object.values(MODULES),
    [USER_ROLES.UNIT_HEAD]: [
      MODULES.DASHBOARD,
      MODULES.ORDERS,
      MODULES.MANUFACTURING,
      MODULES.DISPATCHES,
      MODULES.SALES,
      MODULES.ACCOUNTS,
      MODULES.INVENTORY,
      MODULES.CUSTOMERS,
      MODULES.SUPPLIERS,
      MODULES.PURCHASES
    ],
    [USER_ROLES.PRODUCTION]: [
      MODULES.DASHBOARD,
      MODULES.ORDERS,
      MODULES.MANUFACTURING,
      MODULES.INVENTORY
    ],
    [USER_ROLES.PACKING]: [
      MODULES.DASHBOARD,
      MODULES.ORDERS,
      MODULES.MANUFACTURING,
      MODULES.DISPATCHES,
      MODULES.INVENTORY
    ],
    [USER_ROLES.DISPATCH]: [
      MODULES.DASHBOARD,
      MODULES.ORDERS,
      MODULES.DISPATCHES,
      MODULES.INVENTORY
    ],
    [USER_ROLES.ACCOUNTS]: [
      MODULES.DASHBOARD,
      MODULES.ORDERS,
      MODULES.SALES,
      MODULES.ACCOUNTS,
      MODULES.CUSTOMERS,
      MODULES.SUPPLIERS,
      MODULES.PURCHASES
    ]
  };

  const hasModuleAccess = (module) => {
    if (!user) return false;
    
    // Super User has access to all modules
    if (user.role === USER_ROLES.SUPER_USER) return true;
    
    // Check user's specific permissions if available
    if (user.permissions && user.permissions[module]) {
      return user.permissions[module].view === true;
    }
    
    // Fallback to role-based permissions for backward compatibility
    const userModules = rolePermissions[user.role] || [];
    return userModules.includes(module);
  };

  const hasPermission = (module, permission = 'view') => {
    if (!user) return false;
    
    // Super User has all permissions
    if (user.role === USER_ROLES.SUPER_USER) return true;
    
    // Check user's specific permissions if available
    if (user.permissions && user.permissions[module]) {
      const modulePerms = user.permissions[module];
      
      // Map permission types
      const permissionMap = {
        'view': modulePerms.view,
        'add': modulePerms.add,
        'edit': modulePerms.edit,
        'delete': modulePerms.delete,
        'alter': modulePerms.edit || modulePerms.delete // alter is edit or delete
      };
      
      return permissionMap[permission] === true;
    }
    
    // Fallback to role-based permissions for backward compatibility
    if (!hasModuleAccess(module)) return false;
    
    const permissionLevels = {
      [USER_ROLES.UNIT_HEAD]: ['view', 'edit', 'alter'],
      [USER_ROLES.PRODUCTION]: ['view', 'edit'],
      [USER_ROLES.PACKING]: ['view', 'edit'],
      [USER_ROLES.DISPATCH]: ['view', 'edit'],
      [USER_ROLES.ACCOUNTS]: ['view', 'edit']
    };
    
    const userPermissions = permissionLevels[user.role] || ['view'];
    return userPermissions.includes(permission);
  };

  const getUserModules = () => {
    if (!user) return [];
    
    // If user has specific permissions, return only modules with view access
    if (user.permissions && typeof user.permissions === 'object') {
      return Object.keys(user.permissions).filter(module => 
        user.permissions[module] && user.permissions[module].view === true
      );
    }
    
    // Fallback to role-based permissions
    return rolePermissions[user.role] || [];
  };

  const canManageUsers = () => {
    return user && [USER_ROLES.SUPER_USER, USER_ROLES.UNIT_HEAD].includes(user.role);
  };

  const canAccessSettings = () => {
    return user && user.role === USER_ROLES.SUPER_USER;
  };

  return {
    hasModuleAccess,
    hasPermission,
    getUserModules,
    canManageUsers,
    canAccessSettings
  };
};
