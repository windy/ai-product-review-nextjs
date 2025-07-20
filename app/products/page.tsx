'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/products/ProductCard';
import Pagination from '@/components/ui/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Plus, X } from 'lucide-react';
import Link from 'next/link';

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

interface Category {
  id: number;
  name: string;
  slug: string;
  productCount: number;
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

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const searchParams = useSearchParams();
  const router = useRouter();

  // Get current filter values from URL
  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentPricing = searchParams.get('pricing') || '';
  const currentSort = searchParams.get('sort') || 'created_at';
  const currentPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    setSearchTerm(currentSearch);
    fetchProducts();
    fetchCategories();
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(searchParams.toString());
      
      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data: ProductsResponse = await response.json();
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const updateURL = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value && value.trim() !== '') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset to first page when filters change
    if (key !== 'page') {
      params.delete('page');
    }
    
    router.push(`?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL('search', searchTerm.trim() || null);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    router.push('/products');
  };

  const hasActiveFilters = currentSearch || currentCategory || currentPricing;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover the Best <span className="text-yellow-300">AI Tools</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Find, review, and share your experience with the latest AI products. 
              Help the community make informed decisions about AI tools.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search AI tools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-12 py-3 text-lg text-gray-900"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
                >
                  <Search className="h-5 w-5" />
                </button>
              </form>
            </div>

            <div className="flex justify-center mt-6">
              <Link href="/products/submit">
                <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                  <Plus className="mr-2 h-5 w-5" />
                  Submit a Product
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={currentSort}
                onChange={(e) => updateURL('sort', e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="created_at">Newest</option>
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviews</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Categories */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Categories</h4>
                  <div className="space-y-1">
                    <button
                      onClick={() => updateURL('category', null)}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        !currentCategory
                          ? 'bg-blue-100 text-blue-800 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.slice(0, 5).map((category) => (
                      <button
                        key={category.id}
                        onClick={() => updateURL('category', category.id.toString())}
                        className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          currentCategory === category.id.toString()
                            ? 'bg-blue-100 text-blue-800 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{category.name}</span>
                          <span className="text-xs text-gray-400">({category.productCount})</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Pricing</h4>
                  <div className="space-y-1">
                    {['Free', 'Freemium', 'Paid'].map((pricing) => (
                      <button
                        key={pricing}
                        onClick={() => updateURL('pricing', pricing === currentPricing ? null : pricing)}
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

                {/* Quick Filters */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Quick Filters</h4>
                  <div className="space-y-1">
                    <button
                      onClick={() => updateURL('featured', 'true')}
                      className="block w-full text-left px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100"
                    >
                      Featured Products
                    </button>
                    <button
                      onClick={() => updateURL('sort', 'rating')}
                      className="block w-full text-left px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100"
                    >
                      Top Rated
                    </button>
                    <button
                      onClick={() => updateURL('sort', 'reviews')}
                      className="block w-full text-left px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100"
                    >
                      Most Reviewed
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Products Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Summary */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                {loading ? (
                  <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                ) : (
                  <h2 className="text-xl font-semibold text-gray-900">
                    {products.length > 0 
                      ? `${pagination.total} AI Tools Found`
                      : 'No AI Tools Found'
                    }
                    {currentSearch && (
                      <span className="text-gray-600 font-normal"> for "{currentSearch}"</span>
                    )}
                  </h2>
                )}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    hasNext={pagination.hasNext}
                    hasPrev={pagination.hasPrev}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-500 text-lg mb-4">No AI tools found</div>
              <p className="text-gray-400 mb-8">
                {hasActiveFilters 
                  ? 'Try adjusting your search criteria or filters'
                  : 'Be the first to add an AI tool to our platform!'
                }
              </p>
              {hasActiveFilters ? (
                <Button onClick={clearAllFilters} variant="outline">
                  Clear Filters
                </Button>
              ) : (
                <Link href="/products/submit">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Submit a Product
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}