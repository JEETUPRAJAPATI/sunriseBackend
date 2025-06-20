import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, DollarSign, BarChart3, FileText, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Enhanced validation schema
const itemSchema = z.object({
  name: z.string().min(2, 'Item name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  customerCategory: z.string().min(1, 'Customer category is required'),
  code: z.string().optional(),
  qty: z.number().min(0, 'Quantity cannot be negative').default(0),
  unit: z.string().min(1, 'Unit is required'),
  stdCost: z.number().min(0, 'Cost cannot be negative').default(0),
  salePrice: z.number().min(0, 'Sale price cannot be negative').default(0),
  type: z.enum(['Product', 'Material', 'Spares', 'Assemblies']).default('Product'),
  importance: z.enum(['Low', 'Normal', 'High', 'Critical']).default('Normal'),
  subCategory: z.string().optional(),
  batch: z.string().optional(),
  store: z.string().optional(),
  purchaseCost: z.number().min(0, 'Purchase cost cannot be negative').default(0),
  hsn: z.string().optional(),
  gst: z.number().min(0, 'GST cannot be negative').max(100, 'GST cannot exceed 100%').default(0),
  mrp: z.number().min(0, 'MRP cannot be negative').default(0),
  internalManufacturing: z.boolean().default(false),
  purchase: z.boolean().default(true),
  internalNotes: z.string().optional(),
  minStock: z.number().min(0, 'Minimum stock cannot be negative').default(0),
  leadTime: z.number().min(0, 'Lead time cannot be negative').default(0),
});

const ITEM_TYPES = ['Product', 'Material', 'Spares', 'Assemblies'];
const IMPORTANCE_LEVELS = ['Low', 'Normal', 'High', 'Critical'];
const UNITS = ['pieces', 'kg', 'liters', 'meters', 'sheets', 'boxes', 'units', 'tons', 'cartons'];

export default function ModernInventoryForm({ 
  isOpen, 
  onClose, 
  item = null, 
  categories = [], 
  customerCategories = [],
  onSubmit, 
  isLoading = false 
}) {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [availableSubCategories, setAvailableSubCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      customerCategory: '',
      code: '',
      qty: 0,
      unit: 'pieces',
      stdCost: 0,
      salePrice: 0,
      type: 'Product',
      importance: 'Normal',
      subCategory: '',
      batch: '',
      store: '',
      purchaseCost: 0,
      hsn: '',
      gst: 0,
      mrp: 0,
      internalManufacturing: false,
      purchase: true,
      internalNotes: '',
      minStock: 0,
      leadTime: 0,
    }
  });

  // Update form when item changes (for editing)
  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name || '',
        description: item.description || '',
        category: item.category || '',
        customerCategory: item.customerCategory || '',
        code: item.code || '',
        qty: item.qty || 0,
        unit: item.unit || 'pieces',
        stdCost: item.stdCost || 0,
        salePrice: item.salePrice || 0,
        type: item.type || 'Product',
        importance: item.importance || 'Normal',
        subCategory: item.subCategory || '',
        batch: item.batch || '',
        store: item.store || '',
        purchaseCost: item.purchaseCost || 0,
        hsn: item.hsn || '',
        gst: item.gst || 0,
        mrp: item.mrp || 0,
        internalManufacturing: item.internalManufacturing || false,
        purchase: item.purchase !== false,
        internalNotes: item.internalNotes || '',
        minStock: item.minStock || 0,
        leadTime: item.leadTime || 0,
      });
      setSelectedCategory(item.category || '');
    } else {
      form.reset();
      setSelectedCategory('');
    }
  }, [item, form]);

  // Update subcategories when category changes
  useEffect(() => {
    const category = categories.find(cat => cat.name === selectedCategory);
    setAvailableSubCategories(category?.subCategories || []);
    if (category && !category.subCategories?.includes(form.getValues('subCategory'))) {
      form.setValue('subCategory', '');
    }
  }, [selectedCategory, categories, form]);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset();
      setSelectedCategory('');
      onClose();
      toast({
        title: "Success",
        description: `Item ${item ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      // Handle validation errors
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(field => {
          form.setError(field, {
            type: 'server',
            message: errors[field]
          });
        });
        
        // Show field-specific error toasts
        Object.keys(errors).forEach(field => {
          toast({
            title: `${field.charAt(0).toUpperCase() + field.slice(1)} Error`,
            description: errors[field],
            variant: "destructive",
          });
        });
        
        // Scroll to first error
        const firstErrorField = Object.keys(errors)[0];
        const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          errorElement.focus();
        }
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || `Failed to ${item ? 'update' : 'create'} item`,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getImportanceBadgeColor = (importance) => {
    switch (importance) {
      case 'Critical': return 'bg-red-500 hover:bg-red-600';
      case 'High': return 'bg-orange-500 hover:bg-orange-600';
      case 'Normal': return 'bg-blue-500 hover:bg-blue-600';
      case 'Low': return 'bg-gray-500 hover:bg-gray-600';
      default: return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="h-6 w-6" />
            {item ? 'Edit Item' : 'Add New Item'}
          </DialogTitle>
          <DialogDescription>
            {item ? 'Update the item details below' : 'Fill in the details to add a new inventory item'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Item Details Section */}
            <Card className="border-blue-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-blue-700">
                  <Info className="h-5 w-5" />
                  Item Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-red-500">Item Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter item name" 
                            {...field}
                            className={form.formState.errors.name ? 'border-red-500 focus:border-red-500' : ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Auto-generated if empty" {...field} />
                        </FormControl>
                        <FormDescription>
                          Leave empty to auto-generate based on type
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter item description"
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ITEM_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="importance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Importance Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select importance" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {IMPORTANCE_LEVELS.map((level) => (
                              <SelectItem key={level} value={level}>
                                <div className="flex items-center gap-2">
                                  <Badge className={`${getImportanceBadgeColor(level)} text-white text-xs`}>
                                    {level}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Category Info Section */}
            <Card className="border-green-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-green-700">
                  <BarChart3 className="h-5 w-5" />
                  Category Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-red-500">Category *</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedCategory(value);
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className={form.formState.errors.category ? 'border-red-500' : ''}>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category._id} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-red-500">Customer Category *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className={form.formState.errors.customerCategory ? 'border-red-500' : ''}>
                              <SelectValue placeholder="Select customer category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customerCategories.map((category) => (
                              <SelectItem key={category._id} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="subCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sub Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sub category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableSubCategories.map((subCat, index) => (
                              <SelectItem key={index} value={subCat}>
                                {subCat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="batch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Batch/Lot Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter batch number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing Section */}
            <Card className="border-yellow-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-yellow-700">
                  <DollarSign className="h-5 w-5" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="stdCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00" 
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="salePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sale Price</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00" 
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="purchaseCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Cost</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00" 
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mrp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MRP</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00" 
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gst"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GST Rate (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0" 
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stock Info Section */}
            <Card className="border-purple-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-purple-700">
                  <Package className="h-5 w-5" />
                  Stock Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="qty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Quantity</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-red-500">Unit *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className={form.formState.errors.unit ? 'border-red-500' : ''}>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {UNITS.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="minStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Stock Level</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Alert when stock falls below this level
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="leadTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lead Time (days)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="store"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter store location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isSubmitting}>
                {(isLoading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {item ? 'Update Item' : 'Create Item'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}