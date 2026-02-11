import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  // Calculate order summary
  const subtotal = cart.totalPrice;
  const discount = subtotal * 0.15; // 15% discount
  const tax = 0; // Free tax
  const shipping = 0; // Free shipping
  const total = subtotal - discount + tax + shipping;

  // Estimated delivery date (2 weeks from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 14);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="bg-[#faf8f5] min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Page Title */}
        <h1 className="mb-6 sm:mb-8 text-3xl sm:text-5xl font-serif font-light text-gray-900">Cart</h1>

        {/* Progress Steps */}
        <div className="mb-8 sm:mb-12 flex flex-wrap items-center gap-2 sm:gap-4 text-sm sm:text-base">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="font-bold text-gray-900">1. Cart</span>
          </div>
          <div className="h-px w-8 sm:w-16 bg-gray-300"></div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-gray-400">2. Checkout</span>
          </div>
          <div className="h-px w-8 sm:w-16 bg-gray-300"></div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-gray-400">3. Payment</span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                userId={user.id}
                hasPremium={user.hasPremium || false}
                aiEnabled={user.aiEnabled || false}
              />
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sm:p-8 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Sub Total</span>
                  <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Discount</span>
                  <span className="font-semibold text-gray-900">{formatPrice(discount)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax</span>
                  <span className="font-semibold text-gray-900">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="font-semibold text-[#63A361]">Free</span>
                </div>
              </div>

              <div className="border-t border-gray-300 pt-4 mb-6">
                <div className="flex justify-between text-xl">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-gray-900">{formatPrice(total)}</span>
                </div>
              </div>

              <form action={handleCheckout} className="w-full mb-8">
                <button
                  type="submit"
                  className="w-full bg-gray-900 text-white py-4 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-xl active:scale-[0.98] uppercase tracking-wide"
                >
                  Proceed to Checkout
                </button>
              </form>

              <div className="text-center text-sm text-gray-600 mb-8">
                Estimated Delivery by <span className="font-semibold text-gray-900">{formattedDeliveryDate}</span>
              </div>

              {/* Coupon Section */}
              <div className="border-t border-gray-300 pt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Have a Coupon?</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                  />
                  <button
                    type="button"
                    className="px-6 py-3 bg-[#F7A5A5] text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
