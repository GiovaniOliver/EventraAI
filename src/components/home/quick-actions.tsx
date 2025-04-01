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
      gradient: "from-[hsl(var(--eventra-teal))] to-[hsl(var(--eventra-blue))]",
      color: "text-white"
    },
    {
      icon: <CalendarCheck className="h-6 w-6" />,
      label: "My Events",
      onClick: () => router.push("/events"),
      gradient: "from-[hsl(var(--eventra-blue))] to-[hsl(var(--eventra-purple))]",
      color: "text-white"
    },
    {
      icon: <CheckSquare className="h-6 w-6" />,
      label: "Tasks",
      onClick: () => router.push("/tasks"),
      gradient: "from-[hsl(var(--eventra-teal))] to-[hsl(var(--eventra-blue))]",
      color: "text-white"
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      label: "Analytics",
      onClick: () => router.push("/analytics"),
      gradient: "from-[hsl(var(--eventra-blue))] to-[hsl(var(--eventra-purple))]",
      color: "text-white"
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      label: "Discover",
      onClick: () => router.push("/discover"),
      gradient: "from-[hsl(var(--eventra-purple))] to-[hsl(var(--eventra-blue))]",
      color: "text-white"
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
                  "bg-gradient-to-br hover:shadow-md hover:scale-105 active:scale-95",
                  action.gradient,
                  action.color
                )}
                onClick={action.onClick}
                style={{
                  boxShadow: "0 2px 10px rgba(var(--eventra-blue-rgb), 0.2)"
                }}
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
