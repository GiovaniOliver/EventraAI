'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Event, useEvents } from '@/hooks/use-events'

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
      <div className="py-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600"></div>
        <p className="mt-2 text-gray-600">Loading event data...</p>
      </div>
    )
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Display form-level errors */}
      {errors.form && (
        <div className="rounded-md bg-red-50 p-4 text-red-700">
          {errors.form}
        </div>
      )}
      
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Event Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border p-2 shadow-sm ${
            errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
          }`}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>
      
      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="draft">Draft</option>
            <option value="upcoming">Upcoming</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        {/* Start Date */}
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        {/* End Date */}
        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            value={formData.end_date || ''}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border p-2 shadow-sm ${
              errors.end_date ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
          />
          {errors.end_date && (
            <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
          )}
        </div>
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6">
        <button
          type="button"
          onClick={onCancel || (() => router.back())}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          {isSubmitting
            ? (eventId ? 'Updating...' : 'Creating...')
            : (eventId ? 'Update Event' : 'Create Event')}
        </button>
      </div>
    </form>
  )
} 