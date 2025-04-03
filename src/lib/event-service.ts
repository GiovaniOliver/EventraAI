import { api } from './api';
import { Event } from './supabase';

export interface TaskInput {
  title: string;
  description?: string;
  dueDate?: string | Date;
  priority?: string;
  eventId: string | number;
  status?: string;
}

/**
 * Creates a new event with the provided data
 */
export const createEvent = async (eventData: Partial<Event>): Promise<Event> => {
  try {
    console.log('[EVENT SERVICE] Creating event with data:', eventData);
    
    // Validate essential fields are present
    if (!eventData.title) {
      console.error('[EVENT SERVICE] Missing required field: title');
      throw new Error('Event title is required');
    }
    
    if (!eventData.type) {
      console.error('[EVENT SERVICE] Missing required field: type');
      throw new Error('Event type is required');
    }
    
    // Format dates properly if they exist but aren't in ISO format
    if (eventData.date && !(typeof eventData.date === 'string')) {
      try {
        // Convert Date object to ISO string
        if (eventData.date instanceof Date) {
          eventData.date = eventData.date.toISOString();
        }
      } catch (dateError) {
        console.error('[EVENT SERVICE] Date conversion error:', dateError);
      }
    }
    
    // Ensure all dates are in proper format
    ['start_date', 'end_date'].forEach(dateField => {
      if (eventData[dateField] && eventData[dateField] instanceof Date) {
        eventData[dateField] = eventData[dateField].toISOString();
      }
    });
    
    console.log('[EVENT SERVICE] Sending event data to API:', {
      title: eventData.title,
      type: eventData.type,
      dateFormatted: eventData.date,
    });
    
    // Use the api utility which handles authentication properly
    const createdEvent = await api.post<Event>('/api/events', eventData);
    
    console.log('[EVENT SERVICE] Event created successfully:', createdEvent);
    return createdEvent;
  } catch (error) {
    console.error('[EVENT SERVICE] Error creating event:', error);
    
    // Provide more helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('auth')) {
        console.error('[EVENT SERVICE] Authentication error - user may not be logged in');
        throw new Error('Authentication failed. Please make sure you are logged in and try again.');
      } else if (error.message.includes('422')) {
        console.error('[EVENT SERVICE] Validation error - check event data format');
        throw new Error('Event data validation failed. Please check all required fields.');
      }
    }
    
    throw error;
  }
};

/**
 * Updates an existing event with the provided data
 */
export async function updateEvent(eventId: string | number, eventData: Partial<Event>): Promise<Event> {
  try {
    const response = await api.put<Event>(`/api/events/${eventId}`, eventData);
    return response;
  } catch (error) {
    console.error("Error updating event:", error);
    throw new Error("Failed to update event");
  }
}

/**
 * Deletes an event by its ID
 */
export async function deleteEvent(eventId: string | number): Promise<void> {
  try {
    await api.delete(`/api/events/${eventId}`);
  } catch (error) {
    console.error("Error deleting event:", error);
    throw new Error("Failed to delete event");
  }
}

/**
 * Creates a new task for an event
 */
export async function createTask(taskData: TaskInput): Promise<any> {
  try {
    const response = await api.post('/api/tasks', taskData);
    return response;
  } catch (error) {
    console.error("Error creating task:", error);
    throw new Error("Failed to create task");
  }
}

/**
 * Updates an existing task
 */
export async function updateTask(taskId: string | number, taskData: Partial<TaskInput>): Promise<any> {
  try {
    const response = await api.put(`/api/tasks/${taskId}`, taskData);
    return response;
  } catch (error) {
    console.error("Error updating task:", error);
    throw new Error("Failed to update task");
  }
}

/**
 * Deletes a task by its ID
 */
export async function deleteTask(taskId: string | number): Promise<void> {
  try {
    await api.delete(`/api/tasks/${taskId}`);
  } catch (error) {
    console.error("Error deleting task:", error);
    throw new Error("Failed to delete task");
  }
}

/**
 * Gets all tasks for a specific event
 */
export async function getTasksByEvent(eventId: string | number): Promise<any[]> {
  try {
    const response = await api.get<any[]>(`/api/events/${eventId}/tasks`);
    return response;
  } catch (error) {
    console.error("Error fetching tasks for event:", error);
    throw new Error("Failed to fetch event tasks");
  }
} 