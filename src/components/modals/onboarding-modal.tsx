"use client"

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, Check } from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-md overflow-hidden" aria-describedby="onboarding-description">
        <div className="p-6">
          <div className="text-center mb-6">
            <DialogTitle className="text-2xl font-semibold mb-2">Welcome to Eventra AI</DialogTitle>
            <DialogDescription id="onboarding-description" className="text-gray-600">
              Your AI-powered assistant for planning amazing events of all types
            </DialogDescription>
          </div>
          
          <div className="space-y-5 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                <div className="rounded-full bg-[hsl(var(--eventra-blue))]/10 p-1">
                  <Check className="h-5 w-5 text-[hsl(var(--eventra-blue))]" />
                </div>
              </div>
              <p className="text-sm text-gray-600">Create and manage events with AI assistance</p>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                <div className="rounded-full bg-[hsl(var(--eventra-blue))]/10 p-1">
                  <Check className="h-5 w-5 text-[hsl(var(--eventra-blue))]" />
                </div>
              </div>
              <p className="text-sm text-gray-600">Get personalized recommendations for themes and activities</p>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                <div className="rounded-full bg-[hsl(var(--eventra-blue))]/10 p-1">
                  <Check className="h-5 w-5 text-[hsl(var(--eventra-blue))]" />
                </div>
              </div>
              <p className="text-sm text-gray-600">Streamline your planning process with smart checklists</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              className="w-full bg-gradient-to-r from-[hsl(var(--eventra-teal))] via-[hsl(var(--eventra-blue))] to-[hsl(var(--eventra-purple))] text-white" 
              onClick={onComplete}
            >
              Get Started
            </Button>
            <Button variant="outline" className="w-full text-gray-500 border-gray-200" onClick={onClose}>
              Skip for now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
