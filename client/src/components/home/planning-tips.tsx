import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, Calendar, FileText } from "lucide-react";
import { Link } from "wouter";
import { PlanningTip } from "@shared/schema";

const PlanningTips = () => {
  const { data: tips, isLoading, error } = useQuery<PlanningTip[]>({
    queryKey: ["/api/planning-tips"]
  });
  
  // Helper function to get icon based on tip icon name
  const getTipIcon = (iconName: string) => {
    switch (iconName) {
      case 'tips_and_updates':
        return <Lightbulb className="h-5 w-5 text-secondary-500" />;
      case 'schedule':
        return <Calendar className="h-5 w-5 text-secondary-500" />;
      case 'wysiwyg':
        return <FileText className="h-5 w-5 text-secondary-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-secondary-500" />;
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-lg">Planning Tips</h3>
          <Link href="/discover" className="text-primary-500 text-sm font-medium">View all</Link>
        </div>
        
        <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 flex-shrink-0 w-64">
              <Skeleton className="h-5 w-5 mb-2" />
              <Skeleton className="h-5 w-full mb-1" />
              <Skeleton className="h-4 w-3/4" />
            </div>
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
          <Link href="/discover" className="text-primary-500 text-sm font-medium">View all</Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-red-500">Error loading planning tips. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-lg">Planning Tips</h3>
        <Link href="/discover" className="text-primary-500 text-sm font-medium">View all</Link>
      </div>
      
      <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4">
        {tips && tips.map(tip => (
          <div key={tip.id} className="bg-white rounded-xl shadow-sm p-4 flex-shrink-0 w-64">
            <div className="text-secondary-500 mb-2">
              {getTipIcon(tip.icon)}
            </div>
            <h4 className="font-medium mb-1">{tip.title}</h4>
            <p className="text-sm text-gray-500">{tip.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanningTips;
