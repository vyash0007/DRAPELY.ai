'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function Pagination({ pagination }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  if (pagination.totalPages <= 1) {
    return null;
  }

  const startIndex = (pagination.page - 1) * pagination.limit + 1;
  const endIndex = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="flex items-center justify-between rounded-xl bg-white px-6 py-4 shadow-sm border border-gray-100">
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
          className="border-gray-200 hover:bg-[#f5d7d7]/50"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
          className="border-gray-200 hover:bg-[#f5d7d7]/50"
        >
          Next
        </Button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">
            Showing <span className="font-semibold text-gray-900">{startIndex}</span> to{' '}
            <span className="font-semibold text-gray-900">{endIndex}</span> of{' '}
            <span className="font-semibold text-gray-900">{pagination.total}</span> results
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-lg" aria-label="Pagination">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="rounded-l-lg border-gray-200 hover:bg-[#f5d7d7]/50 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
              // Show first page, last page, current page, and pages around current
              const showPage =
                page === 1 ||
                page === pagination.totalPages ||
                (page >= pagination.page - 1 && page <= pagination.page + 1);

              if (!showPage) {
                // Show ellipsis
                if (page === pagination.page - 2 || page === pagination.page + 2) {
                  return (
                    <span
                      key={page}
                      className="inline-flex items-center border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-500"
                    >
                      ...
                    </span>
                  );
                }
                return null;
              }

              const isActive = page === pagination.page;

              return (
                <Button
                  key={page}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className={cn(
                    "rounded-none border-gray-200",
                    isActive 
                      ? "bg-gradient-to-r from-[#f5a5a5] to-[#f5d7d7] text-gray-900 border-[#f5a5a5] hover:from-[#f5d7d7] hover:to-[#f5a5a5]"
                      : "hover:bg-[#f5d7d7]/50"
                  )}
                >
                  {page}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="rounded-r-lg border-gray-200 hover:bg-[#f5d7d7]/50 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
}
