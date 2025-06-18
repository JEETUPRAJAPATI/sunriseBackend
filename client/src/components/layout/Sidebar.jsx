import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  LayoutDashboard,
  ShoppingCart,
  Cog,
  Truck,
  TrendingUp,
  Calculator,
  Package,
  Users,
  Handshake,
  Receipt,
  Settings,
  LogOut,
  Factory,
  Shield
} from 'lucide-react';

const menuItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    module: 'Dashboard'
  },
  {
    label: 'Orders',
    path: '/orders',
    icon: ShoppingCart,
    module: 'Orders'
  },
  {
    label: 'Manufacturing',
    path: '/manufacturing',
    icon: Cog,
    module: 'Manufacturing'
  },
  {
    label: 'Dispatches',
    path: '/dispatches',
    icon: Truck,
    module: 'Dispatches'
  },
  {
    label: 'Sales',
    path: '/sales',
    icon: TrendingUp,
    module: 'Sales'
  },
  {
    label: 'Accounts',
    path: '/accounts',
    icon: Calculator,
    module: 'Accounts'
  },
  {
    label: 'Inventory',
    path: '/inventory',
    icon: Package,
    module: 'Inventory'
  },
  {
    label: 'Customers',
    path: '/customers',
    icon: Users,
    module: 'Customers'
  },
  {
    label: 'Suppliers',
    path: '/suppliers',
    icon: Handshake,
    module: 'Suppliers'
  },
  {
    label: 'Purchases',
    path: '/purchases',
    icon: Receipt,
    module: 'Purchases'
  }
];

export default function Sidebar({ isOpen, onClose }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { hasModuleAccess } = usePermissions();

  const handleLogout = () => {
    logout();
    onClose?.();
  };

  const filteredMenuItems = menuItems.filter(item => hasModuleAccess(item.module));

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-xl border-r border-slate-200 dark:border-slate-700 transition-transform duration-300 ease-in-out md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo and Company Name */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Factory className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ManuERP
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={onClose}
            >
              ×
            </Button>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {user?.fullName || user?.username}
                  </p>
                  <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {user?.role}
                  </Badge>
                </div>
              </div>
              <div className="md:hidden">
                <ThemeToggle />
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <ScrollArea className="flex-1 px-4 py-4">
            <nav className="space-y-2">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path || 
                  (item.path === '/dashboard' && location === '/');
                
                return (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start h-10 px-4 transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                      )}
                      onClick={onClose}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}

              {/* Super User Only Items */}
              {user?.role === 'Super User' && (
                <>
                  <Separator className="my-4" />
                  <Link href="/user-management">
                    <Button
                      variant={location === '/user-management' ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start h-10 px-4",
                        location === '/user-management'
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                      onClick={onClose}
                    >
                      <Shield className="w-5 h-5 mr-3" />
                      <span>User Management</span>
                    </Button>
                  </Link>
                  
                  {hasModuleAccess('Settings') && (
                    <Link href="/settings">
                      <Button
                        variant={location === '/settings' ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start h-10 px-4",
                          location === '/settings'
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                        onClick={onClose}
                      >
                        <Settings className="w-5 h-5 mr-3" />
                        <span>Settings</span>
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </nav>
          </ScrollArea>

          {/* Logout */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors duration-200"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
