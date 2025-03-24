import { apiRequest } from "./queryClient";
import { Event, Task, Guest } from "@shared/schema";
import { queryClient } from "./queryClient";

export async function getEvent(eventId: number): Promise<Event> {
  try {
    const response = await apiRequest("GET", `/api/events/${eventId}`);
    const event = await response.json() as Event;
    return event;
  } catch (error) {
    console.error("Error fetching event:", error);
    throw new Error("Failed to fetch event");
  }
}

export async function createEvent(eventData: any): Promise<Event> {
  try {
    // Parse event data to ensure proper formatting
    const eventDataToSend = {
      ...eventData,
      // Convert date object to ISO string if it's a Date object
      date: eventData.date instanceof Date ? eventData.date.toISOString() : eventData.date
    };
    
    const response = await apiRequest("POST", "/api/events", eventDataToSend);
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
    // Format data to ensure date is properly handled
    const eventDataToSend = {
      ...eventData,
      // Convert date object to ISO string if it's a Date object
      date: eventData.date instanceof Date ? eventData.date.toISOString() : eventData.date
    };
    
    const response = await apiRequest("PUT", `/api/events/${eventId}`, eventDataToSend);
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
    await apiRequest("DELETE", `/api/events/${eventId}`);
    
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
    // Make sure all required fields are present and format properly
    const processedData = {
      title: taskData.title.trim(),
      eventId: taskData.eventId,
      status: taskData.status || "pending",
      description: (taskData.description && taskData.description.trim() !== "") ? taskData.description : null,
      dueDate: (taskData.dueDate && taskData.dueDate.trim() !== "") ? taskData.dueDate : null,
      assignedTo: taskData.assignedTo || null
    };
    
    console.log("Submitting task data:", processedData);
    const response = await apiRequest("POST", "/api/tasks", processedData);
    const newTask = await response.json();
    
    // Invalidate tasks cache for the event
    queryClient.invalidateQueries({ queryKey: [`/api/events/${taskData.eventId}/tasks`] });
    
    return newTask;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error; // Preserve the original error for better debugging
  }
}

export async function updateTask(taskId: number, taskData: any): Promise<Task> {
  try {
    // Format data properly for API submission
    const processedData = {
      ...taskData,
      status: taskData.status || "pending",
      description: (taskData.description && taskData.description.trim() !== "") ? taskData.description : null,
      dueDate: (taskData.dueDate && taskData.dueDate.trim() !== "") ? taskData.dueDate : null,
      assignedTo: taskData.assignedTo || null
    };
    
    console.log("Updating task data:", processedData);
    const response = await apiRequest("PUT", `/api/tasks/${taskId}`, processedData);
    const updatedTask = await response.json();
    
    // Invalidate tasks cache for the event
    if (taskData.eventId) {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${taskData.eventId}/tasks`] });
    }
    
    return updatedTask;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error; // Preserve the original error for better debugging
  }
}

export async function createGuest(guestData: any): Promise<Guest> {
  try {
    // Format data properly for API submission
    const processedData = {
      name: guestData.name.trim(),
      email: guestData.email.trim(),
      eventId: guestData.eventId,
      status: guestData.status || "invited" // Default value if not provided
    };
    
    console.log("Submitting guest data:", processedData);
    const response = await apiRequest("POST", "/api/guests", processedData);
    const newGuest = await response.json();
    
    // Invalidate guests cache for the event
    queryClient.invalidateQueries({ queryKey: [`/api/events/${guestData.eventId}/guests`] });
    
    return newGuest;
  } catch (error) {
    console.error("Error creating guest:", error);
    throw error; // Preserve the original error for better debugging
  }
}
