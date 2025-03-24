import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Clock, CalendarCheck, Plus, CheckCircle2, Calendar } from "lucide-react";
import { Task, Event } from "@shared/schema";
import { format } from "date-fns";
import { createTask, updateTask } from "@/lib/event-service";
import { useToast } from "@/hooks/use-toast";

export default function Tasks() {
  const { toast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "pending"
  });
  
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
  
  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (data: any) => {
      return createTask(data);
    },
    onSuccess: () => {
      toast({
        title: "Task Created",
        description: "Your task has been successfully created"
      });
      setShowNewTaskDialog(false);
      setNewTask({
        title: "",
        description: "",
        dueDate: "",
        status: "pending"
      });
      // Refetch tasks list
      refetchTasks();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      });
      console.error("Error creating task:", error);
    }
  });
  
  // Handle opening the "Create Task" dialog
  const handleOpenNewTaskDialog = () => {
    if (!selectedEventId) {
      toast({
        title: "Select an Event",
        description: "Please select an event before creating a task",
        variant: "destructive"
      });
      return;
    }
    
    setShowNewTaskDialog(true);
  };
  
  // Handle create task submission
  const handleCreateTask = () => {
    if (!selectedEventId) return;
    
    if (!newTask.title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a title for the task",
        variant: "destructive"
      });
      return;
    }
    
    // Format date properly if provided
    let taskToCreate: any = { 
      ...newTask,
      eventId: selectedEventId
    };
    
    if (taskToCreate.dueDate) {
      taskToCreate.dueDate = new Date(taskToCreate.dueDate).toISOString();
    }
    
    createTaskMutation.mutate(taskToCreate);
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
        <Button size="sm" onClick={handleOpenNewTaskDialog}>
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
                  <Button onClick={handleOpenNewTaskDialog}>Create Task</Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
      
      {/* New Task Dialog */}
      <Dialog open={showNewTaskDialog} onOpenChange={setShowNewTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a task to your event
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                placeholder="Enter task title"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="task-description">Description (Optional)</Label>
              <Textarea
                id="task-description"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Enter task description"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="task-status">Status</Label>
              <Select
                value={newTask.status}
                onValueChange={(value) => setNewTask({...newTask, status: value})}
              >
                <SelectTrigger id="task-status" className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="task-due-date">Due Date (Optional)</Label>
              <div className="flex items-center mt-1">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <Input
                  id="task-due-date"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowNewTaskDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask}>
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
