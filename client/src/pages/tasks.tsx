import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Clock, CalendarCheck, Plus, CheckCircle2 } from "lucide-react";
import { Task, Event } from "@shared/schema";
import { format } from "date-fns";
import { createTask, updateTask } from "@/lib/event-service";
import { useToast } from "@/hooks/use-toast";

export default function Tasks() {
  const { toast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  
  // Fetch user events
  const { 
    data: events, 
    isLoading: isLoadingEvents, 
    error: eventsError 
  } = useQuery<Event[]>({
    queryKey: ["/api/users/1/events"]
  });
  
  // Set the first event as default selected event
  useEffect(() => {
    if (events && events.length > 0 && !selectedEventId) {
      // Find first upcoming or in-progress event
      const now = new Date();
      const upcomingEvent = events.find(
        event => new Date(event.date) > now && event.status !== 'completed' && event.status !== 'cancelled'
      );
      
      setSelectedEventId(upcomingEvent?.id || events[0].id);
    }
  }, [events, selectedEventId]);
  
  // Fetch tasks for the selected event
  const {
    data: tasks,
    isLoading: isLoadingTasks,
    error: tasksError,
    refetch: refetchTasks
  } = useQuery<Task[]>({
    queryKey: [`/api/events/${selectedEventId}/tasks`],
    enabled: !!selectedEventId
  });
  
  // Filter tasks based on selected filter
  const filteredTasks = tasks?.filter(task => {
    if (selectedFilter === "all") return true;
    return task.status === selectedFilter;
  });
  
  // Handle task status update
  const handleUpdateTaskStatus = async (taskId: number, newStatus: string) => {
    if (!selectedEventId) return;
    
    try {
      await updateTask(taskId, { 
        status: newStatus,
        eventId: selectedEventId
      });
      
      toast({
        title: "Task Updated",
        description: `Task status changed to ${newStatus}`,
      });
      
      // Refetch tasks to update the UI
      refetchTasks();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };
  
  // Create a new task (simple example)
  const handleCreateTask = async () => {
    if (!selectedEventId) return;
    
    try {
      const newTask = {
        eventId: selectedEventId,
        title: "New Task",
        description: "Task description here",
        status: "pending",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week from now
      };
      
      await createTask(newTask);
      
      toast({
        title: "Task Created",
        description: "New task has been created",
      });
      
      // Refetch tasks to update the UI
      refetchTasks();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create new task",
        variant: "destructive",
      });
    }
  };
  
  // Render task card
  const renderTaskCard = (task: Task) => {
    // Format due date if available
    const formattedDueDate = task.dueDate 
      ? format(new Date(task.dueDate), 'MMM d, yyyy')
      : 'No due date';
    
    return (
      <Card key={task.id} className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start">
            <button
              className={`mt-1 mr-3 flex-shrink-0 h-5 w-5 rounded-full border ${
                task.status === 'completed' 
                  ? 'bg-primary-500 border-primary-500' 
                  : 'border-gray-300'
              }`}
              onClick={() => handleUpdateTaskStatus(
                task.id, 
                task.status === 'completed' ? 'pending' : 'completed'
              )}
            >
              {task.status === 'completed' && (
                <Check className="h-4 w-4 text-white mx-auto" />
              )}
            </button>
            
            <div className="flex-1">
              <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                {task.title}
              </h4>
              
              {task.description && (
                <p className="text-sm text-gray-600 mt-1 mb-2">{task.description}</p>
              )}
              
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                <span>{formattedDueDate}</span>
              </div>
            </div>
            
            {task.status !== 'completed' && (
              <Select
                defaultValue={task.status}
                onValueChange={(value) => handleUpdateTaskStatus(task.id, value)}
              >
                <SelectTrigger className="w-[110px] h-8 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // Render loading skeletons
  const renderSkeletons = () => {
    return Array(3).fill(0).map((_, i) => (
      <Card key={i} className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start">
            <Skeleton className="h-5 w-5 mr-3 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-8 w-[110px]" />
          </div>
        </CardContent>
      </Card>
    ));
  };

  return (
    <div className="px-4 pt-4 pb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Tasks</h2>
        <Button size="sm" onClick={handleCreateTask}>
          <Plus className="h-4 w-4 mr-1" />
          New Task
        </Button>
      </div>
      
      {isLoadingEvents ? (
        <Skeleton className="h-10 w-full mb-6" />
      ) : eventsError ? (
        <div className="text-red-500 mb-6">Error loading events</div>
      ) : events && events.length > 0 ? (
        <div className="mb-6">
          <Select
            value={selectedEventId?.toString() || ""}
            onValueChange={(value) => setSelectedEventId(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an event" />
            </SelectTrigger>
            <SelectContent>
              {events.map(event => (
                <SelectItem key={event.id} value={event.id.toString()}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="text-center py-6 mb-6">
          <p className="text-gray-500">No events found. Create an event first.</p>
        </div>
      )}
      
      {selectedEventId && (
        <>
          <Tabs defaultValue="all" onValueChange={setSelectedFilter}>
            <TabsList className="w-full mb-6">
              <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
              <TabsTrigger value="pending" className="flex-1">Pending</TabsTrigger>
              <TabsTrigger value="in-progress" className="flex-1">In Progress</TabsTrigger>
              <TabsTrigger value="completed" className="flex-1">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value={selectedFilter}>
              {isLoadingTasks ? (
                renderSkeletons()
              ) : tasksError ? (
                <div className="text-center py-6 text-red-500">
                  Error loading tasks. Please try again.
                </div>
              ) : filteredTasks && filteredTasks.length > 0 ? (
                filteredTasks.map(renderTaskCard)
              ) : (
                <div className="text-center py-10">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">No tasks found</p>
                  <Button onClick={handleCreateTask}>Create Task</Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
