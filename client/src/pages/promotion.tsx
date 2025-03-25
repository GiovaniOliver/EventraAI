import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, CheckCircle, Clock, Users, Zap } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function PromotionPage() {
  const [planDuration, setPlanDuration] = useState<"monthly" | "annually">("annually");
  
  const features = [
    {
      icon: <Zap className="h-12 w-12 text-primary mb-4" />,
      title: "AI-Powered Event Planning",
      description: "Leverage artificial intelligence to create, organize, and optimize your events with personalized recommendations and insights."
    },
    {
      icon: <Users className="h-12 w-12 text-primary mb-4" />,
      title: "Seamless Team Collaboration",
      description: "Collaborate with your team in real-time, assign tasks, track progress, and ensure everyone stays aligned throughout the planning process."
    },
    {
      icon: <Calendar className="h-12 w-12 text-primary mb-4" />,
      title: "Comprehensive Event Management",
      description: "Manage every aspect of your event from a centralized dashboard - from guest lists and vendors to budgets and timelines."
    },
    {
      icon: <Clock className="h-12 w-12 text-primary mb-4" />,
      title: "Time-Saving Automation",
      description: "Automate repetitive tasks and workflows to save time and reduce the risk of errors in your event planning process."
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      description: "Perfect for individuals and small events",
      monthlyPrice: 14.99,
      annualPrice: 11.99, // 20% discount
      features: [
        "Up to 5 virtual events",
        "Basic analytics",
        "Standard templates",
        "50 AI assistant calls per month",
        "Email support",
        "1 team member"
      ],
      popular: false,
      ctaText: "Get Started"
    },
    {
      name: "Professional",
      description: "Advanced features for professionals and growing businesses",
      monthlyPrice: 29.99,
      annualPrice: 23.99, // 20% discount
      features: [
        "Up to 15 virtual events",
        "Advanced analytics",
        "Premium templates",
        "Priority support",
        "Custom branding",
        "200 AI assistant calls per month",
        "3 team members"
      ],
      popular: true,
      ctaText: "Try Pro"
    },
    {
      name: "Business",
      description: "Full-featured solution for established businesses",
      monthlyPrice: 59.99,
      annualPrice: 47.99, // 20% discount
      features: [
        "Up to 50 virtual events",
        "Comprehensive analytics",
        "Team collaboration",
        "API access",
        "White labeling",
        "Custom integrations",
        "500 AI assistant calls per month",
        "10 team members"
      ],
      popular: false,
      ctaText: "Try Business"
    }
  ];

  const testimonials = [
    {
      quote: "This platform has transformed how we manage our virtual conferences. The AI suggestions have saved us countless hours of planning and improved our attendee engagement by 40%.",
      author: "Sarah J.",
      role: "Event Director",
      company: "TechCon Global"
    },
    {
      quote: "I was skeptical about using an AI assistant for event planning, but the recommendations were spot-on. It's like having an experienced event planner on your team.",
      author: "Michael T.",
      role: "Marketing Manager",
      company: "Innovate Inc."
    },
    {
      quote: "The collaborative features make it so easy for our distributed team to work together on events. Everything is centralized, and we've eliminated the endless email threads.",
      author: "Priya K.",
      role: "Community Manager",
      company: "Remote Collective"
    }
  ];

  const faqs = [
    {
      question: "How does the AI assistant help with event planning?",
      answer: "Our AI assistant analyzes your event requirements, audience demographics, and industry trends to provide personalized recommendations for event formats, schedules, content, and engagement strategies. It also helps optimize your budget allocation and suggests time-saving workflows."
    },
    {
      question: "Can I upgrade or downgrade my subscription at any time?",
      answer: "Yes, you can upgrade your subscription at any time, and the new features will be immediately available. If you downgrade, you'll continue to have access to your current plan until the end of your billing cycle, after which the new plan will take effect."
    },
    {
      question: "Is there a limit to how many team members I can add?",
      answer: "Each plan has a specific limit for team members. The Starter plan allows 1 team member, Professional allows 3, Business allows 10, and Enterprise offers unlimited team members. You can always upgrade your plan if you need to add more team members."
    },
    {
      question: "How are AI assistant calls counted?",
      answer: "An AI assistant call is counted whenever you request specific recommendations, analyses, or optimizations from the AI. Simple interactions like asking for clarification or tweaking existing recommendations don't count as additional calls."
    },
    {
      question: "Do you offer custom solutions for larger organizations?",
      answer: "Yes, our Enterprise plan offers custom solutions tailored to the specific needs of larger organizations. This includes dedicated account management, custom feature development, unlimited events and team members, and personalized onboarding support."
    },
    {
      question: "Can I try the platform before committing to a subscription?",
      answer: "Yes, we offer a 14-day free trial that gives you access to all the features in our Professional plan. No credit card is required to start your trial, and you can upgrade, downgrade, or cancel at any time."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-background to-muted">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <Badge variant="outline" className="mb-4 text-primary border-primary px-3 py-1">Limited Time Offer</Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                20% Off Annual Plans
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Transform your virtual event planning experience with our comprehensive AI-powered platform. Save time, reduce stress, and create exceptional events.
              </p>
              <div className="space-x-4">
                <Button size="lg" asChild>
                  <Link href="/pricing">
                    View Plans
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/auth">Start Free Trial</Link>
                </Button>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Virtual event planning" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Revolutionize Your Event Planning</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our platform combines cutting-edge AI with intuitive tools designed specifically for virtual event planners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/30 shadow-sm">
                <CardHeader>
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

      {/* Pricing */}
      <section className="py-20 px-4 md:px-6 bg-muted">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Special Promotional Pricing</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              For a limited time, get 20% off all annual plans. Upgrade now to lock in these savings.
            </p>
            
            <div className="flex justify-center mt-8">
              <Tabs 
                defaultValue="annually" 
                value={planDuration}
                onValueChange={(value) => setPlanDuration(value as "monthly" | "annually")}
                className="w-full max-w-md"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="annually">
                    Annually
                    <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary">Save 20%</Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`border-border/30 shadow-sm ${plan.popular ? 'border-primary shadow-lg relative' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                    Most Popular
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      ${planDuration === "annually" ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                    {planDuration === "annually" && (
                      <div className="text-primary text-sm font-medium mt-1">
                        Billed annually (${(plan.annualPrice * 12).toFixed(2)})
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"} asChild>
                    <Link href="/pricing">
                      {plan.ctaText}
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground">
              All plans include a 14-day free trial. No credit card required.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Need a custom solution? <Link href="/contact" className="text-primary underline">Contact us</Link> for Enterprise pricing.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Join thousands of event planners who are transforming their events with our platform.
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
                <CardContent>
                  <div className="mt-4">
                    <p className="font-medium">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 md:px-6 bg-muted">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Get answers to common questions about our platform and promotional offer.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-border/30 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 md:px-6 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Limited Time Offer: 20% Off Annual Plans</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
            Don't miss this opportunity to save on our comprehensive event planning platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/pricing">
                View Plans & Pricing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white hover:bg-white/10" asChild>
              <Link href="/auth">Start Free Trial</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm opacity-80">
            No credit card required. 14-day free trial. Cancel anytime.
          </p>
        </div>
      </section>
    </div>
  );
}