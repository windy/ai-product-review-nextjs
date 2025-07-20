import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { products, categories, users, productImages, productTags, tags } from '@/lib/db/schema';
import { eq, desc, asc, ilike, and, or, sql } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

// GET /api/products - List products with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const pricing = searchParams.get('pricing');
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';
    const featured = searchParams.get('featured');
    const status = searchParams.get('status') || 'approved';

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    
    // Status filter (default to approved for public view)
    conditions.push(eq(products.status, status as any));

    // Search in name and description
    if (search) {
      conditions.push(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.description, `%${search}%`)
        )
      );
    }

    // Category filter
    if (category) {
      conditions.push(eq(products.categoryId, parseInt(category)));
    }

    // Pricing filter
    if (pricing) {
      conditions.push(ilike(products.pricing, `%${pricing}%`));
    }

    // Featured filter
    if (featured === 'true') {
      conditions.push(eq(products.isFeatured, true));
    }

    // Order by
    const orderBy = order === 'asc' ? asc : desc;
    let orderColumn;
    switch (sort) {
      case 'name':
        orderColumn = products.name;
        break;
      case 'rating':
        orderColumn = products.averageRating;
        break;
      case 'reviews':
        orderColumn = products.totalReviews;
        break;
      default:
        orderColumn = products.createdAt;
    }

    // Execute query
    const productsData = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        shortDescription: products.shortDescription,
        website: products.website,
        pricing: products.pricing,
        averageRating: products.averageRating,
        totalReviews: products.totalReviews,
        isFeatured: products.isFeatured,
        createdAt: products.createdAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        },
        primaryImage: sql<string>`(\n          SELECT url FROM product_images \n          WHERE product_id = ${products.id} AND is_primary = true \n          LIMIT 1\n        )`,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(orderBy(orderColumn))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(and(...conditions));
    
    const total = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

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
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product (authenticated users only)
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
      name,
      description,
      shortDescription,
      website,
      pricing,
      pricingDetails,
      features,
      specifications,
      categoryId,
      images,
      tagIds,
    } = data;

    // Validate required fields
    if (!name || !description || !categoryId) {
      return NextResponse.json(
        { error: 'Name, description, and category are required' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingProduct = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    if (existingProduct.length > 0) {
      return NextResponse.json(
        { error: 'Product with this name already exists' },
        { status: 400 }
      );
    }

    // Create product
    const newProduct = await db
      .insert(products)
      .values({
        name,
        slug,
        description,
        shortDescription,
        website,
        pricing,
        pricingDetails: pricingDetails ? JSON.stringify(pricingDetails) : null,
        features: features ? JSON.stringify(features) : null,
        specifications: specifications ? JSON.stringify(specifications) : null,
        categoryId,
        submittedBy: user.id,
        status: 'pending', // New products need approval
      })
      .returning();

    const productId = newProduct[0].id;

    // Add product images if provided
    if (images && Array.isArray(images)) {
      const imageData = images.map((img: any, index: number) => ({
        productId,
        url: img.url,
        alt: img.alt || name,
        isPrimary: index === 0, // First image is primary
        order: index + 1,
      }));

      await db.insert(productImages).values(imageData);
    }

    // Add product tags if provided
    if (tagIds && Array.isArray(tagIds)) {
      const tagData = tagIds.map((tagId: number) => ({
        productId,
        tagId,
      }));

      await db.insert(productTags).values(tagData);
    }

    return NextResponse.json(
      { message: 'Product submitted successfully', product: newProduct[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}