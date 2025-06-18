import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MetricsCard from '@/components/dashboard/MetricsCard';
import ProductionChart from '@/components/dashboard/ProductionChart';
import SalesChart from '@/components/dashboard/SalesChart';
import RecentOrders from '@/components/dashboard/RecentOrders';
import Alerts from '@/components/dashboard/Alerts';
import QuickActions from '@/components/dashboard/QuickActions';
import {
  ShoppingCart,
  Cog,
  Truck,
  DollarSign,
  Users,
  Calendar,
  Clock
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [dailyTimer, setDailyTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const { data: metricsData, isLoading } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
    enabled: true
  });

  const metrics = metricsData?.metrics || {};

  // Auto-timer functionality
  React.useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setDailyTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Format timer display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section - Full Width */}
      <div className="grid grid-cols-12 gap-6">
        {/* Welcome Message - 6 columns */}
        <div className="col-span-12 md:col-span-6">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-xl h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-3xl font-bold">
                Welcome back, {user?.fullName || user?.username}!
              </CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                {user?.role} • {user?.unit || 'System Access'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-blue-100">
                  <Users className="w-5 h-5" />
                  <span className="text-lg">Ready to manage your operations</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-100">
                  <Calendar className="w-5 h-5" />
                  <span>
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Date & Time Section - 3 columns */}
        <div className="col-span-12 md:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {new Date().toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Week {Math.ceil((new Date().getDate() + new Date().getDay()) / 7)} of {new Date().toLocaleDateString('en-US', { month: 'long' })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timer Section - 3 columns */}
        <div className="col-span-12 md:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <Clock className="w-5 h-5 mr-2 text-green-600" />
                Work Timer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                  {formatTime(dailyTimer)}
                </div>
                <Button 
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  variant={isTimerRunning ? "destructive" : "default"}
                  size="sm" 
                  className="w-full"
                >
                  {isTimerRunning ? 'Pause' : 'Start'}
                </Button>
                <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                  Started at 9:00 AM
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Analytics Overview */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Analytics Overview</h2>
        <Button variant="outline">
          <Clock className="w-4 h-4 mr-2" />
          Last 30 days
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Total Orders"
          value={isLoading ? "..." : metrics.totalOrders?.toLocaleString() || "0"}
          change={isLoading ? "" : `${metrics.ordersGrowth || 0}% from last month`}
          changeType={metrics.ordersGrowth >= 0 ? "increase" : "decrease"}
          icon={ShoppingCart}
          color="blue"
        />
        
        <MetricsCard
          title="Production"
          value={isLoading ? "..." : `${metrics.production || 0}%`}
          change={isLoading ? "" : `${metrics.productionGrowth || 0}% efficiency`}
          changeType="increase"
          icon={Cog}
          color="green"
        />
        
        <MetricsCard
          title="Dispatches"
          value={isLoading ? "..." : metrics.dispatches?.toLocaleString() || "0"}
          change={isLoading ? "" : `${metrics.dispatchesChange || 0}% pending`}
          changeType="decrease"
          icon={Truck}
          color="orange"
        />
        
        <MetricsCard
          title="Revenue"
          value={isLoading ? "..." : `$${(metrics.revenue || 0).toLocaleString()}`}
          change={isLoading ? "" : `${metrics.revenueGrowth || 0}% this quarter`}
          changeType={metrics.revenueGrowth >= 0 ? "increase" : "decrease"}
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductionChart />
        <SalesChart />
      </div>

      {/* Recent Activities and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>
        <div className="space-y-6">
          <Alerts />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
