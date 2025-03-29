"use client"

import { useRouter } from "next/navigation";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

const AiSuggestions = () => {
  const router = useRouter();
  
  return (
    <div className="mb-6">
      <h3 className="font-medium text-lg mb-3">Suggested For You</h3>
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl text-white p-5">
        <div className="flex items-start">
          <div className="mr-4">
            <Lightbulb className="h-8 w-8 text-white" />
          </div>
          <div>
            <h4 className="font-medium text-white mb-1">AI-Powered Event Themes</h4>
            <p className="text-primary-foreground/80 text-sm mb-3">Discover trending themes for your next virtual conference</p>
            <Button
              variant="secondary"
              onClick={() => router.push("/discover")}
            >
              Explore Themes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiSuggestions;
