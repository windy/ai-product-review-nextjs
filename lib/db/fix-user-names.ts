import { db } from './drizzle';
import { users } from './schema';
import { eq, isNull } from 'drizzle-orm';

export async function fixUserNames() {
  console.log('🔧 Fixing user names for existing users...');

  try {
    // Find users without names
    const usersWithoutNames = await db
      .select()
      .from(users)
      .where(isNull(users.name));

    console.log(`Found ${usersWithoutNames.length} users without names`);

    for (const user of usersWithoutNames) {
      // Extract default name from email
      const defaultName = user.email.split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

      // Update user with default name
      await db
        .update(users)
        .set({ name: defaultName })
        .where(eq(users.id, user.id));

      console.log(`✅ Updated user ${user.email} with name: ${defaultName}`);
    }

    console.log('🎉 User names fixed successfully!');
  } catch (error) {
    console.error('❌ Error fixing user names:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  fixUserNames()
    .then(() => {
      console.log('✅ Fix completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fix failed:', error);
      process.exit(1);
    });
}