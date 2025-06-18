import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  Users, 
  Key,
  Settings as SettingsIcon 
} from 'lucide-react';

const ROLES = [
  { value: 'Super User', label: 'Super User' },
  { value: 'Unit Head', label: 'Unit Head' },
  { value: 'Production', label: 'Production' },
  { value: 'Packing', label: 'Packing' },
  { value: 'Dispatch', label: 'Dispatch' },
  { value: 'Accounts', label: 'Accounts' }
];

const UNITS = [
  { value: 'Unit A - Assembly', label: 'Unit A - Assembly' },
  { value: 'Unit B - Packing', label: 'Unit B - Packing' },
  { value: 'Unit C - Dispatch', label: 'Unit C - Dispatch' },
  { value: 'Unit D - Finance', label: 'Unit D - Finance' },
  { value: 'Unit E - Quality', label: 'Unit E - Quality' }
];

const MODULES = [
  'Dashboard', 'Orders', 'Manufacturing', 'Dispatches', 
  'Sales', 'Accounts', 'Inventory', 'Customers', 
  'Suppliers', 'Purchases', 'Settings'
];

const PERMISSION_TYPES = ['view', 'add', 'edit', 'delete'];

const DEFAULT_PERMISSIONS = MODULES.reduce((acc, module) => {
  acc[module] = {
    view: false,
    add: false,
    edit: false,
    delete: false
  };
  return acc;
}, {});

export default function UserManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: '',
    unit: '',
    isActive: true,
    permissions: { ...DEFAULT_PERMISSIONS }
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Handle permission changes
  const updatePermission = (module, permissionType, value) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [permissionType]: value
        }
      }
    }));
  };

  // Toggle all permissions for a module
  const toggleAllModulePermissions = (module, enable) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          view: enable,
          add: enable,
          edit: enable,
          delete: enable
        }
      }
    }));
  };

  // Set role-based default permissions
  const setRoleDefaultPermissions = (role) => {
    let defaultPerms = { ...DEFAULT_PERMISSIONS };
    
    switch (role) {
      case 'Super User':
        // Super User gets all permissions
        MODULES.forEach(module => {
          defaultPerms[module] = { view: true, add: true, edit: true, delete: true };
        });
        break;
      case 'Unit Head':
        // Unit Head gets most permissions except system settings
        MODULES.forEach(module => {
          if (module === 'Settings') {
            defaultPerms[module] = { view: true, add: false, edit: false, delete: false };
          } else {
            defaultPerms[module] = { view: true, add: true, edit: true, delete: false };
          }
        });
        break;
      case 'Production':
        // Production focused permissions
        const productionModules = ['Dashboard', 'Orders', 'Manufacturing', 'Inventory'];
        productionModules.forEach(module => {
          defaultPerms[module] = { view: true, add: true, edit: true, delete: false };
        });
        break;
      case 'Accounts':
        // Accounts focused permissions
        const accountsModules = ['Dashboard', 'Sales', 'Accounts', 'Customers', 'Suppliers'];
        accountsModules.forEach(module => {
          defaultPerms[module] = { view: true, add: true, edit: true, delete: false };
        });
        break;
      case 'Dispatch':
        // Dispatch focused permissions
        const dispatchModules = ['Dashboard', 'Orders', 'Dispatches', 'Customers'];
        dispatchModules.forEach(module => {
          defaultPerms[module] = { view: true, add: true, edit: true, delete: false };
        });
        break;
      case 'Packing':
        // Packing focused permissions
        const packingModules = ['Dashboard', 'Orders', 'Manufacturing', 'Inventory'];
        packingModules.forEach(module => {
          defaultPerms[module] = { view: true, add: false, edit: true, delete: false };
        });
        break;
    }
    
    setFormData(prev => ({ ...prev, permissions: defaultPerms }));
  };

  // Fetch users
  const { data: usersResponse, isLoading, error } = useQuery({
    queryKey: ['/api/users'],
    enabled: true,
    retry: 1
  });

  console.log('Users response:', usersResponse);
  console.log('Loading:', isLoading);
  console.log('Error:', error);

  // Extract users from response - handle both array and object with users property
  const users = Array.isArray(usersResponse) ? usersResponse : (usersResponse?.users || []);
  
  console.log('Processed users:', users);

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData) => {
      return await apiRequest('POST', '/api/users', userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/users']);
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "User created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }) => {
      return await apiRequest('PUT', `/api/users/${id}`, userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/users']);
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      resetForm();
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      return await apiRequest('DELETE', `/api/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/users']);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, newPassword }) => {
      return await apiRequest('POST', `/api/users/${userId}/reset-password`, { password: newPassword });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password reset successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      role: '',
      unit: '',
      isActive: true,
      permissions: { ...DEFAULT_PERMISSIONS }
    });
  };

  const handleCreateUser = () => {
    createUserMutation.mutate(formData);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      fullName: user.fullName,
      role: user.role,
      unit: user.unit,
      isActive: user.isActive
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = () => {
    const updateData = { ...formData };
    if (!updateData.password) {
      delete updateData.password; // Don't update password if not provided
    }
    updateUserMutation.mutate({ id: selectedUser._id, userData: updateData });
  };

  const handleDeleteUser = (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleResetPassword = (userId) => {
    const newPassword = prompt('Enter new password:');
    if (newPassword) {
      resetPasswordMutation.mutate({ userId, newPassword });
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'Super User': return 'default';
      case 'Unit Head': return 'secondary';
      case 'Production': return 'outline';
      case 'Packing': return 'outline';
      case 'Dispatch': return 'outline';
      case 'Accounts': return 'outline';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">Error loading users: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">
              Manage users, roles, and permissions for the manufacturing system.
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the manufacturing system.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fullName" className="text-right">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <Select value={formData.role} onValueChange={(value) => {
                    setFormData({...formData, role: value});
                    setRoleDefaultPermissions(value);
                  }}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unit" className="text-right">
                    Unit
                  </Label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData({...formData, unit: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Permissions Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Module Permissions</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setRoleDefaultPermissions(formData.role)}
                    >
                      Reset to Role Defaults
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-32">Module</TableHead>
                          <TableHead className="text-center w-20">View</TableHead>
                          <TableHead className="text-center w-20">Add</TableHead>
                          <TableHead className="text-center w-20">Edit</TableHead>
                          <TableHead className="text-center w-20">Delete</TableHead>
                          <TableHead className="text-center w-20">All</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {MODULES.map((module) => {
                          const modulePerms = formData.permissions[module] || {};
                          const allEnabled = PERMISSION_TYPES.every(type => modulePerms[type]);
                          
                          return (
                            <TableRow key={module}>
                              <TableCell className="font-medium">{module}</TableCell>
                              {PERMISSION_TYPES.map((permType) => (
                                <TableCell key={permType} className="text-center">
                                  <input
                                    type="checkbox"
                                    checked={modulePerms[permType] || false}
                                    onChange={(e) => updatePermission(module, permType, e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300"
                                  />
                                </TableCell>
                              ))}
                              <TableCell className="text-center">
                                <input
                                  type="checkbox"
                                  checked={allEnabled}
                                  onChange={(e) => toggleAllModulePermissions(module, e.target.checked)}
                                  className="h-4 w-4 rounded border-gray-300"
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleCreateUser} disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.filter(u => u.isActive).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Super Users</CardTitle>
              <SettingsIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.filter(u => u.role === 'Super User').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unit Heads</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.filter(u => u.role === 'Unit Head').length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              Manage user accounts, roles, and permissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.fullName || user.username}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.unit}</TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResetPassword(user._id)}
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-username" className="text-right">
                  Username
                </Label>
                <Input
                  id="edit-username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-fullName" className="text-right">
                  Full Name
                </Label>
                <Input
                  id="edit-fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role" className="text-right">
                  Role
                </Label>
                <Select value={formData.role} onValueChange={(value) => {
                  setFormData({...formData, role: value});
                  // Don't auto-reset permissions when editing, just update role
                }}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-unit" className="text-right">
                  Unit
                </Label>
                <Select value={formData.unit} onValueChange={(value) => setFormData({...formData, unit: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-active" className="text-right">
                  Active
                </Label>
                <Switch
                  id="edit-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                />
              </div>
              
              {/* Permissions Section for Edit */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Module Permissions</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRoleDefaultPermissions(formData.role)}
                  >
                    Reset to Role Defaults
                  </Button>
                </div>
                
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-32">Module</TableHead>
                        <TableHead className="text-center w-20">View</TableHead>
                        <TableHead className="text-center w-20">Add</TableHead>
                        <TableHead className="text-center w-20">Edit</TableHead>
                        <TableHead className="text-center w-20">Delete</TableHead>
                        <TableHead className="text-center w-20">All</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MODULES.map((module) => {
                        const modulePerms = formData.permissions[module] || {};
                        const allEnabled = PERMISSION_TYPES.every(type => modulePerms[type]);
                        
                        return (
                          <TableRow key={module}>
                            <TableCell className="font-medium">{module}</TableCell>
                            {PERMISSION_TYPES.map((permType) => (
                              <TableCell key={permType} className="text-center">
                                <input
                                  type="checkbox"
                                  checked={modulePerms[permType] || false}
                                  onChange={(e) => updatePermission(module, permType, e.target.checked)}
                                  className="h-4 w-4 rounded border-gray-300"
                                />
                              </TableCell>
                            ))}
                            <TableCell className="text-center">
                              <input
                                type="checkbox"
                                checked={allEnabled}
                                onChange={(e) => toggleAllModulePermissions(module, e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleUpdateUser} disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? 'Updating...' : 'Update User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
}