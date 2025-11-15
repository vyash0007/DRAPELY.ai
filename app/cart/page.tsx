import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CartItem } from '@/components/cart-item';
import { formatPrice } from '@/lib/utils';
import { getCart } from '@/actions/cart';
import { createCheckoutSession } from '@/actions/orders';
import { getCurrentUser } from '@/lib/auth';

export default async function CartPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const cart = await getCart();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <ShoppingBag className="h-24 w-24 text-gray-300" />
          <h2 className="text-2xl font-bold">Your cart is empty</h2>
          <p className="text-gray-600">Add some products to get started</p>
          <Link href="/products">
            <Button>Shop Now</Button>
          </Link>
        </div>
      </div>
    );
  }

  async function handleCheckout() {
    'use server';
    const { url } = await createCheckoutSession();
    if (url) {
      redirect(url);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Cart Items ({cart.totalItems})</CardTitle>
            </CardHeader>
            <CardContent>
              {cart.items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{formatPrice(cart.totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">Calculated at checkout</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(cart.totalPrice)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <form action={handleCheckout} className="w-full">
                <Button type="submit" className="w-full" size="lg">
                  Proceed to Checkout
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
