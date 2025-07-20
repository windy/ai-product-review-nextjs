'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  productCount: number;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  color: string;
  usageCount: number;
}

export default function ProductFilters() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current filter values
  const currentCategory = searchParams.get('category');
  const currentPricing = searchParams.get('pricing');
  const currentSearch = searchParams.get('search') || '';

  useEffect(() => {
    setSearchTerm(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/tags')
        ]);

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.categories);
        }

        if (tagsRes.ok) {
          const tagsData = await tagsRes.json();
          setTags(tagsData.tags);
        }
      } catch (error) {
        console.error('Error fetching filter data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilterData();
  }, []);

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset to first page when filters change
    params.delete('page');
    
    router.push(`?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters('search', searchTerm.trim() || null);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    router.push(window.location.pathname);
  };

  const hasActiveFilters = currentCategory || currentPricing || currentSearch;

  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='animate-pulse'>
          <div className='h-4 bg-gray-200 rounded w-3/4 mb-4'></div>
          <div className='space-y-2'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='h-3 bg-gray-200 rounded'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Search */}
      <div>
        <form onSubmit={handleSearch} className='relative'>
          <Input
            type='text'
            placeholder='Search products...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pr-10'
          />
          <button
            type='submit'
            className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
          >
            <Search className='h-4 w-4' />
          </button>
        </form>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div>
          <Button
            variant='outline' 
            size='sm' 
            onClick={clearAllFilters}
            className='w-full'
          >
            <X className='h-4 w-4 mr-2' />
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Categories */}
      <div>
        <h4 className='font-medium text-gray-900 mb-3'>Categories</h4>
        <div className='space-y-2'>
          <button
            onClick={() => updateFilters('category', null)}
            className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              !currentCategory
                ? 'bg-blue-100 text-blue-800 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => updateFilters('category', category.id.toString())}
              className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                currentCategory === category.id.toString()
                  ? 'bg-blue-100 text-blue-800 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className='flex justify-between items-center'>
                <span>{category.name}</span>
                <span className='text-xs text-gray-400'>({category.productCount})</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div>
        <h4 className='font-medium text-gray-900 mb-3'>Pricing</h4>
        <div className='space-y-2'>
          {['Free', 'Freemium', 'Paid'].map((pricing) => (
            <button
              key={pricing}
              onClick={() => updateFilters('pricing', pricing === currentPricing ? null : pricing)}
              className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                currentPricing === pricing
                  ? 'bg-blue-100 text-blue-800 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {pricing}
            </button>
          ))}
        </div>
      </div>

      {/* Popular Tags */}
      {tags.length > 0 && (
        <div>
          <h4 className='font-medium text-gray-900 mb-3'>Popular Tags</h4>
          <div className='flex flex-wrap gap-2'>
            {tags.slice(0, 10).map((tag) => (
              <button
                key={tag.id}
                className='px-2 py-1 text-xs rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors'
                style={{ borderColor: tag.color, color: tag.color }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}