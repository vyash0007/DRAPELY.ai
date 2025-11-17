'use server';

import { unstable_cache } from 'next/cache';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { Order, OrderItem, Product } from '@prisma/client';

export interface OrderWithItems extends Order {
  items: (OrderItem & {
    product: Product;
  })[];
}

/**
 * Create Stripe checkout session
 */
export async function createCheckoutSession() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error('You must be logged in to checkout');
    }

    // Get user's cart
    const cart = await db.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    // Verify stock availability
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.product.title}`);
      }
    }

    // Calculate total
    const total = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );

    // Create pending order
    const order = await db.order.create({
      data: {
        userId: user.id,
        total,
        customerEmail: user.email,
        customerName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: cart.items.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.product.title,
            images: item.product.images.slice(0, 1),
            description: item.product.description || undefined,
          },
          unit_amount: Math.round(Number(item.product.price) * 100),
        },
        quantity: item.quantity,
      })),
      customer_email: user.email,
      metadata: {
        orderId: order.id,
        userId: user.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
    });

    // Update order with Stripe session ID
    await db.order.update({
      where: { id: order.id },
      data: {
        stripeSessionId: session.id,
      },
    });

    return { url: session.url };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Get user's orders
 */
export async function getOrders(): Promise<OrderWithItems[]> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    const cacheKey = `orders-${user.id}`;
    
    return await unstable_cache(
      async () => {
        const orders = await db.order.findMany({
          where: {
            userId: user.id,
            status: {
              not: 'CANCELLED', // Exclude cancelled orders
            },
          },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    images: true,
                    price: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        // Serialize Decimal fields
        return orders.map((order) => ({
          ...order,
          total: typeof order.total === 'object' && order.total !== null && 'toNumber' in order.total
            ? order.total.toNumber()
            : order.total,
          items: order.items.map((item) => ({
            ...item,
            price: typeof item.price === 'object' && item.price !== null && 'toNumber' in item.price
              ? item.price.toNumber()
              : item.price,
            product: {
              ...item.product,
              price: typeof item.product.price === 'object' && item.product.price !== null && 'toNumber' in item.product.price
                ? item.product.price.toNumber()
                : item.product.price,
            },
          })),
        })) as OrderWithItems[];
      },
      [cacheKey],
      {
        revalidate: 30, // Cache for 30 seconds
        tags: ['orders', `orders-${user.id}`],
      }
    )();
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw new Error('Failed to fetch orders');
  }
}

/**
 * Get single order by ID
 */
export async function getOrderById(orderId: string): Promise<OrderWithItems | null> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    const cacheKey = `order-${orderId}-${user.id}`;
    
    return await unstable_cache(
      async () => {
        const order = await db.order.findFirst({
          where: {
            id: orderId,
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
                    images: true,
                    price: true,
                  },
                },
              },
            },
          },
        });

        if (!order) {
          return null;
        }

        // Serialize Decimal fields
        return {
          ...order,
          total: typeof order.total === 'object' && order.total !== null && 'toNumber' in order.total
            ? order.total.toNumber()
            : order.total,
          items: order.items.map((item) => ({
            ...item,
            price: typeof item.price === 'object' && item.price !== null && 'toNumber' in item.price
              ? item.price.toNumber()
              : item.price,
            product: {
              ...item.product,
              price: typeof item.product.price === 'object' && item.product.price !== null && 'toNumber' in item.product.price
                ? item.product.price.toNumber()
                : item.product.price,
            },
          })),
        } as OrderWithItems;
      },
      [cacheKey],
      {
        revalidate: 30, // Cache for 30 seconds
        tags: ['orders', `order-${orderId}`, `orders-${user.id}`],
      }
    )();
  } catch (error) {
    console.error('Error fetching order:', error);
    throw new Error('Failed to fetch order');
  }
}

/**
 * Get order by Stripe session ID
 */
export async function getOrderBySessionId(sessionId: string): Promise<OrderWithItems | null> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    const cacheKey = `order-session-${sessionId}-${user.id}`;
    
    return await unstable_cache(
      async () => {
        const order = await db.order.findFirst({
          where: {
            stripeSessionId: sessionId,
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
                    images: true,
                    price: true,
                  },
                },
              },
            },
          },
        });

        if (!order) {
          return null;
        }

        // Serialize Decimal fields
        return {
          ...order,
          total: typeof order.total === 'object' && order.total !== null && 'toNumber' in order.total
            ? order.total.toNumber()
            : order.total,
          items: order.items.map((item) => ({
            ...item,
            price: typeof item.price === 'object' && item.price !== null && 'toNumber' in item.price
              ? item.price.toNumber()
              : item.price,
            product: {
              ...item.product,
              price: typeof item.product.price === 'object' && item.product.price !== null && 'toNumber' in item.product.price
                ? item.product.price.toNumber()
                : item.product.price,
            },
          })),
        } as OrderWithItems;
      },
      [cacheKey],
      {
        revalidate: 30, // Cache for 30 seconds
        tags: ['orders', `order-session-${sessionId}`, `orders-${user.id}`],
      }
    )();
  } catch (error) {
    console.error('Error fetching order by session:', error);
    throw new Error('Failed to fetch order');
  }
}
