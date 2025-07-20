import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ExternalLink, Users, Calendar, Tag, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReviewList from '@/components/reviews/ReviewList';
import ReviewForm from '@/components/reviews/ReviewForm';
import { Suspense } from 'react';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  try {
    // Direct database call instead of API call on server side
    const { db } = await import('@/lib/db/drizzle');
    const { products, categories, users, productImages, productTags, tags } = await import('@/lib/db/schema');
    const { eq } = await import('drizzle-orm');
    
    // Get product with related data
    const productData = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        shortDescription: products.shortDescription,
        website: products.website,
        pricing: products.pricing,
        pricingDetails: products.pricingDetails,
        features: products.features,
        specifications: products.specifications,
        averageRating: products.averageRating,
        totalReviews: products.totalReviews,
        isFeatured: products.isFeatured,
        status: products.status,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
        },
        submitter: {
          id: users.id,
          name: users.name,
        },
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(users, eq(products.submittedBy, users.id))
      .where(eq(products.slug, slug))
      .limit(1);

    if (productData.length === 0) {
      return null;
    }

    const product = productData[0];

    // Get product images
    const images = await db
      .select({
        id: productImages.id,
        url: productImages.url,
        alt: productImages.alt,
        isPrimary: productImages.isPrimary,
        order: productImages.order,
      })
      .from(productImages)
      .where(eq(productImages.productId, product.id))
      .orderBy(productImages.order);

    // Get product tags
    const productTagsData = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        color: tags.color,
      })
      .from(productTags)
      .leftJoin(tags, eq(productTags.tagId, tags.id))
      .where(eq(productTags.productId, product.id));

    // Parse JSON fields
    const productWithParsedData = {
      ...product,
      pricingDetails: product.pricingDetails && typeof product.pricingDetails === 'string' ? JSON.parse(product.pricingDetails) : product.pricingDetails,
      features: product.features && typeof product.features === 'string' ? JSON.parse(product.features) : product.features,
      specifications: product.specifications && typeof product.specifications === 'string' ? JSON.parse(product.specifications) : product.specifications,
      images,
      tags: productTagsData,
    };

    return productWithParsedData;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const rating = parseFloat(product.averageRating);
  const primaryImage = product.images.find((img: any) => img.isPrimary) || product.images[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4 text-sm">
            <li>
              <Link href="/products" className="text-gray-500 hover:text-gray-700">
                Products
              </Link>
            </li>
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li>
              <Link 
                href={`/products?category=${product.category.id}`}
                className="text-gray-500 hover:text-gray-700"
              >
                {product.category.name}
              </Link>
            </li>
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li className="text-gray-900 font-medium">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div>
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
              {primaryImage && (
                <Image
                  src={primaryImage.url}
                  alt={primaryImage.alt || product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            {/* Additional Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((image: any) => (
                  <div key={image.id} className="aspect-square rounded-md overflow-hidden bg-gray-100">
                    <Image
                      src={image.url}
                      alt={image.alt || product.name}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Category */}
            <div className="mb-2">
              <Link 
                href={`/products?category=${product.category.id}`}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {product.category.name}
              </Link>
            </div>

            {/* Product Name */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Rating and Reviews */}
            <div className="flex items-center mb-6">
              <div className="flex items-center mr-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(rating)
                        ? 'text-yellow-400 fill-current'
                        : i < rating
                        ? 'text-yellow-400 fill-current opacity-50'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="text-lg font-medium text-gray-900 ml-2">
                  {rating.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center text-gray-600">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>{product.totalReviews} reviews</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Pricing */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Pricing</h2>
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {product.pricing}
                </span>
                {product.website && (
                  <a
                    href={product.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center"
                  >
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Website
                    </Button>
                  </a>
                )}
              </div>
              
              {product.pricingDetails && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  {Object.entries(product.pricingDetails).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-1">
                      <span className="text-sm text-gray-600 capitalize">{key}:</span>
                      <span className="text-sm text-gray-900">{value as string}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag: any) => (
                    <span
                      key={tag.id}
                      className="px-2 py-1 text-xs rounded-full border"
                      style={{ 
                        borderColor: tag.color, 
                        color: tag.color,
                        backgroundColor: `${tag.color}10`
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        {product.features && product.features.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Specifications */}
        {product.specifications && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h2>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm font-medium text-gray-500 mb-1">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </dt>
                    <dd className="text-sm text-gray-900">{value as string}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Reviews & Ratings</h2>
            <Button className="bg-green-600 hover:bg-green-700">
              Write a Review
            </Button>
          </div>
          
          {/* Review Statistics */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {rating.toFixed(1)}
                </div>
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  Based on {product.totalReviews} reviews
                </div>
              </div>
              
              <div className="col-span-2">
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 w-12">
                        <span className="text-sm text-gray-600">{stars}</span>
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${Math.random() * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {Math.floor(Math.random() * 20)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <Suspense fallback={<div className="text-center py-8">Loading reviews...</div>}>
            <ReviewList productId={product.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}