'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Package, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Eye,
  Calendar,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  website: string;
  pricing: string;
  averageRating: string;
  totalReviews: number;
  isFeatured: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: number;
    name: string;
  };
  submitter: {
    id: number;
    name: string;
    email: string;
  };
  primaryImage: string;
}

interface AdminProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  counts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export default function AdminProductsPage() {
  const [data, setData] = useState<AdminProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  const currentStatus = searchParams.get('status') || 'all';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    setSearchTerm(currentSearch);
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(searchParams.toString());
      
      const response = await fetch(`/api/admin/products?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateURL = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value && value.trim() !== '') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset page when filters change
    if (key !== 'page') {
      params.delete('page');
    }
    
    router.push(`?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL('search', searchTerm.trim() || null);
  };

  const handleStatusChange = (status: string) => {
    updateURL('status', status === 'all' ? null : status);
  };

  const handleProductAction = async (productId: number, action: 'approve' | 'reject') => {
    setActionLoading(productId);
    
    try {
      const endpoint = action === 'approve' 
        ? `/api/admin/products/${productId}/approve`
        : `/api/admin/products/${productId}/approve`;
      
      const method = action === 'approve' ? 'POST' : 'DELETE';
      const body = action === 'reject' ? JSON.stringify({ reason: 'Quality standards not met' }) : undefined;
      
      const response = await fetch(endpoint, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body,
      });

      if (!response.ok) throw new Error(`Failed to ${action} product`);
      
      // Refresh the products list
      fetchProducts();
    } catch (error) {
      console.error(`Error ${action}ing product:`, error);
      alert(`Failed to ${action} product. Please try again.`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Product Management
        </h1>
        <p className="text-lg text-gray-600">
          Review and manage all AI product submissions
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: 'All Products', count: data?.counts.all },
            { key: 'pending', label: 'Pending', count: data?.counts.pending },
            { key: 'approved', label: 'Approved', count: data?.counts.approved },
            { key: 'rejected', label: 'Rejected', count: data?.counts.rejected },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleStatusChange(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentStatus === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 text-xs opacity-75">({tab.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      {/* Products List */}
      {data?.products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">
            {currentStatus === 'all' 
              ? 'No products have been submitted yet.'
              : `No ${currentStatus} products found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start space-x-4">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden">
                    {product.primaryImage ? (
                      <Image
                        src={product.primaryImage}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {product.name}
                        </h3>
                        {getStatusBadge(product.status)}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {product.shortDescription || product.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {product.submitter.name || product.submitter.email}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(product.createdAt)}
                        </div>
                        <div className="flex items-center">
                          <Package className="h-3 w-3 mr-1" />
                          {product.category.name}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {product.website && (
                        <a
                          href={product.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-blue-600 transition-colors"
                          title="Visit website"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      
                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        className="text-gray-500 hover:text-blue-600 transition-colors"
                        title="View product"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>

                      {product.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleProductAction(product.id, 'approve')}
                            disabled={actionLoading === product.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {actionLoading === product.id ? '...' : 'Approve'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleProductAction(product.id, 'reject')}
                            disabled={actionLoading === product.id}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            {actionLoading === product.id ? '...' : 'Reject'}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              disabled={!data.pagination.hasPrev}
              onClick={() => updateURL('page', (currentPage - 1).toString())}
            >
              Previous
            </Button>
            
            <span className="text-sm text-gray-600">
              Page {data.pagination.page} of {data.pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              disabled={!data.pagination.hasNext}
              onClick={() => updateURL('page', (currentPage + 1).toString())}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}