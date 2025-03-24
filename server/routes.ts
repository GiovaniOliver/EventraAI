import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertEventSchema, 
  insertTaskSchema, 
  insertGuestSchema,
  insertVendorSchema,
  insertEventVendorSchema,
  insertUserPreferenceSchema
} from "@shared/schema";
import { generateAiSuggestions } from "./services/ai-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // All routes are prefixed with /api
  
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      return res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json(user);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get user" });
    }
  });
  
  // Event routes
  app.post("/api/events", async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      return res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create event" });
    }
  });
  
  app.get("/api/events/:id", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      return res.json(event);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get event" });
    }
  });
  
  app.get("/api/users/:userId/events", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const events = await storage.getEventsByOwner(userId);
      return res.json(events);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get user events" });
    }
  });
  
  app.put("/api/events/:id", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const eventData = req.body;
      
      const updatedEvent = await storage.updateEvent(eventId, eventData);
      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      return res.json(updatedEvent);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update event" });
    }
  });
  
  app.delete("/api/events/:id", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const success = await storage.deleteEvent(eventId);
      if (!success) {
        return res.status(404).json({ message: "Event not found" });
      }
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete event" });
    }
  });
  
  // Task routes
  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      return res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create task" });
    }
  });
  
  app.get("/api/events/:eventId/tasks", async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const tasks = await storage.getTasksByEvent(eventId);
      return res.json(tasks);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get event tasks" });
    }
  });
  
  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const taskData = req.body;
      
      const updatedTask = await storage.updateTask(taskId, taskData);
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      return res.json(updatedTask);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update task" });
    }
  });
  
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const success = await storage.deleteTask(taskId);
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete task" });
    }
  });
  
  // Guest routes
  app.post("/api/guests", async (req, res) => {
    try {
      const guestData = insertGuestSchema.parse(req.body);
      const guest = await storage.createGuest(guestData);
      return res.status(201).json(guest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid guest data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create guest" });
    }
  });
  
  app.get("/api/events/:eventId/guests", async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const guests = await storage.getGuestsByEvent(eventId);
      return res.json(guests);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get event guests" });
    }
  });
  
  // Planning tips routes
  app.get("/api/planning-tips", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      let tips;
      
      if (category) {
        tips = await storage.getPlanningTipsByCategory(category);
      } else {
        tips = await storage.getAllPlanningTips();
      }
      
      return res.json(tips);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get planning tips" });
    }
  });
  
  // User preferences routes
  app.post("/api/users/:userId/preferences", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const preferenceData = { ...req.body, userId };
      
      const validatedData = insertUserPreferenceSchema.parse(preferenceData);
      
      // Check if preferences already exist
      const existingPrefs = await storage.getUserPreferences(userId);
      if (existingPrefs) {
        const updatedPrefs = await storage.updateUserPreferences(userId, validatedData);
        return res.json(updatedPrefs);
      }
      
      const preferences = await storage.createUserPreferences(validatedData);
      return res.status(201).json(preferences);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid preference data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to save user preferences" });
    }
  });
  
  app.get("/api/users/:userId/preferences", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const preferences = await storage.getUserPreferences(userId);
      
      if (!preferences) {
        return res.status(404).json({ message: "User preferences not found" });
      }
      
      return res.json(preferences);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get user preferences" });
    }
  });
  
  // AI suggestions routes
  app.post("/api/ai/suggestions", async (req, res) => {
    try {
      const { eventType, theme, budget } = req.body;
      
      if (!eventType) {
        return res.status(400).json({ message: "Event type is required" });
      }
      
      const suggestions = await generateAiSuggestions(eventType, theme, budget);
      return res.json(suggestions);
    } catch (error) {
      return res.status(500).json({ message: "Failed to generate AI suggestions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
