import { db } from './drizzle';
import { products } from './schema';
import { eq } from 'drizzle-orm';

async function createPendingProducts() {
  try {
    console.log('Creating pending products for testing...');
    
    // Update ClackyAI to pending status
    const updated = await db
      .update(products)
      .set({ 
        status: 'pending',
        isApproved: false,
        updatedAt: new Date()
      })
      .where(eq(products.id, 5))
      .returning({ id: products.id, name: products.name, status: products.status });
    
    console.log('Updated existing product:', updated[0]);
    
    // Create a new pending product
    const newProduct = await db
      .insert(products)
      .values({
        name: 'TestAI Assistant',
        slug: 'testai-assistant',
        description: 'This is a test AI assistant product that requires admin approval. It demonstrates various AI capabilities and is submitted for review.',
        shortDescription: 'Test AI assistant awaiting approval',
        website: 'https://testai.example.com',
        pricing: 'Freemium',
        categoryId: 1, // Text & Writing
        submittedBy: 2, // Existing user
        status: 'pending',
        isApproved: false
      })
      .returning({ id: products.id, name: products.name, status: products.status });
    
    console.log('Created new pending product:', newProduct[0]);
    
    // Create another pending product
    const anotherProduct = await db
      .insert(products)
      .values({
        name: 'AI Code Helper',
        slug: 'ai-code-helper',
        description: 'An advanced AI-powered coding assistant that helps developers write better code faster. Features include code completion, bug detection, and optimization suggestions.',
        shortDescription: 'AI coding assistant pending review',
        website: 'https://aicodehelper.example.com',
        pricing: 'Paid',
        categoryId: 3, // Code & Development
        submittedBy: 1, // Admin user
        status: 'pending',
        isApproved: false
      })
      .returning({ id: products.id, name: products.name, status: products.status });
    
    console.log('Created another pending product:', anotherProduct[0]);
    
    console.log('✅ Successfully created pending products for testing');
    
  } catch (error) {
    console.error('❌ Error creating pending products:', error);
  }
}

// Run if executed directly
if (require.main === module) {
  createPendingProducts()
    .then(() => {
      console.log('Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}