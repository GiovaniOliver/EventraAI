"use client"

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Lightbulb, 
  Calendar, 
  FileText, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  Bell, 
  Target, 
  ExternalLink,
  BookOpen, 
  RefreshCw,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// Define the PlanningTip type
interface PlanningTip {
  id: number;
  title: string;
  description: string;
  icon: string;
  category: string;
}

const PlanningTips = () => {
  // Fetch planning tips from API
  const { data: tips, isLoading, error } = useQuery<PlanningTip[]>({
    queryKey: ["/api/planning-tips"],
    queryFn: async () => {
      // Only use mock data if explicitly in development mode with the NEXT_PUBLIC_USE_MOCK_DATA flag
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
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
      }
      
      try {
        const response = await fetch('/api/content/planning-tips', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching planning tips: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Failed to fetch planning tips:', error);
        throw error;
      }
    },
    staleTime: 60 * 1000 // 1 minute
  });
  
  // Helper function to get icon and color based on tip icon name and category
  const getTipStyle = (iconName: string, category: string) => {
    const styles = {
      icon: <Lightbulb className="h-5 w-5" />,
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-blue-300',
      textColor: 'text-blue-700 dark:text-blue-300',
      borderColor: 'border-blue-300 dark:border-blue-700',
      hoverBorderColor: 'group-hover:border-blue-400 dark:group-hover:border-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-950',
      iconBgColor: 'bg-blue-50 dark:bg-blue-900',
      dividerColor: 'border-blue-200/50 dark:border-blue-800/50',
      badgeBgColor: 'bg-blue-100/80 dark:bg-blue-900/80'
    };
    
    // Set icon based on the icon name
    switch (iconName) {
      case 'tips_and_updates':
        styles.icon = <Lightbulb className="h-5 w-5" />;
        break;
      case 'schedule':
        styles.icon = <Calendar className="h-5 w-5" />;
        break;
      case 'wysiwyg':
        styles.icon = <FileText className="h-5 w-5" />;
        break;
      case 'check_circle':
        styles.icon = <CheckCircle className="h-5 w-5" />;
        break;
      case 'alarm':
        styles.icon = <Clock className="h-5 w-5" />;
        break;
      case 'notifications':
        styles.icon = <Bell className="h-5 w-5" />;
        break;
      default:
        styles.icon = <Sparkles className="h-5 w-5" />;
    }
    
    // Set colors based on category
    switch (category) {
      case 'planning':
        styles.gradientFrom = 'from-indigo-500';
        styles.gradientTo = 'to-indigo-300';
        styles.textColor = 'text-indigo-700 dark:text-indigo-300';
        styles.borderColor = 'border-indigo-300 dark:border-indigo-700';
        styles.hoverBorderColor = 'group-hover:border-indigo-400 dark:group-hover:border-indigo-600';
        styles.bgColor = 'bg-indigo-100 dark:bg-indigo-950';
        styles.iconBgColor = 'bg-indigo-50 dark:bg-indigo-900';
        styles.dividerColor = 'border-indigo-200/50 dark:border-indigo-800/50';
        styles.badgeBgColor = 'bg-indigo-100/80 dark:bg-indigo-900/80';
        break;
      case 'organization':
        styles.gradientFrom = 'from-emerald-500';
        styles.gradientTo = 'to-emerald-300';
        styles.textColor = 'text-emerald-700 dark:text-emerald-300';
        styles.borderColor = 'border-emerald-300 dark:border-emerald-700';
        styles.hoverBorderColor = 'group-hover:border-emerald-400 dark:group-hover:border-emerald-600';
        styles.bgColor = 'bg-emerald-100 dark:bg-emerald-950';
        styles.iconBgColor = 'bg-emerald-50 dark:bg-emerald-900';
        styles.dividerColor = 'border-emerald-200/50 dark:border-emerald-800/50';
        styles.badgeBgColor = 'bg-emerald-100/80 dark:bg-emerald-900/80';
        break;
      case 'analysis':
        styles.gradientFrom = 'from-purple-500';
        styles.gradientTo = 'to-purple-300';
        styles.textColor = 'text-purple-700 dark:text-purple-300';
        styles.borderColor = 'border-purple-300 dark:border-purple-700';
        styles.hoverBorderColor = 'group-hover:border-purple-400 dark:group-hover:border-purple-600';
        styles.bgColor = 'bg-purple-100 dark:bg-purple-950';
        styles.iconBgColor = 'bg-purple-50 dark:bg-purple-900';
        styles.dividerColor = 'border-purple-200/50 dark:border-purple-800/50';
        styles.badgeBgColor = 'bg-purple-100/80 dark:bg-purple-900/80';
        break;
      case 'virtual':
        styles.gradientFrom = 'from-amber-500';
        styles.gradientTo = 'to-amber-300';
        styles.textColor = 'text-amber-700 dark:text-amber-300';
        styles.borderColor = 'border-amber-300 dark:border-amber-700';
        styles.hoverBorderColor = 'group-hover:border-amber-400 dark:group-hover:border-amber-600';
        styles.bgColor = 'bg-amber-100 dark:bg-amber-950';
        styles.iconBgColor = 'bg-amber-50 dark:bg-amber-900';
        styles.dividerColor = 'border-amber-200/50 dark:border-amber-800/50';
        styles.badgeBgColor = 'bg-amber-100/80 dark:bg-amber-900/80';
        break;
      default:
        styles.gradientFrom = 'from-blue-500';
        styles.gradientTo = 'to-blue-300';
        styles.textColor = 'text-blue-700 dark:text-blue-300';
        styles.borderColor = 'border-blue-300 dark:border-blue-700';
        styles.hoverBorderColor = 'group-hover:border-blue-400 dark:group-hover:border-blue-600';
        styles.bgColor = 'bg-blue-100 dark:bg-blue-950';
        styles.iconBgColor = 'bg-blue-50 dark:bg-blue-900';
        styles.dividerColor = 'border-blue-200/50 dark:border-blue-800/50';
        styles.badgeBgColor = 'bg-blue-100/80 dark:bg-blue-900/80';
    }
    
    return styles;
  };

  if (isLoading) {
    return (
      <div className="my-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Planning Tips & Best Practices
          </h3>
          <Link href="/discover" className="text-primary text-sm font-medium hover:underline flex items-center group transition-all">
            View all <ExternalLink className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="p-5 border-border shadow-sm overflow-hidden">
              <div className="flex items-center mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-3 flex-1">
                  <Skeleton className="h-5 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-1.5" />
              <Skeleton className="h-4 w-5/6 mb-1.5" />
              <Skeleton className="h-4 w-4/6 mb-5" />
              <Skeleton className="h-px w-full mb-3" />
              <div className="flex justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Planning Tips & Best Practices
          </h3>
          <Link href="/discover" className="text-primary text-sm font-medium hover:underline flex items-center">
            View all <ExternalLink className="h-3.5 w-3.5 ml-1" />
          </Link>
        </div>
        
        <Card className="p-6 border-destructive/20 bg-destructive/5 shadow-sm">
          <div className="flex items-start">
            <div className="bg-destructive/10 rounded-full p-2">
              <Lightbulb className="h-5 w-5 text-destructive" />
            </div>
            <div className="ml-4">
              <p className="text-destructive font-medium">Error loading planning tips</p>
              <p className="text-destructive/80 text-sm mt-1">We couldn't load the planning tips. Please try refreshing the page.</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="mt-4 border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="my-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Planning Tips & Best Practices
        </h3>
        <Link 
          href="/discover" 
          className="text-primary font-medium text-sm hover:underline flex items-center gap-1 group transition-all px-2 py-1 rounded-md hover:bg-primary/5"
          aria-label="View all planning tips"
        >
          View all <ExternalLink className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tips && tips.map(tip => {
          const { 
            icon, 
            textColor, 
            gradientFrom, 
            gradientTo, 
            borderColor, 
            hoverBorderColor,
            bgColor, 
            iconBgColor,
            dividerColor,
            badgeBgColor
          } = getTipStyle(tip.icon, tip.category);
          
          return (
            <Card 
              key={tip.id} 
              className={cn(
                "group overflow-hidden transition-all duration-300",
                "border shadow-sm hover:shadow-md",
                borderColor,
                hoverBorderColor,
                "hover:translate-y-[-3px]"
              )}
            >
              <div className="p-5">
                <div className="flex items-start">
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full",
                    "bg-gradient-to-br",
                    gradientFrom,
                    gradientTo,
                    "shadow-sm"
                  )}>
                    <div className="text-white">
                      {icon}
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-foreground" id={`tip-title-${tip.id}`}>{tip.title}</h4>
                    <span className={cn(
                      "text-xs font-medium uppercase tracking-wider mt-1 inline-block px-2 py-0.5 rounded-full",
                      textColor,
                      badgeBgColor
                    )}>
                      {tip.category}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mt-3" id={`tip-desc-${tip.id}`}>
                  {tip.description}
                </p>
              </div>
              
              <div className={cn(
                "px-5 py-3 border-t flex justify-end items-center",
                dividerColor,
                iconBgColor
              )}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "p-0 h-auto bg-transparent hover:bg-transparent",
                    textColor
                  )}
                  aria-label={`Read more about ${tip.title}`}
                  aria-describedby={`tip-title-${tip.id} tip-desc-${tip.id}`}
                >
                  <span className="text-xs flex items-center">
                    Read more <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PlanningTips;
