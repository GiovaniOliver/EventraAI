import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Cake, School, PartyPopper, MoreHorizontal } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const eventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  type: z.enum(["conference", "birthday", "webinar", "other"]),
  format: z.enum(["virtual", "in-person", "hybrid"]),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  estimatedGuests: z.number().min(1, "Number of guests is required"),
  ownerId: z.number().default(1), // For demo purposes, hardcoded ownerId
});

type EventFormData = z.infer<typeof eventSchema>;

export default function NewEventModal({ isOpen, onClose }: NewEventModalProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      type: "conference",
      format: "virtual",
      ownerId: 1,
    }
  });
  
  const [selectedType, setSelectedType] = useState<string>("conference");
  const [selectedFormat, setSelectedFormat] = useState<string>("virtual");
  
  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setValue("type", type as "conference" | "birthday" | "webinar" | "other");
  };
  
  const handleFormatSelect = (format: string) => {
    setSelectedFormat(format);
    setValue("format", format as "virtual" | "in-person" | "hybrid");
  };
  
  const onSubmit = async (data: EventFormData) => {
    try {
      // Convert date and time to a single date string
      const dateObj = new Date(`${data.date}T${data.time}`);
      
      const eventData = {
        name: data.name,
        type: data.type,
        format: data.format,
        date: dateObj.toISOString(),
        estimatedGuests: data.estimatedGuests,
        ownerId: data.ownerId,
        status: "planning",
      };
      
      const response = await apiRequest("POST", "/api/events", eventData);
      const newEvent = await response.json();
      
      // Invalidate events cache to refresh the events list
      queryClient.invalidateQueries({ queryKey: ["/api/users/1/events"] });
      
      toast({
        title: "Event Created",
        description: `${newEvent.name} has been created successfully.`,
      });
      
      onClose();
      navigate("/events");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-md rounded-t-xl w-full sm:max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <button className="text-gray-500" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">Create New Event</h2>
          <div className="w-6"></div>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="mb-6">
            <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Event Name</Label>
            <Input 
              id="name"
              placeholder="Enter event name" 
              className="w-full px-4 py-3"
              {...register("name")}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>
          
          <div className="mb-6">
            <Label className="block text-sm font-medium text-gray-700 mb-1">Event Type</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className={`border rounded-lg p-4 text-center ${selectedType === "conference" ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:border-primary-500 hover:bg-primary-50"}`}
                onClick={() => handleTypeSelect("conference")}
              >
                <PartyPopper className="h-5 w-5 mx-auto mb-2 text-gray-500" />
                <span className="text-sm">Conference</span>
              </button>
              
              <button
                type="button"
                className={`border rounded-lg p-4 text-center ${selectedType === "birthday" ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:border-primary-500 hover:bg-primary-50"}`}
                onClick={() => handleTypeSelect("birthday")}
              >
                <Cake className="h-5 w-5 mx-auto mb-2 text-gray-500" />
                <span className="text-sm">Birthday</span>
              </button>
              
              <button
                type="button"
                className={`border rounded-lg p-4 text-center ${selectedType === "webinar" ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:border-primary-500 hover:bg-primary-50"}`}
                onClick={() => handleTypeSelect("webinar")}
              >
                <School className="h-5 w-5 mx-auto mb-2 text-gray-500" />
                <span className="text-sm">Webinar</span>
              </button>
              
              <button
                type="button"
                className={`border rounded-lg p-4 text-center ${selectedType === "other" ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:border-primary-500 hover:bg-primary-50"}`}
                onClick={() => handleTypeSelect("other")}
              >
                <MoreHorizontal className="h-5 w-5 mx-auto mb-2 text-gray-500" />
                <span className="text-sm">Other</span>
              </button>
            </div>
            <input type="hidden" {...register("type")} />
          </div>
          
          <div className="mb-6">
            <Label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</Label>
            <div className="flex space-x-3">
              <div className="flex-1">
                <Input 
                  type="date" 
                  className="w-full px-4 py-3"
                  {...register("date")}
                />
                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
              </div>
              <div className="flex-1">
                <Input 
                  type="time" 
                  className="w-full px-4 py-3"
                  {...register("time")}
                />
                {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>}
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <Label className="block text-sm font-medium text-gray-700 mb-1">Event Format</Label>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant={selectedFormat === "virtual" ? "default" : "outline"}
                className="flex-1"
                onClick={() => handleFormatSelect("virtual")}
              >
                Virtual
              </Button>
              <Button
                type="button"
                variant={selectedFormat === "in-person" ? "default" : "outline"}
                className="flex-1"
                onClick={() => handleFormatSelect("in-person")}
              >
                In-Person
              </Button>
              <Button
                type="button"
                variant={selectedFormat === "hybrid" ? "default" : "outline"}
                className="flex-1"
                onClick={() => handleFormatSelect("hybrid")}
              >
                Hybrid
              </Button>
            </div>
            <input type="hidden" {...register("format")} />
          </div>
          
          <div className="mb-8">
            <Label htmlFor="estimatedGuests" className="block text-sm font-medium text-gray-700 mb-1">Estimated Guests</Label>
            <Input 
              id="estimatedGuests"
              type="number" 
              min="1"
              placeholder="Enter number of guests" 
              className="w-full px-4 py-3"
              {...register("estimatedGuests", { valueAsNumber: true })}
            />
            {errors.estimatedGuests && <p className="text-red-500 text-sm mt-1">{errors.estimatedGuests.message}</p>}
          </div>
          
          <div>
            <Button type="submit" className="w-full mb-3">Continue</Button>
            <Button type="button" variant="ghost" className="w-full text-gray-500" onClick={onClose}>Save as Draft</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
