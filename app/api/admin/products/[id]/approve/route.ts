import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/admin';

// POST /api/admin/products/[id]/approve - Approve a product
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Update product status to approved
    const result = await db
      .update(products)
      .set({
        status: 'approved',
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Product approved successfully',
      product: result[0],
    });
  } catch (error) {
    console.error('Error approving product:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      if (error.message === 'Admin access required') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: 'Failed to approve product' },
      { status: 500 }
    );
  }
}

// POST /api/admin/products/[id]/reject - Reject a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const data = await request.json();
    const { reason } = data;

    // Update product status to rejected
    const result = await db
      .update(products)
      .set({
        status: 'rejected',
        updatedAt: new Date(),
        // Could add rejection reason field if needed
      })
      .where(eq(products.id, productId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Product rejected successfully',
      product: result[0],
      reason,
    });
  } catch (error) {
    console.error('Error rejecting product:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      if (error.message === 'Admin access required') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: 'Failed to reject product' },
      { status: 500 }
    );
  }
}