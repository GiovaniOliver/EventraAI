import { apiRequest } from "./queryClient";
import { Event, Task, Guest } from "@shared/schema";
import { queryClient } from "./queryClient";

export async function createEvent(eventData: any): Promise<Event> {
  try {
    const response = await apiRequest("POST", "/api/events", eventData);
    const newEvent = await response.json();
    
    // Invalidate events cache
    queryClient.invalidateQueries({ queryKey: [`/api/users/${eventData.ownerId}/events`] });
    
    return newEvent;
  } catch (error) {
    console.error("Error creating event:", error);
    throw new Error("Failed to create event");
  }
}

export async function updateEvent(eventId: number, eventData: any): Promise<Event> {
  try {
    const response = await apiRequest("PUT", `/api/events/${eventId}`, eventData);
    const updatedEvent = await response.json();
    
    // Invalidate event cache and events list
    queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}`] });
    queryClient.invalidateQueries({ queryKey: ["/api/users/1/events"] });
    
    return updatedEvent;
  } catch (error) {
    console.error("Error updating event:", error);
    throw new Error("Failed to update event");
  }
}

export async function deleteEvent(eventId: number): Promise<boolean> {
  try {
    await apiRequest("DELETE", `/api/events/${eventId}`, undefined);
    
    // Invalidate events cache
    queryClient.invalidateQueries({ queryKey: ["/api/users/1/events"] });
    
    return true;
  } catch (error) {
    console.error("Error deleting event:", error);
    throw new Error("Failed to delete event");
  }
}

export async function createTask(taskData: any): Promise<Task> {
  try {
    // Process empty strings as null values for optional fields
    const processedData = {
      ...taskData,
      description: taskData.description || null,
      dueDate: taskData.dueDate || null,
      assignedTo: taskData.assignedTo || null
    };
    
    const response = await apiRequest("POST", "/api/tasks", processedData);
    const newTask = await response.json();
    
    // Invalidate tasks cache for the event
    queryClient.invalidateQueries({ queryKey: [`/api/events/${taskData.eventId}/tasks`] });
    
    return newTask;
  } catch (error) {
    console.error("Error creating task:", error);
    throw new Error("Failed to create task");
  }
}

export async function updateTask(taskId: number, taskData: any): Promise<Task> {
  try {
    // Process empty strings as null values for optional fields
    const processedData = {
      ...taskData,
      description: taskData.description || null,
      dueDate: taskData.dueDate || null,
      assignedTo: taskData.assignedTo || null
    };
    
    const response = await apiRequest("PUT", `/api/tasks/${taskId}`, processedData);
    const updatedTask = await response.json();
    
    // Invalidate tasks cache for the event
    if (taskData.eventId) {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${taskData.eventId}/tasks`] });
    }
    
    return updatedTask;
  } catch (error) {
    console.error("Error updating task:", error);
    throw new Error("Failed to update task");
  }
}

export async function createGuest(guestData: any): Promise<Guest> {
  try {
    // Make sure status is never undefined
    const processedData = {
      ...guestData,
      status: guestData.status || "invited" // Default value if not provided
    };
    
    const response = await apiRequest("POST", "/api/guests", processedData);
    const newGuest = await response.json();
    
    // Invalidate guests cache for the event
    queryClient.invalidateQueries({ queryKey: [`/api/events/${guestData.eventId}/guests`] });
    
    return newGuest;
  } catch (error) {
    console.error("Error creating guest:", error);
    throw new Error("Failed to create guest");
  }
}
