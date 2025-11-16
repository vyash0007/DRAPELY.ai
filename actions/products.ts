'use server';

import { db } from '@/lib/db';

import { Product, Category } from '@prisma/client';

export interface ProductWithCategory extends Product {
  category: Category;
}

// Serialized type for client components
export type SerializedProductWithCategory = Omit<ProductWithCategory, 'price'> & {
  price: number;
  category: Category;
};

/**
 * Get all products with optional category filter
 */
export async function getProducts({ categorySlug, page = 1, limit = 12 }: { categorySlug?: string; page?: number; limit?: number } = {}): Promise<{ products: SerializedProductWithCategory[]; total: number }> {
  try {
    const where = categorySlug
      ? {
          category: {
            slug: categorySlug,
          },
        }
      : undefined;
    const skip = (page - 1) * limit;
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
    // Serialize Decimal fields (e.g., price) to number
    const serializedProducts = products.map((product) => ({
      ...product,
      price: typeof product.price === 'object' && product.price !== null && 'toNumber' in product.price
        ? product.price.toNumber()
        : product.price,
    }));
    return { products: serializedProducts, total };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { products: [], total: 0 };
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
export async function searchProducts({ query, page = 1, limit = 12 }: { query: string; page?: number; limit?: number }): Promise<{ products: SerializedProductWithCategory[]; total: number }> {
  try {
    const where = {
      OR: [
        {
          title: {
            contains: query,
            mode: 'insensitive' as const,
          },
        },
        {
          description: {
            contains: query,
            mode: 'insensitive' as const,
          },
        },
      ],
    };
    const skip = (page - 1) * limit;
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
    // Serialize Decimal fields (e.g., price) to number
    const serializedProducts = products.map((product) => ({
      ...product,
      price: typeof product.price === 'object' && product.price !== null && 'toNumber' in product.price
        ? product.price.toNumber()
        : product.price,
    }));
    return { products: serializedProducts, total };
  } catch (error) {
    console.error('Error searching products:', error);
    return { products: [], total: 0 };
  }
}
