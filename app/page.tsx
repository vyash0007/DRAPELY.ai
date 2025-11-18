import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/product-grid';
import { getFeaturedProducts } from '@/actions/products';
import Hero from '@/components/ui/hero';
import FeaturedProduct from '@/components/featuredProduct';
import Category from '@/components/Category';
import { getCurrentUser } from '@/lib/auth';

import { Navbar } from '@/components/navbar';

export default async function HomePage() {
  const [featuredProducts, user] = await Promise.all([
    getFeaturedProducts(),
    getCurrentUser(),
  ]);

  return (
    <>
      <Navbar homeTransparent />
      <div>
        {/* Hero Section */}
        <Hero />
        {/* Featured Products */}
        <FeaturedProduct 
          products={featuredProducts}
          userId={user?.id || null}
          hasPremium={user?.hasPremium || false}
          aiEnabled={user?.aiEnabled || false}
        />

        {/* Categories Section */}
        <Category />
      </div>
    </>
  );
}