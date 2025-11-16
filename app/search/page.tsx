'use client';

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/product-grid';
import { getProducts } from '@/actions/products';

// Match the serialized product type from ProductGrid
interface SerializedProductWithCategory {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  images: string[];
  featured: boolean;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    slug: string;
    description: string | null;
  };
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<SerializedProductWithCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 12;
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch products (all or search) with pagination
  const fetchProducts = async (searchQuery: string, pageNum: number) => {
    setIsLoading(true);
    let result;
    if (searchQuery.trim()) {
      result = await (await import('@/actions/products')).searchProducts({ query: searchQuery, page: pageNum, limit });
    } else {
      result = await getProducts({ page: pageNum, limit });
    }
    setProducts(result.products);
    setTotal(result.total);
    setIsLoading(false);
  };

  // Initial fetch and on page/query change
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      fetchProducts(query, page);
    }, 300);
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [query, page]);

  // Category quick filter buttons
  const handleCategoryFilter = (cat: string) => {
    setQuery(cat);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-light tracking-wide text-gray-900 mb-6">
            Search Products
          </h1>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover your perfect style from our curated collection
          </p>

          {/* Search Form */}
          <form onSubmit={(e) => e.preventDefault()} className="max-w-5xl mx-auto">
            <div className="flex items-center bg-white rounded-full shadow-md px-4 py-2" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
              <span className="pl-2 pr-2 flex items-center">
                <Search className="h-6 w-6 text-gray-400" />
              </span>
              <input
                type="text"
                placeholder="Search for dresses, accessories, shoes..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-lg text-gray-900 placeholder:text-gray-400 font-normal px-2 py-2 border-none shadow-none"
                style={{ boxShadow: 'none', border: 'none' }}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="pl-2 pr-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label="Clear search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </form>
          {/* Category Quick Filters */}
          <div className="flex flex-wrap gap-2 justify-center pt-6">
            <button
              type="button"
              onClick={() => handleCategoryFilter('dress')}
              className="px-4 py-2 bg-white border-2 border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Dresses
            </button>
            <button
              type="button"
              onClick={() => handleCategoryFilter('shoes')}
              className="px-4 py-2 bg-white border-2 border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Shoes
            </button>
            <button
              type="button"
              onClick={() => handleCategoryFilter('accessories')}
              className="px-4 py-2 bg-white border-2 border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Accessories
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-300"></div>
            <p className="text-sm md:text-base font-medium">
              {isLoading
                ? 'Loading...'
                : `${total} ${total === 1 ? 'Result' : 'Results'} Found${query ? ` for "${query}"` : ''}`}
            </p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-300"></div>
          </div>
        </div>

        {/* Results Grid */}
        <ProductGrid products={products} emptyMessage="No products found matching your search" />

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <nav className="flex items-center gap-3" aria-label="Pagination">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, page - 1))}
                className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-pink-50 hover:text-pink-600 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-pink-300 ${page === 1 ? 'pointer-events-none opacity-50' : ''}`}
                aria-disabled={page === 1}
                aria-label="Previous page"
              >
                <span className="sr-only">Previous</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {[...Array(totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                const isActive = pageNum === page;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-base font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-pink-300 ${isActive ? 'shadow font-bold' : 'bg-white text-gray-700 hover:bg-pink-50 hover:text-pink-600'}`}
                    style={isActive ? { backgroundColor: '#F0D8D7', color: '#B91C1C', minWidth: 40, textAlign: 'center' } : { minWidth: 40, textAlign: 'center' }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-pink-50 hover:text-pink-600 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-pink-300 ${page === totalPages ? 'pointer-events-none opacity-50' : ''}`}
                aria-disabled={page === totalPages}
                aria-label="Next page"
              >
                <span className="sr-only">Next</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
