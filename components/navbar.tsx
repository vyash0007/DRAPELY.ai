import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, User, Search, Heart, Menu } from 'lucide-react';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { getCart } from '@/actions/cart';
import { getCategories } from '@/actions/products';
import { NavbarWrapper } from './navbar-wrapper';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export async function Navbar({ homeTransparent }: { homeTransparent?: boolean } = {}) {
  const cart = await getCart();
  const categories = await getCategories();

  const NavLinks = () => (
    <>
      <Link href="/products" className="text-gray-900 hover:text-gray-600 font-light transition-colors">
        All Products
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/products?category=${category.slug}`}
          className="text-gray-900 hover:text-gray-600 font-light transition-colors"
        >
          {category.name}
        </Link>
      ))}
    </>
  );

  return (
    <NavbarWrapper>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile Menu & Logo */}
          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                    <Menu className="h-6 w-6 text-gray-900" strokeWidth={1.5} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <SheetHeader className="border-b pb-6">
                    <SheetTitle className="text-left flex items-center gap-2">
                      <Image
                        src="/logo2.2k.png"
                        alt="Logo"
                        width={40}
                        height={40}
                        className="h-10 w-10"
                      />
                      <span className="text-xl font-light tracking-wide">DRAPELY.ai</span>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col space-y-6 mt-8">
                    <NavLinks />
                    <SignedIn>
                      <Link href="/orders" className="text-gray-900 hover:text-gray-600 font-light transition-colors">
                        My Orders
                      </Link>
                    </SignedIn>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>

            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Image
                src="/logo2.2k.png"
                alt="Logo"
                width={56}
                height={56}
                className="h-12 w-12 hidden sm:block"
              />
              <span className="text-xl sm:text-2xl font-light tracking-wide text-gray-900">
                DRAPELY.ai
              </span>
            </Link>
          </div>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLinks />
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Link href="/search" className="hidden xs:block">
              <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                <Search className="h-5 w-5 text-gray-900" strokeWidth={1.5} />
              </Button>
            </Link>

            <SignedIn>
              <Link href="/wishlist">
                <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                  <Heart className="h-5 w-5 text-gray-900" strokeWidth={1.5} />
                </Button>
              </Link>

              <Link href="/cart" className="relative">
                <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                  <ShoppingBag className="h-5 w-5 text-gray-900" strokeWidth={1.5} />
                  {cart && cart.totalItems > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-gray-900 to-gray-700 text-[10px] font-semibold text-white shadow-md ring-2 ring-white">
                      {cart.totalItems}
                    </span>
                  )}
                </Button>
              </Link>

              <div className="hidden sm:block">
                <Link href="/orders">
                  <Button variant="ghost" className="hover:bg-gray-100 text-gray-900 font-light">Orders</Button>
                </Link>
              </div>

              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 border-2 border-[#87A582] rounded-full hover:scale-110 transition-transform duration-200",
                    userButtonPopoverCard: "rounded-2xl shadow-2xl border border-gray-100 bg-white p-2",
                    userButtonPopoverFooter: "!hidden",
                    internal_securedByClerk: "!hidden",
                    userButtonPopoverActionButton: "hover:bg-[#F5F0EB] text-gray-700 hover:text-[#87A582] rounded-xl py-3",
                    userButtonPopoverActionButtonText: "font-medium",
                    userButtonPopoverActionButtonIcon: "text-[#87A582]",
                    userButtonTrigger: "focus:outline-none focus:ring-2 focus:ring-[#87A582] rounded-full",
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
