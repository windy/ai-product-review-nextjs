'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from './button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function Pagination({ currentPage, totalPages, hasNext, hasPrev }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    return `?${params.toString()}`;
  };

  const goToPage = (page: number) => {
    router.push(createPageUrl(page));
  };

  // Calculate visible pages
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    const halfVisible = Math.floor(maxVisible / 2);
    
    let start = Math.max(1, currentPage - halfVisible);
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    // Adjust start if we're near the end
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className='flex items-center justify-center space-x-2'>
      {/* Previous Button */}
      <Button
        variant='outline'
        size='sm'
        onClick={() => goToPage(currentPage - 1)}
        disabled={!hasPrev}
        className='flex items-center'
      >
        <ChevronLeft className='h-4 w-4 mr-1' />
        Previous
      </Button>

      {/* Page Numbers */}
      <div className='flex items-center space-x-1'>
        {/* First page if not visible */}
        {getVisiblePages()[0] > 1 && (
          <>
            <Button
              variant={1 === currentPage ? 'default' : 'outline'}
              size='sm'
              onClick={() => goToPage(1)}
            >
              1
            </Button>
            {getVisiblePages()[0] > 2 && (
              <span className='text-gray-500 px-2'>...</span>
            )}
          </>
        )}

        {/* Visible pages */}
        {getVisiblePages().map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? 'default' : 'outline'}
            size='sm'
            onClick={() => goToPage(page)}
            className='min-w-[2.5rem]'
          >
            {page}
          </Button>
        ))}

        {/* Last page if not visible */}
        {getVisiblePages()[getVisiblePages().length - 1] < totalPages && (
          <>
            {getVisiblePages()[getVisiblePages().length - 1] < totalPages - 1 && (
              <span className='text-gray-500 px-2'>...</span>
            )}
            <Button
              variant={totalPages === currentPage ? 'default' : 'outline'}
              size='sm'
              onClick={() => goToPage(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}
      </div>

      {/* Next Button */}
      <Button
        variant='outline'
        size='sm'
        onClick={() => goToPage(currentPage + 1)}
        disabled={!hasNext}
        className='flex items-center'
      >
        Next
        <ChevronRight className='h-4 w-4 ml-1' />
      </Button>
    </div>
  );
}