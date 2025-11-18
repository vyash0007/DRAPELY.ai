import { notFound } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { getProductBySlug } from '@/actions/products';
import { ProductDetailClient } from '@/components/product-detail-client';
import { getCurrentUser } from '@/lib/auth';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, user] = await Promise.all([
    getProductBySlug(slug),
    getCurrentUser(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <ProductDetailClient 
        product={product}
        userId={user?.id || null}
        hasPremium={user?.hasPremium || false}
        aiEnabled={user?.aiEnabled || false}
      />
    </div>
  );
}
