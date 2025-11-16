'use server';

import { unstable_cache } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { OrderStatus } from '@prisma/client';

export interface OrderFilters {
  search?: string;
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

/**
 * Get all orders with pagination and filters (Admin)
 */
export async function getAdminOrders(filters: OrderFilters = {}) {
  await requireAdminAuth();

  const {
    search = '',
    status,
    page = 1,
    limit = 20,
  } = filters;

  try {
    const cacheKey = `admin-orders-${search}-${status || 'all'}-${page}-${limit}`;
    
    return await unstable_cache(
      async () => {
        const skip = (page - 1) * limit;

        const where = {
          ...(search && {
            OR: [
              { orderNumber: { contains: search, mode: 'insensitive' as const } },
              { user: { email: { contains: search, mode: 'insensitive' as const } } },
            ],
          }),
          ...(status && { status }),
        };

        const [orders, total] = await Promise.all([
          db.order.findMany({
            where,
            include: {
              user: {
                select: {
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
              items: {
                include: {
                  product: {
                    select: {
                      title: true,
                      images: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            skip,
            take: limit,
          }),
          db.order.count({ where }),
        ]);

        // Convert Decimal fields (e.g., total, product.price) to plain numbers
        const safeOrders = orders.map((o) => ({
          ...o,
          total: Number((o as any).total),
          items: o.items.map((item) => ({
            ...item,
            price: Number((item as any).price),
            product: item.product ? { ...item.product } : item.product,
          })),
        }));

        return {
          orders: safeOrders,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        };
      },
      [cacheKey],
      {
        revalidate: 15, // Cache for 15 seconds (admin data changes more frequently)
        tags: ['admin-orders', status ? `admin-orders-${status}` : 'admin-orders-all'],
      }
    )();
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return {
      orders: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      },
    };
  }
}

/**
 * Get single order by ID (Admin)
 */
export async function getAdminOrderById(id: string) {
  await requireAdminAuth();

  try {
    const cacheKey = `admin-order-${id}`;
    
    return await unstable_cache(
      async () => {
        const order = await db.order.findUnique({
          where: { id },
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
                clerkId: true,
              },
            },
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

        if (!order) return null;

        // Convert Decimal fields to plain numbers for safe serialization
        return {
          ...order,
          total: Number((order as any).total),
          items: order.items.map((item) => ({
            ...item,
            price: Number((item as any).price),
            product: item.product
              ? { ...item.product, price: Number((item.product as any).price) }
              : item.product,
          })),
        };
      },
      [cacheKey],
      {
        revalidate: 15, // Cache for 15 seconds
        tags: ['admin-orders', `admin-order-${id}`],
      }
    )();
  } catch (error) {
    console.error('Error fetching admin order:', error);
    return null;
  }
}

/**
 * Get order statistics (Admin)
 */
export async function getOrderStatistics() {
  await requireAdminAuth();

  try {
    const [totalOrders, pendingOrders, processingOrders, deliveredOrders] = await Promise.all([
      db.order.count(),
      db.order.count({ where: { status: 'PENDING' } }),
      db.order.count({ where: { status: 'PROCESSING' } }),
      db.order.count({ where: { status: 'DELIVERED' } }),
    ]);

    const totalRevenue = await db.order.aggregate({
      where: {
        status: {
          in: ['PROCESSING', 'SHIPPED', 'DELIVERED'],
        },
      },
      _sum: {
        total: true,
      },
    });

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      deliveredOrders,
      totalRevenue: Number(totalRevenue._sum.total || 0),
    };
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    return {
      totalOrders: 0,
      pendingOrders: 0,
      processingOrders: 0,
      deliveredOrders: 0,
      totalRevenue: 0,
    };
  }
}
