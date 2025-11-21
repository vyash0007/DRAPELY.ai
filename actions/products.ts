'use server';

import { unstable_cache } from 'next/cache';
import { db } from '@/lib/db';

import { Product, Category, SizeStock } from '@prisma/client';

export interface ProductWithCategory extends Product {
  category: Category;
  sizeStocks?: SizeStock[];
}

// Serialized type for client components
export type SerializedProductWithCategory = Omit<ProductWithCategory, 'price' | 'metadata'> & {
  price: number;
  category: Category;
  metadata?: Record<string, string>;
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
        const serializedProducts = products.map((product) => {
          const productWithMetadata = product as typeof product & { metadata?: any };
          return {
            ...product,
            price: typeof product.price === 'object' && product.price !== null && 'toNumber' in product.price
              ? product.price.toNumber()
              : Number(product.price),
            metadata: (productWithMetadata.metadata as Record<string, string>) || {},
            sizeStocks: product.sizeStocks?.map((ss) => ({ ...ss })),
          };
        });
        return { products: serializedProducts as unknown as SerializedProductWithCategory[], total };
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
 * Get trial products using availableForTryOn field (dedicated way)
 */
export async function getTrialProducts(limit: number = 100): Promise<SerializedProductWithCategory[]> {
  try {
    return await unstable_cache(
      async () => {
        const products = await db.product.findMany({
          where: {
            availableForTryOn: true,
          },
          include: {
            category: true,
            sizeStocks: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: limit,
        });

        console.log(`📊 [getTrialProducts] Found ${products.length} trial products (availableForTryOn: true)`);

        const validProducts = products.filter(p => p && p.id && p.category);
        
        const serializedProducts = validProducts.map((product) => {
          const productWithMetadata = product as typeof product & { metadata?: any };
          return {
            ...product,
            price: typeof product.price === 'object' && product.price !== null && 'toNumber' in product.price
              ? product.price.toNumber()
              : Number(product.price),
            metadata: (productWithMetadata.metadata as Record<string, string>) || {},
          };
        }) as unknown as SerializedProductWithCategory[];
        
        return serializedProducts;
      },
      ['trial-products'],
      {
        revalidate: 60,
        tags: ['products', 'trial-products'],
      }
    )();
  } catch (error) {
    console.error('Error fetching trial products:', error);
    return [];
  }
}

/**
 * Get trial products by category using availableForTryOn field (dedicated way)
 */
export async function getTrialProductsByCategory(
  categorySlug: string,
  limit: number = 100
): Promise<SerializedProductWithCategory[]> {
  try {
    const cacheKey = `trial-products-category-${categorySlug}`;
    
    return await unstable_cache(
      async () => {
        const products = await db.product.findMany({
          where: {
            availableForTryOn: true,
            category: {
              slug: categorySlug,
            },
          },
          include: {
            category: true,
            sizeStocks: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: limit,
        });

        console.log(`📊 [getTrialProductsByCategory] Category: ${categorySlug}, Found ${products.length} trial products`);

        const validProducts = products.filter(p => p && p.id && p.category);
        
        const serializedProducts = validProducts.map((product) => {
          const productWithMetadata = product as typeof product & { metadata?: any };
          return {
            ...product,
            price: typeof product.price === 'object' && product.price !== null && 'toNumber' in product.price
              ? product.price.toNumber()
              : Number(product.price),
            metadata: (productWithMetadata.metadata as Record<string, string>) || {},
          };
        }) as unknown as SerializedProductWithCategory[];
        
        return serializedProducts;
      },
      [cacheKey],
      {
        revalidate: 60,
        tags: ['products', 'trial-products', `category-${categorySlug}`],
      }
    )();
  } catch (error) {
    console.error('Error fetching trial products by category:', error);
    return [];
  }
}

/**
 * Get all products by category (for premium/subscribed users)
 */
export async function getAllProductsByCategory(
  categorySlug: string,
  limit: number = 100
): Promise<SerializedProductWithCategory[]> {
  try {
    const cacheKey = `all-products-category-${categorySlug}`;
    
    return await unstable_cache(
      async () => {
        const products = await db.product.findMany({
          where: {
            category: {
              slug: categorySlug,
            },
          },
          include: {
            category: true,
            sizeStocks: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: limit,
        });

        console.log(`📊 [getAllProductsByCategory] Category: ${categorySlug}, Found ${products.length} products`);

        const validProducts = products.filter(p => p && p.id && p.category);
        
        const serializedProducts = validProducts.map((product) => {
          const productWithMetadata = product as typeof product & { metadata?: any };
          return {
            ...product,
            price: typeof product.price === 'object' && product.price !== null && 'toNumber' in product.price
              ? product.price.toNumber()
              : Number(product.price),
            metadata: (productWithMetadata.metadata as Record<string, string>) || {},
          };
        }) as unknown as SerializedProductWithCategory[];
        
        return serializedProducts;
      },
      [cacheKey],
      {
        revalidate: 60,
        tags: ['products', `category-${categorySlug}`],
      }
    )();
  } catch (error) {
    console.error('Error fetching all products by category:', error);
    return [];
  }
}

/**
 * Get featured products for homepage
 */
export async function getFeaturedProducts(): Promise<SerializedProductWithCategory[]> {
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
        const validProducts = products.filter(p => p && p.id && p.category);
        
        // Serialize Decimal fields (e.g., price) to number
        const serializedProducts = validProducts.map((product) => {
          const productWithMetadata = product as typeof product & { metadata?: any };
          return {
            ...product,
            price: typeof product.price === 'object' && product.price !== null && 'toNumber' in product.price
              ? product.price.toNumber()
              : Number(product.price),
            metadata: (productWithMetadata.metadata as Record<string, string>) || {},
          };
        }) as unknown as SerializedProductWithCategory[];
        
        return serializedProducts;
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
export async function getProductBySlug(slug: string): Promise<SerializedProductWithCategory | null> {
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
    const productWithMetadata = product as typeof product & { metadata?: any };
    return {
      ...product,
      price: typeof product.price === 'object' && product.price !== null && 'toNumber' in product.price
        ? product.price.toNumber()
        : Number(product.price),
      metadata: (productWithMetadata.metadata as Record<string, string>) || {},
    } as unknown as SerializedProductWithCategory;
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
    const serializedProducts = products.map((product) => {
      const productWithMetadata = product as typeof product & { metadata?: any };
      return {
        ...product,
        price: typeof product.price === 'object' && product.price !== null && 'toNumber' in product.price
          ? product.price.toNumber()
          : Number(product.price),
        metadata: (productWithMetadata.metadata as Record<string, string>) || {},
      };
    });
    return { products: serializedProducts as unknown as SerializedProductWithCategory[], total };
  } catch (error) {
    console.error('Error searching products:', error);
    return { products: [], total: 0 };
  }
}
