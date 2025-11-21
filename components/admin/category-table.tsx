'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteCategoryDialog } from './delete-category-dialog';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    products: number;
  };
}

interface CategoryTableProps {
  categories: Category[];
}

export function CategoryTable({ categories }: CategoryTableProps) {
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);

  if (categories.length === 0) {
    return (
      <div className="rounded-xl bg-white p-12 text-center shadow-sm border border-gray-100">
        <p className="text-gray-500 font-medium">No categories found</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-[#fce8e8] to-[#f5d7d7]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Category Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Slug
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Description
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Products
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gradient-to-r hover:from-[#fce8e8]/30 hover:to-transparent transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{category.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 font-medium">{category.slug}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600 max-w-md truncate">
                    {category.description || <span className="text-gray-400 italic">No description</span>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                    {category._count.products} {category._count.products === 1 ? 'product' : 'products'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/categories/${category.id}/edit`}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hover:bg-[#f5d7d7]/50 hover:text-gray-900"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteCategoryId(category.id)}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DeleteCategoryDialog
        categoryId={deleteCategoryId}
        onClose={() => setDeleteCategoryId(null)}
      />
    </>
  );
}

