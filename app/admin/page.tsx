import { 
  Package, 
  MessageSquare, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

async function getAdminStats() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/products?limit=1`);
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.counts;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return null;
  }
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.all || 0,
      icon: Package,
      color: 'blue',
      href: '/admin/products',
    },
    {
      title: 'Pending Approval',
      value: stats?.pending || 0,
      icon: Clock,
      color: 'yellow',
      href: '/admin/products?status=pending',
    },
    {
      title: 'Approved Products',
      value: stats?.approved || 0,
      icon: CheckCircle,
      color: 'green',
      href: '/admin/products?status=approved',
    },
    {
      title: 'Rejected Products',
      value: stats?.rejected || 0,
      icon: XCircle,
      color: 'red',
      href: '/admin/products?status=rejected',
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-500 text-blue-500 bg-blue-50';
      case 'yellow':
        return 'bg-yellow-500 text-yellow-500 bg-yellow-50';
      case 'green':
        return 'bg-green-500 text-green-500 bg-green-50';
      case 'red':
        return 'bg-red-500 text-red-500 bg-red-50';
      default:
        return 'bg-gray-500 text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Admin Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Manage AI Review Hub platform content and users
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const colors = getColorClasses(stat.color);
          const [bgColor, textColor, cardBg] = colors.split(' ');
          
          return (
            <Link
              key={stat.title}
              href={stat.href}
              className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${cardBg}`}>
                  <Icon className={`h-6 w-6 ${textColor}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Pending Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Submissions
            </h2>
            <Link 
              href="/admin/products?status=pending"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View all →
            </Link>
          </div>
          
          {stats?.pending > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {stats.pending} product{stats.pending !== 1 ? 's' : ''} awaiting review
                    </p>
                    <p className="text-xs text-gray-600">
                      Review submissions to approve or reject
                    </p>
                  </div>
                </div>
                <Link href="/admin/products?status=pending">
                  <button className="bg-yellow-600 text-white px-3 py-1 rounded-md text-sm hover:bg-yellow-700 transition-colors">
                    Review
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No pending submissions</p>
            </div>
          )}
        </div>

        {/* Platform Health */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Platform Health
            </h2>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Approval Rate</span>
              <span className="text-sm font-medium text-gray-900">
                {stats ? Math.round((stats.approved / (stats.approved + stats.rejected || 1)) * 100) : 0}%
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Products</span>
              <span className="text-sm font-medium text-gray-900">
                {stats?.all || 0}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Reviews</span>
              <span className="text-sm font-medium text-gray-900">
                {stats?.approved || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/products"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Package className="h-6 w-6 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Manage Products</p>
              <p className="text-sm text-gray-600">Review and manage all products</p>
            </div>
          </Link>
          
          <Link
            href="/admin/reviews"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <MessageSquare className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Review Management</p>
              <p className="text-sm text-gray-600">Moderate user reviews</p>
            </div>
          </Link>
          
          <Link
            href="/admin/users"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="h-6 w-6 text-purple-600" />
            <div>
              <p className="font-medium text-gray-900">User Management</p>
              <p className="text-sm text-gray-600">Manage user accounts</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}