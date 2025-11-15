import { Suspense } from 'react';
import { getProducts } from '@/actions/products';
import { ProductGrid } from '@/components/product-grid';

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category } = await searchParams;
  const products = await getProducts(category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {category ? `${category.replace('-', ' ')}` : 'All Products'}
        </h1>
        <p className="mt-2 text-gray-600">{products.length} products found</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ProductGrid products={products} />
      </Suspense>
    </div>
  );
}
