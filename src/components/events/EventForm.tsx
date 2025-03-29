'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Event, useEvents } from '@/hooks/use-events'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"

interface EventFormProps {
  eventId?: string
  onSuccess?: (event: Event) => void
  onCancel?: () => void
}

export default function EventForm({ eventId, onSuccess, onCancel }: EventFormProps) {
  const router = useRouter()
  const { createEvent, updateEvent, useEvent } = useEvents()
  
  // Fetch event data if editing
  const { data: existingEvent, isLoading: isLoadingEvent } = useEvent(eventId)
  
  // Form state
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    status: 'draft',
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // If editing, populate form with existing data
  useEffect(() => {
    if (existingEvent) {
      setFormData({
        title: existingEvent.title || '',
        description: existingEvent.description || '',
        location: existingEvent.location || '',
        start_date: existingEvent.start_date ? new Date(existingEvent.start_date).toISOString().split('T')[0] : '',
        end_date: existingEvent.end_date ? new Date(existingEvent.end_date).toISOString().split('T')[0] : '',
        status: existingEvent.status || 'draft',
      })
    }
  }, [existingEvent])
  
  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }
  
  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required'
    }
    
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date)
      const end = new Date(formData.end_date)
      
      if (end < start) {
        newErrors.end_date = 'End date cannot be before start date'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Format dates for API
      const eventData = {
        ...formData,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : undefined,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : undefined,
      }
      
      let result
      
      if (eventId) {
        // Update existing event
        result = await updateEvent.mutateAsync({
          id: eventId,
          data: eventData,
        })
      } else {
        // Create new event
        result = await createEvent.mutateAsync(eventData)
      }
      
      if (onSuccess) {
        onSuccess(result)
      } else {
        router.push(`/events/${result.id}`)
      }
    } catch (error) {
      console.error('Error saving event:', error)
      setErrors({
        form: 'Failed to save event. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (eventId && isLoadingEvent) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
        <span className="ml-2">Loading event data...</span>
      </div>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{eventId ? 'Edit Event' : 'Create New Event'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Display form-level errors */}
          {errors.form && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errors.form}</AlertDescription>
            </Alert>
          )}
          
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Event Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description || ''}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location || ''}
                onChange={handleChange}
              />
            </div>
            
            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date || ''}
                onChange={handleChange}
              />
            </div>
            
            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date || ''}
                onChange={handleChange}
                className={errors.end_date ? "border-destructive" : ""}
              />
              {errors.end_date && (
                <p className="text-sm text-destructive">{errors.end_date}</p>
              )}
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel || (() => router.back())}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? (eventId ? 'Updating...' : 'Creating...')
                : (eventId ? 'Update Event' : 'Create Event')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
