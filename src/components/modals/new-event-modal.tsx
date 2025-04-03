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
  Trophy,
  CheckCircle2,
  CalendarClock,
  ImagePlus
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
import { cn } from "@/lib/utils";

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
    icon: <Globe className="h-5 w-5" />,
    label: "Virtual Conference"
  },
  {
    id: "workshop",
    icon: <PencilRuler className="h-5 w-5" />,
    label: "Workshop"
  },
  {
    id: "webinar",
    icon: <Video className="h-5 w-5" />,
    label: "Webinar"
  },
  {
    id: "team_building",
    icon: <Users className="h-5 w-5" />,
    label: "Team Building"
  },
  {
    id: "product_launch",
    icon: <Rocket className="h-5 w-5" />,
    label: "Product Launch"
  },
  {
    id: "networking_event",
    icon: <Network className="h-5 w-5" />,
    label: "Networking Event"
  },
  {
    id: "training_session",
    icon: <GraduationCap className="h-5 w-5" />,
    label: "Training Session"
  },
  {
    id: "panel_discussion",
    icon: <MessageSquare className="h-5 w-5" />,
    label: "Panel Discussion"
  },
  {
    id: "award_ceremony",
    icon: <Trophy className="h-5 w-5" />,
    label: "Award Ceremony"
  }
];

type Auth = {
  user: any;
};

