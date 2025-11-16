'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function CustomerFilters() {
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
    router.push(`/admin/customers?${params.toString()}`);
  };

  return (
    <div className="flex gap-4 rounded-xl bg-white p-5 shadow-sm border border-gray-100">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            defaultValue={searchParams.get('search') || ''}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-11 border-gray-200 focus:border-[#f5a5a5] focus:ring-[#f5a5a5]"
          />
        </div>
      </div>
    </div>
  );
}

