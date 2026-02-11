'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { ProductWithCategory } from '@/actions/products';
import { addToCart } from '@/actions/cart';
import { useRouter } from 'next/navigation';
import { WishlistButton } from '@/components/wishlist-button';
import { SmartImage } from '@/components/smart-image';
import { toast } from 'sonner';



// Match the serialized product type from ProductGrid
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

interface ProductCardProps {
  product: SerializedProductWithCategory;
  userId?: string | null;
  hasPremium?: boolean;
  aiEnabled?: boolean;
}
export function ProductCard({ product, userId, hasPremium = false, aiEnabled = false }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();

  const imageUrl = product.images[0] || '/placeholder.png';
  const isTrialProduct = product.metadata?.is_trial === 'true';

  // Calculate discount deterministically based on product ID to avoid hydration mismatch
  // This ensures the same product always has the same discount status on both server and client
  const hash = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hasDiscount = product.stock > 0 && (hash % 10) < 3; // ~30% chance based on ID

  const originalPrice = hasDiscount ? Number(product.price) * 1.5 : Number(product.price);
  const salePrice = Number(product.price);

  // Get first available size with stock (in standard size order: S, M, L, XL)
  const getFirstAvailableSize = () => {
    // Standard size order to ensure we pick smallest available first
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];

    const productSizes = product.sizes && product.sizes.length > 0
      ? product.sizes
      : ['S', 'M', 'L', 'XL'];

    // Sort sizes by standard order
    const sortedSizes = [...productSizes].sort((a, b) => {
      const indexA = sizeOrder.indexOf(a);
      const indexB = sizeOrder.indexOf(b);
      // If size not in standard order, put it at the end
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });

    if (product.sizeStocks && product.sizeStocks.length > 0) {
      // Find first size (in order) with stock > 0
      const availableSize = sortedSizes.find(size => {
        const sizeStock = product.sizeStocks?.find(s => s.size === size);
        return sizeStock && sizeStock.quantity > 0;
      });
      return availableSize || sortedSizes[0];
    }
    return sortedSizes[0];
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAdding || product.stock === 0) return;

    setIsAdding(true);
    try {
      const size = getFirstAvailableSize();
      await addToCart(product.id, 1, size);
      toast.success('Added to Cart');
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add to cart';
      toast.error(message);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-3 rounded-xl">
          <SmartImage
            src={imageUrl}
            alt={product.title}
            userId={userId || null}
            productId={product.id}
            hasPremium={hasPremium}
            aiEnabled={aiEnabled}
            isTrialProduct={isTrialProduct}
            imageIndex={0}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            quality={85}
            loading="lazy"
          />

          {/* Add to Cart Button - Shows on hover for desktop, persistent for mobile */}
          {product.stock > 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3 px-4 md:py-3.5 md:translate-y-full md:group-hover:translate-y-0 transition-all duration-300 shadow-lg">
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex items-center justify-center gap-2 w-full text-sm font-semibold uppercase tracking-wider hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                {isAdding ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          )}

          {/* Out of Stock Overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">Out of Stock</span>
            </div>
          )}

          {/* Wishlist Icon */}
          <WishlistButton
            productId={product.id}
            variant="icon-only"
            className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200 z-10 active:scale-95"
            iconClassName="w-5 h-5"
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="space-y-1">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-light text-base sm:text-lg text-gray-900 line-clamp-1 hover:text-gray-600 transition-colors">
            {product.title}
          </h3>
        </Link>

        <p className="text-xs sm:text-sm text-gray-500">{product.category.name}</p>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className={`font-bold ${hasDiscount ? 'text-orange-500' : 'text-gray-900'}`}>
            {formatPrice(salePrice)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
