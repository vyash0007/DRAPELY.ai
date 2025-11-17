'use server';

import { unstable_cache } from 'next/cache';
import { db } from '@/lib/db';

import { Product, Category, SizeStock } from '@prisma/client';

export interface ProductWithCategory extends Product {
  category: Category;
  sizeStocks?: SizeStock[];
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
    const cacheKey = `products-${categorySlug || 'all'}-${page}-${limit}`;
    
    return await unstable_cache(
      async () => {
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
            select: {
              id: true,
              title: true,
              slug: true,
              description: true,
              price: true,
              stock: true,
              images: true,
              featured: true,
              fit: true,
              composition: true,
              sizes: true,
              sizeStocks: {
                select: {
                  id: true,
                  size: true,
                  quantity: true,
                  createdAt: true,
                  updatedAt: true,
                  productId: true,
                },
              },
              categoryId: true,
              createdAt: true,
              updatedAt: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  description: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
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
          sizeStocks: product.sizeStocks?.map((ss) => ({ ...ss })),
        }));
        const serializedProductsTyped = serializedProducts as unknown as SerializedProductWithCategory[];
        return { products: serializedProducts, total };
      },
      [cacheKey],
      {
        revalidate: 30, // Cache for 30 seconds
        tags: ['products', categorySlug ? `category-${categorySlug}` : 'all-products'],
      }
    )();
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
    return await unstable_cache(
      async () => {
        const products = await db.product.findMany({
          where: {
            featured: true,
          },
          include: {
            category: true,
            sizeStocks: true,
          },
          take: 6,
          orderBy: {
            createdAt: 'desc',
          },
        });

        // Filter out any null/undefined products and ensure they have valid data
        return products.filter(p => p && p.id && p.category);
      },
      ['featured-products'],
      {
        revalidate: 60, // Reduced cache time to 1 minute for fresher data
        tags: ['products', 'featured'],
      }
    )();
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
        sizeStocks: true,
      },
    });

    if (!product) {
      return null;
    }

    // Serialize Decimal fields (e.g., price) to number
    return {
      ...product,
      price: typeof product.price === 'object' && product.price !== null && 'toNumber' in product.price
        ? product.price.toNumber()
        : product.price,
    } as unknown as ProductWithCategory;
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
    return await unstable_cache(
      async () => {
        const categories = await db.category.findMany({
          orderBy: {
            name: 'asc',
          },
        });

        return categories;
      },
      ['categories'],
      {
        revalidate: 3600, // Cache for 1 hour (static data)
        tags: ['categories'],
      }
    )();
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
          sizeStocks: true,
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
