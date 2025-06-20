import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign,
  BarChart3,
  ShoppingCart,
  Warehouse,
  TrendingDown
} from 'lucide-react';

export default function InventoryStats({ stats = {}, isLoading = false }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num || 0);
  };

  const statsCards = [
    {
      title: 'Total Items',
      value: formatNumber(stats.totalItems),
      icon: Package,
      color: 'blue',
      description: 'Items in inventory'
    },
    {
      title: 'Total Value',
      value: formatCurrency(stats.totalValue),
      icon: DollarSign,
      color: 'green',
      description: 'Inventory worth'
    },
    {
      title: 'Low Stock Items',
      value: formatNumber(stats.lowStockItems),
      icon: TrendingDown,
      color: 'orange',
      description: 'Need attention',
      urgent: stats.lowStockItems > 0
    },
    {
      title: 'Out of Stock',
      value: formatNumber(stats.outOfStockItems),
      icon: AlertTriangle,
      color: 'red',
      description: 'Immediate action needed',
      urgent: stats.outOfStockItems > 0
    },
    {
      title: 'Categories',
      value: formatNumber(stats.totalCategories),
      icon: BarChart3,
      color: 'purple',
      description: 'Product categories'
    },
    {
      title: 'Active Products',
      value: formatNumber(stats.activeProducts),
      icon: ShoppingCart,
      color: 'indigo',
      description: 'Available for sale'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        const colorClasses = {
          blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
          green: 'text-green-600 bg-green-100 dark:bg-green-900/20',
          orange: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
          red: 'text-red-600 bg-red-100 dark:bg-red-900/20',
          purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
          indigo: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20'
        };

        return (
          <Card key={index} className={`relative ${stat.urgent ? 'ring-2 ring-red-200' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${colorClasses[stat.color]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                {stat.urgent && (
                  <Badge variant="destructive" className="text-xs">
                    Alert
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {stat.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Type breakdown component for detailed stats
export function InventoryTypeBreakdown({ typeStats = [], isLoading = false }) {
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num || 0);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Type Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const typeColors = {
    'Product': 'bg-blue-100 text-blue-800 border-blue-200',
    'Material': 'bg-green-100 text-green-800 border-green-200',
    'Spares': 'bg-orange-100 text-orange-800 border-orange-200',
    'Assemblies': 'bg-purple-100 text-purple-800 border-purple-200'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Inventory by Type
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {typeStats.map((type, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Badge className={typeColors[type._id] || 'bg-gray-100 text-gray-800'}>
                  {type._id}
                </Badge>
                <span className="font-medium">{formatNumber(type.count)} items</span>
              </div>
              <div className="text-right text-sm text-gray-500">
                <div>{formatNumber(type.totalQty)} units</div>
                <div>₹{formatNumber(type.totalValue)}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}