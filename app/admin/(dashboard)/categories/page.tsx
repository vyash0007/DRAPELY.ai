import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAdminCategories } from '@/actions/admin-categories';
import { CategoryTable } from '@/components/admin/category-table';

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div className="space-y-8">
      {/* Header */}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-light tracking-wide text-gray-900">Categories</h1>
          <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-600">Manage product categories</p>
        </div>
        <Link href="/admin/categories/new" className="w-full md:w-auto">
          <Button className="w-full md:w-auto bg-[#f5a5a5] hover:bg-[#f5a5a5]/90 text-gray-900 font-semibold shadow-sm hover:shadow-md transition-all">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </Link>
      </div>

      {/* Category Table */}
      <CategoryTable categories={categories} />
    </div>
  );
}

