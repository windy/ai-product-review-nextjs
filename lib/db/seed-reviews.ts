import { db } from './drizzle';
import { reviews, products, users } from './schema';
import { eq } from 'drizzle-orm';

export async function seedReviews() {
  console.log('🌱 Starting reviews seeding...');

  try {
    // Get existing products and users
    const existingProducts = await db.select().from(products).limit(4);
    const existingUsers = await db.select().from(users).limit(3);

    if (existingProducts.length === 0 || existingUsers.length === 0) {
      console.log('⚠️ No products or users found. Please run the main seed first.');
      return;
    }

    // Sample reviews for ChatGPT
    const chatgptReviews = [
      {
        productId: existingProducts[0].id, // ChatGPT
        userId: existingUsers[0].id,
        rating: 5,
        title: 'Incredibly versatile AI assistant',
        content: 'ChatGPT has revolutionized how I approach various tasks. From writing assistance to code generation, it handles everything with remarkable accuracy. The conversational interface feels natural and the responses are contextually aware.',
        pros: JSON.stringify([
          'Excellent natural language understanding',
          'Versatile across many domains',
          'Helpful for brainstorming and creativity',
          'Great for learning new concepts'
        ]),
        cons: JSON.stringify([
          'Sometimes provides outdated information',
          'Can be verbose in responses',
          'Limited real-time data access'
        ]),
        helpfulCount: 15,
        isVerifiedPurchase: true,
        status: 'approved',
      },
      {
        productId: existingProducts[0].id, // ChatGPT
        userId: existingUsers[1].id,
        rating: 4,
        title: 'Great for productivity but has limitations',
        content: 'I use ChatGPT daily for work-related tasks and personal projects. It\'s particularly good at helping with writing, explaining concepts, and generating ideas. However, it sometimes makes factual errors that require verification.',
        pros: JSON.stringify([
          'Fast and responsive',
          'Helps with writer\'s block',
          'Good at explaining complex topics',
          'Free tier available'
        ]),
        cons: JSON.stringify([
          'Occasional factual inaccuracies',
          'Cannot browse the internet',
          'Usage limits on free tier'
        ]),
        helpfulCount: 8,
        isVerifiedPurchase: false,
        status: 'approved',
      }
    ];

    // Sample reviews for GitHub Copilot
    const copilotReviews = [
      {
        productId: existingProducts[1].id, // GitHub Copilot
        userId: existingUsers[2].id,
        rating: 5,
        title: 'Game-changer for developers',
        content: 'GitHub Copilot has significantly improved my coding productivity. The AI suggestions are surprisingly accurate and often predict exactly what I was about to write. It\'s like having a smart pair programming partner.',
        pros: JSON.stringify([
          'Excellent code completion',
          'Supports multiple programming languages',
          'Learns from context',
          'Great IDE integration'
        ]),
        cons: JSON.stringify([
          'Monthly subscription cost',
          'Sometimes suggests inefficient code',
          'Requires internet connection'
        ]),
        helpfulCount: 12,
        isVerifiedPurchase: true,
        status: 'approved',
      },
      {
        productId: existingProducts[1].id, // GitHub Copilot
        userId: existingUsers[0].id,
        rating: 4,
        title: 'Helpful but needs careful review',
        content: 'Copilot is undeniably useful for speeding up development, especially for boilerplate code and common patterns. However, I\'ve learned to always review its suggestions carefully as they\'re not always optimal or secure.',
        pros: JSON.stringify([
          'Speeds up coding significantly',
          'Good for learning new syntax',
          'Handles repetitive tasks well'
        ]),
        cons: JSON.stringify([
          'Code quality can vary',
          'May suggest deprecated methods',
          'Subscription required for full features'
        ]),
        helpfulCount: 6,
        isVerifiedPurchase: true,
        status: 'approved',
      }
    ];

    // Sample reviews for Midjourney
    const midjourneyReviews = [
      {
        productId: existingProducts[2].id, // Midjourney
        userId: existingUsers[1].id,
        rating: 5,
        title: 'Stunning AI-generated artwork',
        content: 'Midjourney creates absolutely breathtaking images. The quality and artistic style are incredible, and it\'s surprisingly good at understanding complex prompts. Perfect for creative projects and professional design work.',
        pros: JSON.stringify([
          'Exceptional image quality',
          'Great variety of artistic styles',
          'Active community for inspiration',
          'Regular updates and improvements'
        ]),
        cons: JSON.stringify([
          'Discord-only interface can be confusing',
          'Limited control over specific details',
          'Queue times during peak hours'
        ]),
        helpfulCount: 20,
        isVerifiedPurchase: true,
        status: 'approved',
      }
    ];

    // Sample reviews for Notion AI
    const notionReviews = [
      {
        productId: existingProducts[3].id, // Notion AI
        userId: existingUsers[2].id,
        rating: 4,
        title: 'Seamless integration with Notion workflow',
        content: 'Notion AI integrates perfectly with my existing Notion workspace. It\'s great for summarizing content, improving writing, and generating ideas. The convenience of having AI built into my note-taking system is invaluable.',
        pros: JSON.stringify([
          'Seamless Notion integration',
          'Good writing assistance features',
          'Helpful for content organization',
          'No separate app needed'
        ]),
        cons: JSON.stringify([
          'Additional cost on top of Notion subscription',
          'Limited compared to dedicated AI tools',
          'Requires existing Notion knowledge'
        ]),
        helpfulCount: 4,
        isVerifiedPurchase: true,
        status: 'approved',
      }
    ];

    // Combine all reviews
    const allReviews = [
      ...chatgptReviews,
      ...copilotReviews,
      ...midjourneyReviews,
      ...notionReviews,
    ];

    // Insert reviews
    const insertedReviews = await db.insert(reviews).values(allReviews).returning();
    
    console.log(`✅ ${insertedReviews.length} reviews created`);

    // Update product statistics
    for (const product of existingProducts) {
      const productReviews = insertedReviews.filter(r => r.productId === product.id);
      if (productReviews.length > 0) {
        const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
        
        await db
          .update(products)
          .set({
            averageRating: avgRating.toFixed(2),
            totalReviews: productReviews.length,
            updatedAt: new Date(),
          })
          .where(eq(products.id, product.id));
      }
    }

    console.log('✅ Product statistics updated');
    console.log('🎉 Reviews seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding reviews:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedReviews()
    .then(() => {
      console.log('✅ Review seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Review seeding failed:', error);
      process.exit(1);
    });
}