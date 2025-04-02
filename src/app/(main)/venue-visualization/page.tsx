"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import VenueVisualizationModal from "@/components/modals/venue-visualization-modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Camera, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VenueVisualizationPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  
  // Open modal when page loads
  useEffect(() => {
    setIsModalOpen(true);
  }, []);
  
  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    // Navigate back to dashboard after modal closes
    router.push("/dashboard");
  };
  
  // Example of fetching real data
  const fetchVisualizations = async () => {
    try {
      const response = await fetch('/api/visualizations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch visualizations');
      }

      const data = await response.json();
      return data.visualizations || [];
    } catch (error) {
      console.error('Error fetching visualizations:', error);
      return [];
    }
  };
  
  return (
    <div className="container py-10">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => router.push("/dashboard")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
      
      <div className="flex flex-col items-center justify-center">
        <div className="max-w-4xl w-full space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-500" />
                AI Venue Visualization
              </CardTitle>
              <CardDescription>
                Transform your venue photos with AI-generated themed decorations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-6 py-12">
                <div className="rounded-full bg-primary/10 p-6 inline-flex">
                  <Camera className="h-12 w-12 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-medium">Create Venue Visualizations</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Upload photos of your venue and see how it would look with different themes and decorations.
                  </p>
                </div>
                <Button 
                  size="lg" 
                  className="mt-4"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Visualization
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <VenueVisualizationModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
      />
    </div>
  );
} 