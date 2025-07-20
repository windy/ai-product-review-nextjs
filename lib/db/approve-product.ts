import { db } from './drizzle';
import { products } from './schema';
import { eq } from 'drizzle-orm';

export async function approveProduct(slug: string) {
  console.log(`🔍 Approving product: ${slug}...`);

  try {
    // Update product status to approved
    const result = await db
      .update(products)
      .set({ 
        status: 'approved',
        updatedAt: new Date()
      })
      .where(eq(products.slug, slug))
      .returning();

    if (result.length === 0) {
      throw new Error(`Product with slug '${slug}' not found`);
    }

    console.log(`✅ Product '${result[0].name}' has been approved!`);
    return result[0];
  } catch (error) {
    console.error('❌ Error approving product:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  const slug = process.argv[2];
  
  if (!slug) {
    console.error('Please provide a product slug: npx tsx lib/db/approve-product.ts <slug>');
    process.exit(1);
  }

  approveProduct(slug)
    .then((product) => {
      console.log('✅ Approval completed:', product.name);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Approval failed:', error);
      process.exit(1);
    });
}