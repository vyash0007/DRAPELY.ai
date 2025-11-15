import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice, formatDate } from '@/lib/utils';
import { getOrders } from '@/actions/orders';
import { getCurrentUser } from '@/lib/auth';

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'secondary';
      case 'PROCESSING':
        return 'default';
      case 'SHIPPED':
        return 'default';
      case 'DELIVERED':
        return 'default';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold">Order History</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                <Badge variant={getStatusColor(order.status)}>{order.status}</Badge>
              </div>
              <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-t pt-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2">
                      <div>
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="font-medium hover:underline"
                        >
                          {item.product.title}
                        </Link>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <span className="font-semibold">
                        {formatPrice(Number(item.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatPrice(Number(order.total))}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
