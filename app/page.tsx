import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/product-grid';
import { getFeaturedProducts } from '@/actions/products';
import Hero from '@/components/ui/hero';
import FeaturedProduct from '@/components/featuredProduct';
import Category from '@/components/Category';

import { Navbar } from '@/components/navbar';

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <>
      <Navbar homeTransparent />
      <div>
        {/* Hero Section */}
        <Hero />
        {/* Featured Products */}
        <FeaturedProduct/>

        {/* Categories Section */}
        <Category />
      </div>
    </>
  );
}
