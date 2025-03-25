import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { CheckCircle, ArrowRight, Users, Award, Heart, Zap, Shield, LifeBuoy } from "lucide-react";

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Alex Johnson",
      role: "Founder & CEO",
      bio: "Former event director with 15 years of experience in corporate and social events.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
      name: "Maria Rodriguez",
      role: "Chief Product Officer",
      bio: "Tech leader passionate about creating user-friendly planning solutions.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
      name: "James Chen",
      role: "Head of AI Development",
      bio: "AI specialist focused on creating intelligent planning recommendations.",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
      name: "Sarah Williams",
      role: "Customer Success Director",
      bio: "Dedicated to ensuring clients maximize value from our platform.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    }
  ];

  const values = [
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: "User-Centered",
      description: "We put our users at the center of everything we build, focusing on their needs and experiences."
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Innovation",
      description: "We continuously explore new technologies and approaches to solve event planning challenges."
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Reliability",
      description: "We build robust, dependable tools that event planners can count on when it matters most."
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Collaboration",
      description: "We believe in the power of teamwork, both within our company and for our users' planning processes."
    },
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      title: "Excellence",
      description: "We strive for the highest quality in our platform, service, and support."
    },
    {
      icon: <LifeBuoy className="h-8 w-8 text-primary" />,
      title: "Support",
      description: "We're committed to providing outstanding assistance to help our users succeed."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-background to-muted">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Our Mission
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                At Eventra AI, we're building the future of event planning with AI-powered tools that make creating exceptional events of all types accessible to everyone.
              </p>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <p>Simplify the event planning process with intuitive tools</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <p>Leverage AI to provide personalized recommendations</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <p>Enable seamless collaboration between team members</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <p>Increase attendee engagement through data-driven insights</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Our team collaborating" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Story</h2>
            <div className="w-20 h-1 bg-primary mx-auto mb-8"></div>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <p>
              Founded in 2023, our platform emerged from a simple observation: virtual event planning was unnecessarily complex and stressful. Our team of event industry veterans and technology experts came together with a shared vision to revolutionize how virtual events are planned and executed.
            </p>
            <p>
              We recognized that while virtual events offer incredible opportunities for global reach and engagement, the tools available to planners weren't evolving quickly enough to meet their needs. Fragmented solutions, tedious manual processes, and a lack of collaborative features were making event planning more difficult than it needed to be.
            </p>
            <p>
              Our answer was to create an all-in-one platform that combines the power of artificial intelligence with user-friendly tools designed specifically for the needs of modern event planners. By focusing on intuitive workflows, real-time collaboration, and data-driven insights, we've built a solution that transforms the event planning experience.
            </p>
            <p>
              Today, we're proud to serve thousands of event planners worldwide, from individual professionals to large enterprise teams. Our platform helps them create seamless, engaging virtual events while saving time, reducing stress, and increasing attendee satisfaction.
            </p>
            <p>
              As we continue to grow, our commitment remains the same: to empower event professionals with innovative tools that make their work easier and more effective, allowing them to focus on what truly matters – creating exceptional experiences for their attendees.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 px-4 md:px-6 bg-muted">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              These core principles guide everything we do, from product development to customer support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-border/30 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="mb-4">{value.icon}</div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              The passionate people behind our mission to transform event planning.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <div className="rounded-full overflow-hidden w-48 h-48 mx-auto mb-4">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                <p className="text-primary font-medium mb-2">{member.role}</p>
                <p className="text-muted-foreground">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 md:px-6 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Us on Our Mission</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
            Experience the difference our platform can make for your next virtual event.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white hover:bg-white/10" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}