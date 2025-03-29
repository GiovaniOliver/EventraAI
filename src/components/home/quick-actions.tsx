"use client"

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlusCircle, CalendarCheck, CheckSquare, BarChart, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NewEventModal from "@/components/modals/new-event-modal";
import { cn } from "@/lib/utils";

const QuickActions = () => {
  const router = useRouter();
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  
  const actions = [
    {
      icon: <PlusCircle className="h-6 w-6" />,
      label: "New Event",
      onClick: () => setShowNewEventModal(true),
      bgColor: "bg-primary/10 text-primary"
    },
    {
      icon: <CalendarCheck className="h-6 w-6" />,
      label: "My Events",
      onClick: () => router.push("/events"),
      bgColor: "bg-blue-500/10 text-blue-500"
    },
    {
      icon: <CheckSquare className="h-6 w-6" />,
      label: "Tasks",
      onClick: () => router.push("/tasks"),
      bgColor: "bg-green-500/10 text-green-500"
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      label: "Analytics",
      onClick: () => router.push("/analytics"),
      bgColor: "bg-purple-500/10 text-purple-500"
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      label: "Discover",
      onClick: () => router.push("/discover"),
      bgColor: "bg-amber-500/10 text-amber-500"
    }
  ];

  return (
    <>
      <Card className="mb-6 border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {actions.map((action, index) => (
              <button
                key={index}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-lg transition-all",
                  "hover:shadow-md hover:scale-105 active:scale-95",
                  action.bgColor
                )}
                onClick={action.onClick}
              >
                {action.icon}
                <span className="text-xs font-medium mt-2 text-center">{action.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <NewEventModal 
        isOpen={showNewEventModal} 
        onClose={() => setShowNewEventModal(false)} 
      />
    </>
  );
};

export default QuickActions;
