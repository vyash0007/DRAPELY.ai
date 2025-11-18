'use server';

import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { unstable_cache } from 'next/cache';

export interface CustomerWithStats {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  aiEnabled: boolean;
  hasPremium: boolean;
  createdAt: Date;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: Date | null;
}

export async function getAdminCustomers({
  search = '',
  page = 1,
  limit = 20,
}: {
  search?: string;
  page?: number;
  limit?: number;
} = {}) {
  await requireAdminAuth();

  try {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
          aiEnabled: true,
          hasPremium: true,
          createdAt: true,
          orders: {
            select: {
              total: true,
              createdAt: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    const customers: CustomerWithStats[] = users.map((user) => {
      const totalSpent = user.orders
        .filter(order => order.status !== 'CANCELLED')
        .reduce(
          (sum, order) => sum + (typeof order.total === 'object' && order.total !== null && 'toNumber' in order.total
            ? order.total.toNumber()
            : Number(order.total)),
          0
        );
      const lastOrder = user.orders.length > 0
        ? user.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        : null;

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        aiEnabled: user.aiEnabled,
        hasPremium: user.hasPremium,
        createdAt: user.createdAt,
        totalOrders: user.orders.length,
        totalSpent,
        lastOrderDate: lastOrder?.createdAt || null,
      };
    });

    return {
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw new Error('Failed to fetch customers');
  }
}

export async function getAdminCustomerById(id: string) {
  await requireAdminAuth();

  try {
    const user = await db.user.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    title: true,
                    images: true,
                    slug: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return null;
    }

    const totalSpent = user.orders
      .filter(order => order.status !== 'CANCELLED')
      .reduce(
        (sum, order) => sum + (typeof order.total === 'object' && order.total !== null && 'toNumber' in order.total
          ? order.total.toNumber()
          : Number(order.total)),
        0
      );

    return {
      ...user,
      totalOrders: user.orders.length,
      totalSpent,
      orders: user.orders.map((order) => ({
        ...order,
        total: typeof order.total === 'object' && order.total !== null && 'toNumber' in order.total
          ? order.total.toNumber()
          : Number(order.total),
        items: order.items.map((item) => ({
          ...item,
          price: typeof item.price === 'object' && item.price !== null && 'toNumber' in item.price
            ? item.price.toNumber()
            : Number(item.price),
        })),
      })),
    };
  } catch (error) {
    console.error('Error fetching customer:', error);
    throw new Error('Failed to fetch customer');
  }
}

/**
 * Update user AI enabled status
 */
export async function updateUserAiEnabled(userId: string, aiEnabled: boolean) {
  await requireAdminAuth();

  try {
    const user = await db.user.update({
      where: { id: userId },
      data: { aiEnabled },
    });

    return { success: true, user };
  } catch (error: any) {
    console.error('Error updating user AI status:', error);
    return {
      success: false,
      error: error.message || 'Failed to update AI status',
    };
  }
}

/**
 * Update user premium status
 * If premium is enabled, AI is automatically enabled
 */
export async function updateUserPremiumStatus(userId: string, hasPremium: boolean) {
  await requireAdminAuth();

  try {
    // If premium is enabled, automatically enable AI
    // If premium is disabled, keep AI status as is (don't change it)
    const updateData: { hasPremium: boolean; aiEnabled?: boolean } = { hasPremium };
    if (hasPremium) {
      updateData.aiEnabled = true;
    }

    const user = await db.user.update({
      where: { id: userId },
      data: updateData,
    });

    return { success: true, user };
  } catch (error: any) {
    console.error('Error updating user premium status:', error);
    return {
      success: false,
      error: error.message || 'Failed to update premium status',
    };
  }
}

