'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Clock, Search, Heart, Calendar, DollarSign, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Interface for event suggestion
interface EventSuggestion {
  id: number;
  title: string;
  description: string;
  complexity: number;
  budget: number;
  duration: string;
  isFavorite?: boolean;
}

export default function DiscoverPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("events");
  const [eventType, setEventType] = useState("Virtual Conference");
  const [budget, setBudget] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<EventSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Handle generating suggestions
  const handleGenerateSuggestions = () => {
    setIsGenerating(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsGenerating(false);
      setShowSuggestions(true);
      
      // Mock data based on the provided screenshots
      setSuggestions([
        {
          id: 1,
          title: "Virtual Innovation Workshop",
          description: "A dynamic online event that encourages innovative thinking and collaboration among attendees. Participants will engage in guided brainstorming sessions, problem-solving activities, and interactive panels with industry leaders.",
          complexity: 3,
          budget: 5000,
          duration: "4 hours"
        },
        {
          id: 2,
          title: "Hybrid Networking Gala",
          description: "A hybrid networking event designed to facilitate meaningful connections among attendees from around the world. The event will feature keynote speeches, breakout sessions, and a virtual networking platform with AI matchmaking capabilities.",
          complexity: 5,
          budget: 20000,
          duration: "1 day"
        },
        {
          id: 3,
          title: "Sustainable Future Conference",
          description: "An ambitious hybrid conference focusing on sustainability and future technologies. It includes panel discussions, virtual exhibitions, and round-table sessions to discuss actionable strategies for a more sustainable future.",
          complexity: 4,
          budget: 15000,
          duration: "2 days"
        }
      ]);
    }, 2000);
  };

  // Handle toggling favorite
  const toggleFavorite = (id: number) => {
    setSuggestions(prev => 
      prev.map(item => 
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
    
    toast({
      title: "Favorite Updated",
      description: "Your favorites have been updated"
    });
  };

  // Handle creating event from suggestion
  const handleCreateEvent = (suggestion: EventSuggestion) => {
    toast({
      title: "Creating Event",
      description: `Creating new event: ${suggestion.title}`
    });
    
    // Simulate redirect to event creation with prefilled data
    setTimeout(() => {
      router.push("/events/new");
    }, 500);
  };

  // Filter suggestions based on search query
  const filteredSuggestions = searchQuery.trim()
    ? suggestions.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : suggestions;

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Discover Event Ideas</h1>
      <p className="text-muted-foreground mb-8">Get AI-powered suggestions for your next virtual event</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Event Preferences Panel */}
        <div className="md:col-span-1">
          <Card className="shadow-md border-border/40 overflow-hidden">
            <div className="bg-gradient-to-r from-[hsl(var(--eventra-teal))] via-[hsl(var(--eventra-blue))] to-[hsl(var(--eventra-purple))] h-2" />
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Event Preferences</h2>
              <p className="text-sm text-muted-foreground mb-6">Select your event type to get started</p>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[hsl(var(--eventra-blue))]" />
                    <Label htmlFor="eventType">Event Type</Label>
                  </div>
                  <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger id="eventType" className="border-border/60 focus:ring-[hsl(var(--eventra-blue))]">
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Virtual Conference">Virtual Conference</SelectItem>
                      <SelectItem value="Hybrid Meeting">Hybrid Meeting</SelectItem>
                      <SelectItem value="Webinar">Webinar</SelectItem>
                      <SelectItem value="Workshop">Workshop</SelectItem>
                      <SelectItem value="Training">Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-[hsl(var(--eventra-blue))]" />
                    <Label htmlFor="budget">Budget (USD)</Label>
                  </div>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="Enter budget amount"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="border-border/60 focus:ring-[hsl(var(--eventra-blue))]"
                  />
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2 border-border/60 hover:bg-muted/50 hover:text-[hsl(var(--eventra-blue))] hover:border-[hsl(var(--eventra-blue))/50]"
                >
                  <span>Show Advanced Options</span>
                </Button>
                
                <Button
                  className="w-full bg-gradient-to-r from-[hsl(var(--eventra-teal))] via-[hsl(var(--eventra-blue))] to-[hsl(var(--eventra-purple))] text-white hover:shadow-md transition-all"
                  onClick={handleGenerateSuggestions}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                      Generating Suggestions...
                    </>
                  ) : showSuggestions ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Get Personalized Suggestions
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Get Personalized Suggestions
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Event Suggestions Panel */}
        <div className="md:col-span-2">
          <Card className="shadow-md border-border/40 h-full">
            <div className="bg-gradient-to-r from-[hsl(var(--eventra-teal))] via-[hsl(var(--eventra-blue))] to-[hsl(var(--eventra-purple))] h-2" />
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Event Suggestions</h2>
                  <p className="text-sm text-muted-foreground">AI-powered ideas tailored to your preferences</p>
                </div>
                <div className="w-60">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search suggestions..."
                      className="pl-8 border-border/60 focus:ring-[hsl(var(--eventra-blue))]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <Tabs defaultValue="events" value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="bg-muted/80 border-border/40">
                  <TabsTrigger value="events" className="data-[state=active]:bg-white data-[state=active]:text-[hsl(var(--eventra-blue))]">Events</TabsTrigger>
                  <TabsTrigger value="themes" className="data-[state=active]:bg-white data-[state=active]:text-[hsl(var(--eventra-blue))]">Themes</TabsTrigger>
                  <TabsTrigger value="budget" className="data-[state=active]:bg-white data-[state=active]:text-[hsl(var(--eventra-blue))]">Budget</TabsTrigger>
                  <TabsTrigger value="tasks" className="data-[state=active]:bg-white data-[state=active]:text-[hsl(var(--eventra-blue))]">Tasks</TabsTrigger>
                  <TabsTrigger value="planning" className="data-[state=active]:bg-white data-[state=active]:text-[hsl(var(--eventra-blue))]">Planning Tips</TabsTrigger>
                </TabsList>
                
                <TabsContent value="events" className="m-0">
                  {isGenerating ? (
                    // Loading skeleton UI
                    <div className="space-y-6">
                      {[1, 2].map((item) => (
                        <Card key={item} className="shadow-sm border-border/30">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="space-y-2">
                                <Skeleton className="h-6 w-60" />
                                <Skeleton className="h-4 w-24" />
                              </div>
                              <Skeleton className="h-10 w-10 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-full mb-1" />
                            <Skeleton className="h-4 w-full mb-1" />
                            <Skeleton className="h-4 w-2/3 mb-6" />
                            <div className="flex items-center gap-6 mb-6">
                              <Skeleton className="h-5 w-24" />
                              <Skeleton className="h-5 w-24" />
                            </div>
                            <div className="flex justify-between">
                              <Skeleton className="h-9 w-20" />
                              <Skeleton className="h-9 w-32" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : !showSuggestions ? (
                    // Initial state before suggestions are generated
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Sparkles className="h-12 w-12 text-[hsl(var(--eventra-blue))] mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Get Personalized Event Ideas</h3>
                      <p className="text-muted-foreground mb-6 max-w-md">
                        Select your event preferences and click "Get Personalized Suggestions" to receive AI-powered event ideas.
                      </p>
                      <Button
                        className="bg-gradient-to-r from-[hsl(var(--eventra-teal))] via-[hsl(var(--eventra-blue))] to-[hsl(var(--eventra-purple))] text-white hover:shadow-md transition-all"
                        onClick={handleGenerateSuggestions}
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Get Started
                      </Button>
                    </div>
                  ) : (
                    // Actual suggestions
                    <div className="space-y-6">
                      {filteredSuggestions.map((suggestion) => (
                        <Card key={suggestion.id} className="shadow-sm hover:shadow-md transition-all border-border/30">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-lg font-semibold mb-1">{suggestion.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>{suggestion.duration}</span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  "h-9 w-9 rounded-full",
                                  suggestion.isFavorite && "text-[hsl(var(--eventra-purple))] bg-[hsl(var(--eventra-purple))]/10"
                                )}
                                onClick={() => toggleFavorite(suggestion.id)}
                                aria-label={suggestion.isFavorite ? "Remove from favorites" : "Add to favorites"}
                              >
                                <Heart className={cn("h-5 w-5", suggestion.isFavorite && "fill-current")} />
                              </Button>
                            </div>
                            
                            <p className="text-muted-foreground mb-5 line-clamp-3">
                              {suggestion.description}
                            </p>
                            
                            <div className="flex items-center gap-6 mb-6">
                              <div className="flex items-center gap-1.5">
                                <DollarSign className="h-4 w-4 text-[hsl(var(--eventra-teal))]" />
                                <span className="font-medium">${suggestion.budget.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Star className="h-4 w-4 text-[hsl(var(--eventra-purple))]" />
                                <span className="font-medium">
                                  Complexity: {Array(suggestion.complexity).fill("★").join("")}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex justify-between">
                              <Button
                                variant="outline"
                                className="border-border/60 hover:bg-muted/50 hover:text-[hsl(var(--eventra-blue))] hover:border-[hsl(var(--eventra-blue))/50]"
                                onClick={() => toggleFavorite(suggestion.id)}
                              >
                                {suggestion.isFavorite ? "Saved" : "Save"}
                              </Button>
                              <Button
                                className="bg-gradient-to-r from-[hsl(var(--eventra-teal))] via-[hsl(var(--eventra-blue))] to-[hsl(var(--eventra-purple))] text-white hover:shadow-md transition-all"
                                onClick={() => handleCreateEvent(suggestion)}
                              >
                                Create Event
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="themes" className="m-0">
                  <div className="flex items-center justify-center py-10 text-center">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Theme suggestions coming soon</h3>
                      <p className="text-muted-foreground max-w-md">
                        We're currently developing theme suggestions for your events
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="budget" className="m-0">
                  <div className="flex items-center justify-center py-10 text-center">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Budget suggestions coming soon</h3>
                      <p className="text-muted-foreground max-w-md">
                        We're currently developing budget suggestions for your events
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="tasks" className="m-0">
                  <div className="flex items-center justify-center py-10 text-center">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Task suggestions coming soon</h3>
                      <p className="text-muted-foreground max-w-md">
                        We're currently developing task suggestions for your events
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="planning" className="m-0">
                  <div className="flex items-center justify-center py-10 text-center">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Planning tips coming soon</h3>
                      <p className="text-muted-foreground max-w-md">
                        We're currently developing planning tips for your events
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              {showSuggestions && isGenerating && (
                <div className="fixed inset-0 flex items-center justify-center bg-background/80 z-50">
                  <div className="bg-background border rounded-lg p-6 shadow-lg w-96 text-center">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
                    <h3 className="text-xl font-medium mb-2">Generating AI Suggestions</h3>
                    <p className="text-muted-foreground mb-4">
                      Please wait while we create personalized event suggestions...
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}