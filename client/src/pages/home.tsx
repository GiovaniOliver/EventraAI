import QuickActions from "@/components/home/quick-actions";
import UpcomingEvents from "@/components/home/upcoming-events";
import AiSuggestions from "@/components/home/ai-suggestions";
import PlanningTips from "@/components/home/planning-tips";

export default function Home() {
  return (
    <div className="home-screen px-4 pt-4 pb-6">
      {/* Welcome Message */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-1">Good morning, Alex</h2>
        <p className="text-gray-600">Your event planning assistant is ready to help</p>
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
