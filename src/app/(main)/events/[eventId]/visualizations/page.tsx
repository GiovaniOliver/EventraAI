import { Suspense } from "react";
import { notFound } from "next/navigation";
import VisualizationGallery from "@/components/venue-visualizations/visualization-gallery";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, HomeIcon, Sparkles } from "lucide-react";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase";
import ClientPage from "./client-page";

// Function to get event data
async function getEvent(eventId: string) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    
    // Get event data
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();
    
    if (error) {
      console.error("Error fetching event:", error);
      return null;
    }
    
    return event;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

export default async function EventVisualizationsPage({
  params
}: {
  params: { eventId: string }
}) {
  const eventId = params.eventId;
  const event = await getEvent(eventId);
  
  if (!event) {
    notFound();
  }
  
  return (
    <div className="container py-6 space-y-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">
              <HomeIcon className="h-4 w-4 mr-1" />
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/events">Events</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/events/${eventId}`}>{event.title || event.name}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/events/${eventId}/visualizations`}>
              Visualizations
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{event.title || event.name} Visualizations</h1>
          <ClientPage eventId={eventId} />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Venue Visualizations
            </CardTitle>
            <CardDescription>
              Transform your venue with AI-generated themed decorations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<VisualizationLoadingSkeleton />}>
              <VisualizationGallery eventId={eventId} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function VisualizationLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg overflow-hidden border">
            <Skeleton className="h-48 w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 