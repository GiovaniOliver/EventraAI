import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import Layout from '@/components/layout/layout';
import { getEventAnalytics, getEventFeedback, getEventFeedbackSummary, generateEventAnalytics } from '@/lib/analytics-service';
import { getEvent } from '@/lib/event-service';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

// Mock color config for charts
const COLORS = ['#5E35B1', '#3949AB', '#1E88E5', '#039BE5', '#00ACC1', '#00897B', '#43A047', '#7CB342'];

interface AnalyticsPageProps {}

export default function AnalyticsPage() {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  
  // Extract event ID from URL if present
  const params = new URLSearchParams(location.split('?')[1]);
  const eventId = params.get('eventId') ? parseInt(params.get('eventId')!) : null;
  
  const [selectedEventId, setSelectedEventId] = useState<number | null>(eventId);
  const [attendeeData, setAttendeeData] = useState({
    totalAttendees: 0,
    averageTimeSpent: 0,
    interactions: 0,
    maxConcurrentUsers: 0
  });
  
  // Get event details if an event is selected
  const eventQuery = useQuery({
    queryKey: ['/api/events', selectedEventId],
    queryFn: () => selectedEventId ? getEvent(selectedEventId) : null,
    enabled: !!selectedEventId
  });
  
  // Get analytics data for the selected event
  const analyticsQuery = useQuery({
    queryKey: ['/api/events/analytics', selectedEventId],
    queryFn: () => selectedEventId ? getEventAnalytics(selectedEventId) : [],
    enabled: !!selectedEventId
  });
  
  // Get feedback for the selected event
  const feedbackQuery = useQuery({
    queryKey: ['/api/events/feedback', selectedEventId],
    queryFn: () => selectedEventId ? getEventFeedback(selectedEventId) : [],
    enabled: !!selectedEventId
  });
  
  // Get feedback summary for the selected event
  const feedbackSummaryQuery = useQuery({
    queryKey: ['/api/events/feedback-summary', selectedEventId],
    queryFn: () => selectedEventId ? getEventFeedbackSummary(selectedEventId) : null,
    enabled: !!selectedEventId
  });
  
  // Mutation for generating new analytics data
  const generateAnalyticsMutation = useMutation({
    mutationFn: (data: { event: any, attendeeData: any }) => 
      generateEventAnalytics(data.event, data.attendeeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events/analytics', selectedEventId] });
      toast({
        title: "Analytics Generated",
        description: "Event analytics have been successfully generated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate analytics. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleGenerateAnalytics = () => {
    if (!eventQuery.data) return;
    
    generateAnalyticsMutation.mutate({
      event: eventQuery.data,
      attendeeData
    });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAttendeeData(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };
  
  // Format analytics data for charts
  const getEngagementData = () => {
    if (!analyticsQuery.data?.length) return [];
    
    return analyticsQuery.data.map(item => ({
      date: new Date(item.analyticsDate).toLocaleDateString(),
      engagementScore: item.engagementScore,
      attendeeCount: item.attendeeCount,
      interactions: item.totalInteractions
    }));
  };
  
  const getFeedbackDistribution = () => {
    if (!feedbackQuery.data?.length) return [];
    
    const ratings = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedbackQuery.data.forEach(feedback => {
      ratings[feedback.overallRating as keyof typeof ratings]++;
    });
    
    return Object.entries(ratings).map(([rating, count]) => ({
      name: `${rating} Star${count !== 1 ? 's' : ''}`,
      value: count
    }));
  };
  
  const renderAnalyticsForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>Generate Post-Event Analytics</CardTitle>
        <CardDescription>
          Enter the attendance data to generate analytics for this event
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="interactions" className="text-sm font-medium">
                Total Interactions
              </label>
              <Input
                id="interactions"
                name="interactions"
                type="number"
                value={attendeeData.interactions || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="maxConcurrentUsers" className="text-sm font-medium">
                Max Concurrent Users
              </label>
              <Input
                id="maxConcurrentUsers"
                name="maxConcurrentUsers"
                type="number"
                value={attendeeData.maxConcurrentUsers || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleGenerateAnalytics}
          disabled={generateAnalyticsMutation.isPending || Object.values(attendeeData).some(val => val === 0)}
        >
          {generateAnalyticsMutation.isPending ? "Generating..." : "Generate Analytics"}
        </Button>
      </CardFooter>
    </Card>
  );
  
  const renderEngagementChart = () => (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Engagement Metrics</CardTitle>
        <CardDescription>
          Event engagement over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={getEngagementData()}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="engagementScore"
                stroke="#8884d8"
                name="Engagement Score"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="attendeeCount"
                stroke="#82ca9d"
                name="Attendee Count"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
  
  const renderFeedbackChart = () => (
    <Card>
      <CardHeader>
        <CardTitle>Feedback Rating Distribution</CardTitle>
        <CardDescription>
          Rating distribution from attendee feedback
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={getFeedbackDistribution()}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {getFeedbackDistribution().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
  
  const renderFeedbackSummary = () => {
    if (!feedbackSummaryQuery.data) return null;
    
    const summary = feedbackSummaryQuery.data;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feedback Summary</CardTitle>
          <CardDescription>
            Summary of all attendee feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Overall Rating</span>
                <span className="text-2xl font-bold">
                  {summary.averageOverallRating.toFixed(1)} / 5.0
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Total Feedback</span>
                <span className="text-2xl font-bold">
                  {summary.totalFeedbackCount}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Content Rating</span>
                <span className="text-sm font-medium">
                  {summary.averageContentRating.toFixed(1)} / 5.0
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${(summary.averageContentRating / 5) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Technical Rating</span>
                <span className="text-sm font-medium">
                  {summary.averageTechnicalRating.toFixed(1)} / 5.0
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${(summary.averageTechnicalRating / 5) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Engagement Rating</span>
                <span className="text-sm font-medium">
                  {summary.averageEngagementRating.toFixed(1)} / 5.0
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${(summary.averageEngagementRating / 5) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Would Recommend</span>
                <span className="text-sm font-medium">
                  {summary.recommendationPercentage.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${summary.recommendationPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const renderFeedbackTable = () => (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Attendee Feedback</CardTitle>
        <CardDescription>
          Detailed feedback from event attendees
        </CardDescription>
      </CardHeader>
      <CardContent>
        {feedbackQuery.data?.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Overall Rating</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Technical</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Recommend</TableHead>
                <TableHead>Comments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedbackQuery.data.map((feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell>{feedback.attendeeEmail}</TableCell>
                  <TableCell>{feedback.overallRating}/5</TableCell>
                  <TableCell>{feedback.contentRating || 'N/A'}</TableCell>
                  <TableCell>{feedback.technicalRating || 'N/A'}</TableCell>
                  <TableCell>{feedback.engagementRating || 'N/A'}</TableCell>
                  <TableCell>{feedback.wouldRecommend ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="max-w-xs truncate">{feedback.comments || 'No comments'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4">
            <p>No feedback data available for this event.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
  
  const renderEvent = () => {
    if (!selectedEventId) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h2 className="text-2xl font-bold mb-4">No Event Selected</h2>
          <p className="text-muted-foreground mb-4">
            Please select an event from the Events page to view its analytics.
          </p>
          <Button onClick={() => window.location.href = '/events'}>
            Go to Events
          </Button>
        </div>
      );
    }
    
    if (eventQuery.isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      );
    }
    
    if (eventQuery.isError || !eventQuery.data) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The selected event could not be found or loaded.
          </p>
          <Button onClick={() => window.location.href = '/events'}>
            Go to Events
          </Button>
        </div>
      );
    }
    
    const event = eventQuery.data;
    const isCompletedEvent = event.status === 'completed';
    
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{event.name}</h1>
          <p className="text-muted-foreground">
            {new Date(event.date).toLocaleDateString()} - {event.format} {event.type}
          </p>
        </div>
        
        <Tabs defaultValue={isCompletedEvent ? "analytics" : "generate"}>
          <TabsList>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="generate">Generate</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analytics" className="space-y-6">
            {analyticsQuery.isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-80 col-span-2" />
                <Skeleton className="h-80" />
              </div>
            ) : analyticsQuery.data?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {renderEngagementChart()}
                {renderFeedbackSummary()}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No Analytics Data</h3>
                <p className="text-muted-foreground mb-4">
                  This event doesn't have any analytics data yet. 
                  {isCompletedEvent 
                    ? " Use the Generate tab to create post-event analytics."
                    : " Analytics will be available once the event is completed."}
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="feedback" className="space-y-6">
            {feedbackQuery.isLoading ? (
              <Skeleton className="h-96 w-full" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFeedbackChart()}
                {renderFeedbackSummary()}
                {renderFeedbackTable()}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="generate">
            {isCompletedEvent ? (
              renderAnalyticsForm()
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">Event Not Completed</h3>
                <p className="text-muted-foreground mb-4">
                  Analytics generation is only available for completed events.
                </p>
                <Button onClick={() => window.location.href = `/events?id=${event.id}`}>
                  Go to Event Details
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  };
  
  return (
    <Layout currentPath="/analytics">
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Analytics &amp; Reporting</h1>
          <p className="text-muted-foreground">
            View event performance metrics and post-event reports
          </p>
        </div>
        
        {renderEvent()}
      </div>
    </Layout>
  );
}