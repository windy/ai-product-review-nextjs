import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { products, reviews, users, categories } from '@/lib/db/schema';
import { sql, eq, desc, and } from 'drizzle-orm';

// GET /api/stats - Get platform statistics
export async function GET() {
  try {
    // Get basic counts
    const [
      totalProducts,
      totalReviews,
      totalUsers,
      totalCategories
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.status, 'approved')),
      db.select({ count: sql<number>`count(*)` }).from(reviews).where(eq(reviews.status, 'approved')),
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(categories)
    ]);

    // Get top-rated products
    const topRatedProducts = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        averageRating: products.averageRating,
        totalReviews: products.totalReviews,
        category: {
          name: categories.name
        }
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(
        eq(products.status, 'approved'),
        sql`${products.totalReviews} >= 2` // At least 2 reviews
      ))
      .orderBy(desc(products.averageRating), desc(products.totalReviews))
      .limit(5);

    // Get most reviewed products
    const mostReviewedProducts = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        averageRating: products.averageRating,
        totalReviews: products.totalReviews,
        category: {
          name: categories.name
        }
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.status, 'approved'))
      .orderBy(desc(products.totalReviews), desc(products.averageRating))
      .limit(5);

    // Get category distribution
    const categoryStats = await db
      .select({
        categoryId: products.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
        productCount: sql<number>`count(*)`,
        averageRating: sql<number | null>`COALESCE(ROUND(AVG(CAST(${products.averageRating} AS DECIMAL)), 2), 0)`,
        totalReviews: sql<number>`SUM(${products.totalReviews})`
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.status, 'approved'))
      .groupBy(products.categoryId, categories.name, categories.slug)
      .orderBy(desc(sql`count(*)`));

    // Get recent activity (recent reviews)
    const recentActivity = await db
      .select({
        reviewId: reviews.id,
        reviewTitle: reviews.title,
        reviewRating: reviews.rating,
        reviewCreatedAt: reviews.createdAt,
        productName: products.name,
        productSlug: products.slug,
        userName: users.name
      })
      .from(reviews)
      .leftJoin(products, eq(reviews.productId, products.id))
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.status, 'approved'))
      .orderBy(desc(reviews.createdAt))
      .limit(10);

    // Rating distribution
    const ratingDistribution = await db
      .select({
        rating: reviews.rating,
        count: sql<number>`count(*)`
      })
      .from(reviews)
      .where(eq(reviews.status, 'approved'))
      .groupBy(reviews.rating)
      .orderBy(desc(reviews.rating));

    // Monthly review trends (last 6 months)
    const monthlyTrends = await db
      .select({
        month: sql<string>`TO_CHAR(${reviews.createdAt}, 'YYYY-MM')`,
        reviewCount: sql<number>`count(*)`
      })
      .from(reviews)
      .where(and(
        eq(reviews.status, 'approved'),
        sql`${reviews.createdAt} >= NOW() - INTERVAL '6 months'`
      ))
      .groupBy(sql`TO_CHAR(${reviews.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${reviews.createdAt}, 'YYYY-MM')`);

    return NextResponse.json({
      overview: {
        totalProducts: totalProducts[0]?.count || 0,
        totalReviews: totalReviews[0]?.count || 0,
        totalUsers: totalUsers[0]?.count || 0,
        totalCategories: totalCategories[0]?.count || 0
      },
      topRatedProducts,
      mostReviewedProducts,
      categoryStats,
      recentActivity,
      ratingDistribution,
      monthlyTrends
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}