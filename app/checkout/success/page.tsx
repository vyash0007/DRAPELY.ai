import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice, formatDate } from '@/lib/utils';
import { getOrderBySessionId } from '@/actions/orders';
import { clearCart } from '@/actions/cart';

interface SuccessPageProps {
  searchParams: Promise<{
    session_id?: string;
  }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect('/');
  }

  const order = await getOrderBySessionId(session_id);

  if (!order) {
    redirect('/');
  }

  // Clear the cart when the user reaches the success page
  // This ensures the cart is emptied even if the webhook hasn't fired yet
  await clearCart();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
        <h1 className="mt-4 text-3xl font-bold">Order Successful!</h1>
        <p className="mt-2 text-gray-600">Thank you for your purchase</p>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Order Number:</span>
            <span className="font-semibold">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-semibold">{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className="font-semibold">{order.status}</span>
          </div>
          <div className="border-t pt-4">
            <div className="mb-2 font-semibold">Items:</div>
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between py-2">
                <span className="text-gray-700">
                  {item.product.title} x {item.quantity}
                </span>
                <span>{formatPrice(Number(item.price) * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{formatPrice(Number(order.total))}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Link href="/products" className="flex-1">
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </Link>
          <Link href="/orders" className="flex-1">
            <Button className="w-full">View All Orders</Button>
          </Link>
        </CardFooter>
      </Card>

      <p className="mt-8 text-center text-sm text-gray-600">
        A confirmation email has been sent to {order.customerEmail}
      </p>
    </div>
  );
}
