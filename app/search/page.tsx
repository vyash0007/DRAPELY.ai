'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/product-grid';
import { searchProducts } from '@/actions/products';
import { ProductWithCategory } from '@/actions/products';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductWithCategory[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const products = await searchProducts(query);
      setResults(products);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">Search Products</h1>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </form>
      </div>

      {hasSearched && (
        <div className="mb-4">
          <p className="text-gray-600">
            {results.length} {results.length === 1 ? 'result' : 'results'} found
            {query && ` for "${query}"`}
          </p>
        </div>
      )}

      {hasSearched && <ProductGrid products={results} emptyMessage="No products found" />}

      {!hasSearched && (
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-gray-500">Enter a search term to find products</p>
        </div>
      )}
    </div>
  );
}
