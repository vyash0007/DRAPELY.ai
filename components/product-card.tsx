'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { ProductWithCategory } from '@/actions/products';
import { addToCart } from '@/actions/cart';
import { useRouter } from 'next/navigation';
import { WishlistButton } from '@/components/wishlist-button';

interface ProductCardProps {
  product: SerializedProductWithCategory;
}
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
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
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
}
export function ProductCard({ product }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();

  const imageUrl = product.images[0] || '/placeholder.png';

  // Calculate discount deterministically based on product ID to avoid hydration mismatch
  // This ensures the same product always has the same discount status on both server and client
  const hash = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hasDiscount = product.stock > 0 && (hash % 10) < 3; // ~30% chance based on ID

  const originalPrice = hasDiscount ? Number(product.price) * 1.5 : Number(product.price);
  const salePrice = Number(product.price);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAdding || product.stock === 0) return;

    setIsAdding(true);
    try {
      await addToCart(product.id);
      router.refresh();
      // Optional: Show success notification
      console.log('Added to cart successfully');
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Optional: Show error notification
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-3 rounded-xl">
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            quality={85}
            loading="lazy"
          />

          {/* Add to Cart Button - Shows on hover */}
          {product.stock > 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3.5 px-4 translate-y-full group-hover:translate-y-0 transition-all duration-300 shadow-lg">
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
          <h3 className="font-light text-lg text-gray-900 line-clamp-1 hover:text-gray-600 transition-colors">
            {product.title}
          </h3>
        </Link>

        <p className="text-sm text-gray-500">{product.category.name}</p>

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
