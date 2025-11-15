'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addToCart } from '@/actions/cart';

interface AddToCartButtonProps {
  productId: string;
  quantity?: number;
  variant?: 'default' | 'outline';
  className?: string;
}

export function AddToCartButton({
  productId,
  quantity = 1,
  variant = 'default',
  className,
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAddToCart = async () => {
    try {
      setIsLoading(true);
      await addToCart(productId, quantity);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add to cart';
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isLoading}
      variant={variant}
      className={className}
    >
      <ShoppingCart className="h-4 w-4" />
      {isLoading ? 'Adding...' : 'Add to Cart'}
    </Button>
  );
}
