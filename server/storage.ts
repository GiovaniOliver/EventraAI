import { 
  users, 
  events, 
  tasks, 
  guests, 
  vendors, 
  eventVendors, 
  planningTips, 
  userPreferences,
  type User, 
  type InsertUser, 
  type Event,
  type InsertEvent,
  type Task,
  type InsertTask,
  type Guest,
  type InsertGuest,
  type Vendor,
  type InsertVendor,
  type EventVendor,
  type InsertEventVendor,
  type PlanningTip,
  type InsertPlanningTip,
  type UserPreference,
  type InsertUserPreference
} from "@shared/schema";

// Define storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Event methods
  getEvent(id: number): Promise<Event | undefined>;
  getEventsByOwner(ownerId: number): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Task methods
  getTask(id: number): Promise<Task | undefined>;
  getTasksByEvent(eventId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Guest methods
  getGuest(id: number): Promise<Guest | undefined>;
  getGuestsByEvent(eventId: number): Promise<Guest[]>;
  createGuest(guest: InsertGuest): Promise<Guest>;
  updateGuest(id: number, guestData: Partial<InsertGuest>): Promise<Guest | undefined>;
  deleteGuest(id: number): Promise<boolean>;
  
  // Vendor methods
  getVendor(id: number): Promise<Vendor | undefined>;
  getAllVendors(): Promise<Vendor[]>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  
  // Event-Vendor methods
  getEventVendor(id: number): Promise<EventVendor | undefined>;
  getVendorsByEvent(eventId: number): Promise<EventVendor[]>;
  createEventVendor(eventVendor: InsertEventVendor): Promise<EventVendor>;
  
  // Planning Tip methods
  getPlanningTip(id: number): Promise<PlanningTip | undefined>;
  getAllPlanningTips(): Promise<PlanningTip[]>;
  getPlanningTipsByCategory(category: string): Promise<PlanningTip[]>;
  createPlanningTip(tip: InsertPlanningTip): Promise<PlanningTip>;
  
  // User Preferences methods
  getUserPreferences(userId: number): Promise<UserPreference | undefined>;
  createUserPreferences(preferences: InsertUserPreference): Promise<UserPreference>;
  updateUserPreferences(userId: number, preferenceData: Partial<InsertUserPreference>): Promise<UserPreference | undefined>;
}

