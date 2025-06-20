import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Package,
  Settings,
  Loader2,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

// Import our new components
import ModernInventoryForm from '@/components/inventory/ModernInventoryForm';
import InventoryTable from '@/components/inventory/InventoryTable';
import InventoryFilters from '@/components/inventory/InventoryFilters';
import InventoryStats, { InventoryTypeBreakdown } from '@/components/inventory/InventoryStats';

export default function InventoryModern() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    subCategory: '',
    importance: '',
    unit: '',
    lowStock: false,
    outOfStock: false,
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    limit: 20
  });

  // Check permissions
  const canView = user?.permissions?.Inventory?.view || user?.role === 'Super User';
  const canAdd = user?.permissions?.Inventory?.add || user?.role === 'Super User';
  const canEdit = user?.permissions?.Inventory?.edit || user?.role === 'Super User';
  const canDelete = user?.permissions?.Inventory?.delete || user?.role === 'Super User';

  // Data fetching
  const { data: itemsData, isLoading: itemsLoading, error: itemsError } = useQuery({
    queryKey: ['/api/items', filters],
    enabled: canView,
    retry: false,
    staleTime: 30000, // 30 seconds
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
    enabled: canView,
    retry: false,
    staleTime: 300000, // 5 minutes (categories don't change often)
    refetchOnMount: false, // Categories are more static
  });

  const { data: customerCategoriesData, isLoading: customerCategoriesLoading } = useQuery({
    queryKey: ['/api/customer-categories'],
    enabled: canView,
    retry: false,
    staleTime: 300000, // 5 minutes (customer categories don't change often)
    refetchOnMount: false, // Customer categories are more static
  });

  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['/api/inventory/stats'],
    enabled: canView,
    retry: false,
    staleTime: 10000, // 10 seconds for more frequent updates
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Extract data
  const items = itemsData?.items || [];
  const pagination = itemsData?.pagination || {};
  const categories = categoriesData?.categories || [];
  const customerCategories = customerCategoriesData?.customerCategories || [];
  const stats = statsData?.overview || {};
  const typeStats = statsData?.typeStats || [];

  // Mutations
  const createItemMutation = useMutation({
    mutationFn: async (itemData) => {
      const response = await api.createItem(itemData);
      return response;
    },
    onSuccess: (data) => {
      // Immediately invalidate and refetch all related queries
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/stats'] });
      
      // Force immediate refetch to update UI
      queryClient.refetchQueries({ queryKey: ['/api/items'] });
      queryClient.refetchQueries({ queryKey: ['/api/inventory/stats'] });
      
      setIsAddModalOpen(false);
      toast({
        title: "Success",
        description: "Item created successfully",
      });
    },
    onError: (error) => {
      throw error;
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.updateItem(id, data);
      return response;
    },
    onSuccess: (data) => {
      // Immediately invalidate and refetch all related queries
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/stats'] });
      
      // Force immediate refetch to update UI
      queryClient.refetchQueries({ queryKey: ['/api/items'] });
      queryClient.refetchQueries({ queryKey: ['/api/inventory/stats'] });
      
      setIsEditModalOpen(false);
      setSelectedItem(null);
      toast({
        title: "Success",
        description: "Item updated successfully",
      });
    },
    onError: (error) => {
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
      setDeleteItem(null);
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

  // Event handlers
  const handleCreateItem = async (data) => {
    try {
      const result = await createItemMutation.mutateAsync(data);
      return result;
    } catch (error) {
      console.error('Create item error:', error);
      throw error;
    }
  };

  const handleUpdateItem = async (data) => {
    if (selectedItem) {
      try {
        const result = await updateItemMutation.mutateAsync({ id: selectedItem._id, data });
        return result;
      } catch (error) {
        console.error('Update item error:', error);
        throw error;
      }
    }
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleDeleteItem = (item) => {
    setDeleteItem(item);
  };

  const confirmDelete = async () => {
    if (deleteItem) {
      await deleteItemMutation.mutateAsync(deleteItem._id);
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/items'] });
    queryClient.invalidateQueries({ queryKey: ['/api/inventory/stats'] });
    queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      category: '',
      subCategory: '',
      importance: '',
      unit: '',
      lowStock: false,
      outOfStock: false,
      sortBy: 'name',
      sortOrder: 'asc',
      page: 1,
      limit: 20
    });
  };

  // Permission check
  if (!canView) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to view inventory.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Inventory Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your inventory items, categories, and stock levels
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={itemsLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${itemsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {canAdd && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          )}
        </div>
      </div>

      {/* Error State */}
      {itemsError && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <p className="text-red-700 dark:text-red-400">
                Failed to load inventory data. Please try refreshing the page.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Manage Items
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Overview */}
          <InventoryStats stats={stats} isLoading={statsLoading} />
          
          {/* Type Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <InventoryTypeBreakdown typeStats={typeStats} isLoading={statsLoading} />
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {canAdd && (
                    <Button 
                      onClick={() => setIsAddModalOpen(true)} 
                      className="w-full justify-start"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Item
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('manage')} 
                    className="w-full justify-start"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Manage Items
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleRefresh} 
                    className="w-full justify-start"
                    disabled={itemsLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${itemsLoading ? 'animate-spin' : ''}`} />
                    Refresh Data
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Low Stock Items */}
          {stats.lowStockItems > 0 && (
            <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                  <AlertTriangle className="h-5 w-5" />
                  Low Stock Alert
                </CardTitle>
                <CardDescription>
                  {stats.lowStockItems} items are running low on stock and need attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => {
                    setFilters(prev => ({ ...prev, lowStock: true }));
                    setActiveTab('manage');
                  }}
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  View Low Stock Items
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          {/* Filters */}
          <InventoryFilters
            filters={filters}
            onFiltersChange={setFilters}
            categories={categories}
            onClearFilters={clearFilters}
            itemCount={pagination.total || 0}
          />

          {/* Items Table */}
          <InventoryTable
            items={items}
            isLoading={itemsLoading}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            permissions={{
              edit: canEdit,
              delete: canDelete
            }}
          />

          {/* Pagination */}
          {pagination.total > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} items
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page >= pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the item "{deleteItem?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteItemMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteItemMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}