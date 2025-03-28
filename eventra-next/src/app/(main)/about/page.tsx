export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">About EventraAI</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-10">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-4">
            EventraAI was created with a simple mission: to make event planning accessible, 
            efficient, and enjoyable for everyone. We believe that technology should simplify 
            complex tasks, and that's exactly what our platform aims to do for event organizers.
          </p>
          <p className="text-gray-700 mb-4">
            By combining powerful planning tools with artificial intelligence, we've created 
            a platform that not only helps you manage your events but also provides intelligent 
            suggestions and automates repetitive tasks.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-10">
          <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
          <p className="text-gray-700 mb-4">
            EventraAI began as a passion project in 2023, born from the frustrations of 
            event planners who were juggling multiple tools and spreadsheets to manage their events. 
            Our founder, who had experience in both software development and event management, 
            saw an opportunity to create a unified platform that could handle all aspects of 
            event planning.
          </p>
          <p className="text-gray-700 mb-4">
            After months of development and feedback from early users, EventraAI launched 
            with its core features. Since then, we've been continually improving our platform 
            based on user feedback and industry trends.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h2 className="text-2xl font-semibold mb-4">Our Technology</h2>
          <p className="text-gray-700 mb-4">
            At the heart of EventraAI is our proprietary AI engine that learns from thousands 
            of successful events to provide personalized recommendations. Our platform is built 
            using modern web technologies to ensure a fast, responsive, and secure experience.
          </p>
          <p className="text-gray-700 mb-4">
            We've designed EventraAI to be both powerful for professional event planners and 
            accessible for those planning their first event. Whether you're organizing a small 
            gathering or a large conference, our tools scale to meet your needs.
          </p>
          <div className="mt-6">
            <h3 className="text-xl font-medium mb-3">Our Tech Stack</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Next.js for fast, SEO-friendly frontend</li>
              <li>Supabase for robust backend services</li>
              <li>TailwindCSS for beautiful, responsive design</li>
              <li>WebSockets for real-time collaboration</li>
              <li>AI services for intelligent suggestions and assistance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 