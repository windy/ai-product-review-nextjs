import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { tags, productTags } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

// GET /api/tags - List all tags with usage counts
export async function GET() {
  try {
    const tagsData = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        color: tags.color,
        usageCount: sql<number>`(\n          SELECT COUNT(*) FROM product_tags \n          WHERE tag_id = ${tags.id}\n        )`,
      })
      .from(tags)
      .orderBy(tags.name);

    return NextResponse.json({ tags: tagsData });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}