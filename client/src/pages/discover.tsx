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
        </CardContent>
        <CardFooter>
          <Skeleton className="h-9 w-full" />
        </CardFooter>
      </Card>
    ));
  };

  return (
    <div className="px-4 pt-4 pb-16">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold mb-1">Discover</h2>
        <p className="text-gray-600">Explore ideas and recommendations for your events</p>
      </div>
      
      {/* Search bar */}
      <div className="mb-6 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search for themes, ideas, or tips..."
            className="pl-10 pr-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
              onClick={() => setSearchQuery("")}
            >
              <span className="sr-only">Clear search</span>
              ✕
            </Button>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="themes">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="themes" className="flex-1">
            <Palette className="h-4 w-4 mr-2 hidden sm:inline-block" />
            Themes
          </TabsTrigger>
          <TabsTrigger value="ideas" className="flex-1">
            <Sparkles className="h-4 w-4 mr-2 hidden sm:inline-block" />
            Event Ideas
          </TabsTrigger>
          <TabsTrigger value="budget" ref={budgetTabRef} className="flex-1">
            <PieChart className="h-4 w-4 mr-2 hidden sm:inline-block" />
            Budget
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex-1">
            <CheckCircle2 className="h-4 w-4 mr-2 hidden sm:inline-block" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="tips" className="flex-1">
            <Lightbulb className="h-4 w-4 mr-2 hidden sm:inline-block" />
            Tips
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="themes">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
              <div className="flex flex-wrap gap-2">
                {['conference', 'birthday', 'webinar', 'workshop', 'other'].map(type => (
                  <Button
                    key={type}
                    variant={selectedEventType === type ? "default" : "outline"}
                    onClick={() => setSelectedEventType(type)}
                    size="sm"
                    className="flex-shrink-0"
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="flex items-center gap-2"
              >
                <Sliders className="h-4 w-4" />
                {showAdvancedOptions ? 'Hide Options' : 'Show Options'}
              </Button>
              
              {themeCategories.length > 0 && (
                <div className="relative ml-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setSelectedThemeFilter(null)}
                  >
                    <Filter className="h-4 w-4" />
                    {selectedThemeFilter ? `Filter: ${selectedThemeFilter}` : 'Filter'}
                  </Button>
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
                    {themeCategories.map(category => (
                      <Button
                        key={category}
                        variant="ghost"
                        className="w-full justify-start text-left"
                        onClick={() => setSelectedThemeFilter(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Advanced Options Form */}
          {showAdvancedOptions && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="format" className="block mb-1">Event Format</Label>
                    <Select
                      value={format}
                      onValueChange={(value: any) => setFormat(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="virtual">Virtual</SelectItem>
                        <SelectItem value="in-person">In-Person</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
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
                
                <Button 
                  onClick={fetchSuggestions}
                  className="w-full"
                >
                  Get Personalized Suggestions
                </Button>
              </CardContent>
            </Card>
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
        
        <TabsContent value="ideas">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
              <div className="flex flex-wrap gap-2">
                {['conference', 'birthday', 'webinar', 'workshop', 'other'].map(type => (
                  <Button
                    key={type}
                    variant={selectedEventType === type ? "default" : "outline"}
                    onClick={() => setSelectedEventType(type)}
                    size="sm"
                    className="flex-shrink-0"
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="flex items-center gap-2"
            >
              <Sliders className="h-4 w-4" />
              {showAdvancedOptions ? 'Hide Options' : 'Show Options'}
            </Button>
          </div>
          
          {/* Advanced Options Form */}
          {showAdvancedOptions && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="budget" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Budget ($)</span>
                    </Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="Enter budget"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="mt-1"
                    />
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="format" className="block mb-1">Event Format</Label>
                    <Select
                      value={format}
                      onValueChange={(value: any) => setFormat(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="virtual">Virtual</SelectItem>
                        <SelectItem value="in-person">In-Person</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="duration" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Duration</span>
                    </Label>
                    <Input
                      id="duration"
                      placeholder="e.g., 2 hours, 3 days"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={fetchSuggestions}
                  className="w-full"
                >
                  Get Personalized Suggestions
                </Button>
              </CardContent>
            </Card>
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
        
        <TabsContent value="budget">
          {budget ? (
            isLoadingSuggestions ? (
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
                <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Enter a budget in the advanced options to see suggestions</p>
                <Button 
                  variant="link" 
                  onClick={() => {
                    setShowAdvancedOptions(true);
                    // Focus on the budget input field
                    setTimeout(() => {
                      document.getElementById('budget')?.focus();
                    }, 100);
                  }}
                  className="mt-2"
                >
                  Set Budget Now
                </Button>
              </div>
            )
          ) : (
            <div className="text-center py-10">
              <DollarSign className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Enter a budget in the advanced options to see suggestions</p>
              <Button 
                variant="link" 
                onClick={() => {
                  setShowAdvancedOptions(true);
                  // Focus on the budget input field
                  setTimeout(() => {
                    document.getElementById('budget')?.focus();
                  }, 100);
                }}
                className="mt-2"
              >
                Set Budget Now
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="tasks">
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
              <Button 
                variant="link" 
                onClick={fetchSuggestions}
                className="mt-2"
              >
                Generate Task Suggestions
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="tips">
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
      
      {/* Create Event Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Event from Suggestion</DialogTitle>
            <DialogDescription>
              This will create a new event based on the selected suggestion. You can edit it further afterwards.
            </DialogDescription>
          </DialogHeader>
          
          {selectedSuggestion && (
            <div className="py-4">
              <h4 className="font-medium text-lg">{selectedSuggestion.title}</h4>
              <p className="text-sm text-gray-600 mt-1 mb-4">{selectedSuggestion.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Event Type:</span>{' '}
                  <span className="font-medium">{selectedEventType}</span>
                </div>
                <div>
                  <span className="text-gray-500">Format:</span>{' '}
                  <span className="font-medium">{format || "Virtual"}</span>
                </div>
                <div>
                  <span className="text-gray-500">Budget:</span>{' '}
                  <span className="font-medium">${selectedSuggestion.estimatedCost}</span>
                </div>
                <div>
                  <span className="text-gray-500">Complexity:</span>{' '}
                  <span className="font-medium">{selectedSuggestion.complexity}/5</span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitCreateEvent}
              disabled={createEventMutation.isPending}
            >
              {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
