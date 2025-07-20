import { getUser } from '@/lib/db/queries';

export async function isAdmin(): Promise<boolean> {
  try {
    const user = await getUser();
    return user?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export async function requireAdmin() {
  const user = await getUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }
  
  return user;
}