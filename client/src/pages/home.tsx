import QuickActions from "@/components/home/quick-actions";
import UpcomingEvents from "@/components/home/upcoming-events";
import AiSuggestions from "@/components/home/ai-suggestions";
import PlanningTips from "@/components/home/planning-tips";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";

export default function Home() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("Good day");
  
  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      setGreeting("Good morning");
    } else if (hour < 18) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);
  
  // Get first name from display name or username
  const getFirstName = () => {
    if (user?.displayName) {
      return user.displayName.split(' ')[0];
    } else if (user?.username) {
      return user.username;
    }
    return "there";
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-6">
      {/* Welcome Message */}
      <div className="mb-8 mt-2">
        <h2 className="text-3xl font-bold tracking-tight mb-1">
          {greeting}, {getFirstName()}
        </h2>
        <p className="text-muted-foreground">
          Your event planning assistant is ready to help
        </p>
      </div>
      
      {/* Quick Actions */}
      <QuickActions />
      
      {/* Upcoming Events */}
      <UpcomingEvents />
      
      {/* AI Suggestions */}
      <AiSuggestions />
      
      {/* Planning Tips */}
      <PlanningTips />
    </div>
  );
}
