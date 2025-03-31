"use client"

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks";
import { Event } from "@/lib/supabase";
import { createEvent, createTask } from "@/lib/event-service";
import { getAiSuggestions, TaskSuggestion } from "@/lib/ai-service";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

import {
  ArrowRight,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  PencilRuler,
  LayoutList,
  Sparkles,
  Settings,
  AlertTriangle,
  CheckCircle2,
  MoveRight,
  Lightbulb,
  Calendar as CalendarIcon,
  ArrowRightCircle,
  BarChart,
  Award,
  Search,
  Globe,
  Video,
  UserCheck,
  Play,
  MessageSquare,
  ThumbsUp,
  Target
} from "lucide-react";

interface PlanningWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

// Event types with descriptions
const EVENT_TYPES = [
  {
    id: "conference",
    name: "Conference",
    description: "A formal event for discussions, presentations, and networking",
    icon: <Globe className="h-5 w-5" />
  },
  {
    id: "webinar",
    name: "Webinar",
    description: "An online seminar focusing on educational content",
    icon: <Video className="h-5 w-5" />
  },
  {
    id: "workshop",
    name: "Workshop",
    description: "Interactive session for skill development and learning",
    icon: <PencilRuler className="h-5 w-5" />
  },
  {
    id: "meetup",
    name: "Meetup",
    description: "Casual gathering for networking and discussions",
    icon: <UserCheck className="h-5 w-5" />
  },
  {
    id: "product_launch",
    name: "Product Launch",
    description: "Event to showcase and introduce a new product or service",
    icon: <Play className="h-5 w-5" />
  }
];

// Event formats with descriptions
const EVENT_FORMATS = [
  {
    id: "virtual",
    name: "Virtual",
    description: "Fully online event with remote participation"
  },
  {
    id: "in-person",
    name: "In-Person",
    description: "Traditional physical event at a venue"
  },
  {
    id: "hybrid",
    name: "Hybrid",
    description: "Combination of in-person and virtual participation"
  }
];

// Steps in the wizard
type WizardStep = 
  | "basics" 
  | "details" 
  | "audience" 
  | "planning" 
  | "tasks" 
  | "review";

