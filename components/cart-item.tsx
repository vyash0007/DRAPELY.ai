'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Plus, Minus, Edit } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { removeFromCart, updateCartItemQuantity } from '@/actions/cart';
import { CartItemWithProduct } from '@/actions/cart';
import { SmartImage } from '@/components/smart-image';

interface CartItemProps {
  item: CartItemWithProduct;
  userId?: string | null;
  hasPremium?: boolean;
  aiEnabled?: boolean;
}

export function CartItem({ item, userId, hasPremium = false, aiEnabled = false }: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleRemove = async () => {
    try {
      setIsUpdating(true);
      await removeFromCart(item.id);
      router.refresh();
    } catch (error) {
      alert('Failed to remove item');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      setIsUpdating(true);
      await updateCartItemQuantity(item.id, newQuantity);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update quantity';
      alert(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const imageUrl = item.product.images[0] || '/placeholder.png';
  const isTrialProduct = item.product.metadata?.is_trial === 'true';

  // Calculate original price with discount
  const originalPrice = Number(item.product.price) * 1.2;
  const currentPrice = Number(item.product.price);

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
      <Link href={`/products/${item.product.slug}`} className="mx-auto sm:mx-0 w-full sm:w-auto flex-shrink-0">
        <div className="relative aspect-square sm:h-48 sm:w-40 overflow-hidden rounded-2xl bg-gray-100 shadow-inner group">
          <SmartImage
            src={imageUrl}
            alt={item.product.title}
            userId={userId || null}
            productId={item.product.id}
            hasPremium={hasPremium}
            aiEnabled={aiEnabled}
            isTrialProduct={isTrialProduct}
            imageIndex={0}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 160px"
            badgePosition="right"
          />
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/products/${item.product.slug}`}>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors mb-2">
              {item.product.title}
            </h3>
          </Link>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {String(
              ('description' in item.product && item.product.description)
                ? item.product.description
                : 'Button-Down Collar & Placket...'
            )}
          </p>

          {/* Size and Color */}
          <div className="flex gap-6 mb-4 text-sm">
            {item.size && (
              <>
                <div>
                  <span className="text-gray-600">Size </span>
                  <span className="font-semibold text-gray-900">{item.size}</span>
                </div>
                <div className="text-gray-300">/</div>
              </>
            )}
            <div>
              <span className="text-gray-600">Color </span>
              <span className="font-semibold text-gray-900">Default</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              {formatPrice(currentPrice)}
            </span>
            <span className="text-base sm:text-lg text-gray-400 line-through">
              {formatPrice(originalPrice)}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-6 gap-4">
          <div className="flex items-center justify-center sm:justify-start gap-2 bg-white rounded-xl border-2 border-gray-100 shadow-sm p-1">
            <button
              onClick={() => handleUpdateQuantity(item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg active:scale-90"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center font-bold text-gray-900 text-lg">{item.quantity}</span>
            <button
              onClick={() => handleUpdateQuantity(item.quantity + 1)}
              disabled={isUpdating || item.quantity >= item.product.stock}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg active:scale-90"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Action Icons */}
          <div className="flex items-center justify-center sm:justify-end gap-3">
            <button
              onClick={handleRemove}
              disabled={isUpdating}
              className="flex-1 sm:flex-none h-12 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl border-2 border-red-50 bg-red-50/50 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95 px-4 sm:px-0"
              aria-label="Remove item"
            >
              <Trash2 className="h-5 w-5" />
              <span className="sm:hidden ml-2 font-semibold">Remove</span>
            </button>
            <Link href={`/products/${item.product.slug}`} className="flex-1 sm:flex-none">
              <button
                className="w-full sm:w-12 h-12 flex items-center justify-center rounded-xl border-2 border-gray-100 bg-gray-50/50 text-gray-600 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-300 shadow-sm active:scale-95 px-4 sm:px-0"
                aria-label="Edit item"
              >
                <Edit className="h-5 w-5" />
                <span className="sm:hidden ml-2 font-semibold">Edit</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
