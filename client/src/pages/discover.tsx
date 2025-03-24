import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  getAiSuggestions, 
  AiSuggestions, 
  ThemeSuggestion, 
  EventSuggestion, 
  BudgetSuggestion,
  TaskSuggestion,
  SuggestionPreferences 
} from "@/lib/ai-service";
import { createEvent } from "@/lib/event-service";
import { 
  Lightbulb, 
  Palette, 
  Sparkles, 
  Sliders, 
  Users, 
  Clock, 
  Search, 
  HeartIcon, 
  Calendar, 
  PieChart, 
  CheckCircle2, 
  DollarSign,
  PlusCircle,
  AlertCircle,
  Filter,
  BarChart4
} from "lucide-react";
import { Event, PlanningTip } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function Discover() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEventType, setSelectedEventType] = useState<string>("conference");
  const [suggestions, setSuggestions] = useState<AiSuggestions | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [selectedThemeFilter, setSelectedThemeFilter] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<EventSuggestion | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Refs to jump to a tab when clicking on a link
  const budgetTabRef = useRef<HTMLButtonElement>(null);
  
  // Preferences state
  const [budget, setBudget] = useState<string>("");
  const [guestCount, setGuestCount] = useState<string>("");
  const [format, setFormat] = useState<"virtual" | "in-person" | "hybrid" | "">("");
  const [duration, setDuration] = useState<string>("");
  
  // Create event from suggestion mutation
  const createEventMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/1/events"] });
      toast({
        title: "Event created",
        description: "Your new event has been created successfully",
      });
      setShowCreateDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create the event. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Fetch planning tips
  const { 
    data: planningTips, 
    isLoading: isLoadingTips, 
    error: tipsError 
  } = useQuery<PlanningTip[]>({
    queryKey: ["/api/planning-tips"]
  });
  
  // Fetch user's events for context
  const {
    data: userEvents
  } = useQuery<Event[]>({
    queryKey: ["/api/users/1/events"] // Using hardcoded user ID for now
  });
  
  // Fetch AI suggestions when event type changes or preferences are updated
  const fetchSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      // Show feedback toast for better UX
      toast({
        title: "Generating AI Suggestions",
        description: "Please wait while we create personalized event suggestions...",
      });
      
      // Convert budget and guestCount to numbers if they exist
      const budgetNum = budget ? parseInt(budget) : undefined;
      const guestCountNum = guestCount ? parseInt(guestCount) : undefined;
      
      // Prepare preferences object
      const preferences: SuggestionPreferences = {
        userId: 1, // Hardcoded for now, would be dynamic in a real app
        guestCount: guestCountNum,
        format: format as any || undefined,
        duration: duration || undefined
      };
      
      const data = await getAiSuggestions(
        selectedEventType,
        undefined, // theme
        budgetNum,
        showAdvancedOptions ? preferences : undefined
      );
      
      setSuggestions(data);
      
      // Show success toast
      toast({
        title: "Suggestions Ready",
        description: "AI-powered event suggestions have been generated successfully!",
        variant: "default"
      });
      
      // If budget is provided, automatically show the budget tab
      if (budgetNum && data.budget && data.budget.length > 0 && budgetTabRef.current) {
        setTimeout(() => {
          budgetTabRef.current?.click();
        }, 300);
      }
      
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch AI suggestions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };
  
  // Create a new event from a suggestion
  const handleCreateEventFromSuggestion = (suggestion: EventSuggestion) => {
    setSelectedSuggestion(suggestion);
    setShowCreateDialog(true);
  };
  
  // Submit the create event form
  const handleSubmitCreateEvent = () => {
    if (!selectedSuggestion) return;
    
    const today = new Date();
    // Set date to 30 days from now
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 30);
    
    createEventMutation.mutate({
      name: selectedSuggestion.title,
      description: selectedSuggestion.description,
      type: selectedEventType,
      format: format || "virtual",
      date: futureDate.toISOString(),
      ownerId: 1, // Hardcoded for now
      estimatedGuests: guestCount ? parseInt(guestCount) : undefined,
      budget: selectedSuggestion.estimatedCost,
      status: "planning"
    });
  };
  
  // Fetch suggestions when event type changes
  useEffect(() => {
    fetchSuggestions();
  }, [selectedEventType]);
  
  // Reset preferences when event type changes
  useEffect(() => {
    setBudget("");
    setGuestCount("");
    setFormat("");
    setDuration("");
    setSelectedThemeFilter(null);
  }, [selectedEventType]);
  
  // Filter themes based on search query or selected filter
  const filteredThemes = suggestions?.themes?.filter(theme => {
    const matchesSearch = !searchQuery || 
      theme.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      theme.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = !selectedThemeFilter || 
      theme.suitable.includes(selectedThemeFilter);
    
    return matchesSearch && matchesFilter;
  });
  
  // Filter event suggestions based on search query
  const filteredEventSuggestions = suggestions?.events?.filter(event => {
    return !searchQuery || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  // Filter planning tips based on search query
  const filteredPlanningTips = planningTips?.filter(tip => {
    return !searchQuery || 
      tip.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      tip.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.category.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  // Get all unique theme categories from suggestions
  const themeCategories = suggestions?.themes?.reduce((acc: string[], theme) => {
    theme.suitable.forEach(category => {
      if (!acc.includes(category)) {
        acc.push(category);
      }
    });
    return acc;
  }, []) || [];
  
  // Render theme card
  const renderThemeCard = (theme: ThemeSuggestion) => {
    return (
      <Card key={theme.id} className="mb-4 hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{theme.name}</CardTitle>
              <CardDescription className="text-xs text-gray-500 mt-1">
                Perfect for {theme.suitable.join(', ')} events
              </CardDescription>
            </div>
            <Palette className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">{theme.description}</p>
          <div className="flex space-x-2 mb-4">
            {theme.colorScheme.map((color, i) => (
              <TooltipProvider key={i}>
                <Tooltip>
                  <TooltipTrigger>
                    <div 
                      className="h-8 w-8 rounded-full border border-gray-200"
                      style={{ backgroundColor: color }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{color}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {theme.suitable.map((suitableType, i) => (
              <Badge 
                key={i}
                variant="outline"
                className="bg-gray-50"
              >
                {suitableType}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="pt-2 flex justify-between">
          <Button variant="ghost" size="sm" className="text-gray-500">
            <HeartIcon className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" size="sm">
            Use This Theme
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
  // Render event suggestion card
  const renderEventSuggestionCard = (suggestion: EventSuggestion) => {
    return (
      <Card key={suggestion.id} className="mb-4 hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{suggestion.title}</CardTitle>
              <CardDescription className="text-xs text-gray-500 mt-1">
                {suggestion.complexity}/5 complexity • ${suggestion.estimatedCost}
              </CardDescription>
            </div>
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">{suggestion.description}</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
              <span className="text-gray-500">Budget:</span>{' '}
              <span className="font-medium ml-1">${suggestion.estimatedCost}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-400 mr-1" />
              <span className="text-gray-500">Duration:</span>{' '}
              <span className="font-medium ml-1">{suggestion.suggestedDuration}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2 flex justify-between">
          <Button variant="ghost" size="sm" className="text-gray-500">
            <HeartIcon className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={() => handleCreateEventFromSuggestion(suggestion)}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
  // Render budget suggestion card
  const renderBudgetCard = (suggestions: BudgetSuggestion[]) => {
    const totalBudget = suggestions.reduce((sum, item) => sum + item.estimatedAmount, 0);
    const colorMap: Record<string, string> = {
      'Virtual Platform': '#4F46E5',
      'Technology': '#4F46E5',
      'Speakers': '#10B981',
      'Presenters': '#10B981',
      'Speakers/Presenters': '#10B981',
      'Marketing': '#F59E0B',
      'Staff': '#6366F1',
      'Contingency': '#A1A1AA',
      'Digital Activities': '#EC4899',
      'Gifts/Deliveries': '#8B5CF6',
      'Decorations': '#F97316',
      'Materials': '#14B8A6',
      'Content': '#14B8A6',
      'Content Creation': '#14B8A6',
    };
    
    return (
      <div className="space-y-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Budget Breakdown</CardTitle>
            <CardDescription>
              Estimated total: ${totalBudget.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center h-10 mb-4">
              {suggestions.map((item, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger>
                      <div 
                        style={{
                          backgroundColor: colorMap[item.category] || `hsl(${index * 50}, 70%, 60%)`,
                          width: `${item.percentage * 100}%`
                        }}
                        className="h-full"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm">
                        <div className="font-medium">{item.category}</div>
                        <div>${item.estimatedAmount} ({(item.percentage * 100).toFixed(1)}%)</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            
            <div className="space-y-3">
              {suggestions.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{
                        backgroundColor: colorMap[item.category] || `hsl(${index * 50}, 70%, 60%)`
                      }}
                    />
                    <span className="text-sm">{item.category}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">${item.estimatedAmount}</span>
                    <span className="text-xs text-gray-500">({(item.percentage * 100).toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-gray-500 italic">
              * Budget allocation is a suggestion and can be adjusted based on your specific needs.
            </p>
          </CardFooter>
        </Card>
        
        {/* Budget Categories Explained */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Budget Categories Explained</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestions.map((item, index) => (
              <div key={index} className="border-b pb-3 last:border-b-0 last:pb-0">
                <h4 className="font-medium flex items-center">
                  <div 
                    className="w-2 h-2 rounded-full mr-2"
                    style={{
                      backgroundColor: colorMap[item.category] || `hsl(${index * 50}, 70%, 60%)`
                    }}
                  />
                  {item.category}
                </h4>
                <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  };
  
  // Render task suggestions
  const renderTaskSuggestions = (tasks: TaskSuggestion[]) => {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Recommended Tasks</CardTitle>
          <CardDescription>
            Key tasks to ensure a successful {selectedEventType} event
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <div key={index} className="flex items-start pb-3 border-b last:border-b-0 last:pb-0">
                <div 
                  className={`flex-shrink-0 mt-0.5 mr-3 w-6 h-6 rounded-full flex items-center justify-center ${
                    task.priority === 'high' 
                      ? 'bg-red-100 text-red-600' 
                      : task.priority === 'medium'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {task.priority === 'high' ? '!' : task.priority === 'medium' ? '~' : '-'}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{task.title}</h4>
                    <Badge variant={
                      task.priority === 'high' 
                        ? 'destructive' 
                        : task.priority === 'medium'
                          ? 'default'
                          : 'outline'
                    }>
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  <div className="text-xs text-gray-500 mt-2">
                    Due: {task.dueDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" variant="outline">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Tasks to Event
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
  // Render planning tip card
  const renderPlanningTipCard = (tip: PlanningTip) => {
    return (
      <Card key={tip.id} className="mb-4 hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{tip.title}</CardTitle>
              <CardDescription className="text-xs mt-1">
                Category: {tip.category}
              </CardDescription>
            </div>
            <Lightbulb className="h-5 w-5 text-amber-500" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">{tip.description}</p>
        </CardContent>
        <CardFooter className="pt-2 flex justify-end">
          <Button variant="ghost" size="sm">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Mark as useful
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
  // Render skeletons for loading state
  const renderSkeletons = () => {
    return Array(3).fill(0).map((_, i) => (
      <Card key={i} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <div className="flex space-x-2 mb-4">
            {Array(4).fill(0).map((_, j) => (
              <Skeleton key={j} className="h-6 w-6 rounded-full" />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {Array(3).fill(0).map((_, j) => (
              <Skeleton key={j} className="h-5 w-16 rounded-full" />
            ))}
          </div>
        </CardContent>
        <CardFooter className="pt-2 flex justify-between">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-28" />
        </CardFooter>
      </Card>
    ));
  };
  
  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Discover Event Ideas</h1>
        <p className="text-gray-600">
          Get AI-powered suggestions for your next virtual event
        </p>
      </div>
      
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="w-full md:w-1/3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Event Preferences</CardTitle>
                <CardDescription>
                  Select your event type to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="eventType" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Event Type</span>
                    </Label>
                    <Select
                      value={selectedEventType}
                      onValueChange={setSelectedEventType}
                    >
                      <SelectTrigger id="eventType" className="mt-1">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conference">Virtual Conference</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="webinar">Webinar</SelectItem>
                        <SelectItem value="team-building">Team Building</SelectItem>
                        <SelectItem value="product-launch">Product Launch</SelectItem>
                        <SelectItem value="networking">Networking Event</SelectItem>
                        <SelectItem value="training">Training Session</SelectItem>
                        <SelectItem value="panel-discussion">Panel Discussion</SelectItem>
                        <SelectItem value="award-ceremony">Award Ceremony</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="budget" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Budget (USD)</span>
                    </Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="Enter budget amount"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <Button
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    variant="ghost"
                    className="w-full flex items-center justify-center"
                  >
                    <Sliders className="h-4 w-4 mr-2" />
                    {showAdvancedOptions ? "Hide Advanced Options" : "Show Advanced Options"}
                  </Button>
                </div>
                
                {showAdvancedOptions && (
                  <div className="mt-4 space-y-4 border-t pt-4">
                    <div>
                      <Label htmlFor="format" className="flex items-center gap-2">
                        <PieChart className="h-4 w-4" />
                        <span>Event Format</span>
                      </Label>
                      <Select
                        value={format}
                        onValueChange={(value: "virtual" | "in-person" | "hybrid") => setFormat(value)}
                      >
                        <SelectTrigger id="format" className="mt-1">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="virtual">Virtual Only</SelectItem>
                          <SelectItem value="in-person">In Person</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="duration" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Expected Duration</span>
                      </Label>
                      <Select
                        value={duration}
                        onValueChange={setDuration}
                      >
                        <SelectTrigger id="duration" className="mt-1">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-2 hours">1-2 hours</SelectItem>
                          <SelectItem value="half-day">Half day</SelectItem>
                          <SelectItem value="full-day">Full day</SelectItem>
                          <SelectItem value="multi-day">Multi-day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="guestCount" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Number of Guests</span>
                      </Label>
                      <Input
                        id="guestCount"
                        type="number"
                        placeholder="Enter guest count"
                        value={guestCount}
                        onChange={(e) => setGuestCount(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
                
                <LoadingButton 
                  onClick={fetchSuggestions}
                  className="w-full mt-4"
                  isLoading={isLoadingSuggestions}
                  loadingText="Generating Suggestions..."
                >
                  Get Personalized Suggestions
                </LoadingButton>
              </CardContent>
            </Card>
          </div>
          
          <div className="w-full md:w-2/3">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Event Suggestions</CardTitle>
                    <CardDescription>
                      AI-powered ideas tailored to your preferences
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search suggestions..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="events" className="w-full">
                  <TabsList className="w-full justify-start rounded-none px-6 border-b">
                    <TabsTrigger value="events">Events</TabsTrigger>
                    <TabsTrigger value="themes">Themes</TabsTrigger>
                    <TabsTrigger value="budget" ref={budgetTabRef}>Budget</TabsTrigger>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="tips">Planning Tips</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="events" className="p-6">
                    {selectedThemeFilter && (
                      <div className="mb-4 flex items-center gap-2">
                        <Badge variant="secondary" className="gap-1 px-3 py-1">
                          <Filter className="h-3 w-3" />
                          {selectedThemeFilter}
                          <button 
                            onClick={() => setSelectedThemeFilter(null)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            ×
                          </button>
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Filtering by event type
                        </span>
                      </div>
                    )}
                    
                    {isLoadingSuggestions ? (
                      renderSkeletons()
                    ) : filteredEventSuggestions && filteredEventSuggestions.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredEventSuggestions.map(renderEventSuggestionCard)}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <Lightbulb className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No event suggestions found for this event type</p>
                        {searchQuery && (
                          <Button 
                            variant="link" 
                            onClick={() => setSearchQuery("")}
                            className="mt-2"
                          >
                            Clear search and try again
                          </Button>
                        )}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="themes" className="p-6">
                    {themeCategories.length > 0 && (
                      <div className="mb-6">
                        <p className="text-sm text-gray-500 mb-2">Filter by event type:</p>
                        <div className="flex flex-wrap gap-2">
                          {themeCategories.map((category, i) => (
                            <Badge 
                              key={i}
                              variant={selectedThemeFilter === category ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => 
                                selectedThemeFilter === category
                                  ? setSelectedThemeFilter(null)
                                  : setSelectedThemeFilter(category)
                              }
                            >
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {isLoadingSuggestions ? (
                      renderSkeletons()
                    ) : filteredThemes && filteredThemes.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredThemes.map(renderThemeCard)}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <Lightbulb className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No theme suggestions found for this event type</p>
                        {searchQuery && (
                          <Button 
                            variant="link" 
                            onClick={() => setSearchQuery("")}
                            className="mt-2"
                          >
                            Clear search and try again
                          </Button>
                        )}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="budget" className="p-6">
                    {isLoadingSuggestions ? (
                      <div className="py-10">
                        <div className="flex justify-center mb-4">
                          <BarChart4 className="h-12 w-12 text-gray-300 animate-pulse" />
                        </div>
                        <p className="text-center text-gray-500">Generating budget suggestions...</p>
                      </div>
                    ) : suggestions?.budget && suggestions.budget.length > 0 ? (
                      renderBudgetCard(suggestions.budget)
                    ) : (
                      <div className="text-center py-10">
                        <DollarSign className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">
                          {budget 
                            ? "No budget suggestions available for this event type"
                            : "Enter a budget amount to see suggested allocations"
                          }
                        </p>
                        <LoadingButton
                          onClick={fetchSuggestions}
                          className="mt-4"
                          isLoading={isLoadingSuggestions}
                          loadingText="Generating Budget..."
                        >
                          Generate Budget Suggestions
                        </LoadingButton>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="tasks" className="p-6">
                    {isLoadingSuggestions ? (
                      <div className="py-10">
                        <div className="flex justify-center mb-4">
                          <CheckCircle2 className="h-12 w-12 text-gray-300 animate-pulse" />
                        </div>
                        <p className="text-center text-gray-500">Generating task suggestions...</p>
                      </div>
                    ) : suggestions?.tasks && suggestions.tasks.length > 0 ? (
                      renderTaskSuggestions(suggestions.tasks)
                    ) : (
                      <div className="text-center py-10">
                        <CheckCircle2 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No task suggestions available for this event type</p>
                        <LoadingButton
                          onClick={fetchSuggestions}
                          className="mt-4"
                          isLoading={isLoadingSuggestions}
                          loadingText="Generating Tasks..."
                        >
                          Generate Task Suggestions
                        </LoadingButton>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="tips" className="p-6">
                    {isLoadingTips ? (
                      renderSkeletons()
                    ) : tipsError ? (
                      <div className="text-center py-6 text-red-500">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                        Error loading planning tips. Please try again.
                      </div>
                    ) : filteredPlanningTips && filteredPlanningTips.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredPlanningTips.map(renderPlanningTipCard)}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <Lightbulb className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No planning tips available</p>
                        {searchQuery && (
                          <Button 
                            variant="link" 
                            onClick={() => setSearchQuery("")}
                            className="mt-2"
                          >
                            Clear search and try again
                          </Button>
                        )}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Create event dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Create a new event based on the selected suggestion
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedSuggestion && (
              <>
                <div>
                  <h3 className="font-medium">{selectedSuggestion.title}</h3>
                  <p className="text-sm text-gray-600">{selectedSuggestion.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Budget:</span>{' '}
                    <span className="font-medium">${selectedSuggestion.estimatedCost}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>{' '}
                    <span className="font-medium">{selectedSuggestion.suggestedDuration}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>{' '}
                    <span className="font-medium">{selectedEventType}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Format:</span>{' '}
                    <span className="font-medium">{format || "Virtual"}</span>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <DialogFooter className="sm:justify-start">
            <Button
              variant="default"
              onClick={handleSubmitCreateEvent}
              disabled={createEventMutation.isPending}
            >
              {createEventMutation.isPending ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2">⏳</span>
                  Creating...
                </span>
              ) : (
                <span className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Create Event
                </span>
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}