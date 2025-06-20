import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Package, 
  AlertTriangle,
  Eye,
  TrendingDown,
  TrendingUp
} from 'lucide-react';

export default function InventoryTable({ 
  items = [], 
  isLoading = false, 
  onEdit, 
  onDelete, 
  onView,
  permissions = {}
}) {
  const getStockStatus = (item) => {
    if (item.qty === 0) {
      return { status: 'Out of Stock', color: 'bg-red-500', icon: AlertTriangle };
    } else if (item.qty <= item.minStock) {
      return { status: 'Low Stock', color: 'bg-orange-500', icon: TrendingDown };
    } else {
      return { status: 'In Stock', color: 'bg-green-500', icon: TrendingUp };
    }
  };

  const getImportanceBadge = (importance) => {
    const colors = {
      'Critical': 'bg-red-100 text-red-800 border-red-200',
      'High': 'bg-orange-100 text-orange-800 border-orange-200',
      'Normal': 'bg-blue-100 text-blue-800 border-blue-200',
      'Low': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[importance] || colors.Normal;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const calculateValue = (item) => {
    return (item.qty || 0) * (item.stdCost || item.purchaseCost || 0);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No items found</h3>
            <p className="text-gray-600 dark:text-gray-400">Start by adding your first inventory item.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Inventory Items ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Details</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Sale Price</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const stockInfo = getStockStatus(item);
                const StockIcon = stockInfo.icon;
                
                return (
                  <TableRow key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {item.name}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getImportanceBadge(item.importance)}>
                            {item.importance}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {item.type}
                          </Badge>
                        </div>
                        {item.batch && (
                          <div className="text-xs text-gray-500">
                            Batch: {item.batch}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {item.code}
                      </code>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{item.category}</div>
                        {item.subCategory && (
                          <div className="text-xs text-gray-500">{item.subCategory}</div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {item.qty?.toLocaleString() || 0}
                        </div>
                        {item.minStock > 0 && (
                          <div className="text-xs text-gray-500">
                            Min: {item.minStock}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {item.unit}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        {item.stdCost > 0 && (
                          <div className="text-sm">{formatCurrency(item.stdCost)}</div>
                        )}
                        {item.purchaseCost > 0 && item.purchaseCost !== item.stdCost && (
                          <div className="text-xs text-gray-500">
                            Purch: {formatCurrency(item.purchaseCost)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {item.salePrice > 0 ? formatCurrency(item.salePrice) : '-'}
                    </TableCell>
                    
                    <TableCell>
                      <div className="font-medium">
                        {formatCurrency(calculateValue(item))}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${stockInfo.color}`}></div>
                        <span className="text-sm">{stockInfo.status}</span>
                        <StockIcon className="w-3 h-3 text-gray-400" />
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onView && onView(item)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {permissions.edit && (
                            <DropdownMenuItem onClick={() => onEdit && onEdit(item)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Item
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {permissions.delete && (
                            <DropdownMenuItem 
                              onClick={() => onDelete && onDelete(item)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Item
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