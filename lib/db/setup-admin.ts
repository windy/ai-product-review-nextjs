import { db } from './drizzle';
import { users } from './schema';
import { eq } from 'drizzle-orm';

export async function setupAdmin(email: string) {
  console.log(`🛡️ Setting up admin role for: ${email}...`);

  try {
    // Update user role to admin
    const result = await db
      .update(users)
      .set({ 
        role: 'admin',
        updatedAt: new Date()
      })
      .where(eq(users.email, email))
      .returning();

    if (result.length === 0) {
      throw new Error(`User with email '${email}' not found`);
    }

    console.log(`✅ User '${result[0].name || result[0].email}' is now an admin!`);
    return result[0];
  } catch (error) {
    console.error('❌ Error setting up admin:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  const email = process.argv[2];
  
  if (!email) {
    console.error('Please provide an email: npx tsx lib/db/setup-admin.ts <email>');
    process.exit(1);
  }

  setupAdmin(email)
    .then((user) => {
      console.log('✅ Admin setup completed:', user.email);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Admin setup failed:', error);
      process.exit(1);
    });
}