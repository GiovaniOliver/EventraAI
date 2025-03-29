'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks';
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart, Loader2, PieChart, LineChart, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  // Extract event ID from URL if present
  const eventId = searchParams.get('eventId');
  
  const [selectedEventId, setSelectedEventId] = useState(eventId);
  const [attendeeData, setAttendeeData] = useState({
    totalAttendees: 0,
    averageTimeSpent: 0,
    interactions: 0,
    maxConcurrentUsers: 0
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAttendeeData(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--manako-purple))] mx-auto mb-4" />
          <p className="text-white/70">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="pb-20 md:pb-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="py-6 md:py-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-white/20 p-2 rounded-full">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Analytics</h2>
        </div>
        <p className="text-white/70 text-sm">
          Track and analyze your event performance
        </p>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-3 bg-white/10 text-white">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-[hsl(var(--manako-purple))]">
            Overview
          </TabsTrigger>
          <TabsTrigger value="engagement" className="data-[state=active]:bg-white data-[state=active]:text-[hsl(var(--manako-purple))]">
            Engagement
          </TabsTrigger>
          <TabsTrigger value="feedback" className="data-[state=active]:bg-white data-[state=active]:text-[hsl(var(--manako-purple))]">
            Feedback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="manako-card">
              <CardHeader>
                <CardTitle>Event Analytics</CardTitle>
                <CardDescription>
                  Key metrics for your events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Total Events</p>
                    <p className="text-lg font-bold">0</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Upcoming Events</p>
                    <p className="text-lg font-bold">0</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Average Attendance</p>
                    <p className="text-lg font-bold">0</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Average Engagement</p>
                    <p className="text-lg font-bold">0%</p>
                  </div>
                </div>
              </CardContent>
            </div>

            <div className="manako-card">
              <CardHeader>
                <CardTitle>Generate Analytics</CardTitle>
                <CardDescription>
                  Create analytics for a specific event
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Select an event to view its analytics</p>
                    <Button 
                      onClick={() => router.push('/events')}
                      className="manako-button w-full"
                    >
                      Go to Events
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Or generate sample analytics</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="totalAttendees" className="text-sm font-medium">
                          Total Attendees
                        </label>
                        <Input
                          id="totalAttendees"
                          name="totalAttendees"
                          type="number"
                          value={attendeeData.totalAttendees || ''}
                          onChange={handleInputChange}
                          className="bg-white/10 border-white/10 text-foreground placeholder:text-muted-foreground focus-visible:ring-[hsl(var(--manako-purple))]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="averageTimeSpent" className="text-sm font-medium">
                          Avg. Time Spent (minutes)
                        </label>
                        <Input
                          id="averageTimeSpent"
                          name="averageTimeSpent"
                          type="number"
                          value={attendeeData.averageTimeSpent || ''}
                          onChange={handleInputChange}
                          className="bg-white/10 border-white/10 text-foreground placeholder:text-muted-foreground focus-visible:ring-[hsl(var(--manako-purple))]"
                        />
                      </div>
                    </div>
                    <Button 
                      className="manako-button w-full"
                      disabled={!selectedEventId}
                    >
                      Generate Analytics
                    </Button>
                  </div>
                </div>
              </CardContent>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="engagement">
          <div className="manako-card">
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
              <CardDescription>
                Visualize engagement data for your events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart className="h-16 w-16 text-[hsl(var(--manako-purple))] mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">
                  Select an event from the Events page to view engagement metrics
                </p>
                <Button 
                  onClick={() => router.push('/events')}
                  className="manako-button"
                >
                  View Your Events
                </Button>
              </div>
            </CardContent>
          </div>
        </TabsContent>

        <TabsContent value="feedback">
          <div className="manako-card">
            <CardHeader>
              <CardTitle>Feedback Analysis</CardTitle>
              <CardDescription>
                Analyze feedback received for your events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <PieChart className="h-16 w-16 text-[hsl(var(--manako-purple))] mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">
                  No feedback data available yet. Select an event to view attendee feedback.
                </p>
                <Button 
                  onClick={() => router.push('/events')}
                  className="manako-button"
                >
                  View Your Events
                </Button>
              </div>
            </CardContent>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 