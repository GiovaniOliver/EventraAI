import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { ArrowRight, Calendar, CheckCircle, Clock, Globe, Users } from "lucide-react";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const [_, navigate] = useLocation();

  const navigateToSignUp = () => {
    if (user) {
      navigate("/events");
    } else {
      navigate("/auth");
    }
  };

  const features = [
    {
      title: "AI-Powered Planning",
      description: "Leverage artificial intelligence to get smart suggestions for your events",
      icon: <Calendar className="h-12 w-12 text-primary mb-4" />
    },
    {
      title: "Real-Time Collaboration",
      description: "Plan events with your team in real-time with our collaborative tools",
      icon: <Users className="h-12 w-12 text-primary mb-4" />
    },
    {
      title: "All Event Types",
      description: "Perfect for conferences, weddings, corporate events, and more",
      icon: <Globe className="h-12 w-12 text-primary mb-4" />
    },
    {
      title: "Time-Saving Workflows",
      description: "Streamline your planning process with our efficient workflow tools",
      icon: <Clock className="h-12 w-12 text-primary mb-4" />
    }
  ];

  const testimonials = [
    {
      quote: "Eventra AI transformed how we plan our conferences. The AI suggestions saved us countless hours of planning time.",
      author: "Sarah Johnson",
      company: "TechConf Organization"
    },
    {
      quote: "The collaborative tools made it easy for our team to work together even though we're spread across different time zones.",
      author: "Michael Chen",
      company: "Global Events Inc."
    },
    {
      quote: "We increased attendee engagement by 45% using the analytics and suggestions from Eventra AI for our corporate events.",
      author: "Jessica Rodriguez",
      company: "Community Builders Association"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-background to-muted">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                Plan Amazing Events with Eventra AI
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Streamline your event planning process with intelligent tools, real-time collaboration, and data-driven insights for any event type.
              </p>
              <div className="space-x-4">
                <Button size="lg" onClick={navigateToSignUp}>
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Event planning with Eventra AI" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features for Seamless Event Planning</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Eventra AI combines cutting-edge AI with intuitive tools to make your event planning process efficient and effective.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/30 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  {feature.icon}
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 md:px-6 bg-muted">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our streamlined process makes event planning efficient and stress-free.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Create Your Event</h3>
              <p className="text-muted-foreground">
                Start with basic details and let our AI help you build a comprehensive event plan.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Collaborate with Your Team</h3>
              <p className="text-muted-foreground">
                Invite team members to contribute, assign tasks, and track progress in real-time.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Host & Analyze</h3>
              <p className="text-muted-foreground">
                Execute your event and gain valuable insights from our analytics dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Join thousands of event planners who are transforming their events with Eventra AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border/30 shadow-sm">
                <CardHeader>
                  <div className="flex text-amber-400 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                      </svg>
                    ))}
                  </div>
                  <CardTitle className="text-xl italic">"{testimonial.quote}"</CardTitle>
                </CardHeader>
                <CardFooter className="pt-2">
                  <div>
                    <p className="font-medium">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-6 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Event Planning?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
            Join thousands of event planners already using Eventra AI to create exceptional experiences for all kinds of events.
          </p>
          <Button size="lg" variant="secondary" onClick={navigateToSignUp}>
            Start Planning Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}