'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, CheckCircle, Clock, Users, Zap, Heart, GraduationCap, Music, Gift } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Image from 'next/image'

export default function PromotionIndexPage() {
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
        "Up to 5 events",
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
        "Up to 15 events",
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
        "Up to 50 events",
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
      quote: "This platform has transformed how we manage our events and conferences. The AI suggestions have saved us countless hours of planning and improved our attendee engagement by 40%.",
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
      answer: "Yes, our Enterprise plan offers custom solutions tailored to the specific needs of larger organizations. This includes dedicated account management, custom feature development, unlimited events and team members, advanced analytics, and personalized onboarding support."
    },
    {
      question: "Can I try the platform before committing to a subscription?",
      answer: "Yes, we offer a 14-day free trial that gives you access to all the features in our Professional plan. No credit card is required to start your trial, and you can upgrade, downgrade, or cancel at any time."
    }
  ];

  const eventTypes = [
    {
      title: "Wedding Planning",
      description: "Create memorable wedding celebrations with comprehensive planning tools for couples and wedding planners.",
      icon: <Heart className="h-6 w-6" />,
      iconBg: "bg-[hsl(var(--eventra-purple))]/10",
      iconColor: "text-[hsl(var(--eventra-purple))]",
      link: "/promotion/wedding",
      image: "/wedding-planning.jpg",
    },
    {
      title: "Birthday Celebrations",
      description: "Plan spectacular birthday parties for all ages with guest management, themes, and entertainment tools.",
      icon: <Gift className="h-6 w-6" />,
      iconBg: "bg-[hsl(var(--eventra-blue))]/10",
      iconColor: "text-[hsl(var(--eventra-blue))]",
      link: "/promotion/birthday",
      image: "/birthday-planning.jpg",
    },
    {
      title: "Corporate Conferences",
      description: "Organize professional business events with registration, agenda planning, and analytics features.",
      icon: <Calendar className="h-6 w-6" />,
      iconBg: "bg-[hsl(var(--eventra-purple))]/10",
      iconColor: "text-[hsl(var(--eventra-purple))]",
      link: "/promotion/conference",
      image: "/conference-planning.jpg",
    },
    {
      title: "Fundraising Events",
      description: "Create impactful charity events with donation tracking, volunteer coordination, and impact reporting.",
      icon: <Heart className="h-6 w-6" />,
      iconBg: "bg-[hsl(var(--eventra-blue))]/10",
      iconColor: "text-[hsl(var(--eventra-blue))]",
      link: "/promotion/fundraiser",
      image: "/fundraiser-planning.jpg",
    },
    {
      title: "Music Festivals",
      description: "Plan unforgettable music experiences with artist management, multi-stage scheduling, and promotion tools.",
      icon: <Music className="h-6 w-6" />,
      iconBg: "bg-[hsl(var(--eventra-purple))]/10",
      iconColor: "text-[hsl(var(--eventra-purple))]",
      link: "/promotion/festival",
      image: "/festival-planning.jpg",
    },
    {
      title: "Educational Events",
      description: "Create engaging workshops, trainings, and conferences with instructor tools and learning assessment features.",
      icon: <GraduationCap className="h-6 w-6" />,
      iconBg: "bg-[hsl(var(--eventra-blue))]/10",
      iconColor: "text-[hsl(var(--eventra-blue))]",
      link: "/promotion/educational",
      image: "/educational-planning.jpg",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="w-full border-b border-gray-100 bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center">
            <Image 
              src="/images/eventraailogo1.png" 
              alt="EventraAI Logo" 
              width={36} 
              height={36} 
              className="h-auto w-auto object-contain mr-2 mt-0.5"
            />
            <span className="eventra-gradient-text font-semibold">EventraAI</span>
          </Link>
          
          <Link
            href="/signup"
            className="rounded-md bg-[hsl(var(--eventra-blue))] px-4 py-1.5 text-sm font-medium text-white hover:bg-[hsl(var(--eventra-purple))] transition-colors"
          >
            Start Planning
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative bg-white py-16 md:py-32 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-[hsl(var(--eventra-blue))]/5 blur-3xl"></div>
          <div className="absolute -bottom-8 -left-8 w-96 h-96 rounded-full bg-[hsl(var(--eventra-purple))]/5 blur-3xl"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8 inline-flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[hsl(var(--eventra-blue))] to-[hsl(var(--eventra-purple))] animate-pulse blur-xl opacity-30"></div>
                <div className="relative bg-white rounded-full p-4 shadow-lg">
                  <div className="flex items-center space-x-4">
                    {/* Event type icons in a circle */}
                    <div className="grid grid-flow-col gap-4">
                      <div className="rounded-full bg-[hsl(var(--eventra-blue))]/10 p-2 w-10 h-10 flex items-center justify-center">
                        <Heart className="h-5 w-5 text-[hsl(var(--eventra-blue))]" />
                      </div>
                      <div className="rounded-full bg-[hsl(var(--eventra-purple))]/10 p-2 w-10 h-10 flex items-center justify-center">
                        <Gift className="h-5 w-5 text-[hsl(var(--eventra-purple))]" />
                      </div>
                      <div className="rounded-full bg-[hsl(var(--eventra-blue))]/10 p-2 w-10 h-10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-[hsl(var(--eventra-blue))]" />
                      </div>
                      <div className="rounded-full bg-[hsl(var(--eventra-purple))]/10 p-2 w-10 h-10 flex items-center justify-center">
                        <Music className="h-5 w-5 text-[hsl(var(--eventra-purple))]" />
                      </div>
                      <div className="rounded-full bg-[hsl(var(--eventra-blue))]/10 p-2 w-10 h-10 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-[hsl(var(--eventra-blue))]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-6xl">
              The Perfect Tool for <span className="relative">
                <span className="relative z-10 eventra-gradient-text">Every Event</span>
                <span className="absolute bottom-0 left-0 w-full h-3 bg-[hsl(var(--eventra-purple))]/10 rounded-full -z-0"></span>
              </span>
            </h1>
            
            <p className="mt-8 text-xl text-gray-600 max-w-3xl mx-auto">
              EventraAI provides specialized features tailored to different types of events.
              Discover how our platform can transform your planning experience for any occasion.
            </p>
            
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Link 
                href="/signup" 
                className="rounded-md shadow-lg shadow-[hsl(var(--eventra-blue))]/10 bg-[hsl(var(--eventra-blue))] px-6 py-3 text-center text-base font-medium text-white hover:bg-[hsl(var(--eventra-purple))] transition-all hover:-translate-y-0.5"
              >
                Start Planning Now
              </Link>
              <a 
                href="#event-types" 
                className="rounded-md border border-gray-200 bg-white px-6 py-3 text-center text-base font-medium text-gray-700 hover:bg-gray-50 transition-all hover:-translate-y-0.5"
              >
                Explore Event Types
              </a>
            </div>
            
            {/* Floating benefits */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg relative">
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[hsl(var(--eventra-blue))] to-[hsl(var(--eventra-purple))] rounded-t-xl"></div>
                <Zap className="h-8 w-8 text-[hsl(var(--eventra-purple))] mb-3" />
                <h3 className="text-lg font-medium text-gray-900">Tailored Features</h3>
                <p className="text-gray-600 mt-2">Specialized tools for each event type</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg relative">
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[hsl(var(--eventra-purple))] to-[hsl(var(--eventra-blue))] rounded-t-xl"></div>
                <Clock className="h-8 w-8 text-[hsl(var(--eventra-blue))] mb-3" />
                <h3 className="text-lg font-medium text-gray-900">Time-Saving</h3>
                <p className="text-gray-600 mt-2">Optimized workflows for faster planning</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg relative">
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[hsl(var(--eventra-blue))] to-[hsl(var(--eventra-purple))] rounded-t-xl"></div>
                <Users className="h-8 w-8 text-[hsl(var(--eventra-purple))] mb-3" />
                <h3 className="text-lg font-medium text-gray-900">Collaborative</h3>
                <p className="text-gray-600 mt-2">Work together with your entire team</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event type cards */}
      <section id="event-types" className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {eventTypes.map((eventType, index) => (
              <Card 
                key={index} 
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 overflow-hidden">
                  <div className="relative h-full w-full overflow-hidden bg-gray-200">
                    <Image 
                      src={eventType.image} 
                      alt={`${eventType.title} event planning`}
                      width={400} 
                      height={200}
                      className="h-full w-full object-cover transition-transform hover:scale-105 duration-500"
                    />
                  </div>
                </div>
                <div className="p-6">
                  <div className={`mb-4 rounded-full ${eventType.iconBg} p-3 w-12 h-12 flex items-center justify-center ${eventType.iconColor}`}>
                    {eventType.icon}
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{eventType.title}</h3>
                  <p className="mb-4 text-gray-600">{eventType.description}</p>
                  <Link
                    href={eventType.link}
                    className="inline-flex items-center text-[hsl(var(--eventra-blue))] hover:text-[hsl(var(--eventra-purple))] transition-colors"
                  >
                    Learn more <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-gradient-to-r from-[hsl(var(--eventra-blue))] to-[hsl(var(--eventra-purple))] py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Ready to Begin Planning Your Event?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">
            Start with EventraAI today and discover how our specialized features can help you create exceptional events.
          </p>
          <div className="mt-8">
            <Link
              href="/signup"
              className="inline-flex items-center rounded-md bg-white px-6 py-3 text-sm font-medium text-[hsl(var(--eventra-purple))] hover:bg-gray-100"
            >
              Create Free Account <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between space-y-6 md:flex-row md:space-y-0">
            <div className="flex items-center">
              <Image 
                src="/images/eventraailogo1.png" 
                alt="EventraAI Logo" 
                width={32} 
                height={32} 
                className="h-auto w-auto object-contain mr-2"
              />
              <span className="eventra-gradient-text font-semibold">EventraAI</span>
            </div>
            
            <div className="flex space-x-6">
              <Link href="/about" className="text-sm text-gray-600 hover:text-[hsl(var(--eventra-blue))]">
                About
              </Link>
              <Link href="/blog" className="text-sm text-gray-600 hover:text-[hsl(var(--eventra-blue))]">
                Blog
              </Link>
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-[hsl(var(--eventra-blue))]">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-gray-600 hover:text-[hsl(var(--eventra-blue))]">
                Terms
              </Link>
            </div>
            
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} EventraAI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}