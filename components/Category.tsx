import Link from 'next/link';
import Image from 'next/image';

const Category = () => {
  return (
    <section className="bg-white py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-light tracking-wide text-gray-900 mb-4">
          Our Categories
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
          Discover our range of categories crafted to help you find exactly what you need. From everyday essentials to standout pieces, everything is organized for effortless browsing.
        </p>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-[600px]">
          {/* Large Featured Category - Women's Fashion */}
          <Link
            href="/products?category=womens-fashion"
            className="group relative overflow-hidden rounded-lg bg-[#f5e6d3] hover:shadow-xl transition-all duration-300 min-h-[500px]"
          >
            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
              {/* Image at top right */}
              <div className="absolute -top-2 -right-2 w-full h-full max-w-[520px] max-h-[520px]">
                <Image
                  src="/womenM-removebg-preview.png"
                  alt="Women's Fashion"
                  fill
                  className="object-contain object-right-top transition-transform duration-500 group-hover:scale-105 drop-shadow-lg"
                  style={{ objectPosition: 'top right' }}
                  priority
                  quality={85}
                />
              </div>

              {/* Content on left bottom */}
              <div className="z-10 max-w-sm relative">
                <h2 className="text-4xl md:text-5xl font-serif italic text-gray-900 mb-4">
                  Women's fashion
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed text-sm md:text-base">
                  Get inspired by women’s fashion selected using smart trend analysis. Discover outfits that blend comfort, elegance, and modern flair—all tailored to your taste.
                </p>
                <span className="inline-block text-sm font-semibold uppercase tracking-wider border-b-2 border-gray-900 pb-1 hover:border-gray-600 transition-colors cursor-pointer text-gray-900">
                  Shop Now
                </span>
              </div>
            </div>
          </Link>

          {/* Right Side - Two Smaller Categories */}
          <div className="grid grid-rows-2 gap-6">
            {/* Men's Fashion */}
            <Link
              href="/products?category=mens-fashion"
              className="group relative overflow-hidden rounded-lg bg-[#c8e6e6] hover:shadow-xl transition-all duration-300 min-h-[240px]"
            >
              <div className="absolute inset-0 flex items-center justify-between p-6 md:p-8">
                <div className="z-10 flex-1 pr-4">
                  <h3 className="text-2xl md:text-3xl font-serif text-gray-900 mb-2">
                    Men's fashion
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">Clean lines, timeless fits, and everyday wear made simple. Choose pieces that work seamlessly from day to night.</p>
                  <span className="inline-block text-sm font-semibold uppercase tracking-wider border-b-2 border-gray-900 pb-1 hover:border-gray-600 transition-colors cursor-pointer text-gray-900">
                    Shop Now
                  </span>
                </div>
                <div className="relative w-44 md:w-56 h-full min-h-[240px]">
                  <Image
                    src="/menM-removebg-preview.png"
                    alt="Men's Fashion"
                    fill
                    className="object-contain object-right transition-transform duration-500 group-hover:scale-105 drop-shadow-lg"
                    style={{ objectPosition: 'right center' }}
                    quality={85}
                    loading="lazy"
                  />
                </div>
              </div>
            </Link>

            {/* Cosmetics/Accessories */}
            <Link
              href="/products?category=accessories"
              className="group relative overflow-hidden rounded-lg bg-[#f4d7e6] hover:shadow-xl transition-all duration-300 min-h-[240px]"
            >
              <div className="absolute inset-0 flex items-center justify-between p-6 md:p-8">
                <div className="z-10 flex-1 pr-4">
                  <h3 className="text-4xl md:text-3xl font-serif  text-gray-900 mb-2">
                    Accessories
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">Level up your style with must-have accessories that keep you on trend.</p>
                  <span className="inline-block text-sm font-semibold uppercase tracking-wider border-b-2 border-gray-900 pb-1 hover:border-gray-600 transition-colors cursor-pointer text-gray-900">
                    Shop Now
                  </span>
                </div>
                <div className="relative w-44 md:w-56 h-full min-h-[240px]">
                  <Image
                    src="/accessoriesM-removebg-preview.png"
                    alt="Accessories"
                    fill
                    className="object-contain object-right transition-transform duration-500 group-hover:scale-105 drop-shadow-lg"
                    style={{ objectPosition: 'right center' }}
                    quality={85}
                    loading="lazy"
                  />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Category;
