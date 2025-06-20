import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Settings,
  FolderOpen,
  RefreshCw,
  BarChart3,
  Package2,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ModernInventoryForm from './ModernInventoryForm';

// Modern Stats Component
function ModernStats({ stats, loading }) {
  const statsCards = [
    {
      title: 'Total Items',
      value: stats?.totalItems || 0,
      icon: Package2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      change: '+12%'
    },
    {
      title: 'Total Value',
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats?.totalValue || 0),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      change: '+8%'
    },
    {
      title: 'Low Stock',
      value: stats?.lowStockCount || 0,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      change: '-3%'
    },
    {
      title: 'Categories',
      value: stats?.categoriesCount || 0,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      change: '+2%'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center">
              <div className={`p-4 ${stat.bgColor}`}>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <div className="flex-1 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">
                      {loading ? (
                        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      ) : (
                        stat.value
                      )}
                    </p>
                  </div>
                  <div className="text-xs text-green-600 font-medium">
                    {stat.change}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Modern Filters Component
function ModernFilters({ filters, onFiltersChange, categories, loading }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters & Search
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <Label>Search Items</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, code, or description..."
                value={filters.search || ''}
                onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>
          
          <div>
            <Label>Category</Label>
            <Select 
              value={filters.category || 'all'} 
              onValueChange={(value) => onFiltersChange({ ...filters, category: value === 'all' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Sort By</Label>
            <Select 
              value={filters.sortBy || 'name'} 
              onValueChange={(value) => onFiltersChange({ ...filters, sortBy: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="code">Code</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="qty">Quantity</SelectItem>
                <SelectItem value="stdCost">Cost</SelectItem>
                <SelectItem value="createdAt">Date Added</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Modern Table Component
function ModernTable({ items, loading, onEdit, onDelete, onView, canEdit, canDelete }) {
  const getStockStatus = (item) => {
    if (item.qty === 0) return { status: 'Out of Stock', color: 'destructive' };
    if (item.qty <= (item.minStock || 5)) return { status: 'Low Stock', color: 'secondary' };
    return { status: 'In Stock', color: 'default' };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6 animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!items.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No items found</h3>
          <p className="text-muted-foreground text-center">
            Start by adding your first inventory item or adjust your filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Items ({items.length})</CardTitle>
        <CardDescription>
          Manage your inventory items and track stock levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const stockStatus = getStockStatus(item);
                return (
                  <TableRow key={item._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground font-mono">{item.code}</div>
                        {item.description && (
                          <div className="text-sm text-muted-foreground mt-1">{item.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Badge variant="outline">{item.category}</Badge>
                        {item.customerCategory && (
                          <div className="mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {item.customerCategory}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.qty} {item.unit}</div>
                        {item.minStock && (
                          <div className="text-sm text-muted-foreground">
                            Min: {item.minStock}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{formatCurrency(item.salePrice)}</div>
                        <div className="text-sm text-muted-foreground">
                          Cost: {formatCurrency(item.stdCost)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={stockStatus.color}>{stockStatus.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onView?.(item)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          {canEdit && (
                            <DropdownMenuItem onClick={() => onEdit(item)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {canDelete && (
                            <DropdownMenuItem 
                              onClick={() => onDelete(item._id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// Category Management Component
function CategoryManager({ categories, customerCategories, loading }) {
  const [newCategory, setNewCategory] = useState({ name: '', subCategories: [] });
  const [newCustomerCategory, setNewCustomerCategory] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingCustomerCategory, setEditingCustomerCategory] = useState(null);
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories">Product Categories</TabsTrigger>
          <TabsTrigger value="customer">Customer Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Categories</CardTitle>
              <CardDescription>Organize your products into categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Add new category form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                  <Input
                    placeholder="Category name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  />
                  <Button onClick={() => console.log('Add category')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </div>
                
                {/* Categories list */}
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{category.name}</div>
                        {category.subCategories?.length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            {category.subCategories.length} subcategories
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingCategory(category)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Categories</CardTitle>
              <CardDescription>Define customer segments for pricing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Add new customer category form */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                  <Input
                    placeholder="Category name"
                    value={newCustomerCategory.name}
                    onChange={(e) => setNewCustomerCategory({ ...newCustomerCategory, name: e.target.value })}
                  />
                  <Input
                    placeholder="Description"
                    value={newCustomerCategory.description}
                    onChange={(e) => setNewCustomerCategory({ ...newCustomerCategory, description: e.target.value })}
                    className="md:col-span-2"
                  />
                  <Button onClick={() => console.log('Add customer category')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                
                {/* Customer categories list */}
                <div className="space-y-2">
                  {customerCategories.map((category) => (
                    <div key={category._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{category.name}</div>
                        {category.description && (
                          <div className="text-sm text-muted-foreground">{category.description}</div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingCustomerCategory(category)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Main Component
export default function ModernInventoryUI() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Permissions
  const canView = user?.permissions?.Inventory?.view || user?.role === 'Super User';
  const canAdd = user?.permissions?.Inventory?.add || user?.role === 'Super User';
  const canEdit = user?.permissions?.Inventory?.edit || user?.role === 'Super User';
  const canDelete = user?.permissions?.Inventory?.delete || user?.role === 'Super User';

  // Queries
  const { data: itemsData, isLoading: itemsLoading, refetch: refetchItems } = useQuery({
    queryKey: ['/api/items', filters],
    enabled: canView,
    retry: false,
    staleTime: 10000,
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
    enabled: canView,
    retry: false,
    staleTime: 300000,
  });

  const { data: customerCategoriesData, isLoading: customerCategoriesLoading } = useQuery({
    queryKey: ['/api/customer-categories'],
    enabled: canView,
    retry: false,
    staleTime: 300000,
  });

  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['/api/inventory/stats'],
    enabled: canView,
    retry: false,
    staleTime: 10000,
  });

  // Mutations
  const createItemMutation = useMutation({
    mutationFn: async (itemData) => {
      console.log('Creating item with data:', itemData);
      const response = await api.createItem(itemData);
      return response;
    },
    onSuccess: (data) => {
      console.log('Item created successfully:', data);
      
      // Force immediate cache invalidation and refetch
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/stats'] });
      
      // Additional forced refetch with delay
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/items'] });
        queryClient.refetchQueries({ queryKey: ['/api/inventory/stats'] });
      }, 100);
      
      setIsAddModalOpen(false);
    },
    onError: (error) => {
      console.error('Create item mutation error:', error);
      throw error;
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      console.log('Updating item:', id, 'with data:', data);
      const response = await api.updateItem(id, data);
      return response;
    },
    onSuccess: (data) => {
      console.log('Item updated successfully:', data);
      
      // Force immediate cache invalidation and refetch
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/stats'] });
      
      // Additional forced refetch with delay
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/items'] });
        queryClient.refetchQueries({ queryKey: ['/api/inventory/stats'] });
      }, 100);
      
      setIsEditModalOpen(false);
      setSelectedItem(null);
    },
    onError: (error) => {
      console.error('Update item mutation error:', error);
      throw error;
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.deleteItem(id);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/stats'] });
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to delete item',
        variant: "destructive",
      });
    }
  });

  // Extract data
  const items = itemsData?.items || [];
  const categories = categoriesData?.categories || [];
  const customerCategories = customerCategoriesData?.customerCategories || [];
  const stats = statsData?.overview || {};

  // Event handlers
  const handleCreateItem = async (data) => {
    try {
      const result = await createItemMutation.mutateAsync(data);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateItem = async (data) => {
    if (selectedItem) {
      try {
        const result = await updateItemMutation.mutateAsync({ id: selectedItem._id, data });
        return result;
      } catch (error) {
        throw error;
      }
    }
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleDeleteItem = async (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteItemMutation.mutateAsync(id);
    }
  };

  const handleRefresh = () => {
    refetchItems();
    refetchStats();
  };

  if (!canView) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <XCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground text-center">
            You don't have permission to view inventory data.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage your inventory items, categories, and stock levels
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={itemsLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${itemsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => setIsCategoryModalOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Categories
          </Button>
          {canAdd && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <ModernStats stats={stats} loading={statsLoading} />

      {/* Filters */}
      <ModernFilters 
        filters={filters} 
        onFiltersChange={setFilters} 
        categories={categories}
        loading={categoriesLoading}
      />

      {/* Items Table */}
      <ModernTable 
        items={items}
        loading={itemsLoading}
        onEdit={handleEditItem}
        onDelete={handleDeleteItem}
        canEdit={canEdit}
        canDelete={canDelete}
      />

      {/* Add Item Modal */}
      <ModernInventoryForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={categories}
        customerCategories={customerCategories}
        onSubmit={handleCreateItem}
        isLoading={createItemMutation.isPending}
      />

      {/* Edit Item Modal */}
      <ModernInventoryForm
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        categories={categories}
        customerCategories={customerCategories}
        onSubmit={handleUpdateItem}
        isLoading={updateItemMutation.isPending}
      />

      {/* Category Management Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Category Management
            </DialogTitle>
            <DialogDescription>
              Manage product categories and customer segments
            </DialogDescription>
          </DialogHeader>
          <CategoryManager 
            categories={categories}
            customerCategories={customerCategories}
            loading={categoriesLoading || customerCategoriesLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}