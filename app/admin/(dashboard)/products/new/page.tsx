import { ProductForm } from '@/components/admin/product-form';
import { getAdminCategories } from '@/actions/admin-products';

export default async function NewProductPage() {
  const categories = await getAdminCategories();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-light tracking-wide text-gray-900">Create New Product</h1>
        <p className="mt-2 text-gray-600">Add a new product to your store</p>
      </div>

      <div className="rounded-xl bg-white p-8 shadow-sm border border-gray-100">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
