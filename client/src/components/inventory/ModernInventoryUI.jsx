import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  showSmartToast, 
  showSuccessToast, 
  showWarningToast,
  showNetworkStatusToast 
} from '@/lib/toast-utils';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import ModernInventoryForm from './ModernInventoryForm';
import ViewItemModal from './ViewItemModal';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import CategoryManagement from './CategoryManagement';
import { apiRequest } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Tag,
  Package2,
  DollarSign,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

// Modern Stats Component
function ModernStats({ stats, isLoading }) {
  const statsCards = [
    {
      title: 'Total Items',
      value: stats?.overview?.totalItems || 0,
      icon: Package2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      change: '+12%'
    },
    {
      title: 'Total Value',
      value: `₹${(stats?.overview?.totalValue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      change: '+8%'
    },
    {
      title: 'Low Stock',
      value: stats?.overview?.lowStockItems || 0,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      change: '-3%'
    },
    {
      title: 'Categories',
      value: stats?.overview?.totalCategories || 0,
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
                      {isLoading ? (
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

// Main component
export default function ModernInventoryUI() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isOnline } = useNetworkStatus();
  const queryClient = useQueryClient();
  
  // State management
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, item: null });
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Data fetching with React Query
  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['/api/items'],
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/inventory/stats'],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: customerCategories = [] } = useQuery({
    queryKey: ['/api/customer-categories'],
  });

  // Mutations for CRUD operations
  const createItemMutation = useMutation({
    mutationFn: (itemData) => apiRequest('POST', '/api/items', itemData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/stats'] });
      showSuccessToast('Item Created', 'New inventory item added successfully');
      setIsFormOpen(false);
      setEditingItem(null);
    },
    onError: (error) => {
      console.error('Create item error:', error);
      showSmartToast(error, 'Create Item');
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }) => apiRequest('PUT', `/api/items/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/stats'] });
      showSuccessToast('Item Updated', 'Inventory item updated successfully');
      setIsFormOpen(false);
      setEditingItem(null);
    },
    onError: (error) => {
      console.error('Update item error:', error);
      showSmartToast(error, 'Update Item');
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id) => apiRequest('DELETE', `/api/items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/stats'] });
      showSuccessToast('Item Deleted', 'Inventory item deleted successfully');
      setDeleteConfirm({ isOpen: false, item: null });
    },
    onError: (error) => {
      console.error('Delete item error:', error);
      showSmartToast(error, 'Delete Item');
    }
  });

  // Network status monitoring
  useEffect(() => {
    showNetworkStatusToast(isOnline);
  }, [isOnline]);

  // Form submission handler
  const handleFormSubmit = async (formData) => {
    try {
      if (editingItem) {
        await updateItemMutation.mutateAsync({ 
          id: editingItem._id, 
          data: formData 
        });
      } else {
        await createItemMutation.mutateAsync(formData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      showSmartToast(error, 'Form Submission');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleView = (item) => {
    setViewItem(item);
  };

  const handleDelete = (item) => {
    setDeleteConfirm({ 
      isOpen: true, 
      item,
      title: "Delete Item",
      description: `Are you sure you want to delete this inventory item?`,
      itemName: item.name
    });
  };

  const confirmDelete = () => {
    if (deleteConfirm.item) {
      deleteItemMutation.mutate(deleteConfirm.item._id);
    }
  };

  // Filter and sort items
  const filteredItems = items.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      case 'code':
        return (a.code || '').localeCompare(b.code || '');
      case 'category':
        return (a.category || '').localeCompare(b.category || '');
      case 'qty':
        return (b.qty || 0) - (a.qty || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      <ModernStats stats={stats} isLoading={statsLoading} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Inventory Items
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Inventory Management
                </CardTitle>
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="code">Code</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="qty">Quantity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name/Code</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading items...
                        </TableCell>
                      </TableRow>
                    ) : filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No items found. Add your first inventory item to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map((item) => (
                        <TableRow key={item._id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">{item.code}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <Badge variant="outline">{item.category}</Badge>
                              {item.subCategory && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {item.subCategory}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.qty} {item.unit}</div>
                              <div className="text-xs text-muted-foreground">
                                Min: {item.minStock} {item.unit}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>₹{item.salePrice?.toLocaleString() || 0}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={(item.qty || 0) <= (item.minStock || 0) ? 'destructive' : 'default'}
                            >
                              {(item.qty || 0) <= (item.minStock || 0) ? 'Low Stock' : 'In Stock'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleView(item)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(item)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(item)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManagement />
        </TabsContent>
      </Tabs>

      <ModernInventoryForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
        }}
        item={editingItem}
        categories={categories}
        customerCategories={customerCategories}
        onSubmit={handleFormSubmit}
        isLoading={createItemMutation.isPending || updateItemMutation.isPending}
      />

      <ViewItemModal
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
        item={viewItem}
      />

      <DeleteConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, item: null })}
        onConfirm={confirmDelete}
        title="Delete Inventory Item"
        description="Are you sure you want to delete this inventory item?"
        itemName={deleteConfirm.item?.name}
        isLoading={deleteItemMutation.isPending}
      />
    </div>
  );
}