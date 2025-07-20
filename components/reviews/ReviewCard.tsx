'use client';

import { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

interface ReviewCardProps {
  review: Review;
  showProduct?: boolean;
  onVote?: (reviewId: number, isHelpful: boolean) => void;
}

export default function ReviewCard({ 
  review, 
  showProduct = false, 
  onVote 
}: ReviewCardProps) {
  const [voting, setVoting] = useState(false);
  const [userVote, setUserVote] = useState<boolean | null>(null);
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);

  const handleVote = async (isHelpful: boolean) => {
    if (voting) return;

    setVoting(true);
    try {
      const response = await fetch(`/api/reviews/${review.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isHelpful }),
      });

      if (response.ok) {
        const data = await response.json();
        setHelpfulCount(data.helpfulCount);
        setUserVote(isHelpful);
        
        if (onVote) {
          onVote(review.id, isHelpful);
        }
      }
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVoting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            {review.user.avatar ? (
              <img 
                src={review.user.avatar} 
                alt={review.user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <User className="h-5 w-5 text-gray-500" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">{review.user.name}</span>
              {review.isVerifiedPurchase && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Verified User
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(review.createdAt)}
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < review.rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="text-sm text-gray-600 ml-1">
            {review.rating}/5
          </span>
        </div>
      </div>

      {/* Product name if showing multiple products */}
      {showProduct && review.product && (
        <div className="mb-3">
          <a 
            href={`/products/${review.product.slug}`}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Review for: {review.product.name}
          </a>
        </div>
      )}

      {/* Title */}
      {review.title && (
        <h4 className="text-lg font-semibold text-gray-900 mb-3">
          {review.title}
        </h4>
      )}

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {review.content}
        </p>
      </div>

      {/* Pros and Cons */}
      {(review.pros?.length || review.cons?.length) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Pros */}
          {review.pros && review.pros.length > 0 && (
            <div>
              <h5 className="font-medium text-green-700 mb-2 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Pros
              </h5>
              <ul className="space-y-1">
                {review.pros.map((pro, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-green-500 mr-2">+</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cons */}
          {review.cons && review.cons.length > 0 && (
            <div>
              <h5 className="font-medium text-red-700 mb-2 flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Cons
              </h5>
              <ul className="space-y-1">
                {review.cons.map((con, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-red-500 mr-2">-</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Helpful votes */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Was this review helpful?
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVote(true)}
              disabled={voting}
              className={`${
                userVote === true ? 'bg-green-50 border-green-300' : ''
              }`}
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              Yes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVote(false)}
              disabled={voting}
              className={`${
                userVote === false ? 'bg-red-50 border-red-300' : ''
              }`}
            >
              <ThumbsDown className="h-4 w-4 mr-1" />
              No
            </Button>
          </div>
        </div>
        
        {helpfulCount > 0 && (
          <div className="text-sm text-gray-500">
            {helpfulCount} people found this helpful
          </div>
        )}
      </div>
    </div>
  );
}