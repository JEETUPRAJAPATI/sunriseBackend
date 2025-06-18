import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Shield, 
  Factory, 
  Package, 
  Truck, 
  Calculator,
  Crown,
  LogIn,
  Eye
} from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'Super User',
    description: 'Full system access with all permissions',
    icon: Crown,
    color: 'bg-gradient-to-r from-purple-500 to-indigo-600',
    permissions: 'All modules with full CRUD access'
  },
  {
    username: 'unithead',
    password: 'unit123',
    role: 'Unit Head',
    description: 'Management level access across multiple units',
    icon: Shield,
    color: 'bg-gradient-to-r from-blue-500 to-cyan-600',
    permissions: 'Dashboard, Orders, Manufacturing, Sales, Dispatches'
  },
  {
    username: 'production',
    password: 'prod123',
    role: 'Production',
    description: 'Manufacturing and production management',
    icon: Factory,
    color: 'bg-gradient-to-r from-green-500 to-emerald-600',
    permissions: 'Dashboard, Orders, Manufacturing, Inventory'
  },
  {
    username: 'packing',
    password: 'pack123',
    role: 'Packing',
    description: 'Packaging operations and inventory',
    icon: Package,
    color: 'bg-gradient-to-r from-orange-500 to-red-600',
    permissions: 'Dashboard, Orders, Manufacturing, Dispatches, Inventory'
  },
  {
    username: 'dispatch',
    password: 'disp123',
    role: 'Dispatch',
    description: 'Shipping and delivery management',
    icon: Truck,
    color: 'bg-gradient-to-r from-yellow-500 to-orange-600',
    permissions: 'Dashboard, Orders, Dispatches, Inventory'
  },
  {
    username: 'accounts',
    password: 'acc123',
    role: 'Accounts',
    description: 'Financial management and reporting',
    icon: Calculator,
    color: 'bg-gradient-to-r from-teal-500 to-blue-600',
    permissions: 'Dashboard, Orders, Sales, Accounts, Customers, Suppliers'
  }
];

export default function DemoAccounts() {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (account) => {
    setIsLoggingIn(true);
    setSelectedAccount(account.username);
    
    try {
      await login({
        username: account.username,
        password: account.password
      });
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${account.role}!`,
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
      setSelectedAccount(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Factory className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Manufacturing ERP Demo
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Experience our comprehensive ERP system with role-based access control. 
            Choose a demo account below to explore different user perspectives.
          </p>
        </div>

        {/* Demo Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {DEMO_ACCOUNTS.map((account) => {
            const Icon = account.icon;
            const isLoading = isLoggingIn && selectedAccount === account.username;
            
            return (
              <Card key={account.username} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${account.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-xs font-medium">
                      {account.role}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                    {account.username}
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    {account.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          Module Access
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {account.permissions}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Username</div>
                        <div className="font-mono text-sm font-medium text-slate-700 dark:text-slate-200">
                          {account.username}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Password</div>
                        <div className="font-mono text-sm font-medium text-slate-700 dark:text-slate-200">
                          {account.password}
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleLogin(account)}
                      disabled={isLoggingIn}
                      className={`w-full ${account.color} hover:opacity-90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200`}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Logging in...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <LogIn className="w-4 h-4" />
                          <span>Login as {account.role}</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Section */}
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100">
              System Features
            </CardTitle>
            <CardDescription className="text-center">
              Comprehensive manufacturing ERP with role-based permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">User Management</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Complete user and permission management system
                </p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Factory className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Manufacturing</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Production planning and execution management
                </p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Inventory</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Real-time inventory tracking and management
                </p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Calculator className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Accounting</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Financial management and reporting tools
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}