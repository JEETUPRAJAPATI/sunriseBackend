import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  AlertTriangle,
  Package,
  TrendingUp,
  DollarSign,
  BarChart3,
  Settings,
  Eye,
  X,
  FolderOpen
} from 'lucide-react';

const ITEM_TYPES = ['Product', 'Material', 'Spares', 'Assemblies'];
const IMPORTANCE_LEVELS = ['Low', 'Normal', 'High', 'Critical'];
const UNITS = ['pieces', 'kg', 'liters', 'meters', 'sheets', 'boxes', 'units'];

// Category Management Component
function CategoryManagement() {
  const queryClient = useQueryClient();
  const [newCategory, setNewCategory] = useState({ name: '', subCategories: [''] });
  const [editingCategory, setEditingCategory] = useState(null);

  const { data: categoriesData } = useQuery({
    queryKey: ['/api/categories'],
    retry: false
  });

  const categories = categoriesData?.categories || [];

  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData) => {
      const response = await api.createCategory({
        ...categoryData,
        subCategories: categoryData.subCategories.filter(sub => sub.trim())
      });
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setNewCategory({ name: '', subCategories: [''] });
      // Show success message if available
      if (data?.message) {
        console.log('Success:', data.message);
      }
    },
    onError: (error) => {
      console.error('Category creation failed:', error);
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.updateCategory(id, {
        ...data,
        subCategories: data.subCategories.filter(sub => sub.trim())
      });
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setEditingCategory(null);
      if (data?.message) {
        console.log('Success:', data.message);
      }
    },
    onError: (error) => {
      console.error('Category update failed:', error);
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.deleteCategory(id);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      if (data?.message) {
        console.log('Success:', data.message);
      }
    },
    onError: (error) => {
      console.error('Category deletion failed:', error);
    }
  });

  const handleAddSubCategory = (category = null) => {
    if (category && editingCategory?._id === category._id) {
      setEditingCategory({
        ...editingCategory,
        subCategories: [...editingCategory.subCategories, '']
      });
    } else {
      setNewCategory({
        ...newCategory,
        subCategories: [...newCategory.subCategories, '']
      });
    }
  };

  const handleRemoveSubCategory = (index, category = null) => {
    if (category && editingCategory?._id === category._id) {
      setEditingCategory({
        ...editingCategory,
        subCategories: editingCategory.subCategories.filter((_, i) => i !== index)
      });
    } else {
      setNewCategory({
        ...newCategory,
        subCategories: newCategory.subCategories.filter((_, i) => i !== index)
      });
    }
  };

  const handleSubCategoryChange = (index, value, category = null) => {
    if (category && editingCategory?._id === category._id) {
      const updated = [...editingCategory.subCategories];
      updated[index] = value;
      setEditingCategory({ ...editingCategory, subCategories: updated });
    } else {
      const updated = [...newCategory.subCategories];
      updated[index] = value;
      setNewCategory({ ...newCategory, subCategories: updated });
    }
  };

  return (
    <div className="space-y-8">
      {/* Add New Category */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-blue-900 dark:text-blue-100">
            <Plus className="h-6 w-6 text-blue-600" />
            Create New Category
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="category-name">Category Name</Label>
            <Input
              id="category-name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              placeholder="Enter category name"
            />
          </div>
          
          <div>
            <Label>Sub-Categories</Label>
            <div className="space-y-2">
              {newCategory.subCategories.map((subCat, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={subCat}
                    onChange={(e) => handleSubCategoryChange(index, e.target.value, null)}
                    placeholder="Enter sub-category name"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveSubCategory(index, null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddSubCategory(null)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Sub-Category
              </Button>
            </div>
          </div>
          
          <Button
            onClick={() => createCategoryMutation.mutate(newCategory)}
            disabled={!newCategory.name.trim() || createCategoryMutation.isPending}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 px-8"
          >
            {createCategoryMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Category
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Categories */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <FolderOpen className="h-6 w-6 text-purple-600" />
            Existing Categories
            <Badge variant="secondary" className="ml-2">
              {categories.length} categories
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category) => (
              <div key={category._id} className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                {editingCategory?._id === category._id ? (
                  <div className="space-y-4">
                    <Input
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    />
                    
                    <div>
                      <Label>Sub-Categories</Label>
                      <div className="space-y-2">
                        {editingCategory.subCategories.map((subCat, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={subCat}
                              onChange={(e) => handleSubCategoryChange(index, e.target.value, editingCategory)}
                              placeholder="Enter sub-category name"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveSubCategory(index, editingCategory)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddSubCategory(editingCategory)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Sub-Category
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateCategoryMutation.mutate({ 
                          id: editingCategory._id, 
                          data: editingCategory 
                        })}
                        disabled={updateCategoryMutation.isPending}
                      >
                        {updateCategoryMutation.isPending ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingCategory(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{category.name}</h4>
                      {category.subCategories.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Sub-categories:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {category.subCategories.map((subCat, index) => (
                              <Badge key={index} variant="secondary">
                                {subCat}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingCategory(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this category?')) {
                            deleteCategoryMutation.mutate(category._id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Customer Category Management Component
function CustomerCategoryManagement() {
  const queryClient = useQueryClient();
  const [newCustomerCategory, setNewCustomerCategory] = useState({ name: '', description: '' });
  const [editingCustomerCategory, setEditingCustomerCategory] = useState(null);

  const { data: customerCategoriesData } = useQuery({
    queryKey: ['/api/customer-categories'],
    retry: false
  });

  const customerCategories = customerCategoriesData?.customerCategories || [];

  const createCustomerCategoryMutation = useMutation({
    mutationFn: async (categoryData) => {
      const response = await api.createCustomerCategory(categoryData);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/customer-categories'] });
      setNewCustomerCategory({ name: '', description: '' });
      if (data?.message) {
        console.log('Success:', data.message);
      }
    },
    onError: (error) => {
      console.error('Customer category creation failed:', error);
    }
  });

  const updateCustomerCategoryMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.updateCustomerCategory(id, data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/customer-categories'] });
      setEditingCustomerCategory(null);
      if (data?.message) {
        console.log('Success:', data.message);
      }
    },
    onError: (error) => {
      console.error('Customer category update failed:', error);
    }
  });

  const deleteCustomerCategoryMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.deleteCustomerCategory(id);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/customer-categories'] });
      if (data?.message) {
        console.log('Success:', data.message);
      }
    },
    onError: (error) => {
      console.error('Customer category deletion failed:', error);
    }
  });

  return (
    <div className="space-y-6">
      {/* Add New Customer Category */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Customer Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="customer-category-name">Category Name</Label>
            <Input
              id="customer-category-name"
              value={newCustomerCategory.name}
              onChange={(e) => setNewCustomerCategory({ ...newCustomerCategory, name: e.target.value })}
              placeholder="Enter customer category name"
            />
          </div>
          
          <div>
            <Label htmlFor="customer-category-description">Description</Label>
            <Textarea
              id="customer-category-description"
              value={newCustomerCategory.description}
              onChange={(e) => setNewCustomerCategory({ ...newCustomerCategory, description: e.target.value })}
              placeholder="Enter description"
              rows="3"
            />
          </div>
          
          <Button
            onClick={() => createCustomerCategoryMutation.mutate(newCustomerCategory)}
            disabled={!newCustomerCategory.name.trim() || createCustomerCategoryMutation.isPending}
          >
            {createCustomerCategoryMutation.isPending ? 'Creating...' : 'Create Customer Category'}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Customer Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Customer Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customerCategories.map((category) => (
              <div key={category._id} className="border rounded-lg p-4">
                {editingCustomerCategory?._id === category._id ? (
                  <div className="space-y-4">
                    <Input
                      value={editingCustomerCategory.name}
                      onChange={(e) => setEditingCustomerCategory({ ...editingCustomerCategory, name: e.target.value })}
                      placeholder="Category name"
                    />
                    
                    <Textarea
                      value={editingCustomerCategory.description}
                      onChange={(e) => setEditingCustomerCategory({ ...editingCustomerCategory, description: e.target.value })}
                      placeholder="Description"
                      rows="3"
                    />
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateCustomerCategoryMutation.mutate({ 
                          id: editingCustomerCategory._id, 
                          data: editingCustomerCategory 
                        })}
                        disabled={updateCustomerCategoryMutation.isPending}
                      >
                        {updateCustomerCategoryMutation.isPending ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingCustomerCategory(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{category.name}</h4>
                      {category.description && (
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingCustomerCategory(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this customer category?')) {
                            deleteCustomerCategoryMutation.mutate(category._id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Inventory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [showLowStock, setShowLowStock] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCustomerCategoryModalOpen, setIsCustomerCategoryModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('items');
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: '',
    subCategory: '',
    batch: '',
    qty: 0,
    unit: 'pieces',
    store: '',
    importance: 'Normal',
    type: 'Product',
    stdCost: 0,
    purchaseCost: 0,
    salePrice: 0,
    hsn: '',
    gst: 0,
    mrp: 0,
    internalManufacturing: false,
    purchase: true,
    description: '',
    internalNotes: '',
    minStock: 0,
    leadTime: 0,
    tags: '',
    customerCategory: '',
    customerPrices: []
  });

  // Check permissions
  const canView = user?.permissions?.Inventory?.view || user?.role === 'Super User';
  const canAdd = user?.permissions?.Inventory?.add || user?.role === 'Super User';
  const canEdit = user?.permissions?.Inventory?.edit || user?.role === 'Super User';
  const canDelete = user?.permissions?.Inventory?.delete || user?.role === 'Super User';

  // Fetch data
  const { data: itemsData, isLoading: itemsLoading, error: itemsError } = useQuery({
    queryKey: ['/api/items', { 
      search: searchTerm, 
      type: selectedType === 'all' ? '' : selectedType,
      category: selectedCategory === 'all' ? '' : selectedCategory,
      subCategory: selectedSubCategory === 'all' ? '' : selectedSubCategory,
      lowStock: showLowStock,
      sortBy,
      sortOrder,
      page: currentPage,
      limit: itemsPerPage
    }],
    enabled: canView,
    retry: false
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['/api/categories'],
    enabled: canView,
    retry: false
  });

  const { data: customerCategoriesData } = useQuery({
    queryKey: ['/api/customer-categories'],
    enabled: canView,
    retry: false
  });

  const { data: statsData } = useQuery({
    queryKey: ['/api/inventory/stats'],
    enabled: canView,
    retry: false
  });

  const items = itemsData?.items || [];
  const pagination = itemsData?.pagination || {};
  const stats = statsData?.overview || {};
  const typeStats = statsData?.typeStats || [];
  const categories = categoriesData?.categories || [];
  const customerCategories = customerCategoriesData?.customerCategories || [];

  // Mutations
  const createItemMutation = useMutation({
    mutationFn: async (itemData) => {
      const response = await api.createItem(itemData);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/stats'] });
      setIsAddModalOpen(false);
      resetForm();
      if (data?.message) {
        console.log('Success:', data.message);
      }
    },
    onError: (error) => {
      console.error('Item creation failed:', error);
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.updateItem(id, data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/stats'] });
      setIsEditModalOpen(false);
      setSelectedItem(null);
      resetForm();
      if (data?.message) {
        console.log('Success:', data.message);
      }
    },
    onError: (error) => {
      console.error('Item update failed:', error);
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.deleteItem(id);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/stats'] });
      if (data?.message) {
        console.log('Success:', data.message);
      }
    },
    onError: (error) => {
      console.error('Item deletion failed:', error);
    }
  });

  // Helper functions
  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      category: '',
      subCategory: '',
      batch: '',
      qty: 0,
      unit: 'pieces',
      store: '',
      importance: 'Normal',
      type: 'Product',
      stdCost: 0,
      purchaseCost: 0,
      salePrice: 0,
      hsn: '',
      gst: 0,
      mrp: 0,
      internalManufacturing: false,
      purchase: true,
      description: '',
      internalNotes: '',
      minStock: 0,
      leadTime: 0,
      tags: '',
      customerCategory: '',
      customerPrices: []
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      ...item,
      tags: item.tags?.join(', ') || '',
      customerCategory: item.customerCategory || '',
      customerPrices: item.customerPrices || []
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteItemMutation.mutate(id);
    }
  };

  const handleSubmit = () => {
    const submitData = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
      qty: Number(formData.qty),
      stdCost: Number(formData.stdCost),
      purchaseCost: Number(formData.purchaseCost),
      salePrice: Number(formData.salePrice),
      gst: Number(formData.gst),
      mrp: Number(formData.mrp),
      minStock: Number(formData.minStock),
      leadTime: Number(formData.leadTime)
    };

    if (selectedItem) {
      updateItemMutation.mutate({ id: selectedItem._id, data: submitData });
    } else {
      createItemMutation.mutate(submitData);
    }
  };

  const getStockStatus = (item) => {
    if (item.qty <= 0) return { status: 'Out of Stock', color: 'destructive' };
    if (item.qty <= item.minStock) return { status: 'Low Stock', color: 'destructive' };
    if (item.qty <= item.minStock * 2) return { status: 'Warning', color: 'secondary' };
    return { status: 'In Stock', color: 'default' };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Available subcategories based on selected category
  const availableSubCategories = categories
    .find(cat => cat.name === formData.category)?.subCategories || [];

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-gray-600">Manage your inventory items, categories, and stock levels</p>
        </div>
        <div className="flex space-x-2">
          {canAdd && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          )}
          <Button variant="outline" onClick={() => setIsCategoryModalOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Categories
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <div className="text-2xl font-bold">{stats.totalItems || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalValue || 0)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Quantity</p>
                <div className="text-2xl font-bold">{stats.totalQty || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <div className="text-2xl font-bold">{stats.lowStockCount || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="type-filter">Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {ITEM_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="category-filter">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category._id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="sort-filter">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="code">Code</SelectItem>
                  <SelectItem value="qty">Quantity</SelectItem>
                  <SelectItem value="stdCost">Cost</SelectItem>
                  <SelectItem value="createdAt">Date Added</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="low-stock"
                  checked={showLowStock}
                  onCheckedChange={setShowLowStock}
                />
                <Label htmlFor="low-stock">Low Stock Only</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>
            Showing {items.length} of {pagination.total} items
          </CardDescription>
        </CardHeader>
        <CardContent>
          {itemsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600">Start by adding your first inventory item.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Sale Price</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
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
                            {item.description && (
                              <div className="text-sm text-gray-500">{item.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{item.code}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{item.category}</div>
                            {item.subCategory && (
                              <div className="text-sm text-gray-500">{item.subCategory}</div>
                            )}
                            {item.customerCategory && (
                              <div className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded mt-1 inline-block">
                                {item.customerCategory}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{item.qty}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.stdCost)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.salePrice)}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.qty * item.stdCost)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.color}>{stockStatus.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(item._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Management Modal - Clean Design */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-blue-600" />
              Category Management
            </DialogTitle>
            <DialogDescription>
              Organize your inventory with product categories and customer classifications
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="categories" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="categories">Product Categories</TabsTrigger>
              <TabsTrigger value="customer-categories">Customer Categories</TabsTrigger>
            </TabsList>
            
            <TabsContent value="categories" className="mt-4">
              <CategoryManagement />
            </TabsContent>
            
            <TabsContent value="customer-categories" className="mt-4">
              <CustomerCategoryManagement />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Item Modal */}
      <Dialog open={isAddModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedItem(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
            <DialogDescription>
              {selectedItem ? 'Update item details' : 'Enter item information to add to inventory'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter item name"
                />
              </div>
              
              <div>
                <Label htmlFor="code">Item Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  placeholder="Auto-generated if empty"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => {
                      handleInputChange('category', value);
                      handleInputChange('subCategory', ''); // Reset subcategory
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category._id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="subCategory">Sub-Category</Label>
                  <Select
                    value={formData.subCategory}
                    onValueChange={(value) => handleInputChange('subCategory', value)}
                    disabled={!formData.category}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sub-category" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubCategories.map(subCat => (
                        <SelectItem key={subCat} value={subCat}>
                          {subCat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="qty">Quantity *</Label>
                  <Input
                    id="qty"
                    type="number"
                    value={formData.qty}
                    onChange={(e) => handleInputChange('qty', e.target.value)}
                    min="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="unit">Unit *</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => handleInputChange('unit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map(unit => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="importance">Importance</Label>
                  <Select
                    value={formData.importance}
                    onValueChange={(value) => handleInputChange('importance', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {IMPORTANCE_LEVELS.map(level => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="store">Store Location</Label>
                  <Input
                    id="store"
                    value={formData.store}
                    onChange={(e) => handleInputChange('store', e.target.value)}
                    placeholder="Storage location"
                  />
                </div>
                
                <div>
                  <Label htmlFor="batch">Batch</Label>
                  <Input
                    id="batch"
                    value={formData.batch}
                    onChange={(e) => handleInputChange('batch', e.target.value)}
                    placeholder="Batch number"
                  />
                </div>
              </div>
            </div>
            
            {/* Type and Pricing */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Item Type</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ITEM_TYPES.map(type => (
                      <Button
                        key={type}
                        type="button"
                        variant={formData.type === type ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleInputChange('type', type)}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="customerCategory">Customer Category</Label>
                  <Select 
                    value={formData.customerCategory || "none"} 
                    onValueChange={(value) => handleInputChange('customerCategory', value === "none" ? "" : value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select customer category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No customer category</SelectItem>
                      {customerCategories.map((category) => (
                        <SelectItem key={category._id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="internalManufacturing"
                    checked={formData.internalManufacturing}
                    onCheckedChange={(checked) => handleInputChange('internalManufacturing', checked)}
                  />
                  <Label htmlFor="internalManufacturing">Internal Manufacturing</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="purchase"
                    checked={formData.purchase}
                    onCheckedChange={(checked) => handleInputChange('purchase', checked)}
                  />
                  <Label htmlFor="purchase">Purchase</Label>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stdCost">Standard Cost</Label>
                  <Input
                    id="stdCost"
                    type="number"
                    value={formData.stdCost}
                    onChange={(e) => handleInputChange('stdCost', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <Label htmlFor="purchaseCost">Purchase Cost</Label>
                  <Input
                    id="purchaseCost"
                    type="number"
                    value={formData.purchaseCost}
                    onChange={(e) => handleInputChange('purchaseCost', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salePrice">Sale Price</Label>
                  <Input
                    id="salePrice"
                    type="number"
                    value={formData.salePrice}
                    onChange={(e) => handleInputChange('salePrice', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <Label htmlFor="mrp">MRP</Label>
                  <Input
                    id="mrp"
                    type="number"
                    value={formData.mrp}
                    onChange={(e) => handleInputChange('mrp', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hsn">HSN/SAC</Label>
                  <Input
                    id="hsn"
                    value={formData.hsn}
                    onChange={(e) => handleInputChange('hsn', e.target.value)}
                    placeholder="HSN/SAC code"
                  />
                </div>
                
                <div>
                  <Label htmlFor="gst">GST %</Label>
                  <Input
                    id="gst"
                    type="number"
                    value={formData.gst}
                    onChange={(e) => handleInputChange('gst', e.target.value)}
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minStock">Min Stock</Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => handleInputChange('minStock', e.target.value)}
                    min="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="leadTime">Lead Time (days)</Label>
                  <Input
                    id="leadTime"
                    type="number"
                    value={formData.leadTime}
                    onChange={(e) => handleInputChange('leadTime', e.target.value)}
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Description and Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Item description"
                rows="3"
              />
            </div>
            
            <div>
              <Label htmlFor="internalNotes">Internal Notes</Label>
              <Textarea
                id="internalNotes"
                value={formData.internalNotes}
                onChange={(e) => handleInputChange('internalNotes', e.target.value)}
                placeholder="Internal notes"
                rows="3"
              />
            </div>
          </div>
          
          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="Enter tags separated by commas"
            />
          </div>
          
          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedItem(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createItemMutation.isPending || updateItemMutation.isPending}
            >
              {createItemMutation.isPending || updateItemMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}