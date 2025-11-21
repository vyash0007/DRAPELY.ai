import { CategoryForm } from '@/components/admin/category-form';

export default function NewCategoryPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-light tracking-wide text-gray-900">Create New Category</h1>
        <p className="mt-2 text-gray-600">Add a new product category to your store</p>
      </div>

      <div className="rounded-xl bg-white p-8 shadow-sm border border-gray-100">
        <CategoryForm />
      </div>
    </div>
  );
}

