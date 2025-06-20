import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  AlertTriangle,
  Package,
  TrendingDown,
  BarChart3
} from 'lucide-react';

const ITEM_TYPES = ['Product', 'Material', 'Spares', 'Assemblies'];
const IMPORTANCE_LEVELS = ['Low', 'Normal', 'High', 'Critical'];
const UNITS = ['pieces', 'kg', 'liters', 'meters', 'sheets', 'boxes', 'units', 'tons', 'cartons'];

export default function InventoryFilters({
  filters,
  onFiltersChange,
  categories = [],
  onClearFilters,
  itemCount = 0
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 1 // Reset to first page when filtering
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleFilterChange('search', localSearch);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.type && filters.type !== 'all') count++;
    if (filters.category && filters.category !== 'all') count++;
    if (filters.subCategory && filters.subCategory !== 'all') count++;
    if (filters.importance && filters.importance !== 'all') count++;
    if (filters.unit && filters.unit !== 'all') count++;
    if (filters.lowStock) count++;
    if (filters.outOfStock) count++;
    return count;
  };

  const clearAllFilters = () => {
    setLocalSearch('');
    onClearFilters();
  };

  const selectedCategory = categories.find(cat => cat.name === filters.category);
  const availableSubCategories = selectedCategory?.subCategories || [];

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {itemCount} items
            </Badge>
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search Bar - Always Visible */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search items by name, code, or description..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
          {activeFiltersCount > 0 && (
            <Button type="button" variant="outline" onClick={clearAllFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </form>

        {/* Quick Status Filters - Always Visible */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.lowStock ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange('lowStock', !filters.lowStock)}
            className="flex items-center gap-2"
          >
            <TrendingDown className="h-4 w-4" />
            Low Stock
            {filters.lowStock && <X className="h-3 w-3" />}
          </Button>
          
          <Button
            variant={filters.outOfStock ? "destructive" : "outline"}
            size="sm"
            onClick={() => handleFilterChange('outOfStock', !filters.outOfStock)}
            className="flex items-center gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Out of Stock
            {filters.outOfStock && <X className="h-3 w-3" />}
          </Button>
        </div>

        {/* Advanced Filters - Collapsible */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select 
                  value={filters.type || 'all'} 
                  onValueChange={(value) => handleFilterChange('type', value === 'all' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {ITEM_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select 
                  value={filters.category || 'all'} 
                  onValueChange={(value) => {
                    handleFilterChange('category', value === 'all' ? '' : value);
                    // Clear subcategory when category changes
                    if (value === 'all' || value !== filters.category) {
                      handleFilterChange('subCategory', '');
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sub Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sub Category</label>
                <Select 
                  value={filters.subCategory || 'all'} 
                  onValueChange={(value) => handleFilterChange('subCategory', value === 'all' ? '' : value)}
                  disabled={!selectedCategory || availableSubCategories.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sub Categories</SelectItem>
                    {availableSubCategories.map((subCat, index) => (
                      <SelectItem key={index} value={subCat}>
                        {subCat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Importance Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Importance</label>
                <Select 
                  value={filters.importance || 'all'} 
                  onValueChange={(value) => handleFilterChange('importance', value === 'all' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {IMPORTANCE_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        <div className="flex items-center gap-2">
                          {level}
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              level === 'Critical' ? 'border-red-200 text-red-700' :
                              level === 'High' ? 'border-orange-200 text-orange-700' :
                              level === 'Normal' ? 'border-blue-200 text-blue-700' :
                              'border-gray-200 text-gray-700'
                            }`}
                          >
                            {level}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Unit Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Unit</label>
                <Select 
                  value={filters.unit || 'all'} 
                  onValueChange={(value) => handleFilterChange('unit', value === 'all' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Units</SelectItem>
                    {UNITS.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Options */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <Select 
                  value={filters.sortBy || 'name'} 
                  onValueChange={(value) => handleFilterChange('sortBy', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="code">Code</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="qty">Quantity</SelectItem>
                    <SelectItem value="stdCost">Cost</SelectItem>
                    <SelectItem value="salePrice">Sale Price</SelectItem>
                    <SelectItem value="createdAt">Date Created</SelectItem>
                    <SelectItem value="updatedAt">Last Updated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Order</label>
                <Select 
                  value={filters.sortOrder || 'asc'} 
                  onValueChange={(value) => handleFilterChange('sortOrder', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Items per page */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Items per page</label>
                <Select 
                  value={filters.limit?.toString() || '20'} 
                  onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Advanced Stock Filters */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Advanced Stock Options</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="internalManufacturing"
                    checked={filters.internalManufacturing || false}
                    onCheckedChange={(checked) => handleFilterChange('internalManufacturing', checked)}
                  />
                  <label htmlFor="internalManufacturing" className="text-sm">
                    Internal Manufacturing
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="purchasable"
                    checked={filters.purchasable || false}
                    onCheckedChange={(checked) => handleFilterChange('purchasable', checked)}
                  />
                  <label htmlFor="purchasable" className="text-sm">
                    Purchasable Items
                  </label>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}