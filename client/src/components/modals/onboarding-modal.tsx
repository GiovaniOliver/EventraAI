import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles } from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-md overflow-hidden">
        <div className="relative h-40 bg-gradient-to-r from-primary-400 to-primary-600">
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-16 w-16 text-white" />
          </div>
        </div>
        
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-2 text-center">Welcome to EventFlow</h2>
          <p className="text-gray-600 text-center mb-6">Your AI-powered assistant for planning amazing virtual and hybrid events</p>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary-500 mr-3 mt-1 flex-shrink-0" />
              <p className="text-sm">Create and manage events with AI assistance</p>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary-500 mr-3 mt-1 flex-shrink-0" />
              <p className="text-sm">Get personalized recommendations for themes and activities</p>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary-500 mr-3 mt-1 flex-shrink-0" />
              <p className="text-sm">Streamline your planning process with smart checklists</p>
            </div>
          </div>
          
          <Button className="w-full mb-2" onClick={onComplete}>Get Started</Button>
          <Button variant="ghost" className="w-full text-gray-500" onClick={onClose}>Skip for now</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
