'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateOrderStatus } from '@/actions/admin-orders';
import { toast } from 'sonner';
import type { OrderStatus } from '@prisma/client';

interface UpdateOrderStatusProps {
  orderId: string;
  currentStatus: OrderStatus;
}

const STATUS_OPTIONS: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'PENDING', label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'PROCESSING', label: 'Processing', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'SHIPPED', label: 'Shipped', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { value: 'DELIVERED', label: 'Delivered', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200' },
];

export function UpdateOrderStatus({ orderId, currentStatus }: UpdateOrderStatusProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (newStatus === status) return;

    setIsLoading(true);
    setStatus(newStatus);

    try {
      const result = await updateOrderStatus(orderId, newStatus);

      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
        setStatus(currentStatus); // Revert on error
      }
    } catch (error) {
      toast.error('Failed to update order status');
      setStatus(currentStatus); // Revert on error
    } finally {
      setIsLoading(false);
    }
  };

  const currentOption = STATUS_OPTIONS.find((opt) => opt.value === status);

  return (
    <div className="relative">
      <select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
        disabled={isLoading}
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold border cursor-pointer transition-opacity ${
          currentOption?.color
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
