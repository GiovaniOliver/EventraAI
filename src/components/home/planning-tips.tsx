"use client"

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Lightbulb, Calendar, FileText } from "lucide-react";

// Define the PlanningTip type
interface PlanningTip {
  id: number;
  title: string;
  description: string;
  icon: string;
  category: string;
}

const PlanningTips = () => {
  // In a real app, this would fetch tips from an API
  const { data: tips, isLoading, error } = useQuery<PlanningTip[]>({
    queryKey: ["/api/planning-tips"],
    queryFn: async () => {
      // Mock data for demonstration purposes
      return [
        {
          id: 1,
          title: "Setting Clear Objectives",
          description: "Define your event's purpose and goals before starting the planning process.",
          icon: "tips_and_updates",
          category: "planning"
        },
        {
          id: 2,
          title: "Effective Scheduling",
          description: "Create a realistic timeline with buffer time for unexpected delays.",
          icon: "schedule",
          category: "organization"
        },
        {
          id: 3,
          title: "Post-Event Evaluation",
          description: "Gather feedback to improve future events and measure success.",
          icon: "wysiwyg",
          category: "analysis"
        },
        {
          id: 4,
          title: "Virtual Engagement",
          description: "Use interactive tools to keep remote attendees engaged throughout your event.",
          icon: "tips_and_updates",
          category: "virtual"
        }
      ];
    },
    staleTime: 60 * 1000 // 1 minute
  });
  
  // Helper function to get icon based on tip icon name
  const getTipIcon = (iconName: string) => {
    switch (iconName) {
      case 'tips_and_updates':
        return <Lightbulb className="h-5 w-5 text-secondary" />;
      case 'schedule':
        return <Calendar className="h-5 w-5 text-secondary" />;
      case 'wysiwyg':
        return <FileText className="h-5 w-5 text-secondary" />;
      default:
        return <Lightbulb className="h-5 w-5 text-secondary" />;
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-lg">Planning Tips</h3>
          <Link href="/discover" className="text-primary text-sm font-medium">
            View all
          </Link>
        </div>
        
        <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-4 flex-shrink-0 w-64">
              <Skeleton className="h-5 w-5 mb-2" />
              <Skeleton className="h-5 w-full mb-1" />
              <Skeleton className="h-4 w-3/4" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-lg">Planning Tips</h3>
          <Link href="/discover" className="text-primary text-sm font-medium">
            View all
          </Link>
        </div>
        
        <Card className="p-4">
          <p className="text-destructive">Error loading planning tips. Please try again.</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-lg">Planning Tips</h3>
        <Link href="/discover" className="text-primary text-sm font-medium">
          View all
        </Link>
      </div>
      
      <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 scrollbar-hide">
        {tips && tips.map(tip => (
          <Card key={tip.id} className="p-4 flex-shrink-0 w-64 hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-secondary mb-2">
              {getTipIcon(tip.icon)}
            </div>
            <h4 className="font-medium mb-1">{tip.title}</h4>
            <p className="text-sm text-muted-foreground">{tip.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PlanningTips;
