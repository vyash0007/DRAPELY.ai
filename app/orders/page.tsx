import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Package, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice, formatDate } from '@/lib/utils';
import { getOrders } from '@/actions/orders';
import { getCurrentUser } from '@/lib/auth';
import { SmartImage } from '@/components/smart-image';
import { CancelOrderButton } from '@/components/cancel-order-button';

export default async function OrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const orders = await getOrders();

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Package className="h-24 w-24 text-gray-300" />
          <h2 className="text-2xl font-bold">No orders yet</h2>
          <p className="text-gray-600">Start shopping to see your orders here</p>
          <Link href="/products">
            <Button>Shop Now</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { text: 'In - Transit', color: 'text-[#E2A16F]' };
      case 'PROCESSING':
        return { text: 'In - Transit', color: 'text-[#E2A16F]' };
      case 'SHIPPED':
        return { text: 'In - Transit', color: 'text-[#E2A16F]' };
      case 'DELIVERED':
        return { text: 'Delivered', color: 'text-[#41A67E]' };
      case 'CANCELLED':
        return { text: 'Cancelled', color: 'text-[#DC0E0E]' };
      default:
        return { text: 'In - Transit', color: 'text-[#E2A16F]' };
    }
  };

  // Calculate delivery date (14 days from order date)
  const getDeliveryDate = (orderDate: Date) => {
    const delivery = new Date(orderDate);
    delivery.setDate(delivery.getDate() + 14);
    return delivery.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-light text-gray-900 mb-3">My Orders</h1>
          <p className="text-gray-500">
            View and edit all your pending, delivered, and returned orders here.
          </p>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => {
            const statusInfo = getStatusDisplay(order.status);
            const deliveryDate = getDeliveryDate(order.createdAt);

            return (
              <div key={order.id} className="bg-white rounded-lg shadow-sm p-8">
                {/* Order Header */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-8">
                    <div>
                      <span className="text-gray-600">Order </span>
                      <span className="text-blue-500 font-semibold">#{order.orderNumber}</span>
                    </div>
                    <div className="text-gray-500">
                      Order Placed: {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <button className="bg-[#E2A16F] text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors">
                    <MapPin className="w-5 h-5" />
                    TRACK ORDER
                  </button>
                </div>

                {/* Order Items */}
                <div className="space-y-6 mb-6">
                  {order.items.map((item) => {
                    const imageUrl = item.product.images[0] || '/placeholder.png';

                    return (
                      <div key={item.id} className="flex items-center gap-6">
                        {/* Product Image */}
                        <Link href={`/products/${item.product.slug}`}>
                          <div className="relative w-28 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                            <SmartImage
                              src={imageUrl}
                              alt={item.product.title}
                              userId={user.id}
                              productId={item.product.id}
                              hasPremium={user.hasPremium || false}
                              aiEnabled={user.aiEnabled || false}
                              isTrialProduct={(item.product.metadata as { is_trial?: string })?.is_trial === 'true'}
                              imageIndex={0}
                              fill
                              className="object-cover"
                              sizes="112px"
                              quality={85}
                              loading="lazy"
                            />
                          </div>
                        </Link>

                        {/* Product Details */}
                        <div className="flex-1">
                          <Link href={`/products/${item.product.slug}`}>
                            <h3 className="text-xl font-bold text-gray-900 hover:text-gray-700 mb-1">
                              {item.product.title}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-500 mb-3">
                            By: {order.customerName || 'Guest'}
                          </p>
                          <div className="flex items-center gap-6 text-sm">
                            {item.size && (
                              <div>
                                <span className="text-gray-600">Size: </span>
                                <span className="font-semibold text-gray-900">{item.size}</span>
                              </div>
                            )}
                            <div>
                              <span className="text-gray-600">Qty: </span>
                              <span className="font-semibold text-gray-900">{item.quantity}</span>
                            </div>
                            <div className="font-bold text-xl text-gray-900">
                              {formatPrice(Number(item.price))}
                            </div>
                          </div>
                        </div>

                        {/* Status and Delivery */}
                        <div className="flex flex-col items-end gap-4 min-w-[280px]">
                          <div className="text-right">
                            <div className="text-sm text-gray-600 mb-1">Status</div>
                            <div className={`text-xl font-semibold ${statusInfo.color}`}>
                              {statusInfo.text}
                            </div>
                          </div>
                          {order.status !== 'DELIVERED' && (
                            <div className="text-right">
                              <div className="text-sm text-gray-600 mb-1">Delivery Expected by</div>
                              <div className="text-lg font-bold text-gray-900">
                                {deliveryDate}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Footer */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <CancelOrderButton orderId={order.id} orderNumber={order.orderNumber} isDelivered={order.status === 'DELIVERED'} />
                  <div className="flex items-center gap-8">
                    <div className="text-gray-500">
                      Paid using credit card ending with ****
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(Number(order.total))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