type EventFormData = z.infer<typeof eventSchema>;

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
  
  const handleTypeSelect = (type: EventTypeEnum) => {
    setSelectedType(type);
    setValue("type", type);
  };
  
  const handleFormatSelect = (format: EventFormatEnum) => {
    setSelectedFormat(format);
    setValue("format", format);
  };

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    const theme = eventThemes.find(t => t.id === themeId);
    if (theme) {
      setValue("theme" as any, JSON.stringify(theme));
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewImage(base64String);
        setValue("coverImage" as any, base64String);
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

      const createdEvent = await response.json();
      
      toast({
        title: "Event created successfully",
        description: "Your new event has been created.",
      });

      // Navigate to the event detail page
      router.push(`/events/${createdEvent.id}`);
      
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
      <DialogContent className="max-w-xl p-0 overflow-hidden border-0 shadow-xl rounded-xl">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[hsl(var(--eventra-teal))] via-[hsl(var(--eventra-blue))] to-[hsl(var(--eventra-purple))]"></div>
        
        {/* Progress indicator */}
        <div className="w-full px-6 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="relative w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-[hsl(var(--eventra-teal))] to-[hsl(var(--eventra-blue))]" 
                  style={{ width: `${(step / 3) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full text-xs mb-1", 
                    step >= 1 
                      ? "bg-[hsl(var(--eventra-teal))] text-white" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {step > 1 ? <CheckCircle2 className="h-4 w-4" /> : 1}
                  </div>
                  <span className="text-[10px]">Basics</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full text-xs mb-1", 
                    step >= 2 
                      ? "bg-[hsl(var(--eventra-blue))] text-white" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {step > 2 ? <CheckCircle2 className="h-4 w-4" /> : 2}
                  </div>
                  <span className="text-[10px]">Details</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full text-xs mb-1", 
                    step >= 3 
                      ? "bg-[hsl(var(--eventra-purple))] text-white" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    3
                  </div>
                  <span className="text-[10px]">Appearance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <DialogHeader className="px-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-[hsl(var(--eventra-teal))] to-[hsl(var(--eventra-blue))] p-2 rounded-md text-white">
              {step === 1 ? (
                <Calendar className="h-5 w-5" />
              ) : step === 2 ? (
                <CalendarClock className="h-5 w-5" />
              ) : (
                <Palette className="h-5 w-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">
                {step === 1 
                  ? "Create New Event" 
                  : step === 2 
                    ? "Event Details" 
                    : "Event Appearance"}
              </DialogTitle>
              <DialogDescription className="text-sm opacity-80">
                {step === 1 
                  ? "Let's start with the basics" 
                  : step === 2 
                    ? "Add more information about your event" 
                    : "Customize how your event looks"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
          
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6">
            {step === 1 && (
              <div className="space-y-6 py-4">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium text-foreground/90 mb-1.5 block">Event Name</Label>
                  <Input 
                    id="title"
                    placeholder="Enter a memorable name for your event" 
                    className="w-full rounded-md border-border/60 focus-visible:ring-[hsl(var(--eventra-blue))/30] focus-visible:border-[hsl(var(--eventra-blue))]"
                    {...register("title")}
                  />
                  {errors.title && <p className="text-destructive text-xs mt-1.5">{errors.title.message}</p>}
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground/90 mb-1.5 block">Event Type</Label>
                  <div className="grid grid-cols-3 gap-2.5 mb-2">
                    {eventTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        className={cn(
                          "flex flex-col items-center justify-center rounded-md border transition-all duration-200 py-3 px-1",
                          selectedType === type.id 
                            ? "border-[hsl(var(--eventra-blue))] bg-[hsl(var(--eventra-blue))/8] shadow-sm" 
                            : "border-border/50 bg-background hover:border-[hsl(var(--eventra-blue))/50] hover:bg-[hsl(var(--eventra-blue))/5]"
                        )}
                        onClick={() => handleTypeSelect(type.id as EventTypeEnum)}
                      >
                        <div className={cn(
                          "flex items-center justify-center rounded-full p-1.5 mb-1.5",
                          selectedType === type.id 
                            ? "bg-[hsl(var(--eventra-blue))/15]" 
                            : "bg-muted"
                        )}>
                          <div className={selectedType === type.id ? "text-[hsl(var(--eventra-blue))]" : "text-muted-foreground"}>
                            {type.icon}
                          </div>
                        </div>
                        <span className={cn(
                          "text-xs text-center line-clamp-1",
                          selectedType === type.id 
                            ? "text-[hsl(var(--eventra-blue))] font-medium" 
                            : "text-muted-foreground"
                        )}>
                          {type.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  <input type="hidden" {...register("type")} />
                  {errors.type && <p className="text-destructive text-xs mt-1.5">{errors.type.message}</p>}
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground/90 mb-1.5 block">Event Format</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      className={cn(
                        "flex items-center justify-center gap-2.5 rounded-md border py-3 px-4 transition-all duration-200",
                        selectedFormat === "in-person" 
                          ? "border-[hsl(var(--eventra-blue))] bg-[hsl(var(--eventra-blue))/8] shadow-sm" 
                          : "border-border/50 hover:border-[hsl(var(--eventra-blue))/50] hover:bg-[hsl(var(--eventra-blue))/5]"
                      )}
                      onClick={() => handleFormatSelect("in-person")}
                    >
                      <div className={cn(
                        "rounded-full p-1.5",
                        selectedFormat === "in-person" 
                          ? "bg-[hsl(var(--eventra-blue))/15] text-[hsl(var(--eventra-blue))]" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        <Users className="h-5 w-5" />
                      </div>
                      <span className={cn(
                        "font-medium", 
                        selectedFormat === "in-person" 
                          ? "text-[hsl(var(--eventra-blue))]" 
                          : "text-muted-foreground"
                      )}>
                        In Person
                      </span>
                    </button>
                    
                    <button
                      type="button"
                      className={cn(
                        "flex items-center justify-center gap-2.5 rounded-md border py-3 px-4 transition-all duration-200",
                        selectedFormat === "virtual" 
                          ? "border-[hsl(var(--eventra-blue))] bg-[hsl(var(--eventra-blue))/8] shadow-sm" 
                          : "border-border/50 hover:border-[hsl(var(--eventra-blue))/50] hover:bg-[hsl(var(--eventra-blue))/5]"
                      )}
                      onClick={() => handleFormatSelect("virtual")}
                    >
                      <div className={cn(
                        "rounded-full p-1.5",
                        selectedFormat === "virtual" 
                          ? "bg-[hsl(var(--eventra-blue))/15] text-[hsl(var(--eventra-blue))]" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        <Video className="h-5 w-5" />
                      </div>
                      <span className={cn(
                        "font-medium", 
                        selectedFormat === "virtual" 
                          ? "text-[hsl(var(--eventra-blue))]" 
                          : "text-muted-foreground"
                      )}>
                        Virtual
                      </span>
                    </button>
                  </div>
                  <input type="hidden" {...register("format")} />
                  {errors.format && <p className="text-destructive text-xs mt-1.5">{errors.format.message}</p>}
                </div>
              </div>
            )}
          
            {step === 2 && (
              <div className="space-y-6 py-4">
                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-foreground/90 mb-1.5 block">Description</Label>
                  <Textarea 
                    id="description"
                    placeholder="Provide details about your event"
                    className="w-full min-h-[100px] rounded-md border-border/60 focus-visible:ring-[hsl(var(--eventra-blue))/30] focus-visible:border-[hsl(var(--eventra-blue))]"
                    {...register("description")}
                  />
                  {errors.description && <p className="text-destructive text-xs mt-1.5">{errors.description.message}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date" className="text-sm font-medium text-foreground/90 mb-1.5 block">Start Date & Time</Label>
                    <Input 
                      id="start_date"
                      type="datetime-local" 
                      className="w-full rounded-md border-border/60 focus-visible:ring-[hsl(var(--eventra-blue))/30] focus-visible:border-[hsl(var(--eventra-blue))]"
                      {...register("start_date")}
                    />
                    {errors.start_date && <p className="text-destructive text-xs mt-1.5">{errors.start_date.message}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="end_date" className="text-sm font-medium text-foreground/90 mb-1.5 block">End Date & Time (Optional)</Label>
                    <Input 
                      id="end_date"
                      type="datetime-local" 
                      className="w-full rounded-md border-border/60 focus-visible:ring-[hsl(var(--eventra-blue))/30] focus-visible:border-[hsl(var(--eventra-blue))]"
                      {...register("end_date")}
                    />
                    {errors.end_date && <p className="text-destructive text-xs mt-1.5">{errors.end_date.message}</p>}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location" className="text-sm font-medium text-foreground/90 mb-1.5 block">Location {selectedFormat === "virtual" && "(Optional)"}</Label>
                    <Input 
                      id="location"
                      placeholder={selectedFormat === "virtual" ? "Virtual link or platform" : "Enter event location"} 
                      className="w-full rounded-md border-border/60 focus-visible:ring-[hsl(var(--eventra-blue))/30] focus-visible:border-[hsl(var(--eventra-blue))]"
                      {...register("location")}
                    />
                    {errors.location && <p className="text-destructive text-xs mt-1.5">{errors.location.message}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="estimated_guests" className="text-sm font-medium text-foreground/90 mb-1.5 block">Estimated Guests</Label>
                    <Input 
                      id="estimated_guests"
                      type="number" 
                      placeholder="Number of attendees" 
                      className="w-full rounded-md border-border/60 focus-visible:ring-[hsl(var(--eventra-blue))/30] focus-visible:border-[hsl(var(--eventra-blue))]"
                      {...register("estimated_guests", { valueAsNumber: true })}
                    />
                    {errors.estimated_guests && <p className="text-destructive text-xs mt-1.5">{errors.estimated_guests.message}</p>}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="budget" className="text-sm font-medium text-foreground/90 mb-1.5 block">Budget</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="budget"
                      type="number" 
                      placeholder="Event budget" 
                      className="w-full pl-9 rounded-md border-border/60 focus-visible:ring-[hsl(var(--eventra-blue))/30] focus-visible:border-[hsl(var(--eventra-blue))]"
                      {...register("budget", { valueAsNumber: true })}
                    />
                  </div>
                  {errors.budget && <p className="text-destructive text-xs mt-1.5">{errors.budget.message}</p>}
                </div>
              </div>
            )}
          
            {/* Step 3: Appearance */}
            {step === 3 && (
              <div className="space-y-6 py-4">
                <div>
                  <Label className="text-sm font-medium text-foreground/90 mb-1.5 block">Theme</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {eventThemes.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => handleThemeSelect(theme.id)}
                        className={cn(
                          "relative rounded-md overflow-hidden border transition-all duration-200 p-0.5 h-24",
                          selectedTheme === theme.id 
                            ? "border-[hsl(var(--eventra-blue))] ring-2 ring-[hsl(var(--eventra-blue))/20]" 
                            : "border-border/50 hover:border-[hsl(var(--eventra-blue))/50]"
                        )}
                      >
                        <div 
                          className="absolute inset-0 opacity-20" 
                          style={{ 
                            background: `linear-gradient(135deg, ${theme.colorScheme[0]}, ${theme.colorScheme[2] || theme.colorScheme[0]})` 
                          }}
                        />
                        <div className="relative h-full flex flex-col items-center justify-center p-2 text-center">
                          <div className="flex gap-1 mb-2">
                            {theme.colorScheme.slice(0, 3).map((color, i) => (
                              <div 
                                key={i} 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-medium mb-0.5">{theme.name}</span>
                          <span className="text-[10px] text-muted-foreground line-clamp-1">
                            {theme.description}
                          </span>
                          {selectedTheme === theme.id && (
                            <div className="absolute top-1 right-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--eventra-blue))]" />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  <input type="hidden" {...register("theme" as any)} />
                </div>
                
                <div>
                  <Label htmlFor="coverImage" className="text-sm font-medium text-foreground/90 mb-1.5 block">Cover Image</Label>
                  <div className="mt-2">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "w-full h-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors",
                        previewImage 
                          ? "border-[hsl(var(--eventra-blue))/30] bg-[hsl(var(--eventra-blue))/5]" 
                          : "border-border/60 hover:border-[hsl(var(--eventra-blue))/50] hover:bg-muted/50"
                      )}
                    >
                      <Input 
                        id="coverImage"
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      
                      {previewImage ? (
                        <div className="relative w-full h-full rounded-md overflow-hidden">
                          <img src={previewImage} alt="Event Cover" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                            <Button 
                              type="button" 
                              size="sm" 
                              variant="secondary"
                              className="bg-white/90 hover:bg-white text-black"
                            >
                              Change Image
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="p-2 rounded-full bg-muted mb-2">
                            <ImagePlus className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground">Click to upload cover image</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">JPEG, PNG (max 4MB)</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer with navigation buttons */}
          <div className="p-4 bg-muted/30 flex items-center justify-between mt-4 rounded-b-xl">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={handlePreviousStep} className="border-border/60 hover:bg-background">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={onClose} className="border-border/60 hover:bg-background">
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
