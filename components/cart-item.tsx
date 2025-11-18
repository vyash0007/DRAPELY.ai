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
    <div className="bg-white rounded-lg p-6 flex gap-6">
      {/* Product Image */}
      <Link href={`/products/${item.product.slug}`}>
        <div className="relative h-48 w-40 overflow-hidden rounded-lg bg-gray-100 flex-shrink-0">
          <SmartImage
            src={imageUrl}
            alt={item.product.title}
            userId={userId}
            productId={item.product.id}
            hasPremium={hasPremium}
            aiEnabled={aiEnabled}
            isTrialProduct={isTrialProduct}
            imageIndex={0}
            fill
            className="object-cover"
            sizes="160px"
          />
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/products/${item.product.slug}`}>
            <h3 className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors mb-2">
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
            <div>
              <span className="text-gray-600">Size </span>
              <span className="font-semibold text-gray-900">XL</span>
            </div>
            <div className="text-gray-300">/</div>
            <div>
              <span className="text-gray-600">Color </span>
              <span className="font-semibold text-gray-900">Default</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(currentPrice)}
            </span>
            <span className="text-lg text-gray-400 line-through">
              {formatPrice(originalPrice)}
            </span>
          </div>
        </div>

        {/* Quantity Controls and Actions */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg border-2 border-gray-200 shadow-sm">
            <button
              onClick={() => handleUpdateQuantity(item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg active:scale-95"
            >
              <Minus className="h-4 w-4 text-gray-700" />
            </button>
            <span className="w-12 text-center font-bold text-gray-900">{item.quantity}</span>
            <button
              onClick={() => handleUpdateQuantity(item.quantity + 1)}
              disabled={isUpdating || item.quantity >= item.product.stock}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg active:scale-95"
            >
              <Plus className="h-4 w-4 text-gray-700" />
            </button>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRemove}
              disabled={isUpdating}
              className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-95"
              aria-label="Remove item"
            >
              <Trash2 className="h-5 w-5 text-red-600" />
            </button>
            <Link href={`/products/${item.product.slug}`}>
              <button
                className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                aria-label="Edit item"
              >
                <Edit className="h-5 w-5 text-gray-700" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
