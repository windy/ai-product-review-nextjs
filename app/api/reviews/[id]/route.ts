import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { reviews, users, products } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

// GET /api/reviews/[id] - Get single review by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviewId = parseInt(id);

    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: 'Invalid review ID' },
        { status: 400 }
      );
    }

    const reviewData = await db
      .select({
        id: reviews.id,
        title: reviews.title,
        content: reviews.content,
        rating: reviews.rating,
        pros: reviews.pros,
        cons: reviews.cons,
        helpfulCount: reviews.helpfulCount,
        isVerifiedPurchase: reviews.isVerifiedPurchase,
        status: reviews.status,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
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
      .where(eq(reviews.id, reviewId))
      .limit(1);

    if (reviewData.length === 0) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    const review = reviewData[0];

    // Parse JSON fields
    const parsedReview = {
      ...review,
      pros: review.pros && typeof review.pros === 'string' ? JSON.parse(review.pros) : review.pros,
      cons: review.cons && typeof review.cons === 'string' ? JSON.parse(review.cons) : review.cons,
    };

    return NextResponse.json({ review: parsedReview });
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review' },
      { status: 500 }
    );
  }
}

// PUT /api/reviews/[id] - Update review (owner only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const reviewId = parseInt(id);

    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: 'Invalid review ID' },
        { status: 400 }
      );
    }

    const data = await request.json();
    const { rating, title, content, pros, cons } = data;

    // Check if review exists and user has permission
    const existingReview = await db
      .select({
        id: reviews.id,
        userId: reviews.userId,
        productId: reviews.productId,
      })
      .from(reviews)
      .where(eq(reviews.id, reviewId))
      .limit(1);

    if (existingReview.length === 0) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Check if user is the owner
    if (existingReview[0].userId !== user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Update review
    const updatedReview = await db
      .update(reviews)
      .set({
        rating,
        title,
        content,
        pros: pros ? JSON.stringify(pros) : null,
        cons: cons ? JSON.stringify(cons) : null,
        updatedAt: new Date(),
        status: 'approved', // Re-approve after edit
      })
      .where(eq(reviews.id, reviewId))
      .returning();

    // Recalculate product average rating if rating was changed
    if (rating) {
      const avgRatingResult = await db
        .select({
          avgRating: sql<number>`ROUND(AVG(${reviews.rating}), 2)`,
          totalReviews: sql<number>`COUNT(*)`,
        })
        .from(reviews)
        .where(and(
          eq(reviews.productId, existingReview[0].productId),
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
          .where(eq(products.id, existingReview[0].productId));
      }
    }

    return NextResponse.json({
      message: 'Review updated successfully',
      review: updatedReview[0],
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/[id] - Delete review (owner only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const reviewId = parseInt(id);

    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: 'Invalid review ID' },
        { status: 400 }
      );
    }

    // Check if review exists and user has permission
    const existingReview = await db
      .select({
        id: reviews.id,
        userId: reviews.userId,
        productId: reviews.productId,
      })
      .from(reviews)
      .where(eq(reviews.id, reviewId))
      .limit(1);

    if (existingReview.length === 0) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Check if user is the owner
    if (existingReview[0].userId !== user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Soft delete the review
    await db
      .update(reviews)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(reviews.id, reviewId));

    // Recalculate product average rating and review count
    const avgRatingResult = await db
      .select({
        avgRating: sql<number>`ROUND(AVG(${reviews.rating}), 2)`,
        totalReviews: sql<number>`COUNT(*)`,
      })
      .from(reviews)
      .where(and(
        eq(reviews.productId, existingReview[0].productId),
        eq(reviews.status, 'approved'),
        eq(reviews.deletedAt, null) // Only count non-deleted reviews
      ));

    if (avgRatingResult.length > 0) {
      await db
        .update(products)
        .set({
          averageRating: avgRatingResult[0].avgRating.toString(),
          totalReviews: avgRatingResult[0].totalReviews,
          updatedAt: new Date(),
        })
        .where(eq(products.id, existingReview[0].productId));
    }

    return NextResponse.json({
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}