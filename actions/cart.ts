'use server';

import { revalidatePath } from 'next/cache';
import { unstable_cache } from 'next/cache';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export interface CartItemWithProduct {
  id: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    images: string[];
    stock: number;
  };
}

export interface CartData {
  id: string;
  items: CartItemWithProduct[];
  totalItems: number;
  totalPrice: number;
}

/**
 * Get current user's cart
 */
export async function getCart(): Promise<CartData | null> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return null;
    }

    const cacheKey = `cart-${user.id}`;
    
    return await unstable_cache(
      async () => {
        const cart = await db.cart.findUnique({
          where: {
            userId: user.id,
          },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    price: true,
                    images: true,
                    stock: true,
                  },
                },
              },
            },
          },
        });

        if (!cart) {
          return null;
        }

        const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.items.reduce(
          (sum, item) => sum + Number(item.product.price) * item.quantity,
          0
        );

        return {
          id: cart.id,
          items: cart.items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            product: {
              ...item.product,
              price: Number(item.product.price),
            },
          })),
          totalItems,
          totalPrice,
        };
      },
      [cacheKey],
      {
        revalidate: 10, // Cache for 10 seconds (cart changes frequently)
        tags: ['cart', `cart-${user.id}`],
      }
    )();
  } catch (error) {
    console.error('Error fetching cart:', error);
    // Return null instead of throwing to allow UI to render gracefully
    // when database is unreachable (e.g., Neon free tier sleep mode)
    return null;
  }
}

/**
 * Add product to cart
 */
export async function addToCart(productId: string, quantity: number = 1) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error('You must be logged in to add items to cart');
    }

    // Optimize: Run product check and cart lookup in parallel
    const [product, cart] = await Promise.all([
      // Only fetch needed fields for stock check
      db.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          stock: true,
        },
      }),
      // Get or create cart in one operation
      db.cart.upsert({
        where: { userId: user.id },
        create: { userId: user.id },
        update: {},
      }),
    ]);

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.stock < quantity) {
      throw new Error('Insufficient stock');
    }

    // Check if product already in cart and update/create in one operation
    const existingCartItem = await db.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      select: {
        id: true,
        quantity: true,
      },
    });

    if (existingCartItem) {
      // Update quantity
      const newQuantity = existingCartItem.quantity + quantity;

      if (product.stock < newQuantity) {
        throw new Error('Insufficient stock');
      }

      await db.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Add new cart item
      await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    // Revalidate cart page and cache
    revalidatePath('/cart');
    
    return { success: true, message: 'Added to cart' };
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

/**
 * Remove product from cart
 */
export async function removeFromCart(cartItemId: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    // Verify cart item belongs to user
    const cartItem = await db.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
      },
    });

    if (!cartItem || cartItem.cart.userId !== user.id) {
      throw new Error('Cart item not found');
    }

    await db.cartItem.delete({
      where: { id: cartItemId },
    });

    revalidatePath('/cart');
    return { success: true, message: 'Removed from cart' };
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    // Verify cart item belongs to user
    const cartItem = await db.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
        product: true,
      },
    });

    if (!cartItem || cartItem.cart.userId !== user.id) {
      throw new Error('Cart item not found');
    }

    if (cartItem.product.stock < quantity) {
      throw new Error('Insufficient stock');
    }

    await db.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    revalidatePath('/cart');
    return { success: true, message: 'Cart updated' };
  } catch (error) {
    console.error('Error updating cart:', error);
    throw error;
  }
}

/**
 * Clear entire cart
 */
export async function clearCart() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    const cart = await db.cart.findUnique({
      where: { userId: user.id },
    });

    if (cart) {
      await db.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    revalidatePath('/cart');
    return { success: true, message: 'Cart cleared' };
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
}
