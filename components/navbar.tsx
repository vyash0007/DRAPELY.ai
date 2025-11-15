import Link from 'next/link';
import { ShoppingBag, User, Search } from 'lucide-react';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { getCart } from '@/actions/cart';
import { getCategories } from '@/actions/products';

export async function Navbar() {
  const cart = await getCart();
  const categories = await getCategories();

  return (
    <nav className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold">
              Fashion Store
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-gray-700 hover:text-black transition">
              All Products
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="text-gray-700 hover:text-black transition"
              >
                {category.name}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <Link href="/search">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
            </Link>

            <SignedIn>
              <Link href="/cart" className="relative">
                <Button variant="ghost" size="icon">
                  <ShoppingBag className="h-5 w-5" />
                  {cart && cart.totalItems > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-xs text-white">
                      {cart.totalItems}
                    </span>
                  )}
                </Button>
              </Link>

              <Link href="/orders">
                <Button variant="ghost">Orders</Button>
              </Link>

              <UserButton />
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  );
}
