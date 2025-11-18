'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { toggleWishlist, isInWishlist } from '@/actions/wishlist';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface WishlistButtonProps {
  productId: string;
  className?: string;
  iconClassName?: string;
  showText?: boolean;
  variant?: 'default' | 'icon-only';
}

export function WishlistButton({
  productId,
  className,
  iconClassName,
  showText = false,
  variant = 'default',
}: WishlistButtonProps) {
  const [isInWishlistState, setIsInWishlistState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  // Check if product is in wishlist on mount
  useEffect(() => {
    const checkWishlist = async () => {
      try {
        const inWishlist = await isInWishlist(productId);
        setIsInWishlistState(inWishlist);
      } catch (error) {
        console.error('Error checking wishlist:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkWishlist();
  }, [productId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setIsLoading(true);
      const result = await toggleWishlist(productId);
      setIsInWishlistState(result.inWishlist);

      if (result.inWishlist) {
        toast.success('Added to Wishlist');
      } else {
        toast.success('Removed from Wishlist');
      }

      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update wishlist';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'icon-only') {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading || isChecking}
        className={cn(
          'flex items-center justify-center transition-colors',
          isLoading || isChecking ? 'cursor-wait' : 'cursor-pointer',
          className
        )}
        aria-label={isInWishlistState ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart
          className={cn(
            'transition-all',
            isInWishlistState ? 'fill-red-500 text-red-500' : 'text-current',
            iconClassName
          )}
        />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading || isChecking}
      className={cn(
        'flex items-center gap-2 transition-colors',
        isLoading || isChecking ? 'cursor-wait opacity-50' : 'cursor-pointer',
        className
      )}
    >
      <Heart
        className={cn(
          'h-5 w-5 transition-all',
          isInWishlistState ? 'fill-red-500 text-red-500' : 'text-current',
          iconClassName
        )}
      />
      {showText && (
        <span>{isInWishlistState ? 'In Wishlist' : 'Add to Wishlist'}</span>
      )}
    </button>
  );
}
