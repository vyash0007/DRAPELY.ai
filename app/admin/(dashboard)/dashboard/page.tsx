import { Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { getOrderStatistics } from '@/actions/admin-orders';
import { db } from '@/lib/db';

async function getDashboardStats() {
  try {
    const [orderStats, productCount, categoryCount] = await Promise.all([
      getOrderStatistics(),
      db.product.count(),
      db.category.count(),
    ]);

    return {
      ...orderStats,
      productCount,
      categoryCount,
    };
  } catch (error) {
    return {
      totalOrders: 0,
      pendingOrders: 0,
      processingOrders: 0,
      deliveredOrders: 0,
      totalRevenue: 0,
      productCount: 0,
      categoryCount: 0,
    };
  }
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      bgColor: 'bg-green-500',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      bgColor: 'bg-blue-500',
    },
    {
      title: 'Total Products',
      value: stats.productCount.toString(),
      icon: Package,
      bgColor: 'bg-purple-500',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders.toString(),
      icon: TrendingUp,
      bgColor: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-2 text-gray-600">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`rounded-full ${stat.bgColor} p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Status Summary */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="text-xl font-semibold text-gray-900">Order Status</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="mt-1 text-2xl font-bold text-orange-600">{stats.pendingOrders}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Processing</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">{stats.processingOrders}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Delivered</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{stats.deliveredOrders}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <a
            href="/admin/products/new"
            className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-gray-400 hover:bg-gray-50"
          >
            <Package className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 font-medium text-gray-900">Add New Product</p>
            <p className="text-sm text-gray-500">Create a new product listing</p>
          </a>
          <a
            href="/admin/orders"
            className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-gray-400 hover:bg-gray-50"
          >
            <ShoppingCart className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 font-medium text-gray-900">View Orders</p>
            <p className="text-sm text-gray-500">Manage customer orders</p>
          </a>
        </div>
      </div>
    </div>
  );
}
