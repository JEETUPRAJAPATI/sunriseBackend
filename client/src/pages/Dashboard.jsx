import { useQuery } from '@tanstack/react-query';
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
  DollarSign
} from 'lucide-react';

export default function Dashboard() {
  const { data: metricsData, isLoading } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
    enabled: true
  });

  const metrics = metricsData?.metrics || {};

  return (
    <div className="space-y-6 animate-fade-in">
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
