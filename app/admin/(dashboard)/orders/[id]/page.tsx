import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Box, UserCircle, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAdminOrderById } from '@/actions/admin-orders';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
  PROCESSING: 'bg-blue-50 text-blue-700 border border-blue-200',
  SHIPPED: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  CANCELLED: 'bg-red-50 text-red-700 border border-red-200',
};

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/orders">
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
            Order #{order.orderNumber.substring(0, 8)}
          </h1>
          <p className="mt-2 text-gray-600">
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-light tracking-wide text-gray-900">
              <Box className="h-5 w-5 text-[#f5a5a5]" />
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b pb-4 last:border-0">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                    {item.product.images[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.title}
                        width={80}
                        height={80}
                        className="h-20 w-20 object-cover"
                      />
                    ) : (
                      <div className="h-20 w-20 bg-gray-200" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.product.title}</h3>
                    {item.size && (
                      <p className="mt-1 text-sm text-gray-500">
                        Size: {item.size}
                      </p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Price: ${Number(item.price).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Status */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <h2 className="mb-4 text-xl font-light tracking-wide text-gray-900">Order Status</h2>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                STATUS_STYLES[order.status]
              }`}
            >
              {order.status}
            </span>
          </div>

          {/* Customer Info */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-light tracking-wide text-gray-900">
              <UserCircle className="h-5 w-5 text-[#f5a5a5]" />
              Customer
            </h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">
                {order.user.firstName} {order.user.lastName}
              </p>
              <p className="text-gray-600">{order.user.email}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-light tracking-wide text-gray-900">
              <CreditCard className="h-5 w-5 text-[#f5a5a5]" />
              Payment
            </h2>
            <div className="space-y-2 text-sm">
              {order.stripeSessionId && (
                <div>
                  <span className="text-gray-600">Session ID:</span>
                  <p className="font-mono text-xs text-gray-900">
                    {order.stripeSessionId.substring(0, 20)}...
                  </p>
                </div>
              )}
              {order.stripePaymentId && (
                <div>
                  <span className="text-gray-600">Payment ID:</span>
                  <p className="font-mono text-xs text-gray-900">
                    {order.stripePaymentId}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <h2 className="mb-4 text-xl font-light tracking-wide text-gray-900">Order Total</h2>
            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-gray-900">
                ${Number(order.total).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
