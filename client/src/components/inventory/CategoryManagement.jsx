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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { showSuccessToast, showSmartToast } from '@/lib/toast-utils';
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Tag,
  Users,
  AlertTriangle,
  X,
  FolderPlus,
  List
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Subcategory Input Component
function SubcategoryInput({ subcategories, setSubcategories }) {
  const addSubcategory = () => {
    setSubcategories([...subcategories, '']);
  };

  const updateSubcategory = (index, value) => {
    const updated = [...subcategories];
    updated[index] = value;
    setSubcategories(updated);
  };

  const removeSubcategory = (index) => {
    setSubcategories(subcategories.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Subcategories (Optional)
        </Label>
        <Button
          type="button"
          onClick={addSubcategory}
          size="sm"
          variant="outline"
          className="h-8 px-3 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Subcategory
        </Button>
      </div>
      {subcategories.length > 0 && (
        <div className="space-y-2">
          {subcategories.map((subcategory, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={subcategory}
                onChange={(e) => updateSubcategory(index, e.target.value)}
                placeholder={`Subcategory ${index + 1}`}
                className="flex-1 h-8 text-sm"
              />
              <Button
                type="button"
                onClick={() => removeSubcategory(index)}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Category Form Modal
function CategoryFormModal({ isOpen, onClose, editingCategory, onSubmit, isLoading }) {
  const [subcategories, setSubcategories] = useState(
    editingCategory?.subcategories || []
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      subcategories: subcategories.filter(sub => sub.trim() !== '')
    };
    onSubmit(data);
  };

  const handleClose = () => {
    setSubcategories([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <Tag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Category Name *
              </Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={editingCategory?.name || ''}
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
                defaultValue={editingCategory?.description || ''}
                placeholder="Enter category description"
                rows={3}
                className="mt-1 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>
            <SubcategoryInput subcategories={subcategories} setSubcategories={setSubcategories} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="border-gray-300 dark:border-gray-600"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Customer Category Form Modal
function CustomerCategoryFormModal({ isOpen, onClose, editingCategory, onSubmit, isLoading }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
    };
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {editingCategory ? 'Edit Customer Category' : 'Add Customer Category'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="customerName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Customer Category Name *
              </Label>
              <Input
                id="customerName"
                name="name"
                required
                defaultValue={editingCategory?.name || ''}
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
                defaultValue={editingCategory?.description || ''}
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
              onClick={onClose}
              className="border-gray-300 dark:border-gray-600"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? 'Saving...' : editingCategory ? 'Update Customer Category' : 'Create Customer Category'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Delete Confirmation Modal
function DeleteConfirmationModal({ isOpen, onClose, onConfirm, title, description, isLoading }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground text-center">{description}</p>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main Category Management Modal
function CategoryManagementModal({ isOpen, onClose }) {
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, item: null });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data fetching
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
    enabled: isOpen,
  });

  const categories = Array.isArray(categoriesData?.categories) ? categoriesData.categories : [];

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

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }) => apiRequest('PUT', `/api/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/categories']);
      setShowCategoryForm(false);
      setEditingCategory(null);
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    },
    onError: (error) => {
      showSmartToast(error, 'Update Category');
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => apiRequest('DELETE', `/api/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/categories']);
      setDeleteConfirm({ isOpen: false, item: null });
      showSuccessToast('Category Deleted', 'Successfully deleted the category');
    },
    onError: (error) => {
      showSmartToast(error, 'Delete Category');
    }
  });

  const handleFormSubmit = (data) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory._id, data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleDelete = (category) => {
    setDeleteConfirm({
      isOpen: true,
      item: category,
      title: 'Delete Category',
      description: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`
    });
  };

  const confirmDelete = () => {
    if (deleteConfirm.item) {
      deleteCategoryMutation.mutate(deleteConfirm.item._id);
    }
  };

  const handleCloseModal = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Tag className="h-6 w-6 text-blue-600" />
              Category Management
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Existing Categories
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage your product categories and subcategories
                </p>
              </div>
              <Button 
                onClick={() => setShowCategoryForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Category
              </Button>
            </div>

            {/* Categories List */}
            <ScrollArea className="h-[400px] w-full">
              <div className="space-y-4">
                {categoriesLoading ? (
                  <div className="text-center py-8">
                    <div className="text-sm text-muted-foreground">Loading categories...</div>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-8">
                    <FolderPlus className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No categories found
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Get started by creating your first category
                    </p>
                  </div>
                ) : (
                  categories.map((category) => (
                    <Card key={category._id} className="border border-gray-200 dark:border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800">
                                <Tag className="h-3 w-3 mr-1" />
                                {category.name}
                              </Badge>
                            </div>
                            {category.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {category.description}
                              </p>
                            )}
                            {category.subcategories && category.subcategories.length > 0 && (
                              <div>
                                <div className="flex items-center gap-1 mb-2">
                                  <List className="h-3 w-3 text-gray-400" />
                                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    Subcategories:
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {category.subcategories.map((sub, index) => (
                                    <Badge 
                                      key={index} 
                                      variant="secondary" 
                                      className="text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                    >
                                      {sub}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(category)}
                              className="h-8 w-8 p-0 hover:bg-green-50 dark:hover:bg-green-950/30"
                            >
                              <Edit className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(category)}
                              className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      <CategoryFormModal
        isOpen={showCategoryForm}
        onClose={() => {
          setShowCategoryForm(false);
          setEditingCategory(null);
        }}
        editingCategory={editingCategory}
        onSubmit={handleFormSubmit}
        isLoading={createCategoryMutation.isPending || updateCategoryMutation.isPending}
      />

      <DeleteConfirmationModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, item: null })}
        onConfirm={confirmDelete}
        title={deleteConfirm.title}
        description={deleteConfirm.description}
        isLoading={deleteCategoryMutation.isPending}
      />
    </>
  );
}

// Customer Category Management Modal
function CustomerCategoryManagementModal({ isOpen, onClose }) {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, item: null });
  const queryClient = useQueryClient();

  // Data fetching
  const { data: customerCategoriesData, isLoading } = useQuery({
    queryKey: ['/api/customer-categories'],
    enabled: isOpen,
  });

  const customerCategories = Array.isArray(customerCategoriesData?.customerCategories) ? customerCategoriesData.customerCategories : [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => apiRequest('POST', '/api/customer-categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/customer-categories']);
      setShowForm(false);
      setEditingCategory(null);
      showSuccessToast('Success', 'Customer category created successfully');
    },
    onError: (error) => {
      showSmartToast(error, 'Create Customer Category');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiRequest('PUT', `/api/customer-categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/customer-categories']);
      setShowForm(false);
      setEditingCategory(null);
      showSuccessToast('Success', 'Customer category updated successfully');
    },
    onError: (error) => {
      showSmartToast(error, 'Update Customer Category');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiRequest('DELETE', `/api/customer-categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/customer-categories']);
      setDeleteConfirm({ isOpen: false, item: null });
      showSuccessToast('Customer Category Deleted', 'Successfully deleted the customer category');
    },
    onError: (error) => {
      showSmartToast(error, 'Delete Customer Category');
    }
  });

  const handleFormSubmit = (data) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = (category) => {
    setDeleteConfirm({
      isOpen: true,
      item: category,
      title: 'Delete Customer Category',
      description: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`
    });
  };

  const confirmDelete = () => {
    if (deleteConfirm.item) {
      deleteMutation.mutate(deleteConfirm.item._id);
    }
  };

  const handleCloseModal = () => {
    setShowForm(false);
    setEditingCategory(null);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Users className="h-6 w-6 text-green-600" />
              Customer Category Management
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Existing Customer Categories
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage your customer category classifications
                </p>
              </div>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Customer Category
              </Button>
            </div>

            {/* Customer Categories List */}
            <ScrollArea className="h-[400px] w-full">
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
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8">
                          Loading customer categories...
                        </TableCell>
                      </TableRow>
                    ) : customerCategories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8">
                          <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            No customer categories found
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Get started by creating your first customer category
                          </p>
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
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800">
                              <Users className="h-3 w-3 mr-1" />
                              {category.name}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500 dark:text-gray-400 py-4">
                            {category.description || 'No description'}
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(category)}
                                className="h-8 w-8 p-0 hover:bg-green-50 dark:hover:bg-green-950/30"
                              >
                                <Edit className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(category)}
                                className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-950/30"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      <CustomerCategoryFormModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingCategory(null);
        }}
        editingCategory={editingCategory}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmationModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, item: null })}
        onConfirm={confirmDelete}
        title={deleteConfirm.title}
        description={deleteConfirm.description}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

// Main Component
export default function CategoryManagement({ 
  showCategoryModal, 
  setShowCategoryModal, 
  showCustomerCategoryModal, 
  setShowCustomerCategoryModal 
}) {
  return (
    <>
      <CategoryManagementModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
      />
      <CustomerCategoryManagementModal
        isOpen={showCustomerCategoryModal}
        onClose={() => setShowCustomerCategoryModal(false)}
      />
    </>
  );
}