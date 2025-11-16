import { Suspense } from 'react';
import { getProducts } from '@/actions/products';
import { ProductGrid } from '@/components/product-grid';

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    page?: string;
  }>;
}
export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const category = params.category;
  const page = params.page;
  const currentPage = page ? parseInt(page, 10) : 1;
  const limit = 12;
  const { products, total } = await getProducts({ categorySlug: category, page: currentPage, limit });

  // Format category name for display
  const categoryTitle = category
    ? category.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'All Products';

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-light tracking-wide text-gray-900 mb-4">
            {categoryTitle}
          </h1>
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-300"></div>
            <p className="text-sm md:text-base font-medium">
              {total} {total === 1 ? 'Product' : 'Products'} Available
            </p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-300"></div>
          </div>
        </div>

        {/* Products Grid */}
        <Suspense fallback={
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center space-y-4">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900"></div>
              <p className="text-gray-600 font-medium">Loading products...</p>
            </div>
          </div>
        }>
          <ProductGrid products={products} />
        </Suspense>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <nav className="flex items-center gap-3" aria-label="Pagination">
              <a
                href={`?${category ? `category=${category}&` : ''}page=${Math.max(1, currentPage - 1)}`}
                className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-pink-50 hover:text-pink-600 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-pink-300 ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
                aria-disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <span className="sr-only">Previous</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </a>
              {[...Array(totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                const isActive = pageNum === currentPage;
                return (
                  <a
                    key={pageNum}
                    href={`?${category ? `category=${category}&` : ''}page=${pageNum}`}
                    className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-base font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-pink-300 ${isActive ? 'shadow font-bold' : 'bg-white text-gray-700 hover:bg-pink-50 hover:text-pink-600'}`}
                    style={isActive ? { backgroundColor: '#F0D8D7', color: '#7c2d12', minWidth: 40, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' } : { minWidth: 40, textAlign: 'center' }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {pageNum}
                  </a>
                );
              })}
              <a
                href={`?${category ? `category=${category}&` : ''}page=${Math.min(totalPages, currentPage + 1)}`}
                className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-pink-50 hover:text-pink-600 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-pink-300 ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
                aria-disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <span className="sr-only">Next</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
