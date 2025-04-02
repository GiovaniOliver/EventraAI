"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import VenueVisualizationModal from "@/components/modals/venue-visualization-modal";
import { Plus, Sparkles } from "lucide-react";

interface ClientPageProps {
  eventId: string;
}

export default function ClientPage({ eventId }: ClientPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        <Sparkles className="mr-2 h-4 w-4" />
        Create Visualization
      </Button>
      
      <VenueVisualizationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
} 