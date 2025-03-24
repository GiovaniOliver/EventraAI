import { PlusCircle, CalendarCheck, CheckSquare } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import NewEventModal from "@/components/modals/new-event-modal";

const QuickActions = () => {
  const [, navigate] = useLocation();
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  
  const actions = [
    {
      icon: <PlusCircle className="text-primary-500 h-6 w-6 mb-2" />,
      label: "New Event",
      onClick: () => setShowNewEventModal(true)
    },
    {
      icon: <CalendarCheck className="text-primary-500 h-6 w-6 mb-2" />,
      label: "My Events",
      onClick: () => navigate("/events")
    },
    {
      icon: <CheckSquare className="text-primary-500 h-6 w-6 mb-2" />,
      label: "Tasks",
      onClick: () => navigate("/tasks")
    }
  ];

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <h3 className="font-medium text-lg mb-3">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-3">
          {actions.map((action, index) => (
            <button
              key={index}
              className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100"
              onClick={action.onClick}
            >
              {action.icon}
              <span className="text-xs text-center">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      <NewEventModal 
        isOpen={showNewEventModal} 
        onClose={() => setShowNewEventModal(false)} 
      />
    </>
  );
};

export default QuickActions;
