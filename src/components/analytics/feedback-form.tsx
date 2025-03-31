'use client'

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { 
  Send, 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  AlertCircle,
  CheckCircle,
  Loader2 
} from 'lucide-react';
import { useState } from 'react';

// Feedback form schema
const feedbackSchema = z.object({
  attendeeEmail: z.string().email({
    message: 'Please enter a valid email address'
  }),
  overallRating: z.number().min(1).max(5),
  contentRating: z.number().min(1).max(5).optional(),
  technicalRating: z.number().min(1).max(5).optional(),
  engagementRating: z.number().min(1).max(5).optional(),
  comments: z.string().optional(),
  wouldRecommend: z.boolean().default(false),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

interface FeedbackFormProps {
  eventId: string;
  onSuccess?: () => void;
}

export default function FeedbackForm({ eventId, onSuccess }: FeedbackFormProps) {
  const { toast } = useToast();
  const [selectedRating, setSelectedRating] = useState<{ [key: string]: number }>({
    overallRating: 3,
    contentRating: 3,
    technicalRating: 3,
    engagementRating: 3
  });
  
  // Setup form with default values
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      attendeeEmail: '',
      overallRating: 3,
      contentRating: 3,
      technicalRating: 3,
      engagementRating: 3,
      comments: '',
      wouldRecommend: false,
    }
  });

  // Submit feedback mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: async (data: FeedbackFormValues) => {
      // Only use mock data if explicitly in development mode with the NEXT_PUBLIC_USE_MOCK_DATA flag
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
      }
      
      try {
        const response = await fetch(`/api/events/${eventId}/feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          throw new Error(`Error submitting feedback: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Failed to submit feedback:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Feedback Submitted',
        description: 'Thank you for your feedback!'
      });
      
      // Reset form
      form.reset();
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: 'Submission Failed',
        description: 'There was a problem submitting your feedback. Please try again.',
        variant: 'destructive'
      });
    }
  });
  
  // Handle form submission
  const onSubmit = (data: FeedbackFormValues) => {
    submitFeedbackMutation.mutate(data);
  };
  
  // Helper function for rating labels
  const getRatingLabel = (value: number) => {
    switch (value) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Very Good";
      case 5: return "Excellent";
      default: return "";
    }
  };
  
  // Helper function to get color based on rating
  const getRatingColor = (value: number) => {
    switch (value) {
      case 1: return "text-destructive";
      case 2: return "text-amber-500";
      case 3: return "text-amber-400";
      case 4: return "text-green-500";
      case 5: return "text-blue-500";
      default: return "text-muted-foreground";
    }
  };
  
  // Helper function to render stars based on rating
  const renderStars = (rating: number, fieldName: string) => {
    return (
      <div className="flex items-center mt-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-5 w-5 cursor-pointer transition-all",
              star <= selectedRating[fieldName]
                ? "fill-current text-amber-400"
                : "text-muted-foreground/30"
            )}
            onClick={() => {
              form.setValue(fieldName as any, star);
              setSelectedRating(prev => ({ ...prev, [fieldName]: star }));
            }}
          />
        ))}
        <span className={cn(
          "ml-2 text-sm font-medium",
          getRatingColor(selectedRating[fieldName])
        )}>
          {getRatingLabel(selectedRating[fieldName])}
        </span>
      </div>
    );
  };
  
  // Helper function to render rating sliders with labels
  const renderRatingSlider = (
    field: any, 
    fieldName: string,
    value: number, 
    onChange: (value: number) => void,
    label: string, 
    description?: string
  ) => (
    <FormItem className="space-y-3">
      <div className="space-y-1">
        <FormLabel className="text-base">{label}</FormLabel>
        {description && (
          <FormDescription className="text-sm text-muted-foreground">
            {description}
          </FormDescription>
        )}
      </div>
      
      {renderStars(value, fieldName)}
      
      <div className="space-y-3 pt-1">
        <FormControl>
          <Slider
            defaultValue={[value]}
            min={1}
            max={5}
            step={1}
            value={[field.value]}
            onValueChange={(values) => {
              onChange(values[0]);
              setSelectedRating(prev => ({ ...prev, [fieldName]: values[0] }));
            }}
            className={cn(
              "h-2",
              field.value >= 4 ? "bg-gradient-to-r from-amber-300/50 to-blue-500/50" :
              field.value >= 3 ? "bg-gradient-to-r from-amber-200/50 to-amber-400/50" :
              "bg-gradient-to-r from-red-300/50 to-amber-300/50"
            )}
          />
        </FormControl>
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><ThumbsDown className="h-3 w-3" /> Poor (1)</span>
          <span className="flex items-center gap-1">Excellent (5) <ThumbsUp className="h-3 w-3" /></span>
        </div>
      </div>
      
      <FormMessage />
    </FormItem>
  );
  
  return (
    <Card className="overflow-hidden border-border shadow-md">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/50">
        <CardTitle className="flex items-center text-xl text-foreground">
          <MessageSquare className="h-5 w-5 mr-2 text-primary" />
          Event Feedback
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          We value your opinion! Please share your thoughts about this event.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="attendeeEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="youremail@example.com" 
                      {...field} 
                      className="bg-muted/30 focus:bg-background transition-colors"
                      aria-required="true"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    We'll use this to identify your feedback and may contact you for follow-up questions.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
              <FormField
                control={form.control}
                name="overallRating"
                render={({ field }) => (
                  renderRatingSlider(
                    field,
                    "overallRating",
                    field.value,
                    field.onChange,
                    'Overall Rating',
                    'How would you rate this event overall?'
                  )
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="contentRating"
                render={({ field }) => (
                  renderRatingSlider(
                    field,
                    "contentRating",
                    field.value || 3,
                    field.onChange,
                    'Content Quality'
                  )
                )}
              />
              
              <FormField
                control={form.control}
                name="technicalRating"
                render={({ field }) => (
                  renderRatingSlider(
                    field,
                    "technicalRating",
                    field.value || 3,
                    field.onChange,
                    'Technical Quality'
                  )
                )}
              />
              
              <FormField
                control={form.control}
                name="engagementRating"
                render={({ field }) => (
                  renderRatingSlider(
                    field,
                    "engagementRating",
                    field.value || 3,
                    field.onChange,
                    'Engagement'
                  )
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="wouldRecommend"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/20 hover:bg-muted/30 transition-colors">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Would Recommend</FormLabel>
                    <FormDescription className="text-sm">
                      Would you recommend this event to others?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-label="Would recommend this event to others"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Additional Comments</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your thoughts, suggestions, or feedback about the event..."
                      className="resize-none min-h-[120px] bg-muted/30 focus:bg-background transition-colors"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Your detailed feedback helps us improve future events.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      
      <CardFooter className="flex justify-end border-t border-border/50 py-4 bg-muted/10">
        <Button 
          onClick={form.handleSubmit(onSubmit)}
          type="submit" 
          className="w-full md:w-auto gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          disabled={submitFeedbackMutation.isPending}
          aria-label="Submit feedback"
        >
          {submitFeedbackMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit Feedback
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}