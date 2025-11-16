import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, UserCircle, Mail, Calendar, DollarSign, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAdminCustomerById } from '@/actions/admin-customers';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const customer = await getAdminCustomerById(id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/customers">
          <Button 
            variant="ghost" 
            size="sm"
            className="hover:bg-[#f5d7d7]/50 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-4xl font-light tracking-wide text-gray-900">
            {customer.firstName && customer.lastName
              ? `${customer.firstName} ${customer.lastName}`
              : customer.firstName || customer.lastName || 'Customer'}
          </h1>
          <p className="mt-2 text-gray-600">{customer.email}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customer Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col items-center text-center">
              {customer.imageUrl ? (
                <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-gray-200 mb-4">
                  <Image
                    src={customer.imageUrl}
                    alt={customer.firstName || customer.email}
                    width={96}
                    height={96}
                    className="h-24 w-24 object-cover"
                    quality={85}
                  />
                </div>
              ) : (
                <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center border-2 border-gray-200 mb-4">
                  <UserCircle className="h-12 w-12 text-slate-600" />
                </div>
              )}
              <h2 className="text-xl font-semibold text-gray-900">
                {customer.firstName && customer.lastName
                  ? `${customer.firstName} ${customer.lastName}`
                  : customer.firstName || customer.lastName || 'No Name'}
              </h2>
              <p className="text-gray-600 mt-1">{customer.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-light tracking-wide text-gray-900 mb-4">Statistics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Total Orders</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{customer.totalOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Total Spent</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  ${customer.totalSpent.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Member Since</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-light tracking-wide text-gray-900 mb-6">Order History</h2>
            {customer.orders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {customer.orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="block rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          Order #{order.orderNumber.substring(0, 8)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ${order.total.toFixed(2)}
                        </p>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold mt-2 ${
                            order.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : order.status === 'PROCESSING'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : order.status === 'SHIPPED'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : order.status === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

