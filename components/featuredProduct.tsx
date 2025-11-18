import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SerializedProductWithCategory } from '@/actions/products';
import { SmartImage } from '@/components/smart-image';

interface FeaturedProductProps {
    products: SerializedProductWithCategory[];
    userId?: string | null;
    hasPremium?: boolean;
    aiEnabled?: boolean;
}

const FeaturedProduct = ({ products, userId, hasPremium = false, aiEnabled = false }: FeaturedProductProps) => {
    const displayProducts = products.slice(0, 3);

    return (
        <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-light tracking-wide text-gray-900 mb-4">
                        Our Featured
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
                       Explore what's trending! updated to keep you ahead of the fashion curve.
                    </p>
                    <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
                        From must-have outfits to kids' fashion, our featured lineup highlights the products our community can't get enough of. Curated for every style and story.
                    </p>
                </div>

                {/* Products Grid */}
                <div className="relative px-0 md:px-12">
                    {/* Navigation Arrows - Hidden on mobile */}
                    <button
                        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 bg-white hover:bg-gray-100 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 active:scale-95"
                        aria-label="Previous"
                    >
                        <ChevronLeft className="h-6 w-6 text-gray-900" />
                    </button>

                    <button
                        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 bg-white hover:bg-gray-100 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 active:scale-95"
                        aria-label="Next"
                    >
                        <ChevronRight className="h-6 w-6 text-gray-900" />
                    </button>

                    {/* Product Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {displayProducts.map((product) => (
                            <div key={product.id} className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                                {/* Product Image */}
                                <Link href={`/products/${product.slug}`}>
                                    <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                                        {product.images && product.images.length > 0 ? (
                                            <SmartImage
                                                src={product.images[0]}
                                                alt={product.title}
                                                userId={userId}
                                                productId={product.id}
                                                hasPremium={hasPremium}
                                                aiEnabled={aiEnabled}
                                                isTrialProduct={product.metadata?.is_trial === 'true'}
                                                imageIndex={0}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                                quality={85}
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                {/* Product Info */}
                                <div className="p-6 space-y-3">
                                    <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-gray-900 line-clamp-1">
                                        {product.title}
                                    </h3>
                                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                                        {product.description || 'Elegant design perfect for any occasion. High quality materials and exceptional craftsmanship.'}
                                    </p>
                                    <Link href={`/products/${product.slug}`} className="inline-block pt-2">
                                        <span className="text-xs font-bold uppercase tracking-widest text-gray-900 border-b-2 border-gray-900 pb-1 hover:border-gray-600 transition-colors">
                                            Discover Now
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturedProduct;