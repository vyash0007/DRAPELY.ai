import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { getProductBySlug } from '@/actions/products';
import { AddToCartButton } from '@/components/add-to-cart-button';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={product.images[0] || '/placeholder.png'}
              alt={product.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.slice(1, 5).map((image, index) => (
                <div key={index} className="relative aspect-square overflow-hidden rounded-md bg-gray-100">
                  <Image
                    src={image}
                    alt={`${product.title} ${index + 2}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 25vw, 12.5vw"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-2">
              {product.category.name}
            </Badge>
            <h1 className="mb-4 text-3xl font-bold">{product.title}</h1>
            <p className="text-3xl font-bold">{formatPrice(Number(product.price))}</p>
          </div>

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-2 font-semibold">Description</h2>
              <p className="text-gray-700">{product.description || 'No description available.'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-2 font-semibold">Product Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Stock:</span>
                  <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                    {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span>{product.category.name}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {product.stock > 0 ? (
            <AddToCartButton productId={product.id} className="w-full" size="lg" />
          ) : (
            <button disabled className="w-full rounded-md bg-gray-300 px-4 py-3 text-gray-600">
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
