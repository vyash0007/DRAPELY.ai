import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { ProductWithCategory } from '@/actions/products';

interface ProductCardProps {
  product: ProductWithCategory;
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images[0] || '/placeholder.png';

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <Badge variant="destructive">Out of Stock</Badge>
            </div>
          )}
          {product.featured && product.stock > 0 && (
            <Badge className="absolute left-2 top-2">Featured</Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="mb-1 font-semibold text-gray-900 line-clamp-1 hover:underline">
            {product.title}
          </h3>
        </Link>
        <p className="mb-2 text-sm text-gray-600">{product.category.name}</p>
        <p className="text-lg font-bold">{formatPrice(Number(product.price))}</p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <AddToCartButton
          productId={product.id}
          variant="outline"
          className="w-full"
        />
      </CardFooter>
    </Card>
  );
}
