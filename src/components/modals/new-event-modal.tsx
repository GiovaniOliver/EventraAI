"use client"

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  X, 
  Cake, 
  School, 
  PartyPopper, 
  MoreHorizontal, 
  Calendar, 
  Users, 
  Video, 
  MapPin,
  Laptop, 
  Upload, 
  ArrowLeft,
  ArrowRight,
  DollarSign,
  Palette,
  Globe,
  PencilRuler,
  Rocket,
  Network,
  GraduationCap,
  MessageSquare,
  Trophy
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks";
import { format } from "date-fns";
import { Spinner } from "@/components/ui/spinner";
import { eventSchema, eventTypeEnum, eventFormatEnum, EventType, EventTypeEnum, EventFormatEnum } from "@/lib/validations/event";

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Define available themes
const eventThemes = [
  {
    id: "modern",
    name: "Modern & Minimal",
    description: "Clean lines and minimalist design",
    colorScheme: ["#3A86FF", "#FFFFFF", "#F1F5F9", "#0F172A"],
  },
  {
    id: "vibrant",
    name: "Vibrant & Bold",
    description: "Eye-catching colors and dynamic elements",
    colorScheme: ["#FF006E", "#FFBE0B", "#FB5607", "#3A86FF"],
  },
  {
    id: "professional",
    name: "Professional",
    description: "Sophisticated and corporate friendly",
    colorScheme: ["#14532D", "#E7E5E4", "#1E3A8A", "#FFFFFF"],
  },
  {
    id: "classic",
    name: "Classic Elegance",
    description: "Timeless design with elegant touches",
    colorScheme: ["#78350F", "#D6D3D1", "#44403C", "#FAFAF9"],
  },
  {
    id: "tech",
    name: "Tech & Digital",
    description: "Modern tech-inspired aesthetic",
    colorScheme: ["#0F172A", "#94A3B8", "#0EA5E9", "#F1F5F9"],
  },
  {
    id: "celebration",
    name: "Celebration",
    description: "Festive and cheerful design",
    colorScheme: ["#4F46E5", "#EC4899", "#F59E0B", "#FFFFFF"],
  }
];

const eventTypes = [
  {
    id: "virtual_conference",
    icon: <Globe />,
    label: "Virtual Conference"
  },
  {
    id: "workshop",
    icon: <PencilRuler />,
    label: "Workshop"
  },
  {
    id: "webinar",
    icon: <Video />,
    label: "Webinar"
  },
  {
    id: "team_building",
    icon: <Users />,
    label: "Team Building"
  },
  {
    id: "product_launch",
    icon: <Rocket />,
    label: "Product Launch"
  },
  {
    id: "networking_event",
    icon: <Network />,
    label: "Networking Event"
  },
  {
    id: "training_session",
    icon: <GraduationCap />,
    label: "Training Session"
  },
  {
    id: "panel_discussion",
    icon: <MessageSquare />,
    label: "Panel Discussion"
  },
  {
    id: "award_ceremony",
    icon: <Trophy />,
    label: "Award Ceremony"
  }
];

type EventFormData = z.infer<typeof eventSchema>;

// Define an interface for User with id property
interface User {
  id: number;
  [key: string]: any;
}

// Define an interface for Auth with user property
interface Auth {
  user: User;
  [key: string]: any;
}

