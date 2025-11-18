'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addToCart } from '@/actions/cart';
import { toast } from 'sonner';

interface AddToCartButtonProps {
  productId: string;
  quantity?: number;
  size?: string;
  variant?: 'default' | 'outline';
  className?: string;
}

export function AddToCartButton({
  productId,
  quantity = 1,
  size,
  variant = 'default',
  className,
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAddToCart = async () => {
    try {
      setIsLoading(true);
      await addToCart(productId, quantity, size);
      toast.success('Added to Cart');
      // Refresh in background (non-blocking)
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add to cart';
      toast.error(message);
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