export default function PlanningWizard({ isOpen, onClose }: PlanningWizardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>("basics");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [autoTasksEnabled, setAutoTasksEnabled] = useState(true);
  const [suggestedTasks, setSuggestedTasks] = useState<TaskSuggestion[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Form data
  const [eventData, setEventData] = useState<Partial<Event>>({
    title: "",
    type: "conference",
    format: "virtual",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    status: "planning",
    budget: null,
    description: "",
    estimatedGuests: 50,
    userId: user?.id || 1,
  });

  // Step data
  const stepProgress = {
    basics: 0,
    details: 20,
    audience: 40,
    planning: 60,
    tasks: 80,
    review: 100
  };

  // Update progress when step changes
  useEffect(() => {
    setProgress(stepProgress[currentStep]);
  }, [currentStep]);

  // Reset wizard state when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep("basics");
      setEventData({
        title: "",
        type: "conference",
        format: "virtual",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: "planning",
        budget: null,
        description: "",
        estimatedGuests: 50,
        userId: user?.id || 1,
      });
      setSuggestedTasks([]);
      setSelectedTasks([]);
      setAutoTasksEnabled(true);
    }
  }, [isOpen, user?.id]);

  // Get AI suggestions for tasks
  const getAiTaskSuggestions = async () => {
    if (!eventData.type) return;
    
    setLoadingSuggestions(true);
    
    try {
      // Only use mock data if explicitly in development mode with the NEXT_PUBLIC_USE_MOCK_DATA flag
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockSuggestions = [
          {
            title: "Contact and book venue",
            description: "Secure your event location by contacting and finalizing venue booking",
            priority: "high",
            dueDate: new Date(new Date(eventData.date || new Date()).getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            title: "Create and send invitations",
            description: "Design and distribute invitations to all guests",
            priority: "high",
            dueDate: new Date(new Date(eventData.date || new Date()).getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            title: "Arrange catering services",
            description: "Select and book a catering company for the event",
            priority: "medium",
            dueDate: new Date(new Date(eventData.date || new Date()).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            title: "Hire event photographer",
            description: "Book a professional photographer to capture the event",
            priority: "medium",
            dueDate: new Date(new Date(eventData.date || new Date()).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            title: "Prepare event timeline",
            description: "Create a detailed schedule for the day of the event",
            priority: "medium",
            dueDate: new Date(new Date(eventData.date || new Date()).getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            title: "Confirm attendance with guests",
            description: "Follow up with all invitees who haven't responded",
            priority: "high",
            dueDate: new Date(new Date(eventData.date || new Date()).getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ];
        
        setSuggestedTasks(mockSuggestions);
        setLoadingSuggestions(false);
        return;
      }
      
      // Call the AI API to generate task suggestions
      const response = await fetch('/api/ai/generate-checklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: eventData.type,
          eventDate: eventData.date,
          guestCount: eventData.estimatedGuests,
          format: eventData.format,
          budget: eventData.budget
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error generating task suggestions: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSuggestedTasks(data.tasks);
    } catch (error) {
      console.error('Failed to get AI task suggestions:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate task suggestions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Get AI suggestions when reaching the tasks step
  useEffect(() => {
    if (currentStep === "tasks" && autoTasksEnabled && suggestedTasks.length === 0) {
      getAiTaskSuggestions();
    }
  }, [currentStep, autoTasksEnabled, suggestedTasks.length]);

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (data: any) => createTask(data),
    onSuccess: () => {
      console.log("Task created successfully");
    },
    onError: (error) => {
      console.error("Error creating task:", error);
    }
  });

  // Helper to convert relative dates to actual dates
  const parseDueDate = (relativeDate: string, eventDate: Date): Date | null => {
    try {
      // If it's a valid date string, use it directly
      if (!isNaN(Date.parse(relativeDate))) {
        return new Date(relativeDate);
      }
      
      // Handle relative dates
      const eventTime = eventDate.getTime();
      
      // Match patterns like "30 days before event" or "2 weeks after event"
      const match = relativeDate.match(/(\d+)\s+(day|days|week|weeks|month|months)\s+(before|after)\s+event/i);
      if (match) {
        const amount = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        const direction = match[3].toLowerCase();
        
        let milliseconds = 0;
        
        // Convert unit to milliseconds
        if (unit === 'day' || unit === 'days') {
          milliseconds = amount * 24 * 60 * 60 * 1000;
        } else if (unit === 'week' || unit === 'weeks') {
          milliseconds = amount * 7 * 24 * 60 * 60 * 1000;
        } else if (unit === 'month' || unit === 'months') {
          milliseconds = amount * 30 * 24 * 60 * 60 * 1000; // Approximate
        }
        
        // Apply direction
        if (direction === 'before') {
          return new Date(eventTime - milliseconds);
        } else {
          return new Date(eventTime + milliseconds);
        }
      }
      
      // Default to event date if we can't parse
      return eventDate;
    } catch (error) {
      console.error("Error parsing date:", error);
      return eventDate; // Default to event date
    }
  };

  // Helper to create tasks for an event
  const createTasksForEvent = async (eventId: number) => {
    if (!suggestedTasks.length || !selectedTasks.length || !eventData.date) return;
    
    // Process only selected tasks
    const tasksToCreate = suggestedTasks
      .filter(task => selectedTasks.includes(task.title))
      .map(task => {
        // Convert relative date string to actual Date object
        const parsedDueDate = parseDueDate(task.dueDate, new Date(eventData.date as Date));
        
        return {
          title: task.title,
          description: task.description,
          eventId: eventId,
          status: "pending",
          dueDate: parsedDueDate,
          assignedTo: null
        };
      });
    
    console.log(`Creating ${tasksToCreate.length} tasks for event ${eventId}`);
    
    // Create each task sequentially
    for (const taskData of tasksToCreate) {
      try {
        console.log("Submitting task data:", taskData);
        await createTaskMutation.mutateAsync(taskData);
      } catch (error) {
        console.error("Error creating task:", error);
      }
    }
  };

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: (data: Partial<Event>) => createEvent(data),
    onSuccess: async (createdEvent) => {
      // Invalidate events query to refetch latest data
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/events`] });
      
      // Create associated tasks if any were selected
      if (selectedTasks.length > 0) {
        try {
          await createTasksForEvent(createdEvent.id);
        } catch (error) {
          console.error("Error creating tasks:", error);
          // Continue anyway as the event was created successfully
        }
      }
      
      toast({
        title: "Event Created",
        description: "Your event has been successfully created"
      });
      
      // Navigate to the event detail page
      router.push(`/events/${createdEvent.id}`);
      
      // Close the wizard
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive"
      });
      console.error("Error creating event:", error);
      setIsLoading(false);
    }
  });

  // Handle creating event
  const handleCreateEvent = async () => {
    setIsLoading(true);
    
    try {
      console.log("Submitting event data:", eventData);
      createEventMutation.mutate(eventData);
    } catch (error) {
      console.error("Error creating event:", error);
      setIsLoading(false);
    }
  };

  // Handle next step
  const handleNextStep = () => {
    // Validation logic
    if (currentStep === "basics") {
      if (!eventData.title?.trim()) {
        toast({
          title: "Missing Information",
          description: "Please enter an event name",
          variant: "destructive"
        });
        return;
      }
      setCurrentStep("details");
    } else if (currentStep === "details") {
      setCurrentStep("audience");
    } else if (currentStep === "audience") {
      setCurrentStep("planning");
    } else if (currentStep === "planning") {
      setCurrentStep("tasks");
    } else if (currentStep === "tasks") {
      setCurrentStep("review");
    }
  };

  // Handle previous step
  const handlePreviousStep = () => {
    if (currentStep === "details") {
      setCurrentStep("basics");
    } else if (currentStep === "audience") {
      setCurrentStep("details");
    } else if (currentStep === "planning") {
      setCurrentStep("audience");
    } else if (currentStep === "tasks") {
      setCurrentStep("planning");
    } else if (currentStep === "review") {
      setCurrentStep("tasks");
    }
  };

  // Handle task selection
  const handleTaskSelection = (taskId: string) => {
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId));
    } else {
      setSelectedTasks([...selectedTasks, taskId]);
    }
  };

  // Format date for display
  const formatEventDate = (dateInput: Date | string | null | undefined) => {
    if (!dateInput) return "No date set";
    try {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      return format(date, 'MMMM d, yyyy h:mm a');
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col overflow-hidden border border-border shadow-lg">
        <DialogHeader className="pb-2 bg-gradient-to-r from-primary/5 to-background border-b border-border/40">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-primary/80 to-primary p-2.5 rounded-lg shadow-sm mr-4">
              <CalendarIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-foreground">Event Planning Wizard</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Create and organize your perfect event with our step-by-step guidance
              </DialogDescription>
            </div>
          </div>
          <div className="mt-4">
            <Progress 
              value={progress} 
              className="h-2.5 rounded-full bg-muted/50" 
              aria-label={`Progress: ${progress}% complete`}
            />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className={progress >= 20 ? "text-primary font-medium" : ""}>Getting started</span>
              </span>
              <span className="flex items-center gap-1">
                <span className={progress >= 40 && progress < 80 ? "text-primary font-medium" : ""}>Event details</span>
              </span>
              <span className="flex items-center gap-1">
                <span className={progress >= 80 ? "text-primary font-medium" : ""}>Finalize</span>
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Step 1: Event Basics */}
          {currentStep === "basics" && (
            <div className="space-y-6 p-1">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <span className="flex items-center justify-center bg-gradient-to-r from-primary/80 to-primary text-primary-foreground h-7 w-7 rounded-full text-sm font-bold">1</span>
                <span className="text-xl">Event Basics</span>
              </h3>
              
              <div className="space-y-6 mt-2">
                <div className="bg-muted/30 p-4 rounded-lg border border-border/60 shadow-sm">
                  <Label htmlFor="event-name" className="text-base font-medium">
                    What's the name of your event?
                  </Label>
                  <Input
                    id="event-name"
                    placeholder="Enter event name"
                    className="mt-2 bg-background shadow-sm transition-colors focus-visible:ring-primary"
                    value={eventData.title || ""}
                    onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                    aria-required="true"
                  />
                  <p className="text-sm text-muted-foreground mt-2 flex items-center">
                    <Lightbulb className="h-4 w-4 mr-1.5 text-amber-500" />
                    Choose a clear, descriptive name that reflects the purpose of your event
                  </p>
                </div>
                
                <div className="space-y-3 pt-2">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary/80" />
                    What type of event are you planning?
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {EVENT_TYPES.map((type) => (
                      <div
                        key={type.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                          eventData.type === type.id
                            ? "border-primary bg-gradient-to-r from-primary/5 to-primary/10 shadow-sm"
                            : "hover:border-primary/50 hover:bg-muted/30"
                        }`}
                        onClick={() => setEventData({ ...eventData, type: type.id })}
                        role="radio"
                        aria-checked={eventData.type === type.id}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setEventData({ ...eventData, type: type.id });
                          }
                        }}
                      >
                        <div className="flex items-start">
                          <div className={`p-2.5 rounded-full ${
                            eventData.type === type.id 
                              ? "bg-gradient-to-r from-primary/80 to-primary text-primary-foreground shadow-inner" 
                              : "bg-muted text-muted-foreground"
                          } transition-all`}>
                            {type.icon}
                          </div>
                          <div className="ml-3">
                            <h4 className="font-medium">{type.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                          </div>
                          {eventData.type === type.id && (
                            <CheckCircle className="ml-auto text-primary h-5 w-5" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3 pt-2">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary/80" />
                    How will your event be delivered?
                  </Label>
                  <RadioGroup 
                    value={eventData.format || "virtual"}
                    onValueChange={(value) => setEventData({ ...eventData, format: value })}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2"
                  >
                    {EVENT_FORMATS.map((format) => (
                      <div key={format.id} className="space-y-2">
                        <Label
                          htmlFor={format.id}
                          className={`flex flex-col items-center justify-between rounded-md border-2 bg-popover p-4 transition-all hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                            eventData.format === format.id
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-muted hover:border-primary/30"
                          }`}
                        >
                          <RadioGroupItem
                            value={format.id}
                            id={format.id}
                            className="sr-only"
                          />
                          <div className="text-center space-y-2">
                            <h4 className="font-medium">{format.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {format.description}
                            </p>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Event Details */}
          {currentStep === "details" && (
            <div className="space-y-6 p-1">
              <h3 className="text-lg font-medium flex items-center">
                <span className="bg-primary/10 p-1 rounded-full mr-2 text-primary text-sm">2</span>
                Event Details
              </h3>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="event-description" className="text-base">
                    Describe your event
                  </Label>
                  <Textarea
                    id="event-description"
                    placeholder="What is your event about? What can attendees expect?"
                    className="mt-1.5 min-h-[100px]"
                    value={eventData.description || ""}
                    onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    A clear description helps attendees understand the value and purpose of your event
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="event-date" className="text-base">
                    When will your event take place?
                  </Label>
                  <div className="flex items-center mt-1.5">
                    <Input
                      id="event-date"
                      type="datetime-local"
                      value={
                        eventData.date
                          ? new Date(eventData.date).toISOString().slice(0, 16)
                          : ""
                      }
                      onChange={(e) =>
                        setEventData({
                          ...eventData,
                          date: new Date(e.target.value),
                        })
                      }
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {eventData.format === "virtual"
                      ? "For virtual events, choose a time that works across different time zones"
                      : "Select a date that gives you enough time for preparation and promotion"}
                  </p>
                </div>
                
                {eventData.format === "virtual" && (
                  <div className="rounded-md bg-amber-50 border border-amber-200 p-4">
                    <div className="flex">
                      <Lightbulb className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-800">Event Tip</h4>
                        <p className="text-sm text-amber-700">
                          Consider testing your technology 24-48 hours before the event to ensure 
                          everything works properly and to familiarize yourself with the features.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Audience & Participants */}
          {currentStep === "audience" && (
            <div className="space-y-6 p-1">
              <h3 className="text-lg font-medium flex items-center">
                <span className="bg-primary/10 p-1 rounded-full mr-2 text-primary text-sm">3</span>
                Audience & Participants
              </h3>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="guest-count" className="text-base">
                    How many attendees are you expecting?
                  </Label>
                  <div className="grid grid-cols-4 gap-4 mt-1.5">
                    {[10, 25, 50, 100].map((count) => (
                      <button
                        key={count}
                        type="button"
                        className={`py-2 px-4 border rounded-md text-center ${
                          eventData.estimatedGuests === count
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-input hover:bg-accent hover:text-accent-foreground"
                        }`}
                        onClick={() => setEventData({ ...eventData, estimatedGuests: count })}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center mt-4">
                    <Input
                      id="guest-count"
                      type="number"
                      min="1"
                      placeholder="Or enter custom number"
                      value={eventData.estimatedGuests || ""}
                      onChange={(e) =>
                        setEventData({
                          ...eventData,
                          estimatedGuests: parseInt(e.target.value) || undefined,
                        })
                      }
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    This helps with planning resources and choosing the right platform capacity
                  </p>
                </div>

                {eventData.format === "virtual" && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Technology Considerations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-start">
                        <span className="p-1 rounded-full bg-primary/10 mr-2">
                          <Users className="h-3.5 w-3.5 text-primary" />
                        </span>
                        <span>
                          For <strong>{eventData.estimatedGuests}</strong> attendees, ensure your virtual platform 
                          supports this capacity without performance issues
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="p-1 rounded-full bg-primary/10 mr-2">
                          <Settings className="h-3.5 w-3.5 text-primary" />
                        </span>
                        <span>
                          Consider whether you need breakout rooms, Q&A features, or interactive polls
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="p-1 rounded-full bg-primary/10 mr-2">
                          <AlertTriangle className="h-3.5 w-3.5 text-primary" />
                        </span>
                        <span>
                          Have a backup plan ready in case of technical difficulties
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div>
                  <Label htmlFor="event-budget" className="text-base">
                    What's your estimated budget for this event? (Optional)
                  </Label>
                  <div className="flex items-center mt-1.5">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="event-budget"
                        type="number"
                        className="pl-7"
                        placeholder="Enter amount"
                        value={eventData.budget || ""}
                        onChange={(e) =>
                          setEventData({
                            ...eventData,
                            budget: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Setting a budget helps with planning and resource allocation
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Planning Approach */}
          {currentStep === "planning" && (
            <div className="space-y-6 p-1">
              <h3 className="text-lg font-medium flex items-center">
                <span className="bg-primary/10 p-1 rounded-full mr-2 text-primary text-sm">4</span>
                Planning Approach
              </h3>
              
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  Let's personalize your planning experience to make your {eventData.type} event a success
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-primary/20">
                    <CardHeader className="pb-2">
                      <div className="flex items-center">
                        <Sparkles className="h-5 w-5 text-primary mr-2" />
                        <CardTitle className="text-base">AI-Powered Planning</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground">
                        Let our AI assistant suggest tasks and timelines based on your event details
                      </p>
                      <div className="flex items-center space-x-2 mt-4">
                        <Checkbox 
                          id="auto-tasks" 
                          checked={autoTasksEnabled} 
                          onCheckedChange={(checked) => setAutoTasksEnabled(checked === true)}
                        />
                        <label
                          htmlFor="auto-tasks"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Automatically generate task suggestions
                        </label>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center">
                        <LayoutList className="h-5 w-5 text-muted-foreground mr-2" />
                        <CardTitle className="text-base">Key Planning Areas</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <Badge variant="outline" className="mr-1">Content Planning</Badge>
                        <Badge variant="outline" className="mr-1">Technical Setup</Badge>
                        <Badge variant="outline" className="mr-1">Promotion</Badge>
                        <Badge variant="outline" className="mr-1">Attendee Experience</Badge>
                        {eventData.format === "virtual" && (
                          <Badge variant="outline" className="mr-1">Technology Testing</Badge>
                        )}
                        {eventData.budget && (
                          <Badge variant="outline" className="mr-1">Budget Management</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-2">
                    <div className="flex items-center">
                      <BarChart className="h-5 w-5 text-primary mr-2" />
                      <CardTitle className="text-base">Success Metrics</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Consider what metrics will define success for your event
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center p-2 rounded-md bg-background">
                        <Award className="h-4 w-4 text-amber-500 mr-2" />
                        <span className="text-sm">Attendance rate</span>
                      </div>
                      <div className="flex items-center p-2 rounded-md bg-background">
                        <MessageSquare className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-sm">Audience engagement</span>
                      </div>
                      <div className="flex items-center p-2 rounded-md bg-background">
                        <ThumbsUp className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">Satisfaction scores</span>
                      </div>
                      <div className="flex items-center p-2 rounded-md bg-background">
                        <Target className="h-4 w-4 text-red-500 mr-2" />
                        <span className="text-sm">Goal completion</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 5: Task Planning */}
          {currentStep === "tasks" && (
            <div className="space-y-6 p-1">
              <h3 className="text-lg font-medium flex items-center">
                <span className="bg-primary/10 p-1 rounded-full mr-2 text-primary text-sm">5</span>
                Event Tasks
              </h3>
              
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  {autoTasksEnabled
                    ? "Here are suggested tasks based on your event details. Select the ones you'd like to include."
                    : "Add tasks to help organize your event planning process."}
                </p>
                
                {loadingSuggestions ? (
                  <div className="text-center py-8">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="mt-2 text-muted-foreground">Generating task suggestions...</p>
                  </div>
                ) : suggestedTasks.length > 0 ? (
                  <div className="space-y-3">
                    {suggestedTasks.map((task, index) => (
                      <div 
                        key={index}
                        className={`border rounded-lg p-3 ${
                          selectedTasks.includes(task.title)
                            ? "border-primary/50 bg-primary/5"
                            : "hover:border-muted-foreground/30"
                        }`}
                      >
                        <div className="flex items-start">
                          <Checkbox 
                            id={`task-${index}`}
                            checked={selectedTasks.includes(task.title)}
                            onCheckedChange={() => handleTaskSelection(task.title)}
                            className="mt-1"
                          />
                          <div className="ml-3 flex-1">
                            <label
                              htmlFor={`task-${index}`}
                              className="font-medium cursor-pointer"
                            >
                              {task.title}
                            </label>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {task.description}
                            </p>
                            <div className="flex items-center mt-2 text-xs text-muted-foreground">
                              <Badge variant="outline" className="mr-2 text-xs">
                                {task.priority} priority
                              </Badge>
                              {task.dueDate && (
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {eventData.date ? formatEventDate(parseDueDate(task.dueDate, new Date(eventData.date as Date))) : task.dueDate}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex justify-between items-center pt-2">
                      <div className="text-sm text-muted-foreground">
                        {selectedTasks.length} of {suggestedTasks.length} tasks selected
                      </div>
                      <div className="space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedTasks([])}
                          disabled={selectedTasks.length === 0}
                        >
                          Clear All
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedTasks(suggestedTasks.map(task => task.title))}
                          disabled={selectedTasks.length === suggestedTasks.length}
                        >
                          Select All
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 border border-dashed rounded-lg">
                    <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <h4 className="font-medium mb-1">No Tasks Generated</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {autoTasksEnabled 
                        ? "We couldn't generate tasks for your event."
                        : "Enable AI suggestions to automatically generate tasks."}
                    </p>
                    <Button onClick={getAiTaskSuggestions}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Task Suggestions
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 6: Review & Create */}
          {currentStep === "review" && (
            <div className="space-y-6 p-1">
              <h3 className="text-lg font-medium flex items-center">
                <span className="bg-primary/10 p-1 rounded-full mr-2 text-primary text-sm">6</span>
                Review & Create Event
              </h3>
              
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Review your event details below before creating your event
                </p>
                
                <div className="border rounded-lg divide-y">
                  <div className="p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg">{eventData.title}</h3>
                      <Badge variant="outline">
                        {eventData.format}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-1.5 text-muted-foreground" />
                      <span>{formatEventDate(eventData.date || "")}</span>
                    </div>
                    {eventData.description && (
                      <p className="text-sm text-muted-foreground border-l-2 border-muted pl-3 italic">
                        {eventData.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Users className="h-4 w-4 mr-1.5 text-muted-foreground" />
                      <span>Audience & Budget</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Estimated Guests:</span>
                        <span className="font-medium ml-2">{eventData.estimatedGuests}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Budget:</span>
                        <span className="font-medium ml-2">
                          {eventData.budget ? `$${eventData.budget}` : "Not specified"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedTasks.length > 0 && (
                    <div className="p-4">
                      <h4 className="font-medium mb-2 flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-1.5 text-muted-foreground" />
                        <span>Selected Tasks ({selectedTasks.length})</span>
                      </h4>
                      <div className="space-y-1 text-sm">
                        {selectedTasks.map((taskTitle) => {
                          const task = suggestedTasks.find(t => t.title === taskTitle);
                          if (!task) return null;
                          return (
                            <div key={taskTitle} className="flex flex-wrap items-center mb-1">
                              <MoveRight className="h-3 w-3 mr-1.5 text-muted-foreground" />
                              <span>{task.title}</span>
                              <Badge 
                                variant="outline" 
                                className="ml-2 text-xs"
                              >
                                {task.priority}
                              </Badge>
                              {task.dueDate && eventData.date && (
                                <span className="flex items-center ml-auto text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatEventDate(parseDueDate(task.dueDate, new Date(eventData.date as Date)))}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-2 border-t bg-muted/20 flex-shrink-0">
          {currentStep !== "basics" && (
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              className="gap-1 bg-background hover:bg-muted hover:text-foreground hover:border-primary/50 border-border/60 transition-all"
              aria-label="Go back to previous step"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
          
          <div className="flex-1"></div>
          
          {currentStep !== "review" ? (
            <Button 
              onClick={handleNextStep} 
              disabled={isLoading}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-sm gap-1 transition-all"
              aria-label="Continue to next step"
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button 
              onClick={handleCreateEvent} 
              disabled={isLoading}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-sm gap-1 transition-all"
              aria-label="Create event"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5"></div>
                  Creating...
                </>
              ) : (
                <>
                  Create Event
                  <ArrowRightCircle className="h-4 w-4 ml-1.5" />
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}