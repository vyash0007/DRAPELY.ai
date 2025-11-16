'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Category } from '@prisma/client';

interface ProductFiltersProps {
  categories: Category[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (search: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    params.delete('page');
    router.push(`/admin/products?${params.toString()}`);
  };

  const handleCategoryChange = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId && categoryId !== 'all') {
      params.set('categoryId', categoryId);
    } else {
      params.delete('categoryId');
    }
    params.delete('page');
    router.push(`/admin/products?${params.toString()}`);
  };

  return (
    <div className="flex gap-4 rounded-xl bg-white p-5 shadow-sm border border-gray-100">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search products..."
            defaultValue={searchParams.get('search') || ''}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-11 border-gray-200 focus:border-[#f5a5a5] focus:ring-[#f5a5a5]"
          />
        </div>
      </div>

      <Select
        defaultValue={searchParams.get('categoryId') || 'all'}
        onValueChange={handleCategoryChange}
      >
        <SelectTrigger className="w-[200px] h-11 border-gray-200 focus:border-[#f5a5a5] focus:ring-[#f5a5a5]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
