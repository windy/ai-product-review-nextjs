'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, 
  MessageSquare, 
  Users, 
  Grid3X3, 
  Star, 
  TrendingUp,
  Activity,
  BarChart3
} from 'lucide-react';

interface StatsData {
  overview: {
    totalProducts: number;
    totalReviews: number;
    totalUsers: number;
    totalCategories: number;
  };
  topRatedProducts: Array<{
    id: number;
    name: string;
    slug: string;
    averageRating: string;
    totalReviews: number;
    category: { name: string };
  }>;
  mostReviewedProducts: Array<{
    id: number;
    name: string;
    slug: string;
    averageRating: string;
    totalReviews: number;
    category: { name: string };
  }>;
  categoryStats: Array<{
    categoryId: number;
    categoryName: string;
    categorySlug: string;
    productCount: number;
    averageRating: number | null;
    totalReviews: number;
  }>;
  recentActivity: Array<{
    reviewId: number;
    reviewTitle: string;
    reviewRating: number;
    reviewCreatedAt: string;
    productName: string;
    productSlug: string;
    userName: string;
  }>;
  ratingDistribution: Array<{
    rating: number;
    count: number;
  }>;
}

export default function StatsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      
      const statsData = await response.json();
      setData(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error loading statistics: {error}</div>
          <button 
            onClick={fetchStats} 
            className="text-blue-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Platform Statistics
          </h1>
          <p className="text-lg text-gray-600">
            Insights and analytics for the AI Review Hub community
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {data.overview.totalProducts}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Reviews</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {data.overview.totalReviews}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {data.overview.totalUsers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Grid3X3 className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Categories</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {data.overview.totalCategories}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Rated Products */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Star className="h-5 w-5 text-yellow-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Top Rated Products</h2>
            </div>
            <div className="space-y-4">
              {data.topRatedProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <Link 
                        href={`/products/${product.slug}`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-gray-500">{product.category.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-900">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      {parseFloat(product.averageRating).toFixed(1)}
                    </div>
                    <p className="text-xs text-gray-500">{product.totalReviews} reviews</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Most Reviewed Products */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Most Reviewed</h2>
            </div>
            <div className="space-y-4">
              {data.mostReviewedProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <Link 
                        href={`/products/${product.slug}`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-gray-500">{product.category.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {product.totalReviews} reviews
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                      {parseFloat(product.averageRating).toFixed(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Statistics */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center mb-6">
            <BarChart3 className="h-5 w-5 text-blue-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Category Breakdown</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.categoryStats.map((category) => (
              <div key={category.categoryId} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{category.categoryName}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Products:</span>
                    <span className="font-medium">{category.productCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Rating:</span>
                    <span className="font-medium">
                      {category.averageRating && typeof category.averageRating === 'number' ? category.averageRating.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Reviews:</span>
                    <span className="font-medium">{category.totalReviews}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <Activity className="h-5 w-5 text-purple-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="space-y-4">
            {data.recentActivity.map((activity) => (
              <div key={activity.reviewId} className="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.userName}</span> reviewed{' '}
                    <Link 
                      href={`/products/${activity.productSlug}`}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      {activity.productName}
                    </Link>
                  </p>
                  {activity.reviewTitle && (
                    <p className="text-sm text-gray-600 mt-1">"{activity.reviewTitle}"</p>
                  )}
                  <div className="flex items-center mt-1 space-x-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < activity.reviewRating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(activity.reviewCreatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}