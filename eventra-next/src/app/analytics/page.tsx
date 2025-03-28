'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
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
import { useAuth } from '@/hooks/use-auth';

export default function AnalyticsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-lg">Loading...</p>
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4 px-6">
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
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
              </Card>

              <Card>
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
                        className="w-full"
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
                          />
                        </div>
                      </div>
                      <Button 
                        className="w-full"
                        disabled={!selectedEventId}
                      >
                        Generate Analytics
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="engagement">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>
                  Visualize engagement data for your events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-12 text-muted-foreground">
                  Select an event from the Events page to view engagement metrics
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Analysis</CardTitle>
                <CardDescription>
                  Analyze feedback received for your events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-12 text-muted-foreground">
                  Select an event from the Events page to view feedback analysis
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
} 