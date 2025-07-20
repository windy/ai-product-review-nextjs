import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { products, categories, users } from '@/lib/db/schema';
import { eq, desc, and, sql, or, ilike } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/admin';

// GET /api/admin/products - List all products for admin (including pending)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build conditions
    const conditions = [eq(products.deletedAt, null)]; // Not deleted

    // Status filter
    if (status !== 'all') {
      conditions.push(eq(products.status, status));
    }

    // Search filter
    if (search) {
      conditions.push(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.description, `%${search}%`)
        )
      );
    }

    // Get products with full details
    const productsData = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        shortDescription: products.shortDescription,
        website: products.website,
        pricing: products.pricing,
        averageRating: products.averageRating,
        totalReviews: products.totalReviews,
        isFeatured: products.isFeatured,
        status: products.status,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
        },
        submitter: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        primaryImage: sql<string>`(
          SELECT url FROM product_images 
          WHERE product_id = ${products.id} AND is_primary = true 
          LIMIT 1
        )`,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(users, eq(products.submittedBy, users.id))
      .where(and(...conditions))
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(and(...conditions));
    
    const total = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    // Get status counts
    const statusCounts = await db
      .select({
        status: products.status,
        count: sql<number>`count(*)`,
      })
      .from(products)
      .where(eq(products.deletedAt, null))
      .groupBy(products.status);

    const counts = {
      all: total,
      pending: statusCounts.find(s => s.status === 'pending')?.count || 0,
      approved: statusCounts.find(s => s.status === 'approved')?.count || 0,
      rejected: statusCounts.find(s => s.status === 'rejected')?.count || 0,
    };

    return NextResponse.json({
      products: productsData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      counts,
    });
  } catch (error) {
    console.error('Error fetching admin products:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      if (error.message === 'Admin access required') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}