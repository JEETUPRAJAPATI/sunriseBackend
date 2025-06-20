import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  TrendingDown,
  RefreshCw,
  FolderPlus,
  Tags,
  Users
} from 'lucide-react';

import ModernInventoryForm from './ModernInventoryForm';
import ViewItemModal from './ViewItemModal';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import CategoryManagement from './CategoryManagement';

import { apiRequest } from '@/lib/queryClient';
import { showSmartToast } from '@/lib/toast-utils';

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
      value: `₹${stats?.overview?.totalValue?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      change: '+8%'
    },
    {
      title: 'Low Stock',
      value: stats?.overview?.lowStockItems || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
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
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-muted-foreground">{stat.title}</div>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  ) : (
                    stat.value
                  )}
                </div>
                <div className="text-xs text-green-600 font-medium">{stat.change}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function ModernInventoryUI() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, item: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCustomerCategoryModal, setShowCustomerCategoryModal] = useState(false);

  // Data fetching with React Query
  const { data: itemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ['/api/items'],
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/inventory/stats'],
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: customerCategoriesData } = useQuery({
    queryKey: ['/api/customer-categories'],
  });

  // Extract arrays from API response
  const items = Array.isArray(itemsData?.items) ? itemsData.items : [];
  const categories = Array.isArray(categoriesData?.categories) ? categoriesData.categories : [];
  const customerCategories = Array.isArray(customerCategoriesData?.customerCategories) ? customerCategoriesData.customerCategories : [];

  // Mutations
  const deleteItemMutation = useMutation({
    mutationFn: (id) => apiRequest('DELETE', `/api/items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/items']);
      queryClient.invalidateQueries(['/api/inventory/stats']);
      setDeleteConfirm({ isOpen: false, item: null });
      toast({
        title: "Item Deleted",
        description: "Inventory item has been deleted successfully",
      });
    },
    onError: (error) => {
      showSmartToast(error, 'Delete Item');
    }
  });

  const createItemMutation = useMutation({
    mutationFn: (data) => apiRequest('POST', '/api/items', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/items']);
      queryClient.invalidateQueries(['/api/inventory/stats']);
      setIsFormOpen(false);
      setEditingItem(null);
      toast({
        title: "Item Created",
        description: "New inventory item has been created successfully",
      });
    },
    onError: (error) => {
      showSmartToast(error, 'Create Item');
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }) => apiRequest('PUT', `/api/items/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/items']);
      queryClient.invalidateQueries(['/api/inventory/stats']);
      setIsFormOpen(false);
      setEditingItem(null);
      toast({
        title: "Item Updated",
        description: "Inventory item has been updated successfully",
      });
    },
    onError: (error) => {
      showSmartToast(error, 'Update Item');
    }
  });

  // Handlers
  const handleFormSubmit = (data) => {
    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem._id, data });
    } else {
      createItemMutation.mutate(data);
    }
  };

  const handleView = (item) => {
    setViewItem(item);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsFormOpen(true);
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

  const handleRefresh = () => {
    queryClient.invalidateQueries(['/api/items']);
    queryClient.invalidateQueries(['/api/categories']);
    queryClient.invalidateQueries(['/api/customer-categories']);
    queryClient.invalidateQueries(['/api/inventory/stats']);
    toast({
      title: "Refreshed",
      description: "Inventory data has been refreshed successfully",
    });
  };

  // Filter and sort items
  const filteredItems = items.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || item.category === selectedCategory;
    
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
      
      {/* Modern Action Bar */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-col">
              <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                Quick Actions
              </h2>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Manage your inventory efficiently with these actions
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => setIsFormOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
              <Button 
                onClick={() => setShowCategoryModal(true)}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-950/30"
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
              <Button 
                onClick={() => setShowCustomerCategoryModal(true)}
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-950/30"
              >
                <Users className="h-4 w-4 mr-2" />
                Customer Category
              </Button>
              <Button 
                onClick={handleRefresh}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-950/30"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Buttons */}
        <div className="lg:col-span-1 space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-left h-12 bg-blue-600 text-white hover:bg-blue-700"
          >
            <Package className="h-5 w-5 mr-3" />
            Inventory Items
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-left h-12 hover:bg-blue-50 dark:hover:bg-blue-950/30"
          >
            <Tag className="h-5 w-5 mr-3" />
            Categories
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-left h-12 hover:bg-green-50 dark:hover:bg-green-950/30"
          >
            <Users className="h-5 w-5 mr-3" />
            Customer Categories
          </Button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <Card className="shadow-sm border-gray-200 dark:border-gray-700">
            <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
              <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <Package className="h-5 w-5" />
                Inventory Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search items by name, code, or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[200px] border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400">
                      <Filter className="h-4 w-4 mr-2 text-gray-400" />
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Package2 className="h-4 w-4" />
                          All Categories
                        </div>
                      </SelectItem>
                      {categories.length > 0 && categories.map((category) => (
                        <SelectItem key={category._id || category.name} value={category.name}>
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[150px] border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400">
                      <BarChart3 className="h-4 w-4 mr-2 text-gray-400" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name A-Z</SelectItem>
                      <SelectItem value="code">Code</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="qty">Quantity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Name/Code</TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Category</TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Stock</TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Price</TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Status</TableHead>
                        <TableHead className="w-[100px] font-semibold text-gray-900 dark:text-gray-100">Actions</TableHead>
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
                        filteredItems.map((item, index) => (
                          <TableRow 
                            key={item._id} 
                            className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                              index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/20'
                            }`}
                          >
                            <TableCell className="py-4">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{item.code}</div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800">
                                  {item.category}
                                </Badge>
                                {item.subCategory && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {item.subCategory}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">{item.qty} {item.unit}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Min: {item.minStock} {item.unit}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <span className="font-medium text-green-600 dark:text-green-400">
                                ₹{item.salePrice?.toLocaleString() || 0}
                              </span>
                            </TableCell>
                            <TableCell className="py-4">
                              <Badge 
                                variant={(item.qty || 0) <= (item.minStock || 0) ? 'destructive' : 'default'}
                                className={
                                  (item.qty || 0) <= (item.minStock || 0) 
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                }
                              >
                                {(item.qty || 0) <= (item.minStock || 0) ? 'Low Stock' : 'In Stock'}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                  <DropdownMenuItem onClick={() => handleView(item)} className="hover:bg-blue-50 dark:hover:bg-blue-950/30">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEdit(item)} className="hover:bg-green-50 dark:hover:bg-green-950/30">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Item
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDelete(item)}
                                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 dark:text-red-400"
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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

      <CategoryManagement 
        showCategoryModal={showCategoryModal}
        setShowCategoryModal={setShowCategoryModal}
        showCustomerCategoryModal={showCustomerCategoryModal}
        setShowCustomerCategoryModal={setShowCustomerCategoryModal}
      />
    </div>
  );
}