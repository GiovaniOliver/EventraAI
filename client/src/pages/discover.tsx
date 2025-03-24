import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAiSuggestions, AiSuggestions, ThemeSuggestion, EventSuggestion, SuggestionPreferences } from "@/lib/ai-service";
import { Lightbulb, Palette, Sparkles, Sliders, Users, Clock } from "lucide-react";
import { PlanningTip } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Discover() {
  const [selectedEventType, setSelectedEventType] = useState<string>("conference");
  const [suggestions, setSuggestions] = useState<AiSuggestions | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  // Fetch planning tips
  const { 
    data: planningTips, 
    isLoading: isLoadingTips, 
    error: tipsError 
  } = useQuery<PlanningTip[]>({
    queryKey: ["/api/planning-tips"]
  });
  
  // Fetch AI suggestions when event type changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      setIsLoadingSuggestions(true);
      try {
        const data = await getAiSuggestions(selectedEventType);
        setSuggestions(data);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };
    
    fetchSuggestions();
  }, [selectedEventType]);
  
  // Render theme card
  const renderThemeCard = (theme: ThemeSuggestion) => {
    return (
      <Card key={theme.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{theme.name}</CardTitle>
            <Palette className="h-5 w-5 text-primary-500" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">{theme.description}</p>
          <div className="flex space-x-2 mb-4">
            {theme.colorScheme.map((color, i) => (
              <div 
                key={i}
                className="h-6 w-6 rounded-full"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {theme.suitable.map((suitableType, i) => (
              <span 
                key={i}
                className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
              >
                {suitableType}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // Render event suggestion card
  const renderEventSuggestionCard = (suggestion: EventSuggestion) => {
    return (
      <Card key={suggestion.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{suggestion.title}</CardTitle>
            <Sparkles className="h-5 w-5 text-primary-500" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">{suggestion.description}</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Complexity:</span>{' '}
              <span className="font-medium">{suggestion.complexity}/5</span>
            </div>
            <div>
              <span className="text-gray-500">Budget:</span>{' '}
              <span className="font-medium">${suggestion.estimatedCost}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">Duration:</span>{' '}
              <span className="font-medium">{suggestion.suggestedDuration}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // Render planning tip card
  const renderPlanningTipCard = (tip: PlanningTip) => {
    return (
      <Card key={tip.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{tip.title}</CardTitle>
            <Lightbulb className="h-5 w-5 text-secondary-500" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">{tip.description}</p>
        </CardContent>
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
      </Card>
    ));
  };

  return (
    <div className="px-4 pt-4 pb-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-1">Discover</h2>
        <p className="text-gray-600">Explore ideas and recommendations for your events</p>
      </div>
      
      <Tabs defaultValue="themes">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="themes" className="flex-1">Themes</TabsTrigger>
          <TabsTrigger value="ideas" className="flex-1">Event Ideas</TabsTrigger>
          <TabsTrigger value="tips" className="flex-1">Planning Tips</TabsTrigger>
        </TabsList>
        
        <TabsContent value="themes">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Event Type</label>
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {['conference', 'birthday', 'webinar', 'other'].map(type => (
                <Button
                  key={type}
                  variant={selectedEventType === type ? "default" : "outline"}
                  onClick={() => setSelectedEventType(type)}
                  className="flex-shrink-0"
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          
          {isLoadingSuggestions ? (
            renderSkeletons()
          ) : suggestions?.themes && suggestions.themes.length > 0 ? (
            suggestions.themes.map(renderThemeCard)
          ) : (
            <div className="text-center py-10">
              <Lightbulb className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No theme suggestions found for this event type</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="ideas">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Event Type</label>
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {['conference', 'birthday', 'webinar', 'other'].map(type => (
                <Button
                  key={type}
                  variant={selectedEventType === type ? "default" : "outline"}
                  onClick={() => setSelectedEventType(type)}
                  className="flex-shrink-0"
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          
          {isLoadingSuggestions ? (
            renderSkeletons()
          ) : suggestions?.events && suggestions.events.length > 0 ? (
            suggestions.events.map(renderEventSuggestionCard)
          ) : (
            <div className="text-center py-10">
              <Lightbulb className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No event suggestions found for this event type</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="tips">
          {isLoadingTips ? (
            renderSkeletons()
          ) : tipsError ? (
            <div className="text-center py-6 text-red-500">
              Error loading planning tips. Please try again.
            </div>
          ) : planningTips && planningTips.length > 0 ? (
            planningTips.map(renderPlanningTipCard)
          ) : (
            <div className="text-center py-10">
              <Lightbulb className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No planning tips available</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
