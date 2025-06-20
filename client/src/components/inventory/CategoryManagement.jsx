import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { showSuccessToast, showSmartToast } from '@/lib/toast-utils';
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Tag,
  Users,
  AlertTriangle
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Confirmation Dialog Component
function ConfirmationDialog({ isOpen, onClose, onConfirm, title, description, confirmText = "Delete", confirmVariant = "destructive" }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main Category Management Component
export default function CategoryManagement({ 
  showCategoryForm, 
  setShowCategoryForm, 
  showCustomerCategoryForm, 
  setShowCustomerCategoryForm 
}) {
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingCustomerCategory, setEditingCustomerCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, item: null, type: null });
  const [currentView, setCurrentView] = useState('categories');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data fetching with proper extraction
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: customerCategoriesData, isLoading: customerCategoriesLoading } = useQuery({
    queryKey: ['/api/customer-categories'],
  });

  // Extract arrays from API response
  const categories = Array.isArray(categoriesData?.categories) ? categoriesData.categories : [];
  const customerCategories = Array.isArray(customerCategoriesData?.customerCategories) ? customerCategoriesData.customerCategories : [];

  // Mutations
  const createCategoryMutation = useMutation({
    mutationFn: (data) => apiRequest('POST', '/api/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/categories']);
      setShowCategoryForm(false);
      setEditingCategory(null);
      toast({
        title: "Success",
        description: "Category created successfully",
      });
    },
    onError: (error) => {
      showSmartToast(error, 'Create Category');
    }
  });

  const createCustomerCategoryMutation = useMutation({
    mutationFn: (data) => apiRequest('POST', '/api/customer-categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/customer-categories']);
      setShowCustomerCategoryForm(false);
      setEditingCustomerCategory(null);
      toast({
        title: "Success",
        description: "Customer category created successfully",
      });
    },
    onError: (error) => {
      showSmartToast(error, 'Create Customer Category');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, type }) => {
      const endpoint = type === 'customer' ? '/api/customer-categories' : '/api/categories';
      return apiRequest('DELETE', `${endpoint}/${id}`);
    },
    onSuccess: (_, { type }) => {
      const endpoint = type === 'customer' ? '/api/customer-categories' : '/api/categories';
      queryClient.invalidateQueries([endpoint]);
      showSuccessToast(
        `${type === 'customer' ? 'Customer Category' : 'Category'} Deleted`,
        'Successfully deleted the category'
      );
      setDeleteConfirm({ isOpen: false, item: null, type: null });
    },
    onError: (error) => {
      showSmartToast(error, 'Delete Category');
    }
  });

  // Handlers
  const handleCreateCategory = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
    };
    createCategoryMutation.mutate(data);
  };

  const handleCreateCustomerCategory = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
    };
    createCustomerCategoryMutation.mutate(data);
  };

  const handleDelete = (item, type) => {
    setDeleteConfirm({ 
      isOpen: true, 
      item, 
      type,
      title: `Delete ${type === 'customer' ? 'Customer Category' : 'Category'}`,
      description: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`
    });
  };

  const confirmDelete = () => {
    if (deleteConfirm.item) {
      deleteMutation.mutate({ 
        id: deleteConfirm.item._id, 
        type: deleteConfirm.type 
      });
    }
  };

  const renderCategoriesView = () => (
    <Card className="shadow-sm border-gray-200 dark:border-gray-700">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/30 border-b border-blue-200 dark:border-blue-800">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Tag className="h-5 w-5" />
            Categories
          </CardTitle>
          <Button 
            onClick={() => setShowCategoryForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Name</TableHead>
                <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Description</TableHead>
                <TableHead className="w-[100px] font-semibold text-gray-900 dark:text-gray-100">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoriesLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    Loading categories...
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No categories found. Add your first category to get started.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category, index) => (
                  <TableRow 
                    key={category._id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                      index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/20'
                    }`}
                  >
                    <TableCell className="font-medium text-gray-900 dark:text-gray-100 py-4">
                      {category.name}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 dark:text-gray-400 py-4">
                      {category.description || 'No description'}
                    </TableCell>
                    <TableCell className="py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem 
                            onClick={() => setEditingCategory(category)}
                            className="hover:bg-green-50 dark:hover:bg-green-950/30"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(category, 'category')}
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
      </CardContent>
    </Card>
  );

  const renderCustomerCategoriesView = () => (
    <Card className="shadow-sm border-gray-200 dark:border-gray-700">
      <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/30 border-b border-green-200 dark:border-green-800">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
            <Users className="h-5 w-5" />
            Customer Categories
          </CardTitle>
          <Button 
            onClick={() => setShowCustomerCategoryForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Customer Category
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Name</TableHead>
                <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Description</TableHead>
                <TableHead className="w-[100px] font-semibold text-gray-900 dark:text-gray-100">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerCategoriesLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    Loading customer categories...
                  </TableCell>
                </TableRow>
              ) : customerCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No customer categories found. Add your first customer category to get started.
                  </TableCell>
                </TableRow>
              ) : (
                customerCategories.map((category, index) => (
                  <TableRow 
                    key={category._id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                      index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/20'
                    }`}
                  >
                    <TableCell className="font-medium text-gray-900 dark:text-gray-100 py-4">
                      {category.name}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 dark:text-gray-400 py-4">
                      {category.description || 'No description'}
                    </TableCell>
                    <TableCell className="py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem 
                            onClick={() => setEditingCustomerCategory(category)}
                            className="hover:bg-green-50 dark:hover:bg-green-950/30"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(category, 'customer')}
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
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Navigation Buttons */}
      <div className="flex gap-4">
        <Button 
          variant={currentView === 'categories' ? 'default' : 'outline'}
          onClick={() => setCurrentView('categories')}
          className={currentView === 'categories' ? 'bg-blue-600 text-white' : ''}
        >
          <Tag className="h-4 w-4 mr-2" />
          Categories
        </Button>
        <Button 
          variant={currentView === 'customer-categories' ? 'default' : 'outline'}
          onClick={() => setCurrentView('customer-categories')}
          className={currentView === 'customer-categories' ? 'bg-green-600 text-white' : ''}
        >
          <Users className="h-4 w-4 mr-2" />
          Customer Categories
        </Button>
      </div>

      {/* Content */}
      {currentView === 'categories' ? renderCategoriesView() : renderCustomerCategoriesView()}

      {/* Add Category Dialog */}
      <Dialog open={showCategoryForm} onOpenChange={setShowCategoryForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Tag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Add New Category
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCategory} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category Name *
                </Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Enter category name"
                  className="mt-1 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter category description"
                  rows={3}
                  className="mt-1 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCategoryForm(false)}
                className="border-gray-300 dark:border-gray-600"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createCategoryMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {createCategoryMutation.isPending ? 'Creating...' : 'Create Category'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Customer Category Dialog */}
      <Dialog open={showCustomerCategoryForm} onOpenChange={setShowCustomerCategoryForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Add Customer Category
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCustomerCategory} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="customerName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Customer Category Name *
                </Label>
                <Input
                  id="customerName"
                  name="name"
                  required
                  placeholder="Enter customer category name"
                  className="mt-1 border-gray-300 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400"
                />
              </div>
              <div>
                <Label htmlFor="customerDescription" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </Label>
                <Textarea
                  id="customerDescription"
                  name="description"
                  placeholder="Enter customer category description"
                  rows={3}
                  className="mt-1 border-gray-300 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCustomerCategoryForm(false)}
                className="border-gray-300 dark:border-gray-600"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createCustomerCategoryMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {createCustomerCategoryMutation.isPending ? 'Creating...' : 'Create Customer Category'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, item: null, type: null })}
        onConfirm={confirmDelete}
        title={deleteConfirm.title}
        description={deleteConfirm.description}
        confirmText="Delete"
        confirmVariant="destructive"
      />
    </div>
  );
}