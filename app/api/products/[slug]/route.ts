import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { products, categories, users, productImages, productTags, tags, reviews } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

// GET /api/products/[slug] - Get single product by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

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
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
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

    // Get recent reviews (first 5)
    const recentReviews = await db
      .select({
        id: reviews.id,
        title: reviews.title,
        content: reviews.content,
        rating: reviews.rating,
        pros: reviews.pros,
        cons: reviews.cons,
        helpfulCount: reviews.helpfulCount,
        createdAt: reviews.createdAt,
        user: {
          id: users.id,
          name: users.name,
          avatar: users.avatar,
        },
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(and(
        eq(reviews.productId, product.id),
        eq(reviews.status, 'approved')
      ))
      .orderBy(desc(reviews.createdAt))
      .limit(5);

    // Parse JSON fields
    const productWithParsedData = {
      ...product,
      pricingDetails: product.pricingDetails && typeof product.pricingDetails === 'string' ? JSON.parse(product.pricingDetails) : product.pricingDetails,
      features: product.features && typeof product.features === 'string' ? JSON.parse(product.features) : product.features,
      specifications: product.specifications && typeof product.specifications === 'string' ? JSON.parse(product.specifications) : product.specifications,
      images,
      tags: productTagsData,
      recentReviews: recentReviews.map(review => ({
        ...review,
        pros: review.pros && typeof review.pros === 'string' ? JSON.parse(review.pros) : review.pros,
        cons: review.cons && typeof review.cons === 'string' ? JSON.parse(review.cons) : review.cons,
      })),
    };

    return NextResponse.json({ product: productWithParsedData });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[slug] - Update product (owner or admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const data = await request.json();

    // Check if product exists and user has permission
    const existingProduct = await db
      .select({
        id: products.id,
        submittedBy: products.submittedBy,
      })
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if user is the owner (or admin in future)
    if (existingProduct[0].submittedBy !== user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    const {
      name,
      description,
      shortDescription,
      website,
      pricing,
      pricingDetails,
      features,
      specifications,
      categoryId,
    } = data;

    // Update product
    const updatedProduct = await db
      .update(products)
      .set({
        name,
        description,
        shortDescription,
        website,
        pricing,
        pricingDetails: pricingDetails ? JSON.stringify(pricingDetails) : null,
        features: features ? JSON.stringify(features) : null,
        specifications: specifications ? JSON.stringify(specifications) : null,
        categoryId,
        updatedAt: new Date(),
        status: 'pending', // Updates need re-approval
      })
      .where(eq(products.id, existingProduct[0].id))
      .returning();

    return NextResponse.json({
      message: 'Product updated successfully',
      product: updatedProduct[0],
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[slug] - Delete product (owner or admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { slug } = await params;

    // Check if product exists and user has permission
    const existingProduct = await db
      .select({
        id: products.id,
        submittedBy: products.submittedBy,
      })
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if user is the owner (or admin in future)
    if (existingProduct[0].submittedBy !== user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Soft delete the product
    await db
      .update(products)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(products.id, existingProduct[0].id));

    return NextResponse.json({
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}