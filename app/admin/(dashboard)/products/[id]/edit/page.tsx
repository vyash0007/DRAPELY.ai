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
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-light tracking-wide text-gray-900">Edit Product</h1>
        <p className="mt-2 text-gray-600">Update product information</p>
      </div>

      <div className="rounded-xl bg-white p-8 shadow-sm border border-gray-100">
        <ProductForm product={product} categories={categories} />
      </div>
    </div>
  );
}
