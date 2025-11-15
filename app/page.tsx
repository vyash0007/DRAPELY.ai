import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/product-grid';
import { getFeaturedProducts } from '@/actions/products';

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="mb-6 text-5xl font-bold">
              Discover Your Perfect Style
            </h1>
            <p className="mb-8 text-xl text-gray-300">
              Shop the latest fashion trends with our curated collection of premium clothing and accessories.
            </p>
            <Link href="/products">
              <Button size="lg" className="bg-white text-black hover:bg-gray-100">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <p className="mt-2 text-gray-600">Handpicked items just for you</p>
        </div>
        <ProductGrid
          products={featuredProducts}
          emptyMessage="No featured products available"
        />
        <div className="mt-12 text-center">
          <Link href="/products">
            <Button variant="outline" size="lg">
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold">Shop by Category</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Link
              href="/products?category=mens-fashion"
              className="group relative overflow-hidden rounded-lg bg-gray-100 p-8 transition-shadow hover:shadow-lg"
            >
              <h3 className="text-2xl font-semibold">Men's Fashion</h3>
              <p className="mt-2 text-gray-600">Stylish clothing for men</p>
              <ArrowRight className="mt-4 h-6 w-6 transition-transform group-hover:translate-x-2" />
            </Link>
            <Link
              href="/products?category=womens-fashion"
              className="group relative overflow-hidden rounded-lg bg-gray-100 p-8 transition-shadow hover:shadow-lg"
            >
              <h3 className="text-2xl font-semibold">Women's Fashion</h3>
              <p className="mt-2 text-gray-600">Elegant clothing for women</p>
              <ArrowRight className="mt-4 h-6 w-6 transition-transform group-hover:translate-x-2" />
            </Link>
            <Link
              href="/products?category=accessories"
              className="group relative overflow-hidden rounded-lg bg-gray-100 p-8 transition-shadow hover:shadow-lg"
            >
              <h3 className="text-2xl font-semibold">Accessories</h3>
              <p className="mt-2 text-gray-600">Complete your look</p>
              <ArrowRight className="mt-4 h-6 w-6 transition-transform group-hover:translate-x-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
