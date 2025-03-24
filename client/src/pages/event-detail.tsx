import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  MapPin,
  Edit,
  Trash2,
  CheckCircle,
  X,
  Plus,
  ArrowLeft,
  Sparkles,
  Share2,
  MoreVertical,
  Tag,
  CalendarClock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Event, Task, Guest } from "@shared/schema";
import { updateEvent, deleteEvent, createTask, updateTask, createGuest } from "@/lib/event-service";
import { useToast } from "@/hooks/use-toast";
import { getAiSuggestions, getEventImprovements, ImprovementSuggestion } from "@/lib/ai-service";

export default function EventDetail() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/events/:id");
  const eventId = match ? parseInt(params.id) : null;
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState<Partial<Event>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [showAddGuestDialog, setShowAddGuestDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "pending"
  });
  const [newGuest, setNewGuest] = useState({
    name: "",
    email: "",
    status: "invited"
  });
  const [suggestedTasks, setSuggestedTasks] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [improvementSuggestions, setImprovementSuggestions] = useState<ImprovementSuggestion[]>([]);
  const [isLoadingImprovements, setIsLoadingImprovements] = useState(false);
  
  // Fetch event details
  const {
    data: event,
    isLoading: isLoadingEvent,
    error: eventError,
    refetch: refetchEvent
  } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId
  });
  
  // Fetch tasks for this event
  const {
    data: tasks,
    isLoading: isLoadingTasks,
    error: tasksError,
    refetch: refetchTasks
  } = useQuery<Task[]>({
    queryKey: [`/api/events/${eventId}/tasks`],
    enabled: !!eventId
  });
  
  // Fetch guests for this event
  const {
    data: guests = [],
    isLoading: isLoadingGuests,
    error: guestsError
  } = useQuery<any[]>({
    queryKey: [`/api/events/${eventId}/guests`],
    enabled: !!eventId
  });
  
  // Update editable event state when event data is loaded
  useEffect(() => {
    if (event) {
      setEditedEvent({
        name: event.name,
        description: event.description,
        format: event.format,
        type: event.type,
        date: event.date,
        budget: event.budget,
        estimatedGuests: event.estimatedGuests,
        theme: event.theme,
        status: event.status
      });
    }
  }, [event]);
  
  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: (data: Partial<Event>) => {
      return updateEvent(eventId!, data);
    },
    onSuccess: () => {
      toast({
        title: "Event Updated",
        description: "Your event has been successfully updated"
      });
      setIsEditing(false);
      refetchEvent();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive"
      });
      console.error("Error updating event:", error);
    }
  });
  
  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: () => {
      return deleteEvent(eventId!);
    },
    onSuccess: () => {
      toast({
        title: "Event Deleted",
        description: "Your event has been successfully deleted"
      });
      navigate("/events");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive"
      });
      console.error("Error deleting event:", error);
    }
  });
  
  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (data: any) => {
      return createTask({
        ...data,
        eventId: eventId
      });
    },
    onSuccess: () => {
      toast({
        title: "Task Created",
        description: "Your task has been successfully created"
      });
      setShowAddTaskDialog(false);
      setNewTask({
        title: "",
        description: "",
        dueDate: "",
        status: "pending"
      });
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
  
  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: number, status: string }) => {
      return updateTask(taskId, { status, eventId: eventId });
    },
    onSuccess: () => {
      refetchTasks();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive"
      });
      console.error("Error updating task status:", error);
    }
  });
  
  // Handle task completion toggle
  const handleToggleTaskCompletion = (taskId: number, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    updateTaskMutation.mutate({ taskId, status: newStatus });
  };
  
  // Handle save event
  const handleSaveEvent = () => {
    if (!eventId) return;
    
    // Format date properly if it's a string
    let dataToSubmit: any = { ...editedEvent };
    if (typeof dataToSubmit.date === 'string') {
      dataToSubmit.date = new Date(dataToSubmit.date).toISOString();
    }
    
    updateEventMutation.mutate(dataToSubmit);
  };
  
  // Handle delete event
  const handleDeleteEvent = () => {
    if (!eventId) return;
    deleteEventMutation.mutate();
  };
  
  // Handle create task
  const handleCreateTask = () => {
    if (!eventId) return;
    
    // Format date properly if provided
    let taskToCreate: any = { ...newTask };
    if (taskToCreate.dueDate) {
      taskToCreate.dueDate = new Date(taskToCreate.dueDate).toISOString();
    }
    
    createTaskMutation.mutate(taskToCreate);
  };
  
  // Handle generating AI task suggestions
  const handleGenerateTaskSuggestions = async () => {
    if (!event) return;
    
    setIsLoadingSuggestions(true);
    try {
      const suggestions = await getAiSuggestions(
        event.type,
        event.theme || undefined,
        event.budget || undefined,
        {
          format: event.format as any,
          guestCount: event.estimatedGuests || undefined
        }
      );
      
      if (suggestions.tasks && suggestions.tasks.length > 0) {
        setSuggestedTasks(suggestions.tasks);
      } else {
        toast({
          title: "No Suggestions",
          description: "Couldn't generate task suggestions for this event type"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate task suggestions",
        variant: "destructive"
      });
      console.error("Error generating task suggestions:", error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };
  
  // Add suggested task
  const handleAddSuggestedTask = (task: any) => {
    if (!eventId) return;
    
    createTaskMutation.mutate({
      title: task.title,
      description: task.description,
      status: "pending",
      eventId: eventId,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null
    });
  };
  
  // Handle generating AI improvement suggestions
  const handleGenerateImprovementSuggestions = async () => {
    if (!event) return;
    
    setIsLoadingImprovements(true);
    try {
      const improvements = await getEventImprovements(event);
      
      if (improvements && improvements.length > 0) {
        setImprovementSuggestions(improvements);
        toast({
          title: "AI Assistant",
          description: `Generated ${improvements.length} suggestions to improve your event`
        });
      } else {
        toast({
          title: "No Suggestions",
          description: "Couldn't generate improvement suggestions for this event"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate improvement suggestions",
        variant: "destructive"
      });
      console.error("Error generating improvement suggestions:", error);
    } finally {
      setIsLoadingImprovements(false);
    }
  };
  
  // Create guest mutation
  const createGuestMutation = useMutation({
    mutationFn: (data: any) => {
      return createGuest({
        ...data,
        eventId: eventId
      });
    },
    onSuccess: () => {
      toast({
        title: "Guest Added",
        description: "The guest has been successfully added to the event"
      });
      setShowAddGuestDialog(false);
      setNewGuest({
        name: "",
        email: "",
        status: "invited"
      });
      // Refetch guests list
      const guestsQueryKey = [`/api/events/${eventId}/guests`];
      queryClient.invalidateQueries({ queryKey: guestsQueryKey });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add guest",
        variant: "destructive"
      });
      console.error("Error adding guest:", error);
    }
  });
  
  // Handle create guest
  const handleCreateGuest = () => {
    if (!eventId) return;
    
    if (!newGuest.name.trim() || !newGuest.email.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide name and email for the guest",
        variant: "destructive"
      });
      return;
    }
    
    createGuestMutation.mutate({
      name: newGuest.name,
      email: newGuest.email,
      status: newGuest.status,
      eventId: eventId
    });
  };
  
  // If event is not found
  if (!isLoadingEvent && !event && !eventError) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <h2 className="text-xl font-semibold mb-4">Event Not Found</h2>
        <p className="text-gray-500 mb-6">The event you're looking for doesn't exist or has been deleted.</p>
        <Button onClick={() => navigate("/events")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
      </div>
    );
  }
  
  // Format date and time for display
  const formatEventDate = (dateValue: string | Date) => {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    return format(date, 'MMMM d, yyyy');
  };
  
  const formatEventTime = (dateValue: string | Date) => {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    return format(date, 'h:mm a');
  };
  
  // Get event status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="px-4 pt-4 pb-24">
      {/* Back button */}
      <Button 
        variant="ghost" 
        className="mb-4 -ml-2 text-gray-500"
        onClick={() => navigate("/events")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Events
      </Button>
      
      {isLoadingEvent ? (
        // Loading skeleton
        <div>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-6" />
          <Skeleton className="h-[200px] w-full mb-6" />
        </div>
      ) : eventError ? (
        // Error state
        <div className="text-center py-10">
          <div className="text-red-500 mb-4">Error loading event details</div>
          <Button onClick={() => refetchEvent()}>Retry</Button>
        </div>
      ) : event && (
        // Event details content
        <>
          <div className="flex flex-wrap justify-between items-start mb-6">
            <div className="flex-1 mr-4">
              {isEditing ? (
                // Edit mode title
                <div className="mb-4">
                  <Label htmlFor="name" className="mb-1 block">Event Name</Label>
                  <Input 
                    id="name"
                    value={editedEvent.name || ''}
                    onChange={(e) => setEditedEvent({...editedEvent, name: e.target.value})}
                    className="mb-2"
                  />
                </div>
              ) : (
                // Display mode title
                <>
                  <h1 className="text-2xl font-bold">{event.name}</h1>
                  <div className="flex items-center mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(event.status)}`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      {event.format.charAt(0).toUpperCase() + event.format.slice(1)}
                    </span>
                  </div>
                </>
              )}
            </div>
            
            {/* Actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(!isEditing)}>
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? "Cancel Editing" : "Edit Event"}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Event
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Event details or edit form */}
          <Card className="mb-6">
            <CardContent className={`${isEditing ? 'pt-6' : 'p-6'}`}>
              {isEditing ? (
                // Edit form
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="description" className="mb-1 block">Description</Label>
                    <Textarea 
                      id="description"
                      value={editedEvent.description || ''}
                      onChange={(e) => setEditedEvent({...editedEvent, description: e.target.value})}
                      className="mb-2 min-h-[100px]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="date" className="mb-1 block">Date & Time</Label>
                      <Input 
                        id="date"
                        type="datetime-local"
                        value={editedEvent.date ? new Date(editedEvent.date).toISOString().slice(0, 16) : ''}
                        onChange={(e) => setEditedEvent({...editedEvent, date: new Date(e.target.value)})}
                        className="mb-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="budget" className="mb-1 block">Budget ($)</Label>
                      <Input 
                        id="budget"
                        type="number"
                        value={editedEvent.budget || ''}
                        onChange={(e) => setEditedEvent({...editedEvent, budget: Number(e.target.value)})}
                        className="mb-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="guests" className="mb-1 block">Estimated Guests</Label>
                      <Input 
                        id="guests"
                        type="number"
                        value={editedEvent.estimatedGuests || ''}
                        onChange={(e) => setEditedEvent({...editedEvent, estimatedGuests: Number(e.target.value)})}
                        className="mb-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="theme" className="mb-1 block">Theme</Label>
                      <Input 
                        id="theme"
                        value={editedEvent.theme || ''}
                        onChange={(e) => setEditedEvent({...editedEvent, theme: e.target.value})}
                        className="mb-2"
                      />
                    </div>
                  </div>
                  
                  <div className="col-span-1 md:col-span-2 flex justify-end space-x-2 mt-4">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveEvent}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                // Display mode
                <div>
                  {event.description ? (
                    <p className="text-gray-700 mb-6">{event.description}</p>
                  ) : (
                    <p className="text-gray-400 italic mb-6">No description provided</p>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-sm mb-1 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" /> Date
                      </span>
                      <span className="font-medium">{formatEventDate(event.date)}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-sm mb-1 flex items-center">
                        <Clock className="h-4 w-4 mr-1" /> Time
                      </span>
                      <span className="font-medium">{formatEventTime(event.date)}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-sm mb-1 flex items-center">
                        <Tag className="h-4 w-4 mr-1" /> Type
                      </span>
                      <span className="font-medium capitalize">{event.type}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-sm mb-1 flex items-center">
                        <Users className="h-4 w-4 mr-1" /> Guests
                      </span>
                      <span className="font-medium">{event.estimatedGuests || 'Not specified'}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-sm mb-1 flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" /> Budget
                      </span>
                      <span className="font-medium">
                        {event.budget ? `$${event.budget}` : 'Not specified'}
                      </span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-sm mb-1 flex items-center">
                        <Sparkles className="h-4 w-4 mr-1" /> Theme
                      </span>
                      <span className="font-medium">
                        {event.theme || 'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Event details tabs */}
          <Tabs defaultValue="tasks" className="mb-6">
            <TabsList className="w-full">
              <TabsTrigger value="tasks" className="flex-1">Tasks</TabsTrigger>
              <TabsTrigger value="guests" className="flex-1">Guests</TabsTrigger>
              <TabsTrigger value="budget" className="flex-1">Budget</TabsTrigger>
            </TabsList>
            
            {/* Tasks tab */}
            <TabsContent value="tasks">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Event Tasks</h3>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleGenerateTaskSuggestions}
                    disabled={isLoadingSuggestions}
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    {isLoadingSuggestions ? 'Generating...' : 'Suggest Tasks'}
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setShowAddTaskDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Task
                  </Button>
                </div>
              </div>
              
              {/* AI suggested tasks */}
              {suggestedTasks.length > 0 && (
                <div className="mb-6">
                  <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
                    <h4 className="font-medium mb-2 flex items-center text-primary-700">
                      <Sparkles className="h-4 w-4 mr-1" />
                      AI Suggested Tasks
                    </h4>
                    <div className="space-y-2">
                      {suggestedTasks.map((task, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                          <div className="flex-1">
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-gray-600">{task.description}</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAddSuggestedTask(task)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Task list */}
              {isLoadingTasks ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="flex items-start">
                          <Skeleton className="h-5 w-5 mr-3 rounded-full" />
                          <div className="flex-1">
                            <Skeleton className="h-5 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-3 w-1/3" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : tasksError ? (
                <div className="text-center py-6 text-red-500">
                  Error loading tasks. Please try again.
                </div>
              ) : tasks && tasks.length > 0 ? (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <Card key={task.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start">
                          <button
                            className={`mt-1 mr-3 flex-shrink-0 h-5 w-5 rounded-full border ${
                              task.status === 'completed' 
                                ? 'bg-primary-500 border-primary-500' 
                                : 'border-gray-300'
                            }`}
                            onClick={() => handleToggleTaskCompletion(
                              task.id, 
                              task.status
                            )}
                          >
                            {task.status === 'completed' && (
                              <CheckCircle className="h-4 w-4 text-white mx-auto" />
                            )}
                          </button>
                          
                          <div className="flex-1">
                            <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                              {task.title}
                            </h4>
                            
                            {task.description && (
                              <p className={`text-sm mt-1 mb-2 ${task.status === 'completed' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {task.description}
                              </p>
                            )}
                            
                            {task.dueDate && (
                              <div className="flex items-center text-xs text-gray-500">
                                <CalendarClock className="h-3 w-3 mr-1" />
                                <span>Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="text-gray-400 mb-4">No tasks yet</div>
                  <Button onClick={() => setShowAddTaskDialog(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add First Task
                  </Button>
                </div>
              )}
            </TabsContent>
            
            {/* Guests tab */}
            <TabsContent value="guests">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Guest List</h3>
                <Button 
                  size="sm"
                  onClick={() => setShowAddGuestDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Guest
                </Button>
              </div>
              
              {isLoadingGuests ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="flex items-center">
                          <Skeleton className="h-8 w-8 rounded-full mr-3" />
                          <div className="flex-1">
                            <Skeleton className="h-5 w-1/3 mb-1" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                          <Skeleton className="h-6 w-16 rounded" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : guestsError ? (
                <div className="text-center py-6 text-red-500">
                  Error loading guests. Please try again.
                </div>
              ) : guests && guests.length > 0 ? (
                <div className="space-y-4">
                  {guests.map((guest: any) => (
                    <Card key={guest.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center">
                          <div className="bg-primary-100 text-primary-600 h-8 w-8 rounded-full flex items-center justify-center mr-3">
                            {guest.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{guest.name}</h4>
                            <p className="text-sm text-gray-500">{guest.email}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            guest.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : guest.status === 'declined' 
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {guest.status}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="text-gray-400 mb-4">No guests added yet</div>
                  <Button onClick={() => setShowAddGuestDialog(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add First Guest
                  </Button>
                </div>
              )}
            </TabsContent>
            
            {/* Budget tab */}
            <TabsContent value="budget">
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">Budget tracking coming soon</p>
                {event.budget ? (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-center mb-4">Total Budget</h3>
                      <div className="text-3xl font-bold text-center text-primary-600">${event.budget}</div>
                    </CardContent>
                  </Card>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Set Budget
                  </Button>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          {/* AI Event Improvement Assistant */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                AI Event Assistant
              </h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleGenerateImprovementSuggestions}
                disabled={isLoadingImprovements}
              >
                {isLoadingImprovements ? 'Generating...' : 'Get Event Recommendations'}
              </Button>
            </div>
            
            {improvementSuggestions.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Sparkles className="h-8 w-8 mb-2 mx-auto text-primary/60" />
                  <h4 className="text-lg font-medium mb-2">Event Improvement Suggestions</h4>
                  <p className="text-gray-500 mb-4">
                    Get AI-powered recommendations to enhance your virtual event experience.
                  </p>
                  <Button 
                    onClick={handleGenerateImprovementSuggestions}
                    disabled={isLoadingImprovements}
                  >
                    {isLoadingImprovements ? 'Generating...' : 'Generate Suggestions'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {improvementSuggestions.map((suggestion, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1 ${
                          suggestion.impact === 'high' ? 'bg-red-100 text-red-600' : 
                          suggestion.impact === 'medium' ? 'bg-amber-100 text-amber-600' : 
                          'bg-green-100 text-green-600'
                        }`}>
                          {suggestion.impact === 'high' ? (
                            <ArrowTrendingUp className="h-4 w-4" />
                          ) : suggestion.impact === 'medium' ? (
                            <ArrowRight className="h-4 w-4" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-semibold">{suggestion.title}</h5>
                            <Badge variant="outline" className="capitalize">
                              {suggestion.area}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                          
                          <Collapsible>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm" className="px-0 h-auto text-xs">
                                <ChevronDown className="h-3 w-3 mr-1" />
                                Implementation Details
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="mt-2 border-l-2 border-gray-200 pl-4 text-sm text-gray-600">
                                <p className="mb-2">{suggestion.implementation}</p>
                                {suggestion.resources && suggestion.resources.length > 0 && (
                                  <div className="mt-2">
                                    <p className="font-medium text-xs uppercase text-gray-500 mb-1">Resources</p>
                                    <ul className="list-disc list-inside text-primary space-y-1">
                                      {suggestion.resources.map((resource, i) => (
                                        <li key={i}>{resource}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEvent}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add task dialog */}
      <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a new task for your event
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                placeholder="Enter task title"
              />
            </div>
            
            <div>
              <Label htmlFor="task-description">Description (Optional)</Label>
              <Textarea
                id="task-description"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Enter task description"
              />
            </div>
            
            <div>
              <Label htmlFor="task-due-date">Due Date (Optional)</Label>
              <Input
                id="task-due-date"
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTaskDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask}>
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add guest dialog */}
      <Dialog open={showAddGuestDialog} onOpenChange={setShowAddGuestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Guest</DialogTitle>
            <DialogDescription>
              Invite a new guest to your event
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="guest-name">Guest Name</Label>
              <Input
                id="guest-name"
                value={newGuest.name}
                onChange={(e) => setNewGuest({...newGuest, name: e.target.value})}
                placeholder="Enter guest name"
              />
            </div>
            
            <div>
              <Label htmlFor="guest-email">Email Address</Label>
              <Input
                id="guest-email"
                type="email"
                value={newGuest.email}
                onChange={(e) => setNewGuest({...newGuest, email: e.target.value})}
                placeholder="Enter guest email"
              />
            </div>
            
            <div>
              <Label htmlFor="guest-status">Status</Label>
              <select
                id="guest-status"
                className="w-full p-2 border rounded mt-1"
                value={newGuest.status}
                onChange={(e) => setNewGuest({...newGuest, status: e.target.value})}
              >
                <option value="invited">Invited</option>
                <option value="confirmed">Confirmed</option>
                <option value="declined">Declined</option>
                <option value="tentative">Tentative</option>
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddGuestDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateGuest}>
              Add Guest
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}