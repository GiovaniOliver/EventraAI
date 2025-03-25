import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  Palette
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

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

const eventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  type: z.enum(["conference", "birthday", "webinar", "workshop", "meetup", "other"]),
  format: z.enum(["virtual", "in-person", "hybrid"]),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  estimatedGuests: z.number().min(1, "Number of guests is required"),
  description: z.string().optional(),
  budget: z.number().optional(),
  theme: z.string().optional(),
  coverImage: z.string().optional(),
  ownerId: z.number().optional(), // Will be set from auth context
});

type EventFormData = z.infer<typeof eventSchema>;

export default function NewEventModal({ isOpen, onClose }: NewEventModalProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string>("conference");
  const [selectedFormat, setSelectedFormat] = useState<string>("virtual");
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, setValue, watch, formState: { errors, isValid }, reset, trigger } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      type: "conference",
      format: "virtual",
      ownerId: user?.id,
      description: "",
      theme: undefined,
      budget: undefined,
      coverImage: "",
    },
    mode: "onChange"
  });
  
  // Update owner ID when user data becomes available
  useEffect(() => {
    if (user?.id) {
      setValue("ownerId", user.id);
    }
  }, [user, setValue]);
  
  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setValue("type", type as any);
  };
  
  const handleFormatSelect = (format: string) => {
    setSelectedFormat(format);
    setValue("format", format as "virtual" | "in-person" | "hybrid");
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
  
  const onSubmit = async (data: EventFormData) => {
    try {
      setIsLoading(true);
      
      // Convert date and time to a single date string
      const dateObj = new Date(`${data.date}T${data.time}`);
      
      // Make sure the data matches the schema fields exactly
      const eventData = {
        name: data.name,
        type: data.type,
        format: data.format,
        date: dateObj.toISOString(),
        estimatedGuests: data.estimatedGuests,
        ownerId: user?.id || 1, // Use the logged-in user's ID
        status: "planning",
        description: data.description || null,
        theme: data.theme || null,
        budget: data.budget || null,
        coverImage: data.coverImage || null
      };
      
      const response = await apiRequest("POST", "/api/events", eventData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create event");
      }
      
      const newEvent = await response.json();
      
      // Invalidate events cache
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/events`] });
      
      toast({
        title: "Event Created",
        description: `${newEvent.name} has been created successfully.`,
      });
      
      // Reset form and close modal
      reset();
      setStep(1);
      setPreviewImage(null);
      setSelectedTheme(null);
      onClose();
      navigate("/events");
      
    } catch (error: any) {
      console.error("Event creation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-xl w-full sm:max-h-[90vh] overflow-y-auto" aria-describedby="event-details-description">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-background z-10">
          <button className="text-muted-foreground" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
          <DialogTitle className="text-lg font-semibold">Create New Event</DialogTitle>
          <div className="w-6"></div>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {/* Step indicators */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              {[1, 2, 3].map((stepNumber) => (
                <div 
                  key={stepNumber} 
                  className={`flex flex-col items-center ${step >= stepNumber ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= stepNumber ? 'border-primary bg-primary/10' : 'border-muted-foreground/30'}`}>
                    {stepNumber}
                  </div>
                  <span className="text-xs mt-1">
                    {stepNumber === 1 ? 'Basics' : stepNumber === 2 ? 'Details' : 'Appearance'}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 h-1 bg-muted relative">
              <div 
                className="absolute h-full bg-primary transition-all duration-300" 
                style={{ width: `${(step - 1) * 50}%` }}
              ></div>
            </div>
          </div>
          
          <DialogDescription id="event-details-description" className="sr-only">
            Fill out the event details to create a new event
          </DialogDescription>
          
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="name" className="block text-sm font-medium mb-1">Event Name</Label>
                <Input 
                  id="name"
                  placeholder="Enter event name" 
                  className="w-full"
                  {...register("name")}
                />
                {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
              </div>
              
              <div>
                <Label className="block text-sm font-medium mb-2">Event Type</Label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    className={`border rounded-lg p-3 text-center ${selectedType === "conference" ? "border-primary bg-primary/10" : "border-border hover:border-primary hover:bg-primary/5"}`}
                    onClick={() => handleTypeSelect("conference")}
                  >
                    <PartyPopper className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <span className="text-xs">Conference</span>
                  </button>
                  
                  <button
                    type="button"
                    className={`border rounded-lg p-3 text-center ${selectedType === "webinar" ? "border-primary bg-primary/10" : "border-border hover:border-primary hover:bg-primary/5"}`}
                    onClick={() => handleTypeSelect("webinar")}
                  >
                    <Video className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <span className="text-xs">Webinar</span>
                  </button>
                  
                  <button
                    type="button"
                    className={`border rounded-lg p-3 text-center ${selectedType === "workshop" ? "border-primary bg-primary/10" : "border-border hover:border-primary hover:bg-primary/5"}`}
                    onClick={() => handleTypeSelect("workshop")}
                  >
                    <School className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <span className="text-xs">Workshop</span>
                  </button>
                  
                  <button
                    type="button"
                    className={`border rounded-lg p-3 text-center ${selectedType === "meetup" ? "border-primary bg-primary/10" : "border-border hover:border-primary hover:bg-primary/5"}`}
                    onClick={() => handleTypeSelect("meetup")}
                  >
                    <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <span className="text-xs">Meetup</span>
                  </button>
                  
                  <button
                    type="button"
                    className={`border rounded-lg p-3 text-center ${selectedType === "birthday" ? "border-primary bg-primary/10" : "border-border hover:border-primary hover:bg-primary/5"}`}
                    onClick={() => handleTypeSelect("birthday")}
                  >
                    <Cake className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <span className="text-xs">Birthday</span>
                  </button>
                  
                  <button
                    type="button"
                    className={`border rounded-lg p-3 text-center ${selectedType === "other" ? "border-primary bg-primary/10" : "border-border hover:border-primary hover:bg-primary/5"}`}
                    onClick={() => handleTypeSelect("other")}
                  >
                    <MoreHorizontal className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <span className="text-xs">Other</span>
                  </button>
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
                  <div className={`flex-1 border rounded-lg p-3 ${selectedFormat === "virtual" ? "border-primary bg-primary/10" : "border-border"}`}>
                    <RadioGroupItem value="virtual" id="virtual" className="sr-only" />
                    <Label htmlFor="virtual" className="flex flex-col items-center cursor-pointer">
                      <Laptop className="h-5 w-5 mb-1 text-muted-foreground" />
                      <span className="text-xs">Virtual</span>
                    </Label>
                  </div>
                  
                  <div className={`flex-1 border rounded-lg p-3 ${selectedFormat === "in-person" ? "border-primary bg-primary/10" : "border-border"}`}>
                    <RadioGroupItem value="in-person" id="in-person" className="sr-only" />
                    <Label htmlFor="in-person" className="flex flex-col items-center cursor-pointer">
                      <MapPin className="h-5 w-5 mb-1 text-muted-foreground" />
                      <span className="text-xs">In-Person</span>
                    </Label>
                  </div>
                  
                  <div className={`flex-1 border rounded-lg p-3 ${selectedFormat === "hybrid" ? "border-primary bg-primary/10" : "border-border"}`}>
                    <RadioGroupItem value="hybrid" id="hybrid" className="sr-only" />
                    <Label htmlFor="hybrid" className="flex flex-col items-center cursor-pointer">
                      <div className="relative h-5 w-5 mb-1">
                        <Laptop className="h-4 w-4 absolute -left-1 text-muted-foreground" />
                        <MapPin className="h-4 w-4 absolute -right-1 text-muted-foreground" />
                      </div>
                      <span className="text-xs">Hybrid</span>
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
                      className="w-full"
                      {...register("date")}
                    />
                    {errors.date && <p className="text-destructive text-sm mt-1">{errors.date.message}</p>}
                  </div>
                  <div className="flex-1">
                    <Input 
                      type="time" 
                      className="w-full"
                      {...register("time")}
                    />
                    {errors.time && <p className="text-destructive text-sm mt-1">{errors.time.message}</p>}
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="estimatedGuests" className="block text-sm font-medium mb-1">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Estimated Guests
                  </span>
                </Label>
                <Input 
                  id="estimatedGuests"
                  type="number" 
                  min="1"
                  placeholder="Enter number of guests" 
                  className="w-full"
                  {...register("estimatedGuests", { valueAsNumber: true })}
                />
                {errors.estimatedGuests && (
                  <p className="text-destructive text-sm mt-1">{errors.estimatedGuests.message}</p>
                )}
              </div>
            </div>
          )}
          
          {/* Step 2: Additional Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="description" className="block text-sm font-medium mb-1">Event Description</Label>
                <Textarea 
                  id="description"
                  placeholder="Describe your event..."
                  className="w-full min-h-[100px]"
                  {...register("description")}
                />
              </div>
              
              <div>
                <Label htmlFor="budget" className="block text-sm font-medium mb-1">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Budget
                  </span>
                </Label>
                <Input 
                  id="budget"
                  type="number" 
                  min="0"
                  placeholder="Enter your budget (optional)" 
                  className="w-full"
                  {...register("budget", { valueAsNumber: true })}
                />
              </div>
              
              <div>
                <Label className="block text-sm font-medium mb-2">
                  <span className="flex items-center gap-1">
                    <Upload className="h-4 w-4" />
                    Cover Image
                  </span>
                </Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  {previewImage ? (
                    <div className="relative">
                      <img 
                        src={previewImage} 
                        alt="Cover preview" 
                        className="mx-auto max-h-[150px] rounded-md object-cover" 
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-white rounded-full p-1"
                        onClick={() => {
                          setPreviewImage(null);
                          setValue("coverImage", "");
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="flex flex-col items-center mx-auto text-muted-foreground hover:text-foreground"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-10 w-10 mb-2" />
                      <span>Click to upload image</span>
                      <span className="text-xs">or drag and drop</span>
                    </button>
                  )}
                  <input 
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Theme Selection */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <Label className="block text-sm font-medium mb-2">
                  <span className="flex items-center gap-1">
                    <Palette className="h-4 w-4" />
                    Select a Theme
                  </span>
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {eventThemes.map((theme) => (
                    <div
                      key={theme.id}
                      className={`border rounded-lg p-3 cursor-pointer ${selectedTheme === theme.id ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
                      onClick={() => handleThemeSelect(theme.id)}
                    >
                      <div className="font-medium text-sm">{theme.name}</div>
                      <p className="text-xs text-muted-foreground mb-2">{theme.description}</p>
                      <div className="flex gap-1">
                        {theme.colorScheme.map((color, index) => (
                          <div 
                            key={index}
                            className="w-5 h-5 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 mt-4">
                <h3 className="text-sm font-medium mb-2">Event Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{watch("name")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="capitalize">{watch("type")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Format:</span>
                    <span className="capitalize">{watch("format")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span>
                      {watch("date") && watch("time") ? 
                        format(new Date(`${watch("date")}T${watch("time")}`), 'MMMM d, yyyy h:mm a') : 
                        "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guests:</span>
                    <span>{watch("estimatedGuests") || 0}</span>
                  </div>
                  {watch("budget") && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Budget:</span>
                      <span>${watch("budget")}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={handlePreviousStep}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            ) : (
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            )}
            
            {step < 3 ? (
              <Button type="button" onClick={handleNextStep}>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    Create Event
                    <Calendar className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
