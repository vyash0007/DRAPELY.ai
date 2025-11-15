'use server';

import { db } from '@/lib/db';
import { Product, Category } from '@prisma/client';

export interface ProductWithCategory extends Product {
  category: Category;
}

/**
 * Get all products with optional category filter
 */
export async function getProducts(categorySlug?: string): Promise<ProductWithCategory[]> {
  try {
    const products = await db.product.findMany({
      where: categorySlug
        ? {
            category: {
              slug: categorySlug,
            },
          }
        : undefined,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return empty array to allow products page to render gracefully
    // when database is unreachable (e.g., Neon free tier sleep mode)
    return [];
  }
}

/**
 * Get featured products for homepage
 */
export async function getFeaturedProducts(): Promise<ProductWithCategory[]> {
  try {
    const products = await db.product.findMany({
      where: {
        featured: true,
      },
      include: {
        category: true,
      },
      take: 6,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return products;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    // Return empty array to allow homepage to render gracefully
    // when database is unreachable (e.g., Neon free tier sleep mode)
    return [];
  }
}

/**
 * Get a single product by slug
 */
export async function getProductBySlug(slug: string): Promise<ProductWithCategory | null> {
  try {
    const product = await db.product.findUnique({
      where: {
        slug,
      },
      include: {
        category: true,
      },
    });

    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw new Error('Failed to fetch product');
  }
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const categories = await db.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return empty array to allow navbar to render gracefully
    // when database is unreachable (e.g., Neon free tier sleep mode)
    return [];
  }
}

/**
 * Search products by title
 */
export async function searchProducts(query: string): Promise<ProductWithCategory[]> {
  try {
    const products = await db.product.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return products;
  } catch (error) {
    console.error('Error searching products:', error);
    throw new Error('Failed to search products');
  }
}
