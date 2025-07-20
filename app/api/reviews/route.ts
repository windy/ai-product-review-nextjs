import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { reviews, users, products } from '@/lib/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

// GET /api/reviews - List reviews with optional product filter
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [eq(reviews.status, 'approved')];
    
    if (productId) {
      conditions.push(eq(reviews.productId, parseInt(productId)));
    }

    // Get reviews with user and product info
    const reviewsData = await db
      .select({
        id: reviews.id,
        title: reviews.title,
        content: reviews.content,
        rating: reviews.rating,
        pros: reviews.pros,
        cons: reviews.cons,
        helpfulCount: reviews.helpfulCount,
        isVerifiedPurchase: reviews.isVerifiedPurchase,
        createdAt: reviews.createdAt,
        user: {
          id: users.id,
          name: users.name,
          avatar: users.avatar,
        },
        product: {
          id: products.id,
          name: products.name,
          slug: products.slug,
        },
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .leftJoin(products, eq(reviews.productId, products.id))
      .where(and(...conditions))
      .orderBy(desc(reviews.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(reviews)
      .where(and(...conditions));
    
    const total = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    // Parse JSON fields
    const parsedReviews = reviewsData.map(review => ({
      ...review,
      pros: review.pros && typeof review.pros === 'string' ? JSON.parse(review.pros) : review.pros,
      cons: review.cons && typeof review.cons === 'string' ? JSON.parse(review.cons) : review.cons,
    }));

    return NextResponse.json({
      reviews: parsedReviews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create new review (authenticated users only)
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const {
      productId,
      rating,
      title,
      content,
      pros,
      cons,
    } = data;

    // Validate required fields
    if (!productId || !rating || !content) {
      return NextResponse.json(
        { error: 'Product ID, rating, and content are required' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if user already reviewed this product
    const existingReview = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(and(
        eq(reviews.productId, productId),
        eq(reviews.userId, user.id)
      ))
      .limit(1);

    if (existingReview.length > 0) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 }
      );
    }

    // Create review
    const newReview = await db
      .insert(reviews)
      .values({
        productId,
        userId: user.id,
        rating,
        title,
        content,
        pros: pros ? JSON.stringify(pros) : null,
        cons: cons ? JSON.stringify(cons) : null,
        status: 'approved', // Auto-approve for now
      })
      .returning();

    // Update product average rating and review count
    const avgRatingResult = await db
      .select({
        avgRating: sql<number>`ROUND(AVG(${reviews.rating}), 2)`,
        totalReviews: sql<number>`COUNT(*)`,
      })
      .from(reviews)
      .where(and(
        eq(reviews.productId, productId),
        eq(reviews.status, 'approved')
      ));

    if (avgRatingResult.length > 0) {
      await db
        .update(products)
        .set({
          averageRating: avgRatingResult[0].avgRating.toString(),
          totalReviews: avgRatingResult[0].totalReviews,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId));
    }

    return NextResponse.json(
      { 
        message: 'Review created successfully', 
        review: newReview[0] 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}