'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';

export interface ProductFormData {
  title: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  images: string[];
  featured: boolean;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}

/**
 * Get all products with pagination and filters (Admin)
 */
export async function getAdminProducts(filters: ProductFilters = {}) {
  await requireAdminAuth();

  const {
    search = '',
    categoryId,
    page = 1,
    limit = 10,
  } = filters;

  try {
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { slug: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(categoryId && { categoryId }),
    };

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    // Convert Decimal fields to plain numbers for client-safe serialization
    const safeProducts = products.map((p) => ({
      ...p,
      price: Number((p as any).price),
    }));

    return {
      products: safeProducts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching admin products:', error);
    return {
      products: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    };
  }
}

/**
 * Get single product by ID (Admin)
 */
export async function getAdminProductById(id: string) {
  await requireAdminAuth();

  try {
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) return null;

    // Convert Decimal price to plain number to avoid passing Decimal to client components
    return {
      ...product,
      price: Number((product as any).price),
    };
  } catch (error) {
    console.error('Error fetching admin product:', error);
    return null;
  }
}

/**
 * Create new product (Admin)
 */
export async function createProduct(data: ProductFormData) {
  await requireAdminAuth();

  try {
    const product = await db.product.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        price: data.price,
        stock: data.stock,
        categoryId: data.categoryId,
        images: data.images,
        featured: data.featured,
      },
    });

    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath('/');

    return { success: true, product };
  } catch (error: any) {
    console.error('Error creating product:', error);
    return {
      success: false,
      error: error.message || 'Failed to create product',
    };
  }
}

/**
 * Update product (Admin)
 */
export async function updateProduct(id: string, data: ProductFormData) {
  await requireAdminAuth();

  try {
    const product = await db.product.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        price: data.price,
        stock: data.stock,
        categoryId: data.categoryId,
        images: data.images,
        featured: data.featured,
      },
    });

    revalidatePath('/admin/products');
    revalidatePath(`/admin/products/${id}/edit`);
    revalidatePath('/products');
    revalidatePath(`/products/${product.slug}`);
    revalidatePath('/');

    return { success: true, product };
  } catch (error: any) {
    console.error('Error updating product:', error);
    return {
      success: false,
      error: error.message || 'Failed to update product',
    };
  }
}

/**
 * Delete product (Admin)
 */
export async function deleteProduct(id: string) {
  await requireAdminAuth();

  try {
    await db.product.delete({
      where: { id },
    });

    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath('/');

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete product',
    };
  }
}

/**
 * Get all categories (Admin)
 */
export async function getAdminCategories() {
  await requireAdminAuth();

  try {
    const categories = await db.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}
