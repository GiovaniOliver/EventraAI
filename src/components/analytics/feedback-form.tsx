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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Spinner } from '@/components/ui/spinner';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  // Handle form submission
  const onSubmit = async (data: FeedbackFormValues) => {
    setIsSubmitting(true);
    try {
      // Mock API call - would be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      toast({
        title: 'Feedback Submitted',
        description: 'Thank you for your feedback!',
      });
      
      // Reset form
      form.reset();
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper function to render rating sliders with labels
  const renderRatingSlider = (
    field: any, 
    value: number, 
    onChange: (value: number) => void,
    label: string, 
    description?: string
  ) => (
    <FormItem className="space-y-4">
      <div className="space-y-1">
        <FormLabel>{label}</FormLabel>
        {description && (
          <FormDescription>
            {description}
          </FormDescription>
        )}
      </div>
      
      <div className="space-y-3">
        <FormControl>
          <Slider
            defaultValue={[value]}
            min={1}
            max={5}
            step={1}
            onValueChange={(values) => onChange(values[0])}
          />
        </FormControl>
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Poor (1)</span>
          <span>Excellent (5)</span>
        </div>
      </div>
      
      <FormMessage />
    </FormItem>
  );
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Feedback</CardTitle>
        <CardDescription>
          Please share your thoughts about this event
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="attendeeEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="youremail@example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    We'll use this to identify your feedback
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="overallRating"
              render={({ field }) => (
                renderRatingSlider(
                  field,
                  field.value,
                  field.onChange,
                  'Overall Rating',
                  'How would you rate this event overall?'
                )
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="contentRating"
                render={({ field }) => (
                  renderRatingSlider(
                    field,
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Would Recommend</FormLabel>
                    <FormDescription>
                      Would you recommend this event to others?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
                  <FormLabel>Additional Comments</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your thoughts, suggestions, or feedback about the event..."
                      className="resize-none min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2" />
                  Submitting...
                </>
              ) : 'Submit Feedback'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}