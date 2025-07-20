import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { categories, products } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

// GET /api/categories - List all categories with product counts
export async function GET() {
  try {
    const categoriesData = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        icon: categories.icon,
        parentId: categories.parentId,
        productCount: sql<number>`(\n          SELECT COUNT(*) FROM products \n          WHERE category_id = ${categories.id} \n          AND status = 'approved'\n          AND deleted_at IS NULL\n        )`,
      })
      .from(categories)
      .orderBy(categories.name);

    return NextResponse.json({ categories: categoriesData });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}