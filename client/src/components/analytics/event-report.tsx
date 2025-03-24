import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import type { Event, EventAnalytics, AttendeeFeedback } from '@shared/schema';
import { Separator } from '@/components/ui/separator';

// Chart colors
const COLORS = ['#5E35B1', '#3949AB', '#1E88E5', '#039BE5', '#00ACC1', '#00897B', '#43A047', '#7CB342'];

interface EventReportProps {
  event: Event;
  analytics: EventAnalytics[];
  feedback: AttendeeFeedback[];
  feedbackSummary: {
    averageOverallRating: number;
    averageContentRating: number;
    averageTechnicalRating: number;
    averageEngagementRating: number;
    recommendationPercentage: number;
    totalFeedbackCount: number;
  };
  printMode?: boolean;
}

export default function EventReport({ 
  event, 
  analytics, 
  feedback, 
  feedbackSummary,
  printMode = false 
}: EventReportProps) {
  // Format date based on print mode
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return printMode 
      ? dateObj.toISOString().split('T')[0]
      : dateObj.toLocaleDateString();
  };
  
  // Get the latest analytics data
  const latestAnalytics = analytics.length > 0
    ? analytics.sort((a, b) => 
        new Date(b.analyticsDate).getTime() - new Date(a.analyticsDate).getTime()
      )[0]
    : null;
  
  // Generate feedback distribution data for pie chart
  const getFeedbackDistribution = () => {
    if (!feedback.length) return [];
    
    const ratings = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedback.forEach(item => {
      ratings[item.overallRating as keyof typeof ratings]++;
    });
    
    return Object.entries(ratings).map(([rating, count]) => ({
      name: `${rating} Star${count !== 1 ? 's' : ''}`,
      value: count
    }));
  };
  
  // Generate engagement metrics data for charts
  const getEngagementData = () => {
    if (!analytics.length) return [];
    
    return analytics.map(item => ({
      date: formatDate(item.analyticsDate),
      engagementScore: item.engagementScore,
      attendeeCount: item.attendeeCount,
    }));
  };
  
  // Handle report printing
  const handlePrint = () => {
    window.print();
  };
  
  // Render header section of the report
  const renderHeader = () => (
    <div className={`${printMode ? 'mb-8' : 'mb-6'}`}>
      <div className="flex justify-between items-start">
        <div>
          <h1 className={`font-bold ${printMode ? 'text-2xl' : 'text-3xl'}`}>
            Event Report: {event.name}
          </h1>
          <p className="text-muted-foreground">
            {formatDate(event.date)} | {event.format} {event.type}
          </p>
        </div>
        {!printMode && (
          <Button onClick={handlePrint}>
            Export Report
          </Button>
        )}
      </div>
      <Separator className="my-4" />
    </div>
  );
  
  // Render event overview section
  const renderOverview = () => (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${printMode ? 'mb-8' : 'mb-6'}`}>
      <Card>
        <CardHeader className={printMode ? 'p-3' : undefined}>
          <CardTitle className={printMode ? 'text-lg' : undefined}>Attendance</CardTitle>
        </CardHeader>
        <CardContent className={printMode ? 'p-3 pt-0' : undefined}>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold">
              {latestAnalytics?.attendeeCount || 0}
            </span>
            <span className="text-muted-foreground">
              / {event.estimatedGuests || 0} estimated
            </span>
          </div>
          <p className="text-sm mt-1 text-muted-foreground">
            {latestAnalytics?.attendeeCount && event.estimatedGuests 
              ? `${Math.round((latestAnalytics.attendeeCount / event.estimatedGuests) * 100)}% of expected attendance`
              : 'No attendance data available'}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className={printMode ? 'p-3' : undefined}>
          <CardTitle className={printMode ? 'text-lg' : undefined}>Engagement Score</CardTitle>
        </CardHeader>
        <CardContent className={printMode ? 'p-3 pt-0' : undefined}>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold">
              {latestAnalytics?.engagementScore || 0}
            </span>
            <span className="text-muted-foreground">/ 100</span>
          </div>
          <p className="text-sm mt-1 text-muted-foreground">
            Based on attendance, interactions, and time spent
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className={printMode ? 'p-3' : undefined}>
          <CardTitle className={printMode ? 'text-lg' : undefined}>Feedback</CardTitle>
        </CardHeader>
        <CardContent className={printMode ? 'p-3 pt-0' : undefined}>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold">
              {feedbackSummary?.averageOverallRating.toFixed(1) || 0}
            </span>
            <span className="text-muted-foreground">/ 5.0 average rating</span>
          </div>
          <p className="text-sm mt-1 text-muted-foreground">
            From {feedbackSummary?.totalFeedbackCount || 0} attendee responses
          </p>
        </CardContent>
      </Card>
    </div>
  );
  
  // Render engagement metrics section with charts
  const renderEngagementMetrics = () => (
    <div className={`${printMode ? 'mb-8 page-break-after' : 'mb-6'}`}>
      <h2 className={`font-semibold ${printMode ? 'text-xl mb-4' : 'text-2xl mb-4'}`}>
        Engagement Metrics
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className={printMode ? 'p-3' : undefined}>
            <CardTitle className={printMode ? 'text-lg' : undefined}>
              Engagement Over Time
            </CardTitle>
          </CardHeader>
          <CardContent className={printMode ? 'p-3 pt-0' : undefined}>
            <div className="h-72">
              {analytics.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getEngagementData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="engagementScore"
                      stroke="#8884d8"
                      name="Engagement Score"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No engagement data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className={printMode ? 'p-3' : undefined}>
            <CardTitle className={printMode ? 'text-lg' : undefined}>
              Detailed Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className={printMode ? 'p-3 pt-0' : undefined}>
            {latestAnalytics ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Average Attendance Time</span>
                    <span className="font-medium">
                      {latestAnalytics.averageAttendanceTime} minutes
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ 
                        width: `${Math.min(100, (latestAnalytics.averageAttendanceTime / 60) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Interactions</span>
                    <span className="font-medium">
                      {latestAnalytics.totalInteractions}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Max Concurrent Users</span>
                    <span className="font-medium">
                      {latestAnalytics.maxConcurrentUsers}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ 
                        width: `${Math.min(100, (latestAnalytics.maxConcurrentUsers / (event.estimatedGuests || 1)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                {latestAnalytics.detailedMetrics && (
                  <>
                    {typeof latestAnalytics.detailedMetrics === 'string' 
                      ? JSON.parse(latestAnalytics.detailedMetrics)
                      : latestAnalytics.detailedMetrics}
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No detailed metrics available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
  
  // Render feedback analysis section
  const renderFeedbackAnalysis = () => (
    <div className={printMode ? 'mb-8' : 'mb-6'}>
      <h2 className={`font-semibold ${printMode ? 'text-xl mb-4' : 'text-2xl mb-4'}`}>
        Feedback Analysis
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className={printMode ? 'p-3' : undefined}>
            <CardTitle className={printMode ? 'text-lg' : undefined}>
              Rating Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className={printMode ? 'p-3 pt-0' : undefined}>
            <div className="h-72">
              {feedback.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getFeedbackDistribution()}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => 
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                    >
                      {getFeedbackDistribution().map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No feedback data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className={printMode ? 'p-3' : undefined}>
            <CardTitle className={printMode ? 'text-lg' : undefined}>
              Detailed Ratings
            </CardTitle>
          </CardHeader>
          <CardContent className={printMode ? 'p-3 pt-0' : undefined}>
            {feedback.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Content Quality</span>
                    <span className="font-medium">
                      {feedbackSummary.averageContentRating.toFixed(1)} / 5.0
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ 
                        width: `${(feedbackSummary.averageContentRating / 5) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Technical Quality</span>
                    <span className="font-medium">
                      {feedbackSummary.averageTechnicalRating.toFixed(1)} / 5.0
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ 
                        width: `${(feedbackSummary.averageTechnicalRating / 5) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Engagement Quality</span>
                    <span className="font-medium">
                      {feedbackSummary.averageEngagementRating.toFixed(1)} / 5.0
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ 
                        width: `${(feedbackSummary.averageEngagementRating / 5) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Would Recommend</span>
                    <span className="font-medium">
                      {feedbackSummary.recommendationPercentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ 
                        width: `${feedbackSummary.recommendationPercentage}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No feedback ratings available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
  
  // Render attendee comments section
  const renderAttendeeComments = () => {
    const commentsWithText = feedback
      .filter(item => item.comments && item.comments.trim().length > 0)
      .sort((a, b) => b.overallRating - a.overallRating);
    
    return (
      <div>
        <h2 className={`font-semibold ${printMode ? 'text-xl mb-4' : 'text-2xl mb-4'}`}>
          Attendee Comments
        </h2>
        
        {commentsWithText.length > 0 ? (
          <Card>
            <CardContent className={`${printMode ? 'p-3' : 'p-6'} space-y-4`}>
              {commentsWithText.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="font-medium">{item.attendeeEmail}</div>
                    <div className="text-sm text-muted-foreground">
                      Rating: {item.overallRating}/5
                    </div>
                  </div>
                  <p className="text-sm">{item.comments}</p>
                  {index < commentsWithText.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className={printMode ? 'p-3' : undefined}>
              <p className="text-muted-foreground py-4 text-center">
                No comments available from attendees
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };
  
  return (
    <div className={printMode ? 'print-container p-6' : 'report-container'}>
      {renderHeader()}
      {renderOverview()}
      {renderEngagementMetrics()}
      {renderFeedbackAnalysis()}
      {renderAttendeeComments()}
      
      {/* Print-specific styles */}
      {printMode && (
        <style jsx global>{`
          @media print {
            @page {
              size: portrait;
              margin: 20mm;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .page-break-after {
              page-break-after: always;
            }
          }
        `}</style>
      )}
    </div>
  );
}