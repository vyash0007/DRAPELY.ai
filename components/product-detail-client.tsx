'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { ProductWithCategory } from '@/actions/products';
import { formatPrice } from '@/lib/utils';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { WishlistButton } from '@/components/wishlist-button';
import { SmartImage } from '@/components/smart-image';

interface ProductDetailClientProps {
  product: ProductWithCategory;
  userId?: string | null;
  hasPremium?: boolean;
  aiEnabled?: boolean;
}

// Color options matching Zara style
const colorOptions = [
  { name: 'White', value: '#FFFFFF', border: true },
  { name: 'Light Blue', value: '#B8C5D6', border: false },
  { name: 'Pink', value: '#D4A5A5', border: false },
  { name: 'Brown', value: '#6B5757', border: false },
  { name: 'Black', value: '#000000', border: false },
];

export function ProductDetailClient({ product, userId, hasPremium = false, aiEnabled = false }: ProductDetailClientProps) {
  // Use product sizes if available, otherwise default to standard sizes
  const availableSizes = product.sizes && product.sizes.length > 0
    ? product.sizes
    : ['S', 'M', 'L', 'XL'];

  // Get size stock information
  const getSizeStock = (size: string) => {
    return product.sizeStocks?.find(s => s.size === size)?.quantity || 0;
  };

  // Find first available size (in stock)
  const firstAvailableSize = availableSizes.find(size => getSizeStock(size) > 0) || availableSizes[0];

  const [selectedSize, setSelectedSize] = useState(firstAvailableSize || 'L');
  const [selectedColor, setSelectedColor] = useState(0);

  const images = product.images.length > 0 ? product.images : ['/placeholder.png'];
  const isTrialProduct = product.metadata?.is_trial === 'true';

  // Mock product number based on product ID
  const productNumber = `${43287340 + product.id}`;

  // Check if selected size is in stock
  const selectedSizeStock = getSizeStock(selectedSize);
  const isSelectedSizeInStock = selectedSizeStock > 0;

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-gray-600">
        <Link href="/" className="hover:text-gray-900 transition-colors">
          Women's
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/products?category=${product.category.slug}`}
          className="hover:text-gray-900 transition-colors"
        >
          {product.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Blouse</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[45%_55%] lg:gap-16">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Badge */}
          <div className="absolute top-4 left-4 z-10 bg-black text-white px-4 py-1.5 text-xs font-medium">
            Official Product
          </div>

          {/* Main Images Stack */}
          <div className="space-y-4">
            {images.slice(0, 4).map((image, index) => (
              <div
                key={index}
                className="relative aspect-[4/5] overflow-hidden bg-gray-100"
              >
                <SmartImage
                  src={image}
                  alt={`${product.title} ${index + 1}`}
                  userId={userId}
                  productId={product.id}
                  hasPremium={hasPremium}
                  aiEnabled={aiEnabled}
                  isTrialProduct={isTrialProduct}
                  imageIndex={index}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  quality={index === 0 ? 90 : 85}
                  loading={index === 0 ? undefined : 'lazy'}
                  badgePosition="right"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* New Arrival Badge */}
          <div className="text-sm font-medium text-gray-600">New Arrival</div>

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-light text-gray-900 uppercase tracking-wide">
            {product.title}
          </h1>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-gray-700 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Product Details */}
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-gray-600 min-w-[120px]">Product No.</span>
              <span className="text-gray-900">{productNumber}</span>
            </div>
            {product.fit && (
              <div className="flex items-start gap-3">
                <span className="text-gray-600 min-w-[120px]">Fit</span>
                <span className="text-gray-900">{product.fit}</span>
              </div>
            )}
            {product.composition && (
              <div className="flex items-start gap-3">
                <span className="text-gray-600 min-w-[120px]">Composition</span>
                <span className="text-gray-900">{product.composition}</span>
              </div>
            )}
          </div>

          {/* Product Details / Shipping Tabs */}
          <div className="border-b border-gray-300">
            <div className="flex gap-8 text-sm">
              <button className="pb-3 border-b-2 border-black font-medium">
                Product Details
              </button>
              <button className="pb-3 text-gray-600 hover:text-gray-900 transition-colors">
                Shipping Details
              </button>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-gray-400 line-through text-lg">
              {formatPrice(Number(product.price) * 1.33)}
            </span>
            <span className="text-4xl font-light text-gray-900">
              {formatPrice(Number(product.price))}
            </span>
          </div>

          {/* Color Selection */}
          {/* <div>
            <div className="flex gap-2 mb-2">
              {colorOptions.map((color, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedColor(index)}
                  className={`w-12 h-12 rounded transition-all ${
                    selectedColor === index
                      ? 'ring-2 ring-offset-2 ring-gray-900'
                      : 'hover:ring-2 hover:ring-offset-2 hover:ring-gray-300'
                  }`}
                  style={{
                    backgroundColor: color.value,
                    border: color.border ? '1px solid #E5E7EB' : 'none'
                  }}
                  aria-label={`Select ${color.name} color`}
                />
              ))}
            </div>
          </div> */}

          {/* Size Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-2 flex-wrap">
                {availableSizes.map((size) => {
                  const sizeStock = getSizeStock(size);
                  const isOutOfStock = sizeStock === 0;

                  return (
                    <button
                      key={size}
                      onClick={() => !isOutOfStock && setSelectedSize(size)}
                      disabled={isOutOfStock}
                      className={`w-14 h-12 text-sm font-medium transition-all border relative ${
                        selectedSize === size
                          ? 'bg-black text-white border-black'
                          : isOutOfStock
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'bg-white text-gray-900 border-gray-300 hover:border-black'
                      }`}
                      title={isOutOfStock ? 'Out of stock' : `${sizeStock} in stock`}
                    >
                      {size}
                      {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-px bg-gray-400 rotate-45 absolute"></div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <button className="text-sm underline hover:no-underline">
                Size Guide
              </button>
            </div>
            {selectedSize && (
              <div className="text-sm text-gray-600 mb-2">
                {isSelectedSizeInStock ? (
                  <span className="text-green-600">
                    ✓ Size {selectedSize}: {selectedSizeStock} in stock
                  </span>
                ) : (
                  <span className="text-red-600">
                    Size {selectedSize} is currently out of stock
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {/* Wishlist Button */}
            <WishlistButton
              productId={product.id}
              variant="icon-only"
              className="w-14 h-14 flex items-center justify-center border border-gray-300 hover:border-black transition-colors"
              iconClassName="h-5 w-5"
            />

            {/* Add to Cart Button */}
            {isSelectedSizeInStock ? (
              <AddToCartButton
                productId={product.id}
                size={selectedSize}
                className="flex-1 h-14 bg-black text-white hover:bg-gray-800 uppercase tracking-wider text-sm font-medium transition-colors"
              />
            ) : (
              <button
                disabled
                className="flex-1 h-14 bg-gray-200 text-gray-500 uppercase tracking-wider text-sm font-medium cursor-not-allowed"
              >
                Out of Stock
              </button>
            )}
          </div>

          {/* Product Information */}
          <div className="grid grid-cols-2 gap-4 pt-4 text-sm border-t border-gray-200">
            <div>
              <p className="font-medium text-gray-900">100% Original Goods</p>
              <p className="text-gray-600 mt-1">Cash on Deliver Available</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Free Standard Shipping on $75+</p>
              <p className="text-gray-600 mt-1">14 Days Free Return Exchange</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
