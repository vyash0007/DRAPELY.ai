import { Suspense } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { getWishlist } from '@/actions/wishlist';
import { formatPrice } from '@/lib/utils';
import { WishlistButton } from '@/components/wishlist-button';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { SmartImage } from '@/components/smart-image';
import { getCurrentUser } from '@/lib/auth';

export const metadata = {
  title: 'My Wishlist | Fashion Store',
  description: 'View and manage your saved items',
};

async function WishlistContent() {
  const [wishlistItems, user] = await Promise.all([
    getWishlist(),
    getCurrentUser(),
  ]);

  if (wishlistItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Heart className="h-24 w-24 text-gray-300 mb-6" />
        <h2 className="text-2xl font-light text-gray-900 mb-2">
          Your Wishlist is Empty
        </h2>
        <p className="text-gray-600 mb-8 max-w-md">
          Save your favorite items to your wishlist and shop them later.
        </p>
        <Link
          href="/products"
          className="px-8 py-3 bg-black text-white hover:bg-gray-800 transition-colors uppercase tracking-wider text-sm"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-xl font-medium">
          My Wishlist ({wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'})
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((item) => {
          const product = item.product;
          const image = product.images[0] || '/placeholder.png';
          const hasStock = product.stock > 0;

          return (
            <div
              key={item.id}
              className="group relative flex flex-col h-full min-h-[420px] bg-[#F9FAFB]"
            >
              {/* Wishlist Remove Button */}
              <div className="absolute top-3 right-3 z-10">
                <WishlistButton
                  productId={product.id}
                  variant="icon-only"
                  className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                  iconClassName="h-4 w-4"
                />
              </div>

              {/* Card Content (Image + Info) */}
              <div className="flex-1 flex flex-col">
                <Link href={`/products/${product.slug}`} className="block flex-1">
                  <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 mb-4">
                    <SmartImage
                      src={image}
                      alt={product.title}
                      userId={user?.id || null}
                      productId={product.id}
                      hasPremium={user?.hasPremium || false}
                      aiEnabled={user?.aiEnabled || false}
                      isTrialProduct={product.metadata?.is_trial === 'true'}
                      imageIndex={0}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />

                    {!hasStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-medium uppercase tracking-wider text-sm">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wider">
                      {product.category.name}
                    </div>
                    <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:underline">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-light">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Add to Cart Button always at bottom */}
              <div className="mt-4">
                {hasStock ? (
                  <AddToCartButton
                    productId={product.id}
                    className="w-full h-11 bg-black text-white hover:bg-gray-800 uppercase tracking-wider text-xs font-medium transition-colors"
                  />
                ) : (
                  <button
                    disabled
                    className="w-full h-11 bg-gray-200 text-gray-500 uppercase tracking-wider text-xs font-medium cursor-not-allowed"
                  >
                    Out of Stock
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function WishlistPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl lg:text-4xl font-light text-gray-900 uppercase tracking-wide mb-8">
          My Wishlist
        </h1>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
          }
        >
          <WishlistContent />
        </Suspense>
      </div>
    </div>
  );
}
