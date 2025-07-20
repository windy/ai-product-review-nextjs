'use client';

import { useState, useEffect } from 'react';
import ReviewCard from './ReviewCard';
import Pagination from '../ui/Pagination';
import { ChevronDown } from 'lucide-react';

interface Review {
  id: number;
  title?: string;
  content: string;
  rating: number;
  pros?: string[];
  cons?: string[];
  helpfulCount: number;
  isVerifiedPurchase: boolean;
  createdAt: string;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  product?: {
    id: number;
    name: string;
    slug: string;
  };
}

interface ReviewListProps {
  productId?: number;
  showProduct?: boolean;
  title?: string;
  limit?: number;
}

export default function ReviewList({ 
  productId, 
  showProduct = false, 
  title = 'Reviews',
  limit = 10
}: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchReviews();
  }, [productId, currentPage, sortBy]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      if (productId) {
        params.append('productId', productId.toString());
      }

      const response = await fetch(`/api/reviews?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      setReviews(data.reviews);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = (reviewId: number, isHelpful: boolean) => {
    // Update the review in the list with new helpful count
    // This will be handled by the ReviewCard component
    console.log(`Vote recorded for review ${reviewId}: ${isHelpful}`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">Error loading reviews: {error}</div>
        <button 
          onClick={fetchReviews} 
          className="text-blue-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">
          {title} {reviews.length > 0 && `(${reviews.length})`}
        </h3>
        
        {/* Sort dropdown */}
        {reviews.length > 0 && (
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
              <option value="helpful">Most Helpful</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Reviews */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <div className="text-gray-500 text-lg mb-2">No reviews yet</div>
          <p className="text-gray-400">
            {productId ? 'Be the first to review this product!' : 'No reviews found.'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                showProduct={showProduct}
                onVote={handleVote}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                hasNext={currentPage < totalPages}
                hasPrev={currentPage > 1}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}