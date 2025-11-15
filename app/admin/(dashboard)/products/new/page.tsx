import { ProductForm } from '@/components/admin/product-form';
import { getAdminCategories } from '@/actions/admin-products';

export default async function NewProductPage() {
  const categories = await getAdminCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
        <p className="mt-2 text-gray-600">Add a new product to your store</p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
