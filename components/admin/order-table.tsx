'use client';

import Link from 'next/link';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from './pagination';
import type { Order, OrderItem, Product, User, OrderStatus } from '@prisma/client';

interface OrderWithDetails extends Order {
  user: Pick<User, 'email' | 'firstName' | 'lastName'>;
  items: (OrderItem & {
    product: Pick<Product, 'title' | 'images'>;
  })[];
}

interface OrderTableProps {
  orders: OrderWithDetails[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export function OrderTable({ orders, pagination }: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-lg bg-white p-12 text-center shadow-md">
        <p className="text-gray-500">No orders found</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Order #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="font-medium text-gray-900">
                    {order.orderNumber.substring(0, 8)}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">
                      {order.user.firstName} {order.user.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{order.user.email}</div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  ${Number(order.total).toFixed(2)}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      STATUS_STYLES[order.status]
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <Link href={`/admin/orders/${order.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination pagination={pagination} />
    </>
  );
}
