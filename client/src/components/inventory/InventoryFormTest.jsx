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
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Simple validation schema for testing
const testSchema = z.object({
  name: z.string().min(2, 'Item name must be at least 2 characters'),
  category: z.string().min(1, 'Category is required'),
  customerCategory: z.string().min(1, 'Customer Category is required'),
  unit: z.string().min(1, 'Unit is required'),
  description: z.string().optional(),
  qty: z.number().min(0).default(0),
  stdCost: z.number().min(0).default(0),
  salePrice: z.number().min(0).default(0),
});

const UNITS = ['pieces', 'kg', 'liters', 'meters', 'boxes'];

export default function InventoryFormTest({ 
  isOpen, 
  onClose, 
  item = null, 
  categories = [], 
  customerCategories = [],
  onSubmit, 
  isLoading = false 
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(testSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      category: '',
      customerCategory: '',
      unit: 'pieces',
      description: '',
      qty: 0,
      stdCost: 0,
      salePrice: 0,
    }
  });

  // Reset form when modal opens/closes or item changes
  useEffect(() => {
    if (isOpen && item) {
      // Editing mode
      form.reset({
        name: item.name || '',
        category: item.category || '',
        customerCategory: item.customerCategory || '',
        unit: item.unit || 'pieces',
        description: item.description || '',
        qty: Number(item.qty) || 0,
        stdCost: Number(item.stdCost) || 0,
        salePrice: Number(item.salePrice) || 0,
      });
    } else if (isOpen && !item) {
      // Adding mode
      form.reset({
        name: '',
        category: '',
        customerCategory: '',
        unit: 'pieces',
        description: '',
        qty: 0,
        stdCost: 0,
        salePrice: 0,
      });
    }
  }, [isOpen, item, form]);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    
    console.log('Test form submitting data:', data);
    
    try {
      await onSubmit(data);
      
      // Reset form and close
      form.reset();
      onClose();
      
      toast({
        title: "Success",
        description: `Item ${item ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      console.error('Test form submission error:', error);
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        
        Object.keys(errors).forEach(field => {
          form.setError(field, {
            type: 'server',
            message: errors[field]
          });
        });
        
        toast({
          title: "Validation Failed",
          description: "Please fix the errors and try again",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || 'Failed to save item',
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {item ? 'Edit Item' : 'Add New Item'} (Test Form)
          </DialogTitle>
          <DialogDescription>
            Simplified test form to verify functionality
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                        className={form.formState.errors.name ? 'border-red-500' : ''}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-red-500">Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-red-500">Customer Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-red-500">Unit *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="qty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
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
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || isSubmitting}
              >
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