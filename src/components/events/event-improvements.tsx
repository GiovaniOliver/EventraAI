"use client"

import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Sparkles, 
  TrendingUp, 
  ArrowRight, 
  Check, 
  ChevronDown, 
  Lightbulb,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import { ImprovementSuggestion } from "@/lib/ai-service";
import { Event } from "@/lib/supabase";
import { getEventImprovements } from "@/lib/ai-service";
import { useToast } from "@/hooks/use-toast";

interface EventImprovementsProps {
  event: Event;
}

export default function EventImprovements({ event }: EventImprovementsProps) {
  const { toast } = useToast();
  const [improvementSuggestions, setImprovementSuggestions] = useState<ImprovementSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Generate improvement suggestions
  const handleGenerateSuggestions = async () => {
    if (!event) return;
    
    setIsLoading(true);
    try {
      const improvements = await getEventImprovements(event);
      
      if (improvements && improvements.length > 0) {
        setImprovementSuggestions(improvements);
        toast({
          title: "AI Insights Generated",
          description: `Generated ${improvements.length} improvement suggestions for your event`,
        });
      } else {
        toast({
          title: "No Suggestions",
          description: "Couldn't generate improvement suggestions for this event type",
          variant: "destructive"
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
      setIsLoading(false);
    }
  };
  
  // Filter suggestions based on active tab
  const filteredSuggestions = improvementSuggestions.filter(suggestion => {
    if (activeTab === "all") return true;
    if (activeTab === "high") return suggestion.impact === "high";
    if (activeTab === "medium") return suggestion.impact === "medium";
    if (activeTab === "low") return suggestion.impact === "low";
    return true;
  });
  
  // Get count for each impact level
  const getCountByImpact = (impact: string) => {
    return improvementSuggestions.filter(s => s.impact === impact).length;
  };
  
  const highCount = getCountByImpact("high");
  const mediumCount = getCountByImpact("medium");
  const lowCount = getCountByImpact("low");
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            AI Event Improvement Assistant
          </h3>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center items-center mb-4">
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-4 w-3/4 mx-auto mb-4" />
            <Skeleton className="h-4 w-1/2 mx-auto mb-6" />
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-start space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (improvementSuggestions.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            AI Event Improvement Assistant
          </h3>
        </div>
        
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center max-w-md mx-auto">
              <Sparkles className="h-12 w-12 mb-4 text-primary/60" />
              <CardTitle className="text-xl mb-2">Event Improvement Suggestions</CardTitle>
              <CardDescription className="mb-6 text-base">
                Get AI-powered recommendations to enhance your {event.format} event experience and maximize engagement.
              </CardDescription>
              <Button 
                onClick={handleGenerateSuggestions}
                size="lg"
                className="px-8"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Suggestions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-primary" />
          AI Event Improvement Assistant
        </h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleGenerateSuggestions}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Refresh Suggestions
        </Button>
      </div>
      
      <Alert className="bg-primary/5 border-primary/20">
        <Lightbulb className="h-4 w-4 text-primary" />
        <AlertTitle>AI-generated suggestions</AlertTitle>
        <AlertDescription>
          These recommendations are tailored to your "{event.title}" event based on best practices for {event.format} events.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all">
            All ({improvementSuggestions.length})
          </TabsTrigger>
          <TabsTrigger value="high" className="text-red-600">
            High Impact ({highCount})
          </TabsTrigger>
          <TabsTrigger value="medium" className="text-amber-600">
            Medium ({mediumCount})
          </TabsTrigger>
          <TabsTrigger value="low" className="text-green-600">
            Low ({lowCount})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4 mt-2">
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((suggestion, index) => (
              <Card key={index} className="overflow-hidden">
                <div className={`h-1 ${
                  suggestion.impact === 'high' ? 'bg-red-500' : 
                  suggestion.impact === 'medium' ? 'bg-amber-500' : 
                  'bg-green-500'
                }`} />
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      suggestion.impact === 'high' ? 'bg-red-100 text-red-600' : 
                      suggestion.impact === 'medium' ? 'bg-amber-100 text-amber-600' : 
                      'bg-green-100 text-green-600'
                    }`}>
                      {suggestion.impact === 'high' ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : suggestion.impact === 'medium' ? (
                        <ArrowRight className="h-5 w-5" />
                      ) : (
                        <Check className="h-5 w-5" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="text-base font-semibold">{suggestion.title}</h4>
                        <Badge variant="outline" className="capitalize ml-2">
                          {suggestion.area}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>
                      
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-0 h-auto text-xs">
                            <ChevronDown className="h-3 w-3 mr-1" />
                            How to implement
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="mt-3 border-l-2 border-muted pl-4 text-sm text-muted-foreground">
                            <p className="mb-2">{suggestion.implementation}</p>
                            
                            {suggestion.resources && suggestion.resources.length > 0 && (
                              <div className="mt-3">
                                <p className="font-medium text-xs uppercase text-muted-foreground mb-2">Resources</p>
                                <ul className="space-y-1">
                                  {suggestion.resources.map((resource, i) => (
                                    <li key={i} className="flex items-center">
                                      <ExternalLink className="h-3 w-3 mr-1 text-primary" />
                                      <span className="text-primary">{resource}</span>
                                    </li>
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
            ))
          ) : (
            <div className="flex items-center justify-center p-8 text-center border rounded-lg border-dashed">
              <div>
                <AlertTriangle className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p>No suggestions with {activeTab} impact level found.</p>
                <Button 
                  variant="ghost" 
                  onClick={() => setActiveTab('all')} 
                  className="mt-2"
                >
                  View all suggestions
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}