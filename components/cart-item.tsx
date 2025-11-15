'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { removeFromCart, updateCartItemQuantity } from '@/actions/cart';
import { CartItemWithProduct } from '@/actions/cart';

interface CartItemProps {
  item: CartItemWithProduct;
}

export function CartItem({ item }: CartItemProps) {
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

  return (
    <div className="flex gap-4 border-b py-4">
      <Link href={`/products/${item.product.slug}`}>
        <div className="relative h-24 w-24 overflow-hidden rounded-md bg-gray-100">
          <Image
            src={imageUrl}
            alt={item.product.title}
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link href={`/products/${item.product.slug}`}>
            <h3 className="font-semibold hover:underline">{item.product.title}</h3>
          </Link>
          <p className="mt-1 text-sm text-gray-600">
            {formatPrice(item.product.price)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-md border">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleUpdateQuantity(item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleUpdateQuantity(item.quantity + 1)}
              disabled={isUpdating || item.quantity >= item.product.stock}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            disabled={isUpdating}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>

      <div className="font-semibold">
        {formatPrice(item.product.price * item.quantity)}
      </div>
    </div>
  );
}
