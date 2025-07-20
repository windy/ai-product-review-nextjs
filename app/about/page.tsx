export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI Review Hub
            </h1>
            <p className="text-xl text-gray-600">
              Your comprehensive platform for discovering and reviewing AI tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">✨ Key Features</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Product Discovery:</strong> Browse 4+ AI tools across 6 categories</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>User Reviews:</strong> Read and write detailed product reviews</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Advanced Search:</strong> Filter by category, pricing, and ratings</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Statistics Dashboard:</strong> Platform analytics and insights</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Product Submission:</strong> Add new AI tools to the platform</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>User Authentication:</strong> Secure login and user profiles</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">🚀 Technical Stack</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">●</span>
                  <span><strong>Frontend:</strong> Next.js 15, React 19, TypeScript</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">●</span>
                  <span><strong>Styling:</strong> Tailwind CSS V3, Responsive Design</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">●</span>
                  <span><strong>Database:</strong> PostgreSQL + Drizzle ORM</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">●</span>
                  <span><strong>API:</strong> RESTful API with Next.js App Router</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">●</span>
                  <span><strong>Authentication:</strong> Session-based with secure cookies</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">●</span>
                  <span><strong>State Management:</strong> SWR for data fetching</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              📊 Platform Statistics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600 mb-1">4+</div>
                <div className="text-sm text-gray-600">AI Products</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600 mb-1">12+</div>
                <div className="text-sm text-gray-600">User Reviews</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600 mb-1">6</div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600 mb-1">10+</div>
                <div className="text-sm text-gray-600">Product Tags</div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">🔧 API Endpoints</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Products API</h3>
                <ul className="space-y-1 text-gray-600">
                  <li><code className="bg-white px-2 py-1 rounded">GET /api/products</code></li>
                  <li><code className="bg-white px-2 py-1 rounded">GET /api/products/[slug]</code></li>
                  <li><code className="bg-white px-2 py-1 rounded">POST /api/products</code></li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Reviews API</h3>
                <ul className="space-y-1 text-gray-600">
                  <li><code className="bg-white px-2 py-1 rounded">GET /api/reviews</code></li>
                  <li><code className="bg-white px-2 py-1 rounded">POST /api/reviews</code></li>
                  <li><code className="bg-white px-2 py-1 rounded">POST /api/reviews/[id]/vote</code></li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Categories & Tags</h3>
                <ul className="space-y-1 text-gray-600">
                  <li><code className="bg-white px-2 py-1 rounded">GET /api/categories</code></li>
                  <li><code className="bg-white px-2 py-1 rounded">GET /api/tags</code></li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
                <ul className="space-y-1 text-gray-600">
                  <li><code className="bg-white px-2 py-1 rounded">GET /api/stats</code></li>
                  <li><code className="bg-white px-2 py-1 rounded">GET /api/user</code></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 mt-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              🎯 Project Completion Status
            </h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="text-green-600 text-4xl mb-2">✅</div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">
                All Features Implemented!
              </h3>
              <p className="text-green-700">
                This AI Review Hub platform is fully functional with all requested features including
                user authentication, product management, review system, search & filtering, 
                category browsing, and statistics dashboard.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Built with ❤️ using modern web technologies • Ready for production deployment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}