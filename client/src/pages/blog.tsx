import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Calendar, Clock, Search, Tag, User } from "lucide-react";
import { Link } from "wouter";

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const featuredPosts = [
    {
      id: "event-trends-2025",
      title: "Event Industry Trends in 2025: What to Expect",
      excerpt: "Explore the emerging trends that will shape the event landscape in 2025, from AI integrations to immersive experiences across all event formats.",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "March 18, 2025",
      author: "James Wilson",
      category: "Trends",
      readTime: "7 min read"
    },
    {
      id: "hybrid-events-best-practices",
      title: "Hybrid Events: Best Practices for Seamless Integration",
      excerpt: "Learn how to create hybrid events that offer equally engaging experiences for both in-person and remote attendees.",
      image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "March 10, 2025",
      author: "Sophia Chen",
      category: "Best Practices",
      readTime: "9 min read"
    },
    {
      id: "ai-event-planning",
      title: "How AI is Revolutionizing Event Planning and Execution",
      excerpt: "Discover how artificial intelligence is transforming the way events are planned, managed, and optimized for attendee engagement for any event type.",
      image: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "February 27, 2025",
      author: "Marcus Johnson",
      category: "Technology",
      readTime: "6 min read"
    }
  ];

  const allPosts = [
    ...featuredPosts,
    {
      id: "digital-networking-strategies",
      title: "10 Networking Strategies That Actually Work at Any Event",
      excerpt: "Effective strategies to foster meaningful connections and networking opportunities at in-person, hybrid, and digital event settings.",
      image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "February 21, 2025",
      author: "Emma Davis",
      category: "Networking",
      readTime: "8 min read"
    },
    {
      id: "budget-friendly-events",
      title: "Budget-Friendly Events: Do More With Less",
      excerpt: "Practical tips for creating impressive events even with limited resources and budget constraints, regardless of format.",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "February 15, 2025",
      author: "David Martinez",
      category: "Planning",
      readTime: "5 min read"
    },
    {
      id: "measuring-event-success",
      title: "Beyond Attendance: Measuring Event Success",
      excerpt: "Key metrics and KPIs to evaluate the true impact and ROI of your events beyond simple attendance numbers.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "February 8, 2025",
      author: "Olivia Thompson",
      category: "Analytics",
      readTime: "7 min read"
    },
    {
      id: "event-accessibility",
      title: "Making Events Accessible to Everyone",
      excerpt: "Best practices for ensuring your events are inclusive and accessible to attendees with various needs and abilities.",
      image: "https://images.unsplash.com/photo-1573164574001-618f4a00a69b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "January 30, 2025",
      author: "Michael Brown",
      category: "Inclusivity",
      readTime: "6 min read"
    },
    {
      id: "engaging-presentations",
      title: "Creating Engaging Presentations That Captivate",
      excerpt: "Techniques and tools to design and deliver presentations that keep attendees engaged and interested at any event format.",
      image: "https://images.unsplash.com/photo-1558403194-611308249627?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "January 23, 2025",
      author: "Rachel Kim",
      category: "Content",
      readTime: "8 min read"
    },
    {
      id: "event-security",
      title: "Ensuring Security and Privacy in Modern Events",
      excerpt: "Essential practices for protecting your events from security threats and safeguarding attendee privacy across all formats.",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "January 15, 2025",
      author: "Thomas Walker",
      category: "Security",
      readTime: "7 min read"
    }
  ];

  const categories = [
    "All",
    "Trends",
    "Best Practices",
    "Technology",
    "Planning",
    "Analytics",
    "Security"
  ];

  const filteredPosts = allPosts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Placeholder function for a fully implemented blog
  const getBlogPostUrl = (id: string) => `/blog/${id}`;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section className="py-16 px-4 md:px-6 bg-gradient-to-b from-background to-muted">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Event Planning Insights
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Expert advice, trends, and strategies to elevate your event planning for any occasion
            </p>
          </div>
          
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search articles..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {searchQuery === "" && (
        <section className="py-16 px-4 md:px-6">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-8">Featured Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden h-full flex flex-col border-border/30 shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                      {post.category}
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {post.date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {post.readTime}
                      </div>
                    </div>
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground">{post.excerpt}</p>
                  </CardContent>
                  <CardFooter className="pt-0 flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{post.author}</span>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={getBlogPostUrl(post.id)}>
                        Read More
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="py-16 px-4 md:px-6 bg-muted">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <h2 className="text-3xl font-bold mb-4 md:mb-0">
              {searchQuery ? "Search Results" : "All Articles"}
            </h2>
            {!searchQuery && (
              <Tabs defaultValue="All" className="w-full md:w-auto">
                <TabsList className="w-full md:w-auto overflow-auto">
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category}>
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
          </div>

          {searchQuery && filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-2xl font-bold mb-2">No results found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search terms or browse our categories
              </p>
              <Button onClick={() => setSearchQuery("")}>View All Articles</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(searchQuery ? filteredPosts : allPosts).map((post) => (
                <Card key={post.id} className="h-full flex flex-col border-border/30 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {post.date}
                      </div>
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-1" />
                        {post.category}
                      </div>
                    </div>
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground">{post.excerpt}</p>
                  </CardContent>
                  <CardFooter className="pt-0 flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{post.author}</span>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={getBlogPostUrl(post.id)}>
                        Read More
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination (simplified for this example) */}
          {!searchQuery && (
            <div className="flex justify-center mt-12">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
                <Button variant="outline" size="sm">2</Button>
                <Button variant="outline" size="sm">3</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 px-4 md:px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-muted-foreground mb-6">
            Get the latest event planning insights delivered straight to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input type="email" placeholder="Enter your email" className="sm:min-w-[300px]" />
            <Button>Subscribe</Button>
          </div>
        </div>
      </section>
    </div>
  );
}