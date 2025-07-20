import Link from 'next/link';
import Image from 'next/image';
import { Star, ExternalLink, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: {
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
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const rating = parseFloat(product.averageRating);
  const imageUrl = product.primaryImage || 'https://placehold.co/400x300/E5E7EB/6B7280?text=No+Image';

  const getPricingColor = (pricing: string) => {
    switch (pricing.toLowerCase()) {
      case 'free':
        return 'bg-green-100 text-green-800';
      case 'freemium':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden'>
      {/* Featured Badge */}
      {product.isFeatured && (
        <div className='absolute top-2 left-2 z-10'>
          <span className='bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full'>
            Featured
          </span>
        </div>
      )}

      {/* Product Image */}
      <div className='relative h-48 overflow-hidden'>
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className='object-cover hover:scale-105 transition-transform duration-200'
        />
      </div>

      {/* Product Content */}
      <div className='p-6'>
        {/* Category */}
        <div className='mb-2'>
          <Link 
            href={`/products?category=${product.category.id}`}
            className='text-xs text-blue-600 hover:text-blue-800 font-medium'
          >
            {product.category.name}
          </Link>
        </div>

        {/* Product Name */}
        <h3 className='text-lg font-semibold text-gray-900 mb-2 line-clamp-1'>
          <Link 
            href={`/products/${product.slug}`}
            className='hover:text-blue-600 transition-colors'
          >
            {product.name}
          </Link>
        </h3>

        {/* Description */}
        <p className='text-gray-600 text-sm mb-4 line-clamp-2'>
          {product.shortDescription}
        </p>

        {/* Rating and Reviews */}
        <div className='flex items-center mb-4'>
          <div className='flex items-center mr-3'>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(rating)
                    ? 'text-yellow-400 fill-current'
                    : i < rating
                    ? 'text-yellow-400 fill-current opacity-50'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className='text-sm text-gray-600 ml-1'>
              {rating.toFixed(1)}
            </span>
          </div>
          <div className='flex items-center text-sm text-gray-500'>
            <Users className='h-4 w-4 mr-1' />
            {product.totalReviews}
          </div>
        </div>

        {/* Pricing and Actions */}
        <div className='flex items-center justify-between'>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPricingColor(product.pricing)}`}>
            {product.pricing}
          </span>
          
          <div className='flex space-x-2'>
            {product.website && (
              <a
                href={product.website}
                target='_blank'
                rel='noopener noreferrer'
                className='text-gray-500 hover:text-blue-600 transition-colors'
                title='Visit website'
              >
                <ExternalLink className='h-4 w-4' />
              </a>
            )}
            <Link href={`/products/${product.slug}`}>
              <Button size='sm' variant='outline'>
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}