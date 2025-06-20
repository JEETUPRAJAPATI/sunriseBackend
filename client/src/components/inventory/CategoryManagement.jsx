import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  FolderOpen,
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
            <AlertTriangle className="h-5 w-5 text-amber-500" />
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

// Category Form Component
function CategoryForm({ isOpen, onClose, category = null, type = 'category' }) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    subCategories: category?.subCategories?.join(', ') || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const endpoint = type === 'customer' ? '/api/customer-categories' : '/api/categories';
  
  const mutation = useMutation({
    mutationFn: (data) => {
      if (category) {
        return apiRequest('PUT', `${endpoint}/${category._id}`, data);
      }
      return apiRequest('POST', endpoint, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      showSuccessToast(
        `${type === 'customer' ? 'Customer Category' : 'Category'} ${category ? 'Updated' : 'Created'}`,
        `Successfully ${category ? 'updated' : 'created'} ${formData.name}`
      );
      onClose();
      setFormData({ name: '', description: '', subCategories: '' });
    },
    onError: (error) => {
      showSmartToast(error, `${category ? 'Update' : 'Create'} ${type === 'customer' ? 'Customer Category' : 'Category'}`);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }

    const submitData = {
      name: formData.name.trim(),
      description: formData.description.trim()
    };

    if (type !== 'customer' && formData.subCategories.trim()) {
      submitData.subCategories = formData.subCategories
        .split(',')
        .map(sub => sub.trim())
        .filter(sub => sub);
    }

    mutation.mutate(submitData);
  };

  React.useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        subCategories: category.subCategories?.join(', ') || ''
      });
    } else {
      setFormData({ name: '', description: '', subCategories: '' });
    }
  }, [category, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'customer' ? <Users className="h-5 w-5" /> : <Tag className="h-5 w-5" />}
            {category ? 'Edit' : 'Add'} {type === 'customer' ? 'Customer Category' : 'Category'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter category name"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter category description"
              rows={3}
            />
          </div>
          {type !== 'customer' && (
            <div>
              <Label htmlFor="subCategories">Sub Categories</Label>
              <Input
                id="subCategories"
                value={formData.subCategories}
                onChange={(e) => setFormData(prev => ({ ...prev, subCategories: e.target.value }))}
                placeholder="Enter sub categories separated by commas"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Separate multiple sub categories with commas
              </p>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : category ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Main Category Management Component
export default function CategoryManagement() {
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [customerCategoryFormOpen, setCustomerCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingCustomerCategory, setEditingCustomerCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, item: null, type: null });
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: customerCategories = [], isLoading: customerCategoriesLoading } = useQuery({
    queryKey: ['/api/customer-categories'],
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, type }) => {
      const endpoint = type === 'customer' ? '/api/customer-categories' : '/api/categories';
      return apiRequest('DELETE', `${endpoint}/${id}`);
    },
    onSuccess: (_, { type }) => {
      const endpoint = type === 'customer' ? '/api/customer-categories' : '/api/categories';
      queryClient.invalidateQueries({ queryKey: [endpoint] });
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

  const handleEdit = (category, type) => {
    if (type === 'customer') {
      setEditingCustomerCategory(category);
      setCustomerCategoryFormOpen(true);
    } else {
      setEditingCategory(category);
      setCategoryFormOpen(true);
    }
  };

  const handleDelete = (category, type) => {
    setDeleteConfirm({ 
      isOpen: true, 
      item: category, 
      type,
      title: `Delete ${type === 'customer' ? 'Customer Category' : 'Category'}`,
      description: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`
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

  return (
    <div className="space-y-6">
      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Product Categories
          </TabsTrigger>
          <TabsTrigger value="customer-categories" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customer Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Product Categories
                </CardTitle>
                <Button onClick={() => setCategoryFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <div className="text-center py-8">Loading categories...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Sub Categories</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No categories found. Add your first category to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      categories.map((category) => (
                        <TableRow key={category._id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {category.description || 'No description'}
                          </TableCell>
                          <TableCell>
                            {category.subCategories && category.subCategories.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {category.subCategories.map((sub, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {sub}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">No subcategories</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEdit(category, 'category')}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(category, 'category')}
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customer-categories">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Customer Categories
                </CardTitle>
                <Button onClick={() => setCustomerCategoryFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {customerCategoriesLoading ? (
                <div className="text-center py-8">Loading customer categories...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerCategories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          No customer categories found. Add your first customer category to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      customerCategories.map((category) => (
                        <TableRow key={category._id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {category.description || 'No description'}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEdit(category, 'customer')}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(category, 'customer')}
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Forms */}
      <CategoryForm
        isOpen={categoryFormOpen}
        onClose={() => {
          setCategoryFormOpen(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        type="category"
      />

      <CategoryForm
        isOpen={customerCategoryFormOpen}
        onClose={() => {
          setCustomerCategoryFormOpen(false);
          setEditingCustomerCategory(null);
        }}
        category={editingCustomerCategory}
        type="customer"
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, item: null, type: null })}
        onConfirm={confirmDelete}
        title={`Delete ${deleteConfirm.type === 'customer' ? 'Customer Category' : 'Category'}`}
        description={`Are you sure you want to delete "${deleteConfirm.item?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="destructive"
      />
    </div>
  );
}