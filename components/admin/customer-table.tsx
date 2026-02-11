'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Eye, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from './pagination';
import type { CustomerWithStats } from '@/actions/admin-customers';

interface CustomerTableProps {
  customers: CustomerWithStats[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function CustomerTable({ customers, pagination }: CustomerTableProps) {
  if (customers.length === 0) {
    return (
      <div className="rounded-xl bg-white p-12 text-center shadow-sm border border-gray-100">
        <p className="text-gray-500 font-medium">No customers found</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-[#fce8e8] to-[#f5d7d7]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Customer
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Orders
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Total Spent
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Last Order
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Member Since
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gradient-to-r hover:from-[#fce8e8]/30 hover:to-transparent transition-colors">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-3">
                    {customer.imageUrl ? (
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-gray-200">
                        <Image
                          src={customer.imageUrl}
                          alt={customer.firstName || customer.email}
                          width={40}
                          height={40}
                          className="h-10 w-10 object-cover"
                          quality={85}
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                        <UserCircle className="h-5 w-5 text-slate-600" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-gray-900">
                        {customer.firstName && customer.lastName
                          ? `${customer.firstName} ${customer.lastName}`
                          : customer.firstName || customer.lastName || 'No Name'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="text-sm font-medium text-gray-900">{customer.email}</span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
                    {customer.totalOrders}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="text-sm font-semibold text-gray-900">
                    ${customer.totalSpent.toFixed(2)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {customer.lastOrderDate ? (
                    <span className="text-sm text-gray-600 font-medium">
                      {new Date(customer.lastOrderDate).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">No orders</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="text-sm text-gray-600 font-medium">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <Link href={`/admin/customers/${customer.id}`}>
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

