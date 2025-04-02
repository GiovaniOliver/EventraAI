"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Trash2, 
  Sparkles, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  XCircle 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Visualization {
  id: string;
  event_id: string;
  original_image_path: string;
  generated_image_path: string | null;
  theme: string;
  prompt: string | null;
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
  originalUrl?: string;
  generatedUrl?: string;
}

interface VisualizationGalleryProps {
  eventId: string;
}

export default function VisualizationGallery({ eventId }: VisualizationGalleryProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedVisualization, setSelectedVisualization] = useState<Visualization | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "compare">("grid");
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Fetch visualizations for this event
  const { 
    data: visualizations, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['visualizations', eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/venue-visualization`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch visualizations');
      }
      
      const data = await response.json();
      return data.visualizations || [];
    },
  });

  // Delete visualization mutation
  const deleteVisualization = useMutation({
    mutationFn: async (visualizationId: string) => {
      const response = await fetch(
        `/api/events/${eventId}/venue-visualization/${visualizationId}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete visualization');
      }
      
      return visualizationId;
    },
    onSuccess: (deletedId) => {
      toast({
        title: "Visualization Deleted",
        description: "The visualization has been removed"
      });
      
      // Close fullscreen view if the deleted item was selected
      if (selectedVisualization?.id === deletedId) {
        setSelectedVisualization(null);
        setIsFullscreen(false);
      }
      
      // Refresh visualizations
      queryClient.invalidateQueries({ queryKey: ['visualizations', eventId] });
    },
    onError: (error) => {
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "Failed to delete visualization",
        variant: "destructive"
      });
    }
  });

  // Handle fullscreen view
  const openFullscreen = (visualization: Visualization) => {
    setSelectedVisualization(visualization);
    setIsFullscreen(true);
  };
  
  // Handle closing fullscreen view
  const closeFullscreen = () => {
    setIsFullscreen(false);
  };
  
  // Handle download image
  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Handle visualization deletion
  const handleDelete = (visualizationId: string) => {
    if (confirm("Are you sure you want to delete this visualization?")) {
      deleteVisualization.mutate(visualizationId);
    }
  };
  
  // Get the appropriate status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            <Clock className="w-3 h-3 mr-1" />
            Processing
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };
  
  // Get theme badge
  const getThemeBadge = (theme: string) => {
    const themeColors: Record<string, string> = {
      elegant: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      rustic: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
      modern: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300",
      bohemian: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300",
      tropical: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
      vintage: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      industrial: "bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-300",
      glamorous: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    };
    
    const colorClass = themeColors[theme.toLowerCase()] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    
    return (
      <Badge variant="outline" className={colorClass}>
        <Sparkles className="w-3 h-3 mr-1" />
        {theme.charAt(0).toUpperCase() + theme.slice(1)}
      </Badge>
    );
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  if (isError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>
          {error instanceof Error ? error.message : "Failed to load visualizations"}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <div className="relative aspect-video">
                  <Skeleton className="h-full w-full rounded-t-lg" />
                </div>
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (!visualizations || visualizations.length === 0) {
    return (
      <div className="text-center py-12">
        <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Visualizations Yet</h3>
        <p className="text-muted-foreground mb-6">
          Upload a venue image and let AI transform it with themed decorations
        </p>
        <Button variant="default">
          <Sparkles className="h-4 w-4 mr-2" />
          Create Visualization
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Venue Visualizations</h2>
          <div className="flex items-center gap-2">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "compare")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="compare">Compare</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visualizations.map((visualization: Visualization) => (
              <Card key={visualization.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div 
                    className="relative aspect-video cursor-pointer" 
                    onClick={() => openFullscreen(visualization)}
                  >
                    {visualization.status === 'completed' && visualization.generatedUrl ? (
                      <Image
                        src={visualization.generatedUrl}
                        alt={`Visualization with ${visualization.theme} theme`}
                        fill
                        className="object-cover"
                      />
                    ) : visualization.status === 'processing' ? (
                      <div className="flex items-center justify-center h-full w-full bg-muted">
                        <RefreshCw className="h-12 w-12 text-muted-foreground animate-spin" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full w-full bg-muted">
                        <XCircle className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      {getThemeBadge(visualization.theme)}
                      {getStatusBadge(visualization.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(visualization.created_at)}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Options
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {visualization.status === 'completed' && (
                            <DropdownMenuItem 
                              onClick={() => 
                                visualization.generatedUrl && 
                                handleDownload(
                                  visualization.generatedUrl,
                                  `visualization-${visualization.id}.jpg`
                                )
                              }
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive" 
                            onClick={() => handleDelete(visualization.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Carousel className="w-full">
            <CarouselContent>
              {visualizations.map((visualization: Visualization) => (
                <CarouselItem key={visualization.id} className="md:basis-1/2">
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex flex-col p-6">
                        <div className="text-xl font-semibold mb-2 flex items-center justify-between">
                          {getThemeBadge(visualization.theme)}
                          {getStatusBadge(visualization.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="space-y-2">
                            <div className="text-sm font-medium">Original</div>
                            <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
                              {visualization.originalUrl && (
                                <Image
                                  src={visualization.originalUrl}
                                  alt="Original venue"
                                  fill
                                  className="object-cover"
                                />
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-sm font-medium">Themed</div>
                            <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
                              {visualization.status === 'completed' && visualization.generatedUrl ? (
                                <Image
                                  src={visualization.generatedUrl}
                                  alt="Themed venue"
                                  fill
                                  className="object-cover"
                                />
                              ) : visualization.status === 'processing' ? (
                                <div className="flex items-center justify-center h-full">
                                  <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
                                </div>
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <XCircle className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-auto flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(visualization.created_at)}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openFullscreen(visualization)}
                          >
                            View Full
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        )}
      </div>
      
      {/* Fullscreen Visualization Dialog */}
      <Dialog open={isFullscreen} onOpenChange={closeFullscreen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedVisualization && (
                <>
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  {selectedVisualization.theme.charAt(0).toUpperCase() + selectedVisualization.theme.slice(1)} Theme Visualization
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedVisualization && (
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(selectedVisualization.status)}
                  <span className="text-sm">
                    Created on {formatDate(selectedVisualization.created_at)}
                  </span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedVisualization && (
            <Tabs defaultValue="comparison" className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="comparison">Side by Side</TabsTrigger>
                <TabsTrigger value="original">Original</TabsTrigger>
                <TabsTrigger value="themed">Themed</TabsTrigger>
              </TabsList>
              
              <TabsContent value="comparison" className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Original Venue</h4>
                    <div className="relative aspect-video max-h-[60vh] rounded-md overflow-hidden bg-muted">
                      {selectedVisualization.originalUrl && (
                        <Image
                          src={selectedVisualization.originalUrl}
                          alt="Original venue"
                          fill
                          className="object-contain"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Themed Visualization</h4>
                    <div className="relative aspect-video max-h-[60vh] rounded-md overflow-hidden bg-muted">
                      {selectedVisualization.status === 'completed' && selectedVisualization.generatedUrl ? (
                        <Image
                          src={selectedVisualization.generatedUrl}
                          alt="Themed venue"
                          fill
                          className="object-contain"
                        />
                      ) : selectedVisualization.status === 'processing' ? (
                        <div className="flex items-center justify-center h-full">
                          <RefreshCw className="h-12 w-12 text-muted-foreground animate-spin" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <XCircle className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="original">
                <div className="space-y-2 mt-4">
                  <h4 className="text-sm font-medium">Original Venue</h4>
                  <div className="relative aspect-video max-h-[70vh] w-full rounded-md overflow-hidden bg-muted">
                    {selectedVisualization.originalUrl && (
                      <Image
                        src={selectedVisualization.originalUrl}
                        alt="Original venue"
                        fill
                        className="object-contain"
                      />
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="themed">
                <div className="space-y-2 mt-4">
                  <h4 className="text-sm font-medium">Themed Visualization</h4>
                  <div className="relative aspect-video max-h-[70vh] w-full rounded-md overflow-hidden bg-muted">
                    {selectedVisualization.status === 'completed' && selectedVisualization.generatedUrl ? (
                      <Image
                        src={selectedVisualization.generatedUrl}
                        alt="Themed venue"
                        fill
                        className="object-contain"
                      />
                    ) : selectedVisualization.status === 'processing' ? (
                      <div className="flex items-center justify-center h-full">
                        <RefreshCw className="h-12 w-12 text-muted-foreground animate-spin" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <XCircle className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter className="sm:justify-between">
            {selectedVisualization && selectedVisualization.status === 'completed' && (
              <Button 
                variant="outline"
                onClick={() => selectedVisualization.generatedUrl && 
                  handleDownload(
                    selectedVisualization.generatedUrl,
                    `visualization-${selectedVisualization.id}.jpg`
                  )
                }
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
            
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={closeFullscreen}
              >
                Close
              </Button>
              
              {selectedVisualization && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete(selectedVisualization.id);
                    closeFullscreen();
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 