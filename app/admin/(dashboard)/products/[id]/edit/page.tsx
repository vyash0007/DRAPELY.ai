import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/admin/product-form';
import { getAdminProductById, getAdminCategories } from '@/actions/admin-products';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProductById(id),
    getAdminCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <p className="mt-2 text-gray-600">Update product information</p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <ProductForm product={product} categories={categories} />
      </div>
    </div>
  );
}
