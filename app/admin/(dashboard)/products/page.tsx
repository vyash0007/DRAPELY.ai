import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAdminProducts, getAdminCategories } from '@/actions/admin-products';
import { ProductTable } from '@/components/admin/product-table';
import { ProductFilters } from '@/components/admin/product-filters';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    categoryId?: string;
    page?: string;
  }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || '';
  const categoryId = params.categoryId;

  const [{ products, pagination }, categories] = await Promise.all([
    getAdminProducts({ search, categoryId, page, limit: 10 }),
    getAdminCategories(),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-light tracking-wide text-gray-900">Products</h1>
          <p className="mt-2 text-gray-600">Manage your product inventory</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="bg-[#f5a5a5] hover:bg-[#f5a5a5]/90 text-gray-900 font-semibold shadow-sm hover:shadow-md transition-all">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <ProductFilters categories={categories} />

      {/* Product Table */}
      <ProductTable products={products} pagination={pagination} />
    </div>
  );
}
