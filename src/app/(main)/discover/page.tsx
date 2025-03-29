'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Lightbulb, 
  Palette, 
  Sparkles, 
  Users, 
  Search, 
  Heart, 
  CheckCircle2, 
  DollarSign,
  ChevronRight,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

// Define the interface for a suggestion item
interface SuggestionItem {
  id: number;
  title: string;
  description: string;
  color: string;
}

// Define the interface for all suggestions categories
interface AllSuggestions {
  [key: string]: SuggestionItem[];
}

export default function DiscoverPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState('themes');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFavorited, setIsFavorited] = useState<Record<string, boolean>>({});
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Handle favorite toggle
  const toggleFavorite = (id: string) => {
    setIsFavorited(prev => {
      const newState = { ...prev };
      newState[id] = !prev[id];
      
      // Show toast
      if (newState[id]) {
        toast({
          title: "Added to favorites",
          description: "Item added to your favorites"
        });
      }
      
      return newState;
    });
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--manako-purple))] mx-auto mb-4" />
          <p className="text-muted-foreground">Loading discover page...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  // Categories for the left sidebar
  const categories = [
    {
      id: 'themes',
      name: 'Event Themes',
      icon: <Palette className="h-5 w-5" />,
      color: 'bg-purple-500/10 text-purple-500'
    },
    {
      id: 'ideas',
      name: 'Event Ideas',
      icon: <Lightbulb className="h-5 w-5" />,
      color: 'bg-amber-500/10 text-amber-500'
    },
    {
      id: 'activities',
      name: 'Activities',
      icon: <Users className="h-5 w-5" />,
      color: 'bg-blue-500/10 text-blue-500'
    },
    {
      id: 'budget',
      name: 'Budget Tips',
      icon: <DollarSign className="h-5 w-5" />,
      color: 'bg-green-500/10 text-green-500'
    },
    {
      id: 'checklists',
      name: 'Checklists',
      icon: <CheckCircle2 className="h-5 w-5" />,
      color: 'bg-pink-500/10 text-pink-500'
    }
  ];

  // Mock suggestions data properly typed
  const suggestionsData: AllSuggestions = {
    themes: [
      {
        id: 1,
        title: 'Modern Tech Conference',
        description: 'Clean, minimalist design with high-tech elements perfect for product launches',
        color: 'bg-blue-500/10 border-blue-500/20'
      },
      {
        id: 2,
        title: 'Creative Workshop',
        description: 'Vibrant and playful design ideal for workshops and creative team building',
        color: 'bg-purple-500/10 border-purple-500/20'
      },
      {
        id: 3,
        title: 'Corporate Gala',
        description: 'Elegant and sophisticated design for formal corporate events and ceremonies',
        color: 'bg-indigo-500/10 border-indigo-500/20'
      }
    ],
    ideas: [
    {
      id: 1,
        title: 'Virtual Industry Summit',
        description: 'A comprehensive multi-day event featuring keynotes and breakout sessions',
        color: 'bg-green-500/10 border-green-500/20'
    },
    {
      id: 2,
        title: 'Interactive Workshop Series',
        description: 'Hands-on workshops where participants can develop new skills',
        color: 'bg-amber-500/10 border-amber-500/20'
      }
    ],
    activities: [
      {
        id: 1,
        title: 'Team Building Exercises',
        description: 'Fun activities to improve team collaboration and communication',
        color: 'bg-cyan-500/10 border-cyan-500/20'
      }
    ],
    budget: [
      {
        id: 1,
        title: 'Budget Planning Template',
        description: 'Comprehensive template to track and manage your event budget',
        color: 'bg-green-500/10 border-green-500/20'
      }
    ],
    checklists: [
      {
        id: 1,
        title: 'Event Planning Checklist',
        description: 'Complete checklist to ensure nothing is forgotten in your event planning',
        color: 'bg-pink-500/10 border-pink-500/20'
      }
    ]
  };

  // Filter suggestions based on search query
  const filteredSuggestions: AllSuggestions = searchQuery.trim() 
    ? Object.entries(suggestionsData).reduce((acc, [key, items]) => {
        acc[key] = items.filter(item => 
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    return acc;
      }, {} as AllSuggestions)
    : suggestionsData;
    
    return (
    <div className="pb-20 md:pb-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="py-6 md:py-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-white/20 p-2 rounded-full">
            <Sparkles className="h-5 w-5 text-white" />
            </div>
          <h2 className="text-2xl font-bold text-white">Discover</h2>
          </div>
        <p className="text-white/70 text-sm">
          Find inspiration and ideas for your next event
        </p>
          </div>
      
      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />
        <Input
          type="search"
          placeholder="Search for ideas, themes, and more..."
          className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-white/50 focus-visible:ring-[hsl(var(--manako-purple))]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
            </div>
            
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* Left Sidebar */}
        <div className="md:col-span-1">
          <div className="manako-card sticky top-20">
            <h3 className="text-lg font-semibold mb-4 text-[hsl(var(--manako-purple))]">Categories</h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    activeCategory === category.id ? "bg-accent" : ""
                  )}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <div className={`mr-2 rounded-full p-1 ${category.color}`}>
                    {category.icon}
                </div>
                  <span>{category.name}</span>
          </Button>
            ))}
          </div>
          </div>
                    </div>
        
        {/* Main Content */}
        <div className="md:col-span-3">
          {Object.keys(filteredSuggestions).map(category => {
            if (category === activeCategory && filteredSuggestions[category].length > 0) {
              return (
                <div key={category} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white capitalize">
                      {categories.find(c => c.id === category)?.name}
                    </h3>
                    {filteredSuggestions[category].length > 3 && (
                      <Button variant="ghost" size="sm" className="text-white">
                        View all <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            )}
          </div>
          
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredSuggestions[category].map(item => {
                      const itemKey = `${category}-${item.id}`;
                      return (
                        <div key={itemKey} className="manako-card hover:shadow-xl transition-shadow">
                          <div className="flex flex-col h-full">
                            <h4 className="font-medium mb-2">{item.title}</h4>
                            <p className="text-muted-foreground text-sm mb-4 flex-grow">
                              {item.description}
                            </p>
                            <div className="flex justify-between items-center mt-auto">
                              <Button variant="outline" size="sm">
                                View Details
            </Button>
            <Button
                    variant="ghost"
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => toggleFavorite(itemKey)}
                              >
                                <Heart 
                                  className={cn(
                                    "h-4 w-4",
                                    isFavorited[itemKey] ? "fill-[hsl(var(--manako-purple))] text-[hsl(var(--manako-purple))]" : ""
                                  )} 
                                />
                          </Button>
                      </div>
                        </div>
                      </div>
                      );
                    })}
                      </div>
                      </div>
              );
            }
            return null;
          })}
          
          {/* No results */}
          {searchQuery && Object.values(filteredSuggestions).every(items => items.length === 0) && (
            <div className="manako-card text-center">
              <p className="text-muted-foreground mb-4">
                No results found for "{searchQuery}"
              </p>
              <Button className="manako-button" onClick={() => setSearchQuery('')}>
                Clear Search
                          </Button>
                      </div>
                    )}
        </div>
      </div>
    </div>
  );
}