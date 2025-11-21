import { getAdminCategoryById } from '@/actions/admin-categories';
import { CategoryForm } from '@/components/admin/category-form';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCategoryPage({ params }: PageProps) {
  const { id } = await params;
  const category = await getAdminCategoryById(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-light tracking-wide text-gray-900">Edit Category</h1>
        <p className="mt-2 text-gray-600">Update category information</p>
      </div>

      <div className="rounded-xl bg-white p-8 shadow-sm border border-gray-100">
        <CategoryForm category={category} />
      </div>
    </div>
  );
}

