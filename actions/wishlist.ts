'use server';

import { revalidatePath } from 'next/cache';
import { unstable_cache } from 'next/cache';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export interface WishlistItemWithProduct {
  id: string;
  productId: string;
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    images: string[];
    stock: number;
    category: {
      id: string;
      name: string;
      slug: string;
    };
  };
  createdAt: Date;
}

/**
 * Get current user's wishlist
 */
export async function getWishlist(): Promise<WishlistItemWithProduct[]> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return [];
    }

    const cacheKey = `wishlist-${user.id}`;

    return await unstable_cache(
      async () => {
        const wishlistItems = await db.wishlistItem.findMany({
          where: {
            userId: user.id,
          },
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                price: true,
                images: true,
                stock: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return wishlistItems.map((item) => ({
          id: item.id,
          productId: item.productId,
          product: {
            ...item.product,
            price: Number(item.product.price),
          },
          createdAt: item.createdAt,
        }));
      },
      [cacheKey],
      {
        revalidate: 10, // Cache for 10 seconds
        tags: ['wishlist', `wishlist-${user.id}`],
      }
    )();
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }
}

/**
 * Check if product is in wishlist
 */
export async function isInWishlist(productId: string): Promise<boolean> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return false;
    }

    const item = await db.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    return !!item;
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return false;
  }
}

/**
 * Add product to wishlist
 */
export async function addToWishlist(productId: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error('You must be logged in to add items to wishlist');
    }

    // Check if product exists
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Check if already in wishlist
    const existing = await db.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    if (existing) {
      throw new Error('Product already in wishlist');
    }

    // Add to wishlist
    await db.wishlistItem.create({
      data: {
        userId: user.id,
        productId,
      },
    });

    revalidatePath('/wishlist');

    return { success: true, message: 'Added to wishlist' };
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
}

/**
 * Remove product from wishlist
 */
export async function removeFromWishlist(productId: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    const item = await db.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    if (!item) {
      throw new Error('Product not in wishlist');
    }

    await db.wishlistItem.delete({
      where: { id: item.id },
    });

    revalidatePath('/wishlist');

    return { success: true, message: 'Removed from wishlist' };
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
}

/**
 * Toggle product in wishlist (add if not present, remove if present)
 */
export async function toggleWishlist(productId: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error('You must be logged in');
    }

    const existing = await db.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    if (existing) {
      await db.wishlistItem.delete({
        where: { id: existing.id },
      });
      revalidatePath('/wishlist');
      return { success: true, inWishlist: false, message: 'Removed from wishlist' };
    } else {
      await db.wishlistItem.create({
        data: {
          userId: user.id,
          productId,
        },
      });
      revalidatePath('/wishlist');
      return { success: true, inWishlist: true, message: 'Added to wishlist' };
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    throw error;
  }
}
