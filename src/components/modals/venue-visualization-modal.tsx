"use client";

import { useState, useRef, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks";
import { AuthContext } from "@/app/providers";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, Sparkles, RefreshCw, Camera, Eye, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Theme options for venue visualization
const THEME_OPTIONS = [
  { id: "elegant", name: "Elegant", description: "Sophisticated and refined decoration style" },
  { id: "rustic", name: "Rustic", description: "Natural, warm, and earthy elements" },
  { id: "modern", name: "Modern", description: "Clean lines, monochromatic colors, and minimalist style" },
  { id: "bohemian", name: "Bohemian", description: "Eclectic, colorful, and artistic approach" },
  { id: "tropical", name: "Tropical", description: "Bright, lively with exotic elements" },
  { id: "vintage", name: "Vintage", description: "Nostalgic with antique touches" },
  { id: "industrial", name: "Industrial", description: "Raw, utilitarian with urban edge" },
  { id: "glamorous", name: "Glamorous", description: "Luxurious with metallics and dramatic elements" },
];

// Form type definition
interface FormData {
  image: FileList;
  eventId: string;
  theme: string;
  eventType: string;
  additionalPrompt?: string;
}

interface VenueVisualizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VenueVisualizationModal({ isOpen, onClose }: VenueVisualizationModalProps) {
  const { toast } = useToast();
  const auth = useAuth();
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [visualizationId, setVisualizationId] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>();
  const selectedTheme = watch("theme");
  const selectedEventId = watch("eventId");
  const selectedFiles = watch("image");
  
  // Fetch user's events for the dropdown
  const { data: events, isLoading: loadingEvents } = useQuery({
    queryKey: ['userEvents'],
    queryFn: async () => {
      if (!user) return [];
      
      const response = await fetch('/api/events?status=all&limit=10', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const data = await response.json();
      return data.events || [];
    },
    enabled: !!user
  });
  
  // Handle file selection for preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };
  
  // Handle form submission
  const onSubmit = async (data: FormData) => {
    if (!data.image || data.image.length === 0) {
      toast({
        title: "Image Required",
        description: "Please select a venue image to visualize",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', data.image[0]);
      formData.append('theme', data.theme);
      formData.append('eventType', data.eventType);
      
      if (data.additionalPrompt) {
        formData.append('additionalPrompt', data.additionalPrompt);
      }
      
      const response = await fetch(`/api/events/${data.eventId}/venue-visualization`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate visualization');
      }
      
      const result = await response.json();
      
      // Get the visualization details with URLs
      const visualizationResponse = await fetch(
        `/api/events/${data.eventId}/venue-visualization/${result.visualizationId}`,
        { credentials: 'include' }
      );
      
      if (visualizationResponse.ok) {
        const visualizationData = await visualizationResponse.json();
        setVisualizationId(result.visualizationId);
        setGeneratedImageUrl(visualizationData.visualization.generatedUrl);
        setShowComparison(true);
      }
      
      toast({
        title: "Visualization Complete",
        description: "Your themed venue visualization has been generated!",
      });
    } catch (error) {
      console.error('Visualization error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate visualization",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle modal close
  const handleClose = () => {
    reset();
    setPreviewUrl(null);
    setVisualizationId(null);
    setGeneratedImageUrl(null);
    setShowComparison(false);
    onClose();
  };
  
  // Handle deletion of a visualization
  const handleDeleteVisualization = async () => {
    if (!visualizationId || !selectedEventId) return;
    
    try {
      const response = await fetch(
        `/api/events/${selectedEventId}/venue-visualization/${visualizationId}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete visualization');
      }
      
      toast({
        title: "Deleted",
        description: "Visualization has been deleted",
      });
      
      setVisualizationId(null);
      setGeneratedImageUrl(null);
      setShowComparison(false);
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "Failed to delete visualization",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Venue Visualization
          </DialogTitle>
          <DialogDescription>
            Transform your venue photos with AI-generated themed decorations
          </DialogDescription>
        </DialogHeader>
        
        {showComparison && generatedImageUrl ? (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Visualization Results</h3>
            
            <Tabs defaultValue="comparison" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="comparison" className="flex-1">Side by Side</TabsTrigger>
                <TabsTrigger value="original" className="flex-1">Original</TabsTrigger>
                <TabsTrigger value="themed" className="flex-1">Themed</TabsTrigger>
              </TabsList>
              
              <TabsContent value="comparison" className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Original Venue</h4>
                    <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                      {previewUrl && (
                        <Image
                          src={previewUrl}
                          alt="Original venue"
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Themed Visualization</h4>
                    <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                      <Image
                        src={generatedImageUrl}
                        alt="Themed venue"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="original">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Original Venue</h4>
                  <div className="relative aspect-video max-h-[60vh] w-full rounded-md overflow-hidden bg-muted">
                    {previewUrl && (
                      <Image
                        src={previewUrl}
                        alt="Original venue"
                        fill
                        className="object-contain"
                      />
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="themed">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Themed Visualization</h4>
                  <div className="relative aspect-video max-h-[60vh] w-full rounded-md overflow-hidden bg-muted">
                    <Image
                      src={generatedImageUrl}
                      alt="Themed venue"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setShowComparison(false);
                  setVisualizationId(null);
                  setGeneratedImageUrl(null);
                }}
              >
                Create New Visualization
              </Button>
              
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/events/${selectedEventId}/visualizations`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={handleDeleteVisualization}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event-select">Select Event</Label>
                <Select 
                  defaultValue="" 
                  {...register("eventId", { required: true })}
                  onValueChange={(value) => {
                    // react-hook-form setValue
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingEvents ? (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : events && events.length > 0 ? (
                      events.map((event: any) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title || event.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No events found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.eventId && (
                  <p className="text-sm text-red-500">Please select an event</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Upload Venue Image</Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="venue-image"
                    className={cn(
                      "flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600",
                      previewUrl ? "h-64" : "h-32 p-6"
                    )}
                  >
                    {previewUrl ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={previewUrl}
                          alt="Venue preview"
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Camera className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          JPG or PNG (MAX. 4MB)
                        </p>
                      </div>
                    )}
                    <input
                      id="venue-image"
                      type="file"
                      className="hidden"
                      accept="image/png, image/jpeg, image/jpg"
                      {...register("image", { required: true })}
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                  </label>
                </div>
                {errors.image && (
                  <p className="text-sm text-red-500">Please upload a venue image</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Select Theme</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {THEME_OPTIONS.map((theme) => (
                    <label
                      key={theme.id}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 rounded-md border-2 p-3 cursor-pointer hover:bg-accent/50",
                        selectedTheme === theme.id ? "border-primary bg-accent" : "border-muted"
                      )}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        value={theme.id}
                        {...register("theme", { required: true })}
                      />
                      <span className="text-sm font-medium">{theme.name}</span>
                      <span className="text-xs text-muted-foreground leading-tight text-center">
                        {theme.description}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.theme && (
                  <p className="text-sm text-red-500">Please select a theme</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="event-type">Event Type</Label>
                <Select 
                  defaultValue="party" 
                  {...register("eventType", { required: true })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="party">Party</SelectItem>
                    <SelectItem value="wedding">Wedding</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="corporate">Corporate Event</SelectItem>
                    <SelectItem value="gala">Gala</SelectItem>
                    <SelectItem value="birthday">Birthday</SelectItem>
                    <SelectItem value="concert">Concert</SelectItem>
                  </SelectContent>
                </Select>
                {errors.eventType && (
                  <p className="text-sm text-red-500">Please select an event type</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="additional-prompt">Additional Details (Optional)</Label>
                <Textarea
                  id="additional-prompt"
                  placeholder="Add any specific details you want to include in the visualization"
                  className="resize-none"
                  maxLength={100}
                  {...register("additionalPrompt")}
                />
                <p className="text-xs text-muted-foreground">
                  Specify any additional elements or details you'd like to see in your themed venue
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Visualization
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
} 