import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { products, categories, users } from '@/lib/db/schema';
import { eq, desc, and, sql, or, ilike } from 'drizzle-orm';

export async function GET() {
  try {
    console.log('🔍 Testing Admin Products Query...');
    
    // Direct database query without auth to test data
    const conditions = [eq(products.deletedAt, null)];
    
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
      .limit(20);

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
      all: productsData.length,
      pending: statusCounts.find(s => s.status === 'pending')?.count || 0,
      approved: statusCounts.find(s => s.status === 'approved')?.count || 0,
      rejected: statusCounts.find(s => s.status === 'rejected')?.count || 0,
    };

    console.log('✅ Query Results:');
    console.log(`   Total Products: ${productsData.length}`);
    console.log(`   Status Counts:`, counts);
    
    if (productsData.length > 0) {
      console.log('   Sample Products:');
      productsData.slice(0, 3).forEach((p, i) => {
        console.log(`     ${i + 1}. ${p.name} (${p.status}) - Category: ${p.category?.name}`);
      });
    }

    return NextResponse.json({
      success: true,
      products: productsData,
      counts,
      debug: {
        totalFound: productsData.length,
        statusBreakdown: statusCounts
      }
    });
  } catch (error) {
    console.error('❌ Test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        message: 'Database query failed'
      }
    }, { status: 500 });
  }
}