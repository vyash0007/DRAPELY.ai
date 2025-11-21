'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Pencil, Trash2 } from 'lucide-react';
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
  availableForTryOn: boolean;
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
      <div className="rounded-xl bg-white p-12 text-center shadow-sm border border-gray-100">
        <p className="text-gray-500 font-medium">No products found</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm border border-gray-100">
        <table className="w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gradient-to-r from-[#fce8e8] to-[#f5d7d7]">
            <tr>
              <th className="w-[35%] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Product
              </th>
              <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Category
              </th>
              <th className="w-[10%] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Price
              </th>
              <th className="w-[10%] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Stock
              </th>
              <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Status
              </th>
              <th className="w-[15%] px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gradient-to-r hover:from-[#fce8e8]/30 hover:to-transparent transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          width={56}
                          height={56}
                          className="h-14 w-14 object-cover"
                          quality={85}
                        />
                      ) : (
                        <div className="h-14 w-14 bg-gray-100" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 truncate">{product.title}</div>
                      <div className="text-sm text-gray-500 font-medium truncate">{product.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                    {product.category.name}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="text-sm font-semibold text-gray-900">${Number(product.price).toFixed(2)}</span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="text-sm font-medium text-gray-900">{product.stock}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                    {product.featured ? (
                      <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 w-fit">
                        Featured
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600 border border-gray-200 w-fit">
                        Regular
                      </span>
                    )}
                    {product.availableForTryOn && (
                      <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200 w-fit">
                        AI Try-On
                      </span>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/products/${product.id}/edit`}>
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
                      onClick={() => setDeleteProductId(product.id)}
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

      <Pagination pagination={pagination} />

      <DeleteProductDialog
        productId={deleteProductId}
        onClose={() => setDeleteProductId(null)}
      />
    </>
  );
}