export default function NewEventModal({ isOpen, onClose }: NewEventModalProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth() as unknown as Auth;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<EventTypeEnum>();
  const [selectedFormat, setSelectedFormat] = useState<EventFormatEnum>();
  const [selectedTheme, setSelectedTheme] = useState<string | undefined>(undefined);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
    trigger
  } = useForm<EventType>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      type: undefined,
      format: "in-person",
      description: "",
      location: "",
      start_date: "",
      end_date: "",
      estimated_guests: undefined,
      budget: undefined,
      status: "draft",
      owner_id: undefined
    }
  });
  
  // Update owner ID when user data becomes available
  useEffect(() => {
    if (user?.id) {
      setValue("owner_id", user.id);
    }
  }, [user, setValue]);
  
  const handleTypeSelect = (type: eventTypeEnum) => {
    setSelectedType(type);
    setValue("type", type);
  };
  
  const handleFormatSelect = (format: eventFormatEnum) => {
    setSelectedFormat(format);
    setValue("format", format);
  };

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    const theme = eventThemes.find(t => t.id === themeId);
    if (theme) {
      setValue("theme", JSON.stringify(theme));
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewImage(base64String);
        setValue("coverImage", base64String);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleNextStep = async () => {
    const isStepValid = await trigger();
    if (isStepValid) {
      setStep(prev => prev + 1);
    }
  };
  
  const handlePreviousStep = () => {
    setStep(prev => prev - 1);
  };
  
  const onSubmit = async (data: EventType) => {
    try {
      setIsSubmitting(true);
      
      // Format dates
      const formattedData = {
        ...data,
        start_date: data.start_date,
        end_date: data.end_date || undefined,
      };

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      toast({
        title: "Event created successfully",
        description: "Your new event has been created.",
      });

      reset();
      onClose();
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error creating event",
        description: "There was a problem creating your event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl overflow-hidden border border-border/40 shadow-lg">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[hsl(var(--eventra-teal))] via-[hsl(var(--eventra-blue))] to-[hsl(var(--eventra-purple))]"></div>
        
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-[hsl(var(--eventra-teal))] to-[hsl(var(--eventra-blue))] p-2 rounded-md text-white">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">Create New Event</DialogTitle>
              <DialogDescription>Fill out the details to set up your event</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="border rounded-md shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${step >= 1 ? "bg-[hsl(var(--eventra-teal))]" : "bg-muted-foreground/30"}`}></div>
                <div className={`w-3 h-3 rounded-full ${step >= 2 ? "bg-[hsl(var(--eventra-blue))]" : "bg-muted-foreground/30"}`}></div>
                <div className={`w-3 h-3 rounded-full ${step >= 3 ? "bg-[hsl(var(--eventra-purple))]" : "bg-muted-foreground/30"}`}></div>
              </div>
              <span className="text-sm text-muted-foreground">Step {step} of 3</span>
            </div>
          
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="p-6 space-y-5">
                <div>
                  <Label htmlFor="title" className="block text-sm font-medium mb-1">Event Name</Label>
                  <Input 
                    id="title"
                    placeholder="Enter event name" 
                    className="w-full border-border/60 focus:border-[hsl(var(--eventra-blue))] focus:ring-[hsl(var(--eventra-blue))/20]"
                    {...register("title")}
                  />
                  {errors.title && <p className="text-destructive text-sm mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <Label className="block text-sm font-medium mb-2">Event Type</Label>
                  <div className="grid grid-cols-3 gap-3 mb-2">
                    {eventTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        className={`rounded-md border py-3 transition-colors ${
                          selectedType === type.id 
                            ? "border-[hsl(var(--eventra-blue))] bg-[hsl(var(--eventra-blue))/10]" 
                            : "border-gray-200 hover:border-[hsl(var(--eventra-blue))] hover:bg-[hsl(var(--eventra-blue))/5]"
                        }`}
                        onClick={() => handleTypeSelect(type.id as eventTypeEnum)}
                      >
                        <div className="flex items-center space-x-2">
                          {type.icon}
                          <span className={`text-xs ${selectedType === type.id ? "text-[hsl(var(--eventra-blue))]" : "text-gray-600"}`}>{type.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <input type="hidden" {...register("type")} />
                </div>
                
                <div>
                  <Label className="block text-sm font-medium mb-2">Event Format</Label>
                  <RadioGroup 
                    className="flex gap-3" 
                    value={selectedFormat}
                    onValueChange={handleFormatSelect}
                  >
                    <div className={`flex-1 border rounded-lg p-3 
                      ${selectedFormat === "virtual" 
                        ? "border-[hsl(var(--eventra-blue))] bg-[hsl(var(--eventra-blue))]/5" 
                        : "border-gray-200 hover:border-[hsl(var(--eventra-blue))] hover:bg-[hsl(var(--eventra-blue))]/5"}`}>
                      <RadioGroupItem value="virtual" id="virtual" className="sr-only" />
                      <Label htmlFor="virtual" className="flex flex-col items-center cursor-pointer">
                        <Laptop className={`h-5 w-5 mb-1 ${selectedFormat === "virtual" ? "text-[hsl(var(--eventra-blue))]" : "text-gray-500"}`} />
                        <span className={`text-xs ${selectedFormat === "virtual" ? "text-[hsl(var(--eventra-blue))]" : "text-gray-600"}`}>Virtual</span>
                      </Label>
                    </div>
                    
                    <div className={`flex-1 border rounded-lg p-3 
                      ${selectedFormat === "in-person" 
                        ? "border-[hsl(var(--eventra-blue))] bg-[hsl(var(--eventra-blue))]/5" 
                        : "border-gray-200 hover:border-[hsl(var(--eventra-blue))] hover:bg-[hsl(var(--eventra-blue))]/5"}`}>
                      <RadioGroupItem value="in-person" id="in-person" className="sr-only" />
                      <Label htmlFor="in-person" className="flex flex-col items-center cursor-pointer">
                        <MapPin className={`h-5 w-5 mb-1 ${selectedFormat === "in-person" ? "text-[hsl(var(--eventra-blue))]" : "text-gray-500"}`} />
                        <span className={`text-xs ${selectedFormat === "in-person" ? "text-[hsl(var(--eventra-blue))]" : "text-gray-600"}`}>In-Person</span>
                      </Label>
                    </div>
                    
                    <div className={`flex-1 border rounded-lg p-3 
                      ${selectedFormat === "hybrid" 
                        ? "border-[hsl(var(--eventra-blue))] bg-[hsl(var(--eventra-blue))]/5" 
                        : "border-gray-200 hover:border-[hsl(var(--eventra-blue))] hover:bg-[hsl(var(--eventra-blue))]/5"}`}>
                      <RadioGroupItem value="hybrid" id="hybrid" className="sr-only" />
                      <Label htmlFor="hybrid" className="flex flex-col items-center cursor-pointer">
                        <div className="relative h-5 w-5 mb-1">
                          <Laptop className={`h-4 w-4 absolute -left-1 ${selectedFormat === "hybrid" ? "text-[hsl(var(--eventra-blue))]" : "text-gray-500"}`} />
                          <MapPin className={`h-4 w-4 absolute -right-1 ${selectedFormat === "hybrid" ? "text-[hsl(var(--eventra-blue))]" : "text-gray-500"}`} />
                        </div>
                        <span className={`text-xs ${selectedFormat === "hybrid" ? "text-[hsl(var(--eventra-blue))]" : "text-gray-600"}`}>Hybrid</span>
                      </Label>
                    </div>
                  </RadioGroup>
                  <input type="hidden" {...register("format")} />
                </div>
                
                <div>
                  <Label className="block text-sm font-medium mb-1">Date & Time</Label>
                  <div className="flex space-x-3">
                    <div className="flex-1">
                      <Input 
                        type="date" 
                        className="w-full border-border/60 focus:border-[hsl(var(--eventra-blue))] focus:ring-[hsl(var(--eventra-blue))/20]"
                        {...register("start_date")}
                      />
                      {errors.start_date && <p className="text-destructive text-sm mt-1">{errors.start_date.message}</p>}
                    </div>
                    <div className="flex-1">
                      <Input 
                        type="time" 
                        className="w-full border-border/60 focus:border-[hsl(var(--eventra-blue))] focus:ring-[hsl(var(--eventra-blue))/20]"
                        {...register("end_date")}
                      />
                      {errors.end_date && <p className="text-destructive text-sm mt-1">{errors.end_date.message}</p>}
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="estimated_guests" className="block text-sm font-medium mb-1">Estimated Guests</Label>
                  <Input 
                    id="estimated_guests"
                    type="number" 
                    placeholder="Enter number of guests" 
                    className="w-full border-border/60 focus:border-[hsl(var(--eventra-blue))] focus:ring-[hsl(var(--eventra-blue))/20]"
                    {...register("estimated_guests", { valueAsNumber: true })}
                  />
                  {errors.estimated_guests && <p className="text-destructive text-sm mt-1">{errors.estimated_guests.message}</p>}
                </div>
              </div>
            )}
          
            {/* Step 2: Details */}
            {step === 2 && (
              <div className="p-6 space-y-5">
                <div>
                  <Label htmlFor="description" className="block text-sm font-medium mb-1">Description</Label>
                  <Textarea 
                    id="description"
                    placeholder="Enter event description"
                    className="w-full border-border/60 focus:border-[hsl(var(--eventra-blue))] focus:ring-[hsl(var(--eventra-blue))/20]"
                    {...register("description")}
                  />
                  {errors.description && <p className="text-destructive text-sm mt-1">{errors.description.message}</p>}
                </div>
                
                <div>
                  <Label htmlFor="budget" className="block text-sm font-medium mb-1">Budget</Label>
                  <Input 
                    id="budget"
                    type="number" 
                    placeholder="Enter budget" 
                    className="w-full border-border/60 focus:border-[hsl(var(--eventra-blue))] focus:ring-[hsl(var(--eventra-blue))/20]"
                    {...register("budget", { valueAsNumber: true })}
                  />
                  {errors.budget && <p className="text-destructive text-sm mt-1">{errors.budget.message}</p>}
                </div>
              </div>
            )}
          
            {/* Step 3: Appearance */}
            {step === 3 && (
              <div className="p-6 space-y-5">
                <div>
                  <Label htmlFor="theme" className="block text-sm font-medium mb-1">Theme</Label>
                  <RadioGroup 
                    className="flex gap-3" 
                    value={selectedTheme}
                    onValueChange={handleThemeSelect}
                  >
                    {eventThemes.map((theme) => (
                      <div key={theme.id} className="flex items-center">
                        <RadioGroupItem value={theme.id} id={theme.id} className="sr-only" />
                        <div className="flex flex-col items-center cursor-pointer">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2">
                            {theme.id === "modern" && (
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colorScheme[0] }}></div>
                            )}
                            {theme.id === "vibrant" && (
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colorScheme[0] }}></div>
                            )}
                            {theme.id === "professional" && (
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colorScheme[0] }}></div>
                            )}
                            {theme.id === "classic" && (
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colorScheme[0] }}></div>
                            )}
                            {theme.id === "tech" && (
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colorScheme[0] }}></div>
                            )}
                            {theme.id === "celebration" && (
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colorScheme[0] }}></div>
                            )}
                          </div>
                          <span className="text-xs">{theme.name}</span>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                  <input type="hidden" {...register("theme")} />
                </div>
                
                <div>
                  <Label htmlFor="coverImage" className="block text-sm font-medium mb-1">Cover Image</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input 
                        id="coverImage"
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Button type="button" onClick={() => fileInputRef.current?.click()}>
                        {previewImage ? "Change Image" : "Upload Image"}
                      </Button>
                    </div>
                    {previewImage && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden">
                        <img src={previewImage} alt="Event Cover" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer with navigation buttons */}
          <div className="pt-4 border-t border-border/40 flex items-center justify-between">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={handlePreviousStep} className="border-border/60 hover:bg-muted/50 hover:text-[hsl(var(--eventra-blue))] hover:border-[hsl(var(--eventra-blue))/50]">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={onClose} className="border-border/60 hover:bg-muted/50">
                Cancel
              </Button>
            )}
            
            {step < 3 ? (
              <Button 
                type="button" 
                onClick={handleNextStep}
                className="bg-gradient-to-r from-[hsl(var(--eventra-teal))] via-[hsl(var(--eventra-blue))] to-[hsl(var(--eventra-purple))] text-white hover:shadow-md transition-all"
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="bg-gradient-to-r from-[hsl(var(--eventra-teal))] via-[hsl(var(--eventra-blue))] to-[hsl(var(--eventra-purple))] text-white hover:shadow-md transition-all"
              >
                {isSubmitting ? <Spinner className="mr-2" /> : null}
                Create Event
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
