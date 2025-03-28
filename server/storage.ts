import session from "express-session";
import createMemoryStore from "memorystore";
import * as supabaseService from "./supabase-service";
import { User, Event, Task, Guest, Vendor, EventVendor, PlanningTip, UserPreference, EventAnalytics, AttendeeFeedback, SubscriptionPlan, Transaction } from "../shared/supabase-types";

// Define storage interface
export interface IStorage {
  // Session Store
  sessionStore: session.Store;
  
  // User methods
  getUser(id: number): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  createUser(user: Omit<User, 'id' | 'created_at'>): Promise<User | null>;
  updateUser(id: number, userData: Partial<User>): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  getAdminUsers(): Promise<User[]>;
  createAdminUser(user: Omit<User, 'id' | 'created_at'>): Promise<User | null>;
  updateStripeCustomerId(userId: number, customerId: string): Promise<User | null>;
  updateUserSubscription(userId: number, tier: string, status: string): Promise<User | null>;
  
  // Event methods
  getEvent(id: number): Promise<Event | null>;
  getEventsByOwner(ownerId: number): Promise<Event[]>;
  createEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event | null>;
  updateEvent(id: number, eventData: Partial<Event>): Promise<Event | null>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Task methods
  getTask(id: number): Promise<Task | null>;
  getTasksByEvent(eventId: number): Promise<Task[]>;
  createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task | null>;
  updateTask(id: number, taskData: Partial<Task>): Promise<Task | null>;
  deleteTask(id: number): Promise<boolean>;
  
  // Other methods would be defined here (vendors, guests, etc.)
}

export class SupabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    // Initialize memory session store
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | null> {
    return supabaseService.getUser(id);
  }
  
  async getUserByUsername(username: string): Promise<User | null> {
    return supabaseService.getUserByUsername(username);
  }
  
  async createUser(user: Omit<User, 'id' | 'created_at'>): Promise<User | null> {
    return supabaseService.createUser(user);
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | null> {
    return supabaseService.updateUser(id, userData);
  }
  
  async getAllUsers(): Promise<User[]> {
    // Implement this method in the supabase-service.ts file when needed
    return [];
  }
  
  async getAdminUsers(): Promise<User[]> {
    // Implement this method in the supabase-service.ts file when needed
    return [];
  }
  
  async createAdminUser(user: Omit<User, 'id' | 'created_at'>): Promise<User | null> {
    // Admin users have is_admin set to true
    return this.createUser({
      ...user,
      is_admin: true
    });
  }
  
  async updateStripeCustomerId(userId: number, customerId: string): Promise<User | null> {
    return this.updateUser(userId, { stripe_customer_id: customerId });
  }
  
  async updateUserSubscription(userId: number, tier: string, status: string): Promise<User | null> {
    return this.updateUser(userId, { 
      subscription_tier: tier,
      subscription_status: status
    });
  }
  
  // Event methods
  async getEvent(id: number): Promise<Event | null> {
    return supabaseService.getEvent(id);
  }
  
  async getEventsByOwner(ownerId: number): Promise<Event[]> {
    return supabaseService.getEventsByOwner(ownerId);
  }
  
  async createEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event | null> {
    return supabaseService.createEvent(event);
  }
  
  async updateEvent(id: number, eventData: Partial<Event>): Promise<Event | null> {
    return supabaseService.updateEvent(id, eventData);
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    return supabaseService.deleteEvent(id);
  }
  
  // Task methods
  async getTask(id: number): Promise<Task | null> {
    return supabaseService.getTask(id);
  }
  
  async getTasksByEvent(eventId: number): Promise<Task[]> {
    return supabaseService.getTasksByEvent(eventId);
  }
  
  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task | null> {
    return supabaseService.createTask(task);
  }
  
  async updateTask(id: number, taskData: Partial<Task>): Promise<Task | null> {
    return supabaseService.updateTask(id, taskData);
  }
  
  async deleteTask(id: number): Promise<boolean> {
    return supabaseService.deleteTask(id);
  }
  
  // Additional methods for other entities would be implemented here
}

// Export a singleton instance
export const storage = new SupabaseStorage(); 