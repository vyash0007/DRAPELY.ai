import Link from 'next/link';
import { Boxes, ShoppingBag, DollarSign, Clock, Plus, Eye } from 'lucide-react';
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
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingBag,
      bgColor: 'bg-[#f5d7d7]',
      iconColor: 'text-[#f5a5a5]',
      textColor: 'text-[#f5a5a5]',
    },
    {
      title: 'Total Products',
      value: stats.productCount.toString(),
      icon: Boxes,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-600',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders.toString(),
      icon: Clock,
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      textColor: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-light tracking-wide text-gray-900">Dashboard Overview</h1>
        <p className="mt-2 text-gray-600">Welcome back, here's what's happening with your store</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="group rounded-xl bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-[#f5a5a5]/10 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                  <p className={`text-3xl font-light tracking-tight ${stat.textColor}`}>{stat.value}</p>
                </div>
                <div className={`rounded-xl ${stat.bgColor} p-3 group-hover:scale-105 transition-transform`}>
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Status Summary */}
      <div className="rounded-xl bg-white p-8 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-light tracking-wide text-gray-900 mb-6">Order Status</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Pending</p>
            <p className="text-3xl font-light text-orange-600">{stats.pendingOrders}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Processing</p>
            <p className="text-3xl font-light text-blue-600">{stats.processingOrders}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Delivered</p>
            <p className="text-3xl font-light text-green-600">{stats.deliveredOrders}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl bg-white p-8 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-light tracking-wide text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/admin/products/new"
            className="group rounded-xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-white to-gray-50 p-8 text-center transition-all duration-200 hover:border-[#f5a5a5] hover:bg-gradient-to-br hover:from-[#fce8e8] hover:to-[#f5d7d7] hover:shadow-md"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#f5d7d7] to-[#f5a5a5] group-hover:scale-110 transition-transform">
              <Plus className="h-7 w-7 text-gray-900" />
            </div>
            <p className="mt-2 text-lg font-semibold text-gray-900">Add New Product</p>
            <p className="mt-1 text-sm text-gray-600">Create a new product listing</p>
          </Link>
          <Link
            href="/admin/orders"
            className="group rounded-xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-white to-gray-50 p-8 text-center transition-all duration-200 hover:border-[#f5a5a5] hover:bg-gradient-to-br hover:from-[#fce8e8] hover:to-[#f5d7d7] hover:shadow-md"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#f5d7d7] to-[#f5a5a5] group-hover:scale-110 transition-transform">
              <Eye className="h-7 w-7 text-gray-900" />
            </div>
            <p className="mt-2 text-lg font-semibold text-gray-900">View Orders</p>
            <p className="mt-1 text-sm text-gray-600">Manage customer orders</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
