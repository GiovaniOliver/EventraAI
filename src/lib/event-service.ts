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
export async function createEvent(eventData: Partial<Event>): Promise<Event> {
  try {
    const response = await api.post<Event>('/api/events', eventData);
    return response;
  } catch (error) {
    console.error("Error creating event:", error);
    throw new Error("Failed to create event");
  }
}

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