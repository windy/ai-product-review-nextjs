import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import AdminNavigation from '@/components/admin/AdminNavigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  
  // Check if user is authenticated and is admin
  if (!user) {
    redirect('/sign-in?redirect=/admin');
  }
  
  if (user.role !== 'admin') {
    redirect('/products?error=access_denied');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation user={user} />
      <div className="py-8">
        {children}
      </div>
    </div>
  );
}