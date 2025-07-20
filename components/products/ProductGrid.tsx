'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';
import Pagination from '../ui/Pagination';

interface Product {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  website: string;
  pricing: string;
  averageRating: string;
  totalReviews: number;
  isFeatured: boolean;
  createdAt: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  primaryImage: string;
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function ProductGrid() {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        
        // Add search params to API call
        searchParams.forEach((value, key) => {
          params.append(key, value);
        });

        const response = await fetch(`/api/products?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  if (loading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {[...Array(6)].map((_, i) => (
          <div key={i} className='bg-white rounded-lg shadow-md animate-pulse'>
            <div className='h-48 bg-gray-200 rounded-t-lg'></div>
            <div className='p-6'>
              <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
              <div className='h-3 bg-gray-200 rounded w-full mb-4'></div>
              <div className='flex justify-between items-center'>
                <div className='h-3 bg-gray-200 rounded w-1/4'></div>
                <div className='h-4 bg-gray-200 rounded w-1/3'></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center py-8'>
        <div className='text-red-600 mb-4'>Error loading products: {error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className='text-blue-600 hover:underline'
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data || data.products.length === 0) {
    return (
      <div className='text-center py-12'>
        <div className='text-gray-500 text-lg mb-4'>No products found</div>
        <p className='text-gray-400'>Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
        {data.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {data.pagination.totalPages > 1 && (
        <Pagination
          currentPage={data.pagination.page}
          totalPages={data.pagination.totalPages}
          hasNext={data.pagination.hasNext}
          hasPrev={data.pagination.hasPrev}
        />
      )}
    </div>
  );
}