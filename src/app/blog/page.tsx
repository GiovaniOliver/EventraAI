import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import { Search } from 'lucide-react'

const articles = [
  {
    id: 1,
    title: 'Event Industry Trends in 2025: What to Expect',
    description: 'Explore the emerging trends that will shape the event landscape in 2025, from AI integrations to immersive experiences across all event formats.',
    image: '/blog/trends-2025.jpg',
    date: 'March 18, 2025',
    readTime: '7 min read',
    category: 'Trends',
    author: 'James Wilson'
  },
  {
    id: 2,
    title: 'Hybrid Events: Best Practices for Seamless Integration',
    description: 'Learn how to create hybrid events that offer equally engaging experiences for both in-person and remote attendees.',
    image: '/blog/hybrid-events.jpg',
    date: 'March 10, 2025',
    readTime: '9 min read',
    category: 'Best Practices',
    author: 'Sophia Chen'
  },
  {
    id: 3,
    title: 'How AI is Revolutionizing Event Planning and Execution',
    description: 'Discover how artificial intelligence is transforming the way events are planned, managed, and optimized for attendee engagement for any event type.',
    image: '/blog/ai-revolution.jpg',
    date: 'February 27, 2025',
    readTime: '6 min read',
    category: 'Technology',
    author: 'Marcus Johnson'
  },
  {
    id: 4,
    title: '10 Networking Strategies That Actually Work at Any Event',
    description: 'Effective strategies to foster meaningful connections and networking opportunities at in-person, hybrid, and digital event settings.',
    image: '/blog/networking.jpg',
    date: 'February 21, 2025',
    readTime: '5 min read',
    category: 'Networking',
    author: 'Emma Davis'
  },
  {
    id: 5,
    title: 'Budget-Friendly Events: Do More With Less',
    description: 'Practical tips for creating impressive events, even with limited resources and budget constraints, regardless of format.',
    image: '/blog/budget-events.jpg',
    date: 'February 15, 2025',
    readTime: '8 min read',
    category: 'Planning',
    author: 'David Martinez'
  },
  {
    id: 6,
    title: 'Beyond Attendance: Measuring Event Success',
    description: 'Key metrics and KPIs to evaluate the true impact and ROI of your events beyond simple attendance numbers.',
    image: '/blog/metrics.jpg',
    date: 'February 5, 2025',
    readTime: '6 min read',
    category: 'Analytics',
    author: 'Olivia Thompson'
  }
]

export default function BlogPage() {
  const featuredArticles = articles.slice(0, 3)
  const allArticles = articles
  
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Event Planning Insights</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Expert advice, trends, and strategies to elevate your event planning for any occasion
          </p>
          
          <div className="mx-auto mt-8 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-2xl font-bold text-gray-900">Featured Articles</h2>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {featuredArticles.map((article) => (
              <div key={article.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                  <div className="absolute top-0 left-0 z-10 m-2 rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white">
                    {article.category}
                  </div>
                  <img
                    src={article.image || '/blog/placeholder.jpg'}
                    alt={article.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <div className="mb-3 flex items-center text-xs text-gray-500">
                    <span>{article.date}</span>
                    <span className="mx-2">•</span>
                    <span>{article.readTime}</span>
                  </div>
                  <h3 className="mb-2 text-xl font-bold">{article.title}</h3>
                  <p className="mb-4 text-sm text-gray-600">{article.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{article.author}</span>
                    <Link href={`/blog/${article.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                      Read More →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Articles */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">All Articles</h2>
            
            <div className="flex space-x-2">
              <button className="rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white">All</button>
              <button className="rounded px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200">Trends</button>
              <button className="rounded px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200">Best Practices</button>
              <button className="rounded px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200">Technology</button>
              <button className="rounded px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200">Planning</button>
              <button className="rounded px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200">Analytics</button>
              <button className="rounded px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200">Security</button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {allArticles.map((article) => (
              <div key={article.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center text-xs text-gray-500">
                  <span>{article.date}</span>
                  <span className="mx-2">•</span>
                  <span className="rounded-full bg-gray-100 px-2 py-1">{article.category}</span>
                </div>
                <h3 className="mb-2 text-xl font-bold">{article.title}</h3>
                <p className="mb-4 text-sm text-gray-600">{article.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{article.author}</span>
                  <Link href={`/blog/${article.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                    Read More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          <div className="mt-10 flex justify-center">
            <nav className="inline-flex items-center space-x-1 rounded-md">
              <button className="rounded-l-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50">
                Previous
              </button>
              <button className="border-t border-b border-gray-300 bg-indigo-600 px-4 py-2 text-sm font-medium text-white">
                1
              </button>
              <button className="border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50">
                2
              </button>
              <button className="border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50">
                3
              </button>
              <button className="rounded-r-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50">
                Next
              </button>
            </nav>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-gray-900">Subscribe to Our Newsletter</h2>
            <p className="mt-4 text-gray-600">
              Get the latest event planning insights delivered straight to your inbox
            </p>
            
            <div className="mt-8 flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-l-md border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button className="rounded-r-md bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}
