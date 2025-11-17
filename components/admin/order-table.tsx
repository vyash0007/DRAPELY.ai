'use client';

import Link from 'next/link';
import { Eye, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from './pagination';
import { UpdateOrderStatus } from './update-order-status';
import type { Order, OrderItem, Product, User, OrderStatus } from '@prisma/client';


interface SerializedOrderItem extends Omit<OrderItem, 'price'> {
  price: number;
  product: Pick<Product, 'title' | 'images'>;
}

interface SerializedOrderWithDetails extends Omit<Order, 'total'> {
  total: number;
  user: Pick<User, 'email' | 'firstName' | 'lastName'>;
  items: SerializedOrderItem[];
}

interface OrderTableProps {
  orders: SerializedOrderWithDetails[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
  PROCESSING: 'bg-blue-50 text-blue-700 border border-blue-200',
  SHIPPED: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  CANCELLED: 'bg-red-50 text-red-700 border border-red-200',
};

export function OrderTable({ orders, pagination }: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl bg-white p-12 text-center shadow-sm border border-gray-100">
        <p className="text-gray-500 font-medium">No orders found</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-[#fce8e8] to-[#f5d7d7]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Order #
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Customer
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Items
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Total
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Date
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gradient-to-r hover:from-[#fce8e8]/30 hover:to-transparent transition-colors">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="font-semibold text-gray-900">
                    {order.orderNumber.substring(0, 8)}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {order.user.firstName} {order.user.lastName}
                    </div>
                    <div className="text-sm text-gray-500 font-medium">{order.user.email}</div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="text-sm font-medium text-gray-900">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="text-sm font-semibold text-gray-900">
                    ${Number(order.total).toFixed(2)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <UpdateOrderStatus orderId={order.id} currentStatus={order.status} />
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="text-sm text-gray-600 font-medium">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <Link href={`/admin/orders/${order.id}`}>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="hover:bg-[#f5d7d7]/50 hover:text-gray-900"
                    >
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
