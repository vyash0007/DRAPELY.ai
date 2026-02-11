import { ProductCard } from '@/components/product-card';

// Match the serialized product type from server actions
interface SerializedProductWithCategory {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  images: string[];
  featured: boolean;
  metadata?: Record<string, string>;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  sizes?: string[];
  sizeStocks?: { size: string; quantity: number }[];
  category: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    slug: string;
    description: string | null;
  };
}

interface ProductGridProps {
  products: SerializedProductWithCategory[];
  emptyMessage?: string;
  userId?: string | null;
  hasPremium?: boolean;
  aiEnabled?: boolean;
}

export function ProductGrid({ products, emptyMessage = 'No products found', userId, hasPremium = false, aiEnabled = false }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-900">No Products Found</p>
          <p className="text-gray-500 leading-relaxed">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          userId={userId}
          hasPremium={hasPremium}
          aiEnabled={aiEnabled}
        />
      ))}
    </div>
  );
}
