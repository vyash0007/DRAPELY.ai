import Link from 'next/link';
import { getProducts, getProductsByMetadata } from '@/actions/products';
import { getCurrentUser } from '@/lib/auth';
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
  
  const [productsData, user] = await Promise.all([
    getProducts({ categorySlug: category, page: currentPage, limit }),
    getCurrentUser(),
  ]);
  
  let { products, total } = productsData;

  // Debug: Print user ID and product IDs
  console.log('=== Products Page Debug ===');
  console.log('User ID:', user?.id || 'No user');
  console.log('User AI Enabled:', user?.aiEnabled || false);
  console.log('Product IDs:', products.map(p => p.id));
  console.log('Total Products:', products.length);
  console.log('========================');

  // Get AI products if user has AI enabled (only on first page and no category filter)
  // Merge them with regular products, putting AI products first
  if (user?.aiEnabled && currentPage === 1 && !category) {
    const aiProducts = await getProductsByMetadata('is_trial', 'true', 6);
    
    console.log('AI Products IDs:', aiProducts.map(p => p.id));
    
    // Remove AI products from regular products to avoid duplicates
    const aiProductIds = new Set(aiProducts.map(p => p.id));
    const regularProducts = products.filter(p => !aiProductIds.has(p.id));
    
    // Combine: AI products first, then regular products
    products = [...aiProducts, ...regularProducts];
    
    console.log('Final Products IDs (after merge):', products.map(p => p.id));
  }

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
        <ProductGrid 
        products={products}
        userId={user?.id || null}
        hasPremium={user?.hasPremium || false}
        aiEnabled={user?.aiEnabled || false}
      />

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <nav className="flex items-center gap-2" aria-label="Pagination">
              {/* Previous Button */}
              {currentPage > 1 && (
                <Link
                  href={`?${category ? `category=${category}&` : ''}page=${currentPage - 1}`}
                  prefetch={true}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-pink-50 hover:text-pink-600 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-pink-300"
                  aria-label="Previous page"
                >
                  <span className="sr-only">Previous</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
              )}

              {/* Smart Pagination - Show limited pages with ellipsis */}
              {(() => {
                const pages: (number | string)[] = [];
                const maxVisible = 7; // Show max 7 page numbers
                
                if (totalPages <= maxVisible) {
                  // Show all pages if total is small
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  // Smart pagination logic
                  if (currentPage <= 3) {
                    // Show first 3, ellipsis, last 2
                    for (let i = 1; i <= 3; i++) pages.push(i);
                    pages.push('ellipsis-start');
                    pages.push(totalPages - 1);
                    pages.push(totalPages);
                  } else if (currentPage >= totalPages - 2) {
                    // Show first 2, ellipsis, last 3
                    pages.push(1);
                    pages.push(2);
                    pages.push('ellipsis-end');
                    for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i);
                  } else {
                    // Show first, ellipsis, current-1, current, current+1, ellipsis, last
                    pages.push(1);
                    pages.push('ellipsis-start');
                    pages.push(currentPage - 1);
                    pages.push(currentPage);
                    pages.push(currentPage + 1);
                    pages.push('ellipsis-end');
                    pages.push(totalPages);
                  }
                }

                return pages.map((page, idx) => {
                  if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  
                  const pageNum = page as number;
                  const isActive = pageNum === currentPage;
                  const pageUrl = `?${category ? `category=${category}&` : ''}page=${pageNum}`;
                  
                  return (
                    <Link
                      key={pageNum}
                      href={pageUrl}
                      prefetch={pageNum === currentPage + 1 || pageNum === currentPage - 1} // Prefetch adjacent pages
                      className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-base font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-pink-300 ${isActive ? 'shadow font-bold' : 'bg-white text-gray-700 hover:bg-pink-50 hover:text-pink-600'}`}
                      style={isActive ? { backgroundColor: '#F0D8D7', color: '#7c2d12', minWidth: 40, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' } : { minWidth: 40, textAlign: 'center' }}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {pageNum}
                    </Link>
                  );
                });
              })()}

              {/* Next Button */}
              {currentPage < totalPages && (
                <Link
                  href={`?${category ? `category=${category}&` : ''}page=${currentPage + 1}`}
                  prefetch={true}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-pink-50 hover:text-pink-600 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-pink-300"
                  aria-label="Next page"
                >
                  <span className="sr-only">Next</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
