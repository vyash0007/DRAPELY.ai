'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';

export interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
}

/**
 * Get all categories with product counts (Admin)
 */
export async function getAdminCategories() {
  await requireAdminAuth();

  try {
    const categories = await db.category.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
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

/**
 * Get single category by ID (Admin)
 */
export async function getAdminCategoryById(id: string) {
  await requireAdminAuth();

  try {
    const category = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return category;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

/**
 * Create new category (Admin)
 */
export async function createCategory(data: CategoryFormData) {
  await requireAdminAuth();

  try {
    // Check if category with same name or slug already exists
    const existing = await db.category.findFirst({
      where: {
        OR: [
          { name: data.name },
          { slug: data.slug },
        ],
      },
    });

    if (existing) {
      return {
        success: false,
        error: existing.name === data.name
          ? 'A category with this name already exists'
          : 'A category with this slug already exists',
      };
    }

    const category = await db.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
      },
    });

    revalidatePath('/admin/categories');
    revalidatePath('/products');
    revalidatePath('/');
    revalidateTag('categories', 'max');

    return { success: true, category };
  } catch (error: any) {
    console.error('Error creating category:', error);
    return {
      success: false,
      error: error.message || 'Failed to create category',
    };
  }
}

/**
 * Update category (Admin)
 */
export async function updateCategory(id: string, data: CategoryFormData) {
  await requireAdminAuth();

  try {
    // Check if another category with same name or slug already exists
    const existing = await db.category.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              { name: data.name },
              { slug: data.slug },
            ],
          },
        ],
      },
    });

    if (existing) {
      return {
        success: false,
        error: existing.name === data.name
          ? 'A category with this name already exists'
          : 'A category with this slug already exists',
      };
    }

    const category = await db.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
      },
    });

    revalidatePath('/admin/categories');
    revalidatePath('/products');
    revalidatePath('/');
    revalidateTag('categories', 'max');

    return { success: true, category };
  } catch (error: any) {
    console.error('Error updating category:', error);
    return {
      success: false,
      error: error.message || 'Failed to update category',
    };
  }
}

/**
 * Delete category (Admin)
 */
export async function deleteCategory(id: string) {
  await requireAdminAuth();

  try {
    // Check if category has associated products
    const productsCount = await db.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      return {
        success: false,
        error: `Cannot delete category. It has ${productsCount} associated product(s). Please reassign or delete products first.`,
      };
    }

    await db.category.delete({
      where: { id },
    });

    revalidatePath('/admin/categories');
    revalidatePath('/products');
    revalidatePath('/');
    revalidateTag('categories', 'max');

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete category',
    };
  }
}

