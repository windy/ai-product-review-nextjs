import { db } from './drizzle';
import { categories, tags, products, productImages, productTags, users } from './schema';
import bcrypt from 'bcryptjs';

export async function seedPlatform() {
  console.log('🌱 Starting AI Product Review Platform seeding...');

  try {
    // Create demo users
    const demoUsers = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        bio: 'AI enthusiast and early adopter of innovative tools.',
        isVerified: true,
      },
      {
        name: 'Sarah Chen',
        email: 'sarah@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        bio: 'Product manager focused on AI productivity tools.',
        isVerified: true,
      },
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        bio: 'Developer and AI tools reviewer.',
        isVerified: true,
      },
    ];

    const insertedUsers = await db.insert(users).values(demoUsers).returning();
    console.log('✅ Demo users created');

    // Create categories
    const categoryData = [
      {
        name: 'Text & Writing',
        slug: 'text-writing',
        description: 'AI tools for content creation, writing assistance, and text generation',
        icon: 'pen-tool',
      },
      {
        name: 'Image & Design',
        slug: 'image-design',
        description: 'AI-powered image generation, editing, and design tools',
        icon: 'image',
      },
      {
        name: 'Code & Development',
        slug: 'code-development',
        description: 'AI coding assistants and development tools',
        icon: 'code',
      },
      {
        name: 'Video & Audio',
        slug: 'video-audio',
        description: 'AI tools for video editing, audio processing, and multimedia creation',
        icon: 'video',
      },
      {
        name: 'Business & Productivity',
        slug: 'business-productivity',
        description: 'AI tools for business automation and productivity enhancement',
        icon: 'briefcase',
      },
      {
        name: 'Data & Analytics',
        slug: 'data-analytics',
        description: 'AI tools for data analysis, visualization, and insights',
        icon: 'bar-chart',
      },
    ];

    const insertedCategories = await db.insert(categories).values(categoryData).returning();
    console.log('✅ Categories created');

    // Create tags
    const tagData = [
      { name: 'Free', slug: 'free', color: '#10B981' },
      { name: 'Freemium', slug: 'freemium', color: '#F59E0B' },
      { name: 'Paid', slug: 'paid', color: '#EF4444' },
      { name: 'Open Source', slug: 'open-source', color: '#8B5CF6' },
      { name: 'API Available', slug: 'api-available', color: '#3B82F6' },
      { name: 'No Login Required', slug: 'no-login', color: '#06B6D4' },
      { name: 'Mobile App', slug: 'mobile-app', color: '#EC4899' },
      { name: 'Browser Extension', slug: 'browser-extension', color: '#F97316' },
      { name: 'Enterprise', slug: 'enterprise', color: '#6B7280' },
      { name: 'Beginner Friendly', slug: 'beginner-friendly', color: '#84CC16' },
    ];

    const insertedTags = await db.insert(tags).values(tagData).returning();
    console.log('✅ Tags created');

    // Create sample products
    const sampleProducts = [
      {
        name: 'ChatGPT',
        slug: 'chatgpt',
        description: 'ChatGPT is a conversational AI model developed by OpenAI that can assist with a wide range of tasks including writing, analysis, coding, and general question answering.',
        shortDescription: 'Advanced AI chatbot for conversations and assistance',
        website: 'https://chat.openai.com',
        pricing: 'Freemium',
        pricingDetails: {
          free: 'Limited usage with GPT-3.5',
          paid: 'ChatGPT Plus at $20/month with GPT-4 access',
        },
        features: [
          'Natural language conversations',
          'Code generation and debugging',
          'Writing assistance',
          'Data analysis',
          'Creative content generation',
        ],
        specifications: {
          model: 'GPT-4',
          context_length: '8K-32K tokens',
          languages: '50+ languages supported',
          api: 'Available via OpenAI API',
        },
        categoryId: insertedCategories[0].id, // Text & Writing
        submittedBy: insertedUsers[0].id,
        averageRating: '4.5',
        totalReviews: 1247,
        isApproved: true,
        isFeatured: true,
        status: 'approved',
      },
      {
        name: 'GitHub Copilot',
        slug: 'github-copilot',
        description: 'GitHub Copilot is an AI pair programmer that helps you write code faster and with less work. It draws context from comments and code to suggest individual lines and whole functions instantly.',
        shortDescription: 'AI-powered code completion and generation tool',
        website: 'https://github.com/features/copilot',
        pricing: 'Paid',
        pricingDetails: {
          individual: '$10/month or $100/year',
          business: '$19/user/month',
          enterprise: 'Custom pricing',
        },
        features: [
          'Real-time code suggestions',
          'Multiple language support',
          'Context-aware completions',
          'Function generation',
          'Code documentation',
        ],
        specifications: {
          ide_support: 'VS Code, Visual Studio, Neovim, JetBrains IDEs',
          languages: '40+ programming languages',
          model: 'Based on GPT architecture',
          integration: 'Native IDE integration',
        },
        categoryId: insertedCategories[2].id, // Code & Development
        submittedBy: insertedUsers[1].id,
        averageRating: '4.3',
        totalReviews: 892,
        isApproved: true,
        isFeatured: true,
        status: 'approved',
      },
      {
        name: 'Midjourney',
        slug: 'midjourney',
        description: 'Midjourney is an independent research lab exploring new mediums of thought and expanding the imaginative powers of the human species through AI-generated artwork.',
        shortDescription: 'AI art generator creating stunning visual artwork',
        website: 'https://midjourney.com',
        pricing: 'Freemium',
        pricingDetails: {
          basic: '$10/month - 200 images',
          standard: '$30/month - Unlimited relaxed + 15h fast',
          pro: '$60/month - Unlimited relaxed + 30h fast',
        },
        features: [
          'High-quality image generation',
          'Various artistic styles',
          'Upscaling capabilities',
          'Style transfer',
          'Community gallery',
        ],
        specifications: {
          resolution: 'Up to 2048x2048 pixels',
          formats: 'PNG, JPG',
          styles: '100+ artistic styles',
          interface: 'Discord bot',
        },
        categoryId: insertedCategories[1].id, // Image & Design
        submittedBy: insertedUsers[2].id,
        averageRating: '4.6',
        totalReviews: 1543,
        isApproved: true,
        isFeatured: true,
        status: 'approved',
      },
      {
        name: 'Notion AI',
        slug: 'notion-ai',
        description: 'Notion AI is integrated directly into Notion workspace, helping users write, brainstorm, edit, summarize and translate content. It leverages the power of AI to enhance productivity and creativity.',
        shortDescription: 'AI writing assistant integrated into Notion workspace',
        website: 'https://notion.so/product/ai',
        pricing: 'Paid',
        pricingDetails: {
          addon: '$10/member/month (add-on to Notion plans)',
          usage: 'Unlimited AI responses for paid users',
        },
        features: [
          'AI writing assistance',
          'Content summarization',
          'Language translation',
          'Brainstorming helper',
          'Data extraction from text',
        ],
        specifications: {
          integration: 'Native Notion integration',
          languages: '10+ languages supported',
          response_time: 'Real-time',
          content_types: 'Text, tables, databases',
        },
        categoryId: insertedCategories[4].id, // Business & Productivity
        submittedBy: insertedUsers[0].id,
        averageRating: '4.2',
        totalReviews: 567,
        isApproved: true,
        isFeatured: false,
        status: 'approved',
      },
    ];

    const insertedProducts = await db.insert(products).values(sampleProducts).returning();
    console.log('✅ Sample products created');

    // Add product images
    const productImageData = [
      // ChatGPT images
      {
        productId: insertedProducts[0].id,
        url: 'https://placehold.co/800x600/0066CC/FFFFFF?text=ChatGPT+Interface',
        alt: 'ChatGPT chat interface',
        isPrimary: true,
        order: 1,
      },
      {
        productId: insertedProducts[0].id,
        url: 'https://placehold.co/800x600/00AA44/FFFFFF?text=ChatGPT+Code+Generation',
        alt: 'ChatGPT generating code',
        isPrimary: false,
        order: 2,
      },
      // GitHub Copilot images
      {
        productId: insertedProducts[1].id,
        url: 'https://placehold.co/800x600/24292E/FFFFFF?text=GitHub+Copilot+VS+Code',
        alt: 'GitHub Copilot in VS Code',
        isPrimary: true,
        order: 1,
      },
      {
        productId: insertedProducts[1].id,
        url: 'https://placehold.co/800x600/0366D6/FFFFFF?text=Copilot+Code+Suggestions',
        alt: 'Copilot code suggestions',
        isPrimary: false,
        order: 2,
      },
      // Midjourney images
      {
        productId: insertedProducts[2].id,
        url: 'https://placehold.co/800x600/7C3AED/FFFFFF?text=Midjourney+Artwork',
        alt: 'Midjourney generated artwork',
        isPrimary: true,
        order: 1,
      },
      {
        productId: insertedProducts[2].id,
        url: 'https://placehold.co/800x600/EC4899/FFFFFF?text=Midjourney+Gallery',
        alt: 'Midjourney community gallery',
        isPrimary: false,
        order: 2,
      },
      // Notion AI images
      {
        productId: insertedProducts[3].id,
        url: 'https://placehold.co/800x600/000000/FFFFFF?text=Notion+AI+Writing',
        alt: 'Notion AI writing assistance',
        isPrimary: true,
        order: 1,
      },
    ];

    await db.insert(productImages).values(productImageData);
    console.log('✅ Product images added');

    // Add product tags
    const productTagData = [
      // ChatGPT tags
      { productId: insertedProducts[0].id, tagId: insertedTags[1].id }, // Freemium
      { productId: insertedProducts[0].id, tagId: insertedTags[4].id }, // API Available
      { productId: insertedProducts[0].id, tagId: insertedTags[9].id }, // Beginner Friendly

      // GitHub Copilot tags
      { productId: insertedProducts[1].id, tagId: insertedTags[2].id }, // Paid
      { productId: insertedProducts[1].id, tagId: insertedTags[4].id }, // API Available
      { productId: insertedProducts[1].id, tagId: insertedTags[8].id }, // Enterprise

      // Midjourney tags
      { productId: insertedProducts[2].id, tagId: insertedTags[1].id }, // Freemium
      { productId: insertedProducts[2].id, tagId: insertedTags[9].id }, // Beginner Friendly

      // Notion AI tags
      { productId: insertedProducts[3].id, tagId: insertedTags[2].id }, // Paid
      { productId: insertedProducts[3].id, tagId: insertedTags[8].id }, // Enterprise
    ];

    await db.insert(productTags).values(productTagData);
    console.log('✅ Product tags added');

    console.log('🎉 AI Product Review Platform seeding completed successfully!');
    console.log(`
📊 Summary:
- ${insertedUsers.length} demo users created
- ${insertedCategories.length} categories created
- ${insertedTags.length} tags created
- ${insertedProducts.length} sample products created
- ${productImageData.length} product images added
- ${productTagData.length} product-tag relationships created

🔑 Demo user credentials:
- john@example.com / password123
- sarah@example.com / password123
- mike@example.com / password123
    `);

  } catch (error) {
    console.error('❌ Error seeding platform:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedPlatform()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}