// Implement in-memory storage
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private tasks: Map<number, Task>;
  private guests: Map<number, Guest>;
  private vendors: Map<number, Vendor>;
  private eventVendors: Map<number, EventVendor>;
  private planningTips: Map<number, PlanningTip>;
  private userPreferences: Map<number, UserPreference>;
  
  // ID counters for generating primary keys
  private currentUserId: number;
  private currentEventId: number;
  private currentTaskId: number;
  private currentGuestId: number;
  private currentVendorId: number;
  private currentEventVendorId: number;
  private currentPlanningTipId: number;
  private currentUserPreferenceId: number;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.tasks = new Map();
    this.guests = new Map();
    this.vendors = new Map();
    this.eventVendors = new Map();
    this.planningTips = new Map();
    this.userPreferences = new Map();
    
    this.currentUserId = 1;
    this.currentEventId = 1;
    this.currentTaskId = 1;
    this.currentGuestId = 1;
    this.currentVendorId = 1;
    this.currentEventVendorId = 1;
    this.currentPlanningTipId = 1;
    this.currentUserPreferenceId = 1;
    
    // Initialize with some planning tips
    this.initPlanningTips();
  }

  // Initialize with some default planning tips
  private initPlanningTips() {
    const tips: InsertPlanningTip[] = [
      {
        title: "5 Ways to Engage Virtual Attendees",
        description: "Keep your audience engaged and interactive during online events",
        category: "engagement",
        icon: "tips_and_updates"
      },
      {
        title: "Perfect Timing for Event Activities",
        description: "Learn how to schedule your event for maximum participation",
        category: "timing",
        icon: "schedule"
      },
      {
        title: "Budget Planning Essentials",
        description: "Smart strategies to allocate resources effectively",
        category: "budget",
        icon: "wysiwyg"
      }
    ];
    
    tips.forEach(tip => this.createPlanningTip(tip));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  // Event methods
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getEventsByOwner(ownerId: number): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) => event.ownerId === ownerId
    );
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.currentEventId++;
    const now = new Date();
    const event: Event = {
      ...insertEvent,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updatedEvent: Event = {
      ...event,
      ...eventData,
      updatedAt: new Date()
    };
    
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }

  // Task methods
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByEvent(eventId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.eventId === eventId
    );
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const now = new Date();
    
    // Ensure all required fields are set and optional fields are properly null
    const task: Task = {
      title: insertTask.title,
      eventId: insertTask.eventId,
      description: insertTask.description ?? null,
      status: insertTask.status ?? "pending",
      dueDate: insertTask.dueDate ?? null,
      assignedTo: insertTask.assignedTo ?? null,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    // Make sure we don't store undefined values
    const processedData = {
      ...(taskData.eventId !== undefined ? { eventId: taskData.eventId } : {}),
      ...(taskData.title !== undefined ? { title: taskData.title } : {}),
      ...(taskData.status !== undefined ? { status: taskData.status } : {}),
      description: taskData.description ?? task.description,
      dueDate: taskData.dueDate ?? task.dueDate,
      assignedTo: taskData.assignedTo ?? task.assignedTo
    };
    
    const updatedTask: Task = {
      ...task,
      ...processedData,
      updatedAt: new Date()
    };
    
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Guest methods
  async getGuest(id: number): Promise<Guest | undefined> {
    return this.guests.get(id);
  }

  async getGuestsByEvent(eventId: number): Promise<Guest[]> {
    return Array.from(this.guests.values()).filter(
      (guest) => guest.eventId === eventId
    );
  }

  async createGuest(insertGuest: InsertGuest): Promise<Guest> {
    const id = this.currentGuestId++;
    const now = new Date();
    const guest: Guest = {
      ...insertGuest,
      id,
      createdAt: now
    };
    this.guests.set(id, guest);
    return guest;
  }

  async updateGuest(id: number, guestData: Partial<InsertGuest>): Promise<Guest | undefined> {
    const guest = this.guests.get(id);
    if (!guest) return undefined;
    
    const updatedGuest: Guest = {
      ...guest,
      ...guestData
    };
    
    this.guests.set(id, updatedGuest);
    return updatedGuest;
  }

  async deleteGuest(id: number): Promise<boolean> {
    return this.guests.delete(id);
  }

  // Vendor methods
  async getVendor(id: number): Promise<Vendor | undefined> {
    return this.vendors.get(id);
  }

  async getAllVendors(): Promise<Vendor[]> {
    return Array.from(this.vendors.values());
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const id = this.currentVendorId++;
    const now = new Date();
    const vendor: Vendor = {
      ...insertVendor,
      id,
      createdAt: now
    };
    this.vendors.set(id, vendor);
    return vendor;
  }

  // Event-Vendor methods
  async getEventVendor(id: number): Promise<EventVendor | undefined> {
    return this.eventVendors.get(id);
  }

  async getVendorsByEvent(eventId: number): Promise<EventVendor[]> {
    return Array.from(this.eventVendors.values()).filter(
      (eventVendor) => eventVendor.eventId === eventId
    );
  }

  async createEventVendor(insertEventVendor: InsertEventVendor): Promise<EventVendor> {
    const id = this.currentEventVendorId++;
    const now = new Date();
    const eventVendor: EventVendor = {
      ...insertEventVendor,
      id,
      createdAt: now
    };
    this.eventVendors.set(id, eventVendor);
    return eventVendor;
  }

  // Planning Tip methods
  async getPlanningTip(id: number): Promise<PlanningTip | undefined> {
    return this.planningTips.get(id);
  }

  async getAllPlanningTips(): Promise<PlanningTip[]> {
    return Array.from(this.planningTips.values());
  }

  async getPlanningTipsByCategory(category: string): Promise<PlanningTip[]> {
    return Array.from(this.planningTips.values()).filter(
      (tip) => tip.category === category
    );
  }

  async createPlanningTip(insertTip: InsertPlanningTip): Promise<PlanningTip> {
    const id = this.currentPlanningTipId++;
    const now = new Date();
    const planningTip: PlanningTip = {
      ...insertTip,
      id,
      createdAt: now
    };
    this.planningTips.set(id, planningTip);
    return planningTip;
  }

  // User Preferences methods
  async getUserPreferences(userId: number): Promise<UserPreference | undefined> {
    return Array.from(this.userPreferences.values()).find(
      (pref) => pref.userId === userId
    );
  }

  async createUserPreferences(insertPreference: InsertUserPreference): Promise<UserPreference> {
    const id = this.currentUserPreferenceId++;
    const now = new Date();
    const userPreference: UserPreference = {
      ...insertPreference,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.userPreferences.set(id, userPreference);
    return userPreference;
  }

  async updateUserPreferences(userId: number, preferenceData: Partial<InsertUserPreference>): Promise<UserPreference | undefined> {
    const preference = Array.from(this.userPreferences.values()).find(
      (pref) => pref.userId === userId
    );
    
    if (!preference) return undefined;
    
    const updatedPreference: UserPreference = {
      ...preference,
      ...preferenceData,
      updatedAt: new Date()
    };
    
    this.userPreferences.set(preference.id, updatedPreference);
    return updatedPreference;
  }
}

export const storage = new MemStorage();
