import Link from 'next/link';
import { ShoppingBag, User, Search } from 'lucide-react';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { getCart } from '@/actions/cart';
import { getCategories } from '@/actions/products';
import { NavbarWrapper } from './navbar-wrapper';

export async function Navbar({ homeTransparent }: { homeTransparent?: boolean } = {}) {
  const cart = await getCart();
  const categories = await getCategories();

  return (
    <NavbarWrapper>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
              FASHION
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-gray-900 hover:text-gray-600 font-medium transition-colors">
              All Products
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="text-gray-900 hover:text-gray-600 font-medium transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            <Link href="/search">
              <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                <Search className="h-5 w-5 text-gray-900" />
              </Button>
            </Link>

            <SignedIn>
              <Link href="/cart" className="relative">
                <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                  <ShoppingBag className="h-5 w-5 text-gray-900" />
                  {cart && cart.totalItems > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-xs text-white">
                      {cart.totalItems}
                    </span>
                  )}
                </Button>
              </Link>

              <Link href="/orders">
                <Button variant="ghost" className="hover:bg-gray-100 text-gray-900 font-medium">Orders</Button>
              </Link>

              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9"
                  }
                }}
              />
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                  <User className="h-5 w-5 text-gray-900" />
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </NavbarWrapper>
  );
}
