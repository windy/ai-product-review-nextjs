import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { reviewVotes, reviews } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

// POST /api/reviews/[id]/vote - Vote on review helpfulness
export async function POST(
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
    const { isHelpful } = data;

    if (typeof isHelpful !== 'boolean') {
      return NextResponse.json(
        { error: 'isHelpful must be a boolean' },
        { status: 400 }
      );
    }

    // Check if review exists
    const review = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(eq(reviews.id, reviewId))
      .limit(1);

    if (review.length === 0) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Check if user already voted on this review
    const existingVote = await db
      .select({ id: reviewVotes.id, isHelpful: reviewVotes.isHelpful })
      .from(reviewVotes)
      .where(and(
        eq(reviewVotes.reviewId, reviewId),
        eq(reviewVotes.userId, user.id)
      ))
      .limit(1);

    if (existingVote.length > 0) {
      // Update existing vote if different
      if (existingVote[0].isHelpful !== isHelpful) {
        await db
          .update(reviewVotes)
          .set({ isHelpful })
          .where(and(
            eq(reviewVotes.reviewId, reviewId),
            eq(reviewVotes.userId, user.id)
          ));
      }
    } else {
      // Create new vote
      await db
        .insert(reviewVotes)
        .values({
          reviewId,
          userId: user.id,
          isHelpful,
        });
    }

    // Update review helpful count
    const helpfulCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(reviewVotes)
      .where(and(
        eq(reviewVotes.reviewId, reviewId),
        eq(reviewVotes.isHelpful, true)
      ));

    const helpfulCount = helpfulCountResult[0]?.count || 0;

    await db
      .update(reviews)
      .set({ helpfulCount })
      .where(eq(reviews.id, reviewId));

    return NextResponse.json({
      message: 'Vote recorded successfully',
      helpfulCount,
    });
  } catch (error) {
    console.error('Error recording vote:', error);
    return NextResponse.json(
      { error: 'Failed to record vote' },
      { status: 500 }
    );
  }
}

// GET /api/reviews/[id]/vote - Get user's vote on review
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ voted: false, isHelpful: null });
    }

    const { id } = await params;
    const reviewId = parseInt(id);

    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: 'Invalid review ID' },
        { status: 400 }
      );
    }

    const vote = await db
      .select({ isHelpful: reviewVotes.isHelpful })
      .from(reviewVotes)
      .where(and(
        eq(reviewVotes.reviewId, reviewId),
        eq(reviewVotes.userId, user.id)
      ))
      .limit(1);

    if (vote.length === 0) {
      return NextResponse.json({ voted: false, isHelpful: null });
    }

    return NextResponse.json({
      voted: true,
      isHelpful: vote[0].isHelpful,
    });
  } catch (error) {
    console.error('Error fetching vote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vote' },
      { status: 500 }
    );
  }
}