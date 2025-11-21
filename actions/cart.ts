'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export interface CartItemWithProduct {
  id: string;
  quantity: number;
  size: string | null;
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    images: string[];
    stock: number;
    metadata?: Record<string, string>;
  };
}

export interface CartData {
  id: string;
  items: CartItemWithProduct[];
  totalItems: number;
  totalPrice: number;
}

/**
 * Get current user's cart (no caching - cart needs fresh data)
 */
export async function getCart(): Promise<CartData | null> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return null;
    }

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
                metadata: true,
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
        size: item.size,
        product: {
          ...item.product,
          price: Number(item.product.price),
          metadata: (item.product.metadata as Record<string, string>) || {},
        },
      })),
      totalItems,
      totalPrice,
    };
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
export async function addToCart(productId: string, quantity: number = 1, size?: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error('You must be logged in to add items to cart');
    }

    // Optimize: Run product check and cart lookup in parallel
    const [product, cart] = await Promise.all([
      // Fetch product with size stocks
      db.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          stock: true,
          sizeStocks: {
            select: {
              size: true,
              quantity: true,
            },
          },
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

    // Check stock based on size
    let availableStock = product.stock;
    if (size) {
      const sizeStock = product.sizeStocks.find(s => s.size === size);
      if (!sizeStock || sizeStock.quantity < quantity) {
        throw new Error(`Insufficient stock for size ${size}`);
      }
      availableStock = sizeStock.quantity;
    } else if (product.stock < quantity) {
      throw new Error('Insufficient stock');
    }

    // Check if product with same size already in cart
    const existingCartItem = await db.cartItem.findUnique({
      where: {
        cartId_productId_size: {
          cartId: cart.id,
          productId,
          size: size || "",
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

      if (availableStock < newQuantity) {
        throw new Error(`Insufficient stock${size ? ` for size ${size}` : ''}`);
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
          size: size || null,
        },
      });
    }

    // Revalidate cart page and cache
    revalidatePath('/cart');
    // Revalidate all pages to update navbar cart count
    revalidatePath('/', 'layout');
    // Revalidate cart cache tags
    revalidateTag('cart', 'max');
    revalidateTag(`cart-${user.id}`, 'max');

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
    revalidatePath('/', 'layout');
    revalidateTag('cart', 'max');
    revalidateTag(`cart-${user.id}`, 'max');
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
    revalidatePath('/', 'layout');
    revalidateTag('cart', 'max');
    revalidateTag(`cart-${user.id}`, 'max');
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
    revalidatePath('/', 'layout');
    revalidateTag('cart', 'max');
    revalidateTag(`cart-${user.id}`, 'max');
    return { success: true, message: 'Cart cleared' };
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
}
