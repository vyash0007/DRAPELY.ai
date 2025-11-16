'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteProductDialog } from './delete-product-dialog';
import { Pagination } from './pagination';
import type { Product, Category } from '@prisma/client';


interface SerializedProductWithCategory {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  images: string[];
  featured: boolean;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  category: Category;
}

interface ProductTableProps {
  products: SerializedProductWithCategory[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function ProductTable({ products, pagination }: ProductTableProps) {
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  if (products.length === 0) {
    return (
      <div className="rounded-lg bg-white p-12 text-center shadow-md">
        <p className="text-gray-500">No products found</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          width={48}
                          height={48}
                          className="h-12 w-12 object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-200" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">{product.title}</div>
                      <div className="text-sm text-gray-500">{product.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                    {product.category.name}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  ${Number(product.price).toFixed(2)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {product.stock}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {product.featured ? (
                    <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                      Featured
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">
                      Regular
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteProductId(product.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination pagination={pagination} />

      <DeleteProductDialog
        productId={deleteProductId}
        onClose={() => setDeleteProductId(null)}
      />
    </>
  );
}
