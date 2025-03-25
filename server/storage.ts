import { 
  users, 
  events, 
  tasks, 
  guests, 
  vendors, 
  eventVendors, 
  planningTips, 
  userPreferences,
  eventAnalytics,
  attendeeFeedback,
  subscriptionPlans,
  transactions,
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
  type InsertUserPreference,
  type EventAnalytics,
  type InsertEventAnalytics,
  type AttendeeFeedback,
  type InsertAttendeeFeedback,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
  type Transaction,
  type InsertTransaction
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, isNull, asc } from "drizzle-orm";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import createMemoryStore from "memorystore";
import { pool } from "./db";

// Define storage interface
export interface IStorage {
  // Session Store
  sessionStore: session.Store;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getAdminUsers(): Promise<User[]>;
  createAdminUser(user: InsertUser): Promise<User>;
  updateStripeCustomerId(userId: number, customerId: string): Promise<User | undefined>;
  updateUserSubscription(userId: number, tier: string, status: string): Promise<User | undefined>;
  
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
  getPartnerVendors(): Promise<Vendor[]>;
  getUserVendors(userId: number): Promise<Vendor[]>;
  getVendorsByCategory(category: string): Promise<Vendor[]>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: number, vendorData: Partial<InsertVendor>): Promise<Vendor | undefined>;
  deleteVendor(id: number): Promise<boolean>;
  
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
  
  // Event Analytics methods
  getEventAnalytics(id: number): Promise<EventAnalytics | undefined>;
  getAnalyticsByEvent(eventId: number): Promise<EventAnalytics[]>;
  createEventAnalytics(analytics: InsertEventAnalytics): Promise<EventAnalytics>;
  updateEventAnalytics(id: number, analyticsData: Partial<InsertEventAnalytics>): Promise<EventAnalytics | undefined>;
  
  // Attendee Feedback methods
  getAttendeeFeedback(id: number): Promise<AttendeeFeedback | undefined>;
  getFeedbackByEvent(eventId: number): Promise<AttendeeFeedback[]>;
  createAttendeeFeedback(feedback: InsertAttendeeFeedback): Promise<AttendeeFeedback>;
  getEventFeedbackSummary(eventId: number): Promise<{
    averageOverallRating: number;
    averageContentRating: number;
    averageTechnicalRating: number;
    averageEngagementRating: number;
    recommendationPercentage: number;
    totalFeedbackCount: number;
  }>;
  
  // Subscription Plan methods
  getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined>;
  getSubscriptionPlanByName(name: string): Promise<SubscriptionPlan | undefined>;
  getAllSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getActiveSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: number, planData: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined>;
  
  // Transaction methods
  getTransaction(id: number): Promise<Transaction | undefined>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transactionData: Partial<Transaction>): Promise<Transaction | undefined>;
}

// Implement in-memory storage
export class MemStorage implements IStorage {
  sessionStore: session.Store;
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private tasks: Map<number, Task>;
  private guests: Map<number, Guest>;
  private vendors: Map<number, Vendor>;
  private eventVendors: Map<number, EventVendor>;
  private planningTips: Map<number, PlanningTip>;
  private userPreferences: Map<number, UserPreference>;
  private subscriptionPlans: Map<number, SubscriptionPlan>;
  private transactions: Map<number, Transaction>;
  
  // ID counters for generating primary keys
  private currentUserId: number;
  private currentEventId: number;
  private currentTaskId: number;
  private currentGuestId: number;
  private currentVendorId: number;
  private currentEventVendorId: number;
  private currentPlanningTipId: number;
  private currentUserPreferenceId: number;
  private currentSubscriptionPlanId: number;
  private currentTransactionId: number;

  constructor() {
    // Initialize memory session store
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    this.users = new Map();
    this.events = new Map();
    this.tasks = new Map();
    this.guests = new Map();
    this.vendors = new Map();
    this.eventVendors = new Map();
    this.planningTips = new Map();
    this.userPreferences = new Map();
    this.eventAnalytics = new Map();
    this.attendeeFeedback = new Map();
    this.subscriptionPlans = new Map();
    this.transactions = new Map();
    
    this.currentUserId = 1;
    this.currentEventId = 1;
    this.currentTaskId = 1;
    this.currentGuestId = 1;
    this.currentVendorId = 1;
    this.currentEventVendorId = 1;
    this.currentPlanningTipId = 1;
    this.currentUserPreferenceId = 1;
    this.currentEventAnalyticsId = 1;
    this.currentAttendeeFeedbackId = 1;
    this.currentSubscriptionPlanId = 1;
    this.currentTransactionId = 1;
    
    // Initialize with some planning tips
    this.initPlanningTips();
    
    // Initialize default subscription plans
    this.initSubscriptionPlans();
  }
  
  // Initialize default subscription plans
  private initSubscriptionPlans() {
    const plans: InsertSubscriptionPlan[] = [
      {
        name: "free",
        displayName: "Free Plan",
        description: "Basic features for personal use",
        price: 0,
        currency: "usd",
        interval: "month",
        billingCycle: "monthly",
        features: JSON.stringify([
          "Up to 3 virtual events",
          "Basic analytics",
          "Standard templates"
        ]),
        eventLimit: 3,
        guestLimit: 50,
        vendorLimit: 5,
        analyticsPeriod: 1,
        isActive: true
      },
      {
        name: "pro",
        displayName: "Pro Plan",
        description: "Advanced features for professionals",
        price: 1999, // $19.99 in cents
        currency: "usd",
        interval: "month",
        billingCycle: "monthly",
        features: JSON.stringify([
          "Unlimited virtual events",
          "Advanced analytics",
          "Premium templates",
          "Priority support",
          "Custom branding"
        ]),
        eventLimit: 10,
        guestLimit: 200,
        vendorLimit: 15,
        analyticsPeriod: 3,
        isActive: true
      },
      {
        name: "business",
        displayName: "Business Plan",
        description: "Full-featured solution for businesses",
        price: 4999, // $49.99 in cents
        currency: "usd",
        interval: "month",
        billingCycle: "monthly",
        features: JSON.stringify([
          "Everything in Pro",
          "Dedicated support",
          "Team collaboration",
          "API access",
          "White labeling",
          "Custom integrations"
        ]),
        eventLimit: 30,
        guestLimit: 500,
        vendorLimit: 30,
        analyticsPeriod: 6,
        isActive: true
      },
      {
        name: "enterprise",
        displayName: "Enterprise Plan",
        description: "Custom solution for large organizations",
        price: 19999, // $199.99 in cents
        currency: "usd",
        interval: "month",
        billingCycle: "monthly",
        features: JSON.stringify([
          "Everything in Business",
          "Dedicated account manager",
          "Custom development",
          "SLA guarantees",
          "Advanced security features",
          "Bulk event management"
        ]),
        eventLimit: null, // Unlimited
        guestLimit: null, // Unlimited
        vendorLimit: null, // Unlimited
        analyticsPeriod: 12,
        isActive: true
      }
    ];
    
    plans.forEach(plan => this.createSubscriptionPlan(plan));
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
      isAdmin: insertUser.isAdmin ?? false,
      stripeCustomerId: null,
      subscriptionTier: insertUser.subscriptionTier ?? "free",
      subscriptionStatus: "active",
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      ...userData
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async getAdminUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.isAdmin === true);
  }
  
  async createAdminUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      isAdmin: true,
      stripeCustomerId: null,
      subscriptionTier: "enterprise",
      subscriptionStatus: "active",
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateStripeCustomerId(userId: number, customerId: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    user.stripeCustomerId = customerId;
    this.users.set(userId, user);
    return user;
  }
  
  async updateUserSubscription(userId: number, tier: string, status: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    user.subscriptionTier = tier;
    user.subscriptionStatus = status;
    this.users.set(userId, user);
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
      status: insertEvent.status || "draft", // Ensure status is not undefined
      estimatedGuests: insertEvent.estimatedGuests ?? null,
      description: insertEvent.description ?? null,
      theme: insertEvent.theme ?? null,
      budget: insertEvent.budget ?? null,
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
      status: insertGuest.status || "pending", // Ensure status is not undefined
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
  
  async getPartnerVendors(): Promise<Vendor[]> {
    return Array.from(this.vendors.values()).filter(
      (vendor) => vendor.isPartner === true
    );
  }
  
  async getUserVendors(userId: number): Promise<Vendor[]> {
    return Array.from(this.vendors.values()).filter(
      (vendor) => vendor.ownerId === userId
    );
  }
  
  async getVendorsByCategory(category: string): Promise<Vendor[]> {
    return Array.from(this.vendors.values()).filter(
      (vendor) => vendor.category === category
    );
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const id = this.currentVendorId++;
    const now = new Date();
    const vendor: Vendor = {
      id,
      name: insertVendor.name,
      category: insertVendor.category,
      createdAt: now,
      ownerId: insertVendor.ownerId ?? null, // Ensure ownerId is not undefined
      isPartner: insertVendor.isPartner ?? false,
      isApproved: insertVendor.isApproved ?? false,
      services: insertVendor.services ?? [],
      logo: insertVendor.logo ?? null,
      rating: insertVendor.rating ?? null,
      description: insertVendor.description ?? null,
      contactEmail: insertVendor.contactEmail ?? null,
      contactPhone: insertVendor.contactPhone ?? null,
      website: insertVendor.website ?? null
    };
    this.vendors.set(id, vendor);
    return vendor;
  }
  
  async updateVendor(id: number, vendorData: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const vendor = this.vendors.get(id);
    if (!vendor) return undefined;
    
    const updatedVendor: Vendor = {
      ...vendor,
      ...vendorData
    };
    
    this.vendors.set(id, updatedVendor);
    return updatedVendor;
  }
  
  async deleteVendor(id: number): Promise<boolean> {
    return this.vendors.delete(id);
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
      status: insertEventVendor.status || "pending", // Ensure status is not undefined
      budget: insertEventVendor.budget ?? null,
      notes: insertEventVendor.notes ?? null,
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
      preferredThemes: insertPreference.preferredThemes ?? {},
      preferredEventTypes: insertPreference.preferredEventTypes ?? {},
      notificationsEnabled: insertPreference.notificationsEnabled ?? null,
      onboardingCompleted: insertPreference.onboardingCompleted ?? null,
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
  
  // Event Analytics map and counters
  private eventAnalytics: Map<number, EventAnalytics> = new Map();
  private attendeeFeedback: Map<number, AttendeeFeedback> = new Map();
  private currentEventAnalyticsId: number = 1;
  private currentAttendeeFeedbackId: number = 1;
  
  // Event Analytics methods
  async getEventAnalytics(id: number): Promise<EventAnalytics | undefined> {
    return this.eventAnalytics.get(id);
  }
  
  async getAnalyticsByEvent(eventId: number): Promise<EventAnalytics[]> {
    return Array.from(this.eventAnalytics.values()).filter(
      (analytics) => analytics.eventId === eventId
    );
  }
  
  async createEventAnalytics(insertAnalytics: InsertEventAnalytics): Promise<EventAnalytics> {
    const id = this.currentEventAnalyticsId++;
    const now = new Date();
    const eventAnalytics: EventAnalytics = {
      ...insertAnalytics,
      id,
      attendeeCount: insertAnalytics.attendeeCount ?? null,
      engagementScore: insertAnalytics.engagementScore ?? null,
      averageAttendanceTime: insertAnalytics.averageAttendanceTime ?? null,
      maxConcurrentUsers: insertAnalytics.maxConcurrentUsers ?? null,
      totalInteractions: insertAnalytics.totalInteractions ?? null,
      feedbackScore: insertAnalytics.feedbackScore ?? null,
      analyticsDate: insertAnalytics.analyticsDate ?? now,
      detailedMetrics: insertAnalytics.detailedMetrics ?? {},
      createdAt: now,
      updatedAt: now
    };
    this.eventAnalytics.set(id, eventAnalytics);
    return eventAnalytics;
  }
  
  async updateEventAnalytics(id: number, analyticsData: Partial<InsertEventAnalytics>): Promise<EventAnalytics | undefined> {
    const analytics = this.eventAnalytics.get(id);
    if (!analytics) return undefined;
    
    const updatedAnalytics: EventAnalytics = {
      ...analytics,
      ...analyticsData,
      updatedAt: new Date()
    };
    
    this.eventAnalytics.set(id, updatedAnalytics);
    return updatedAnalytics;
  }
  
  // Attendee Feedback methods
  async getAttendeeFeedback(id: number): Promise<AttendeeFeedback | undefined> {
    return this.attendeeFeedback.get(id);
  }
  
  async getFeedbackByEvent(eventId: number): Promise<AttendeeFeedback[]> {
    return Array.from(this.attendeeFeedback.values()).filter(
      (feedback) => feedback.eventId === eventId
    );
  }
  
  async createAttendeeFeedback(insertFeedback: InsertAttendeeFeedback): Promise<AttendeeFeedback> {
    const id = this.currentAttendeeFeedbackId++;
    const now = new Date();
    const feedback: AttendeeFeedback = {
      ...insertFeedback,
      id,
      contentRating: insertFeedback.contentRating ?? null,
      technicalRating: insertFeedback.technicalRating ?? null,
      engagementRating: insertFeedback.engagementRating ?? null,
      comments: insertFeedback.comments ?? null,
      wouldRecommend: insertFeedback.wouldRecommend ?? null,
      createdAt: now
    };
    this.attendeeFeedback.set(id, feedback);
    return feedback;
  }
  
  async getEventFeedbackSummary(eventId: number): Promise<{
    averageOverallRating: number;
    averageContentRating: number;
    averageTechnicalRating: number;
    averageEngagementRating: number;
    recommendationPercentage: number;
    totalFeedbackCount: number;
  }> {
    const feedbacks = await this.getFeedbackByEvent(eventId);
    
    if (feedbacks.length === 0) {
      return {
        averageOverallRating: 0,
        averageContentRating: 0,
        averageTechnicalRating: 0,
        averageEngagementRating: 0,
        recommendationPercentage: 0,
        totalFeedbackCount: 0
      };
    }
    
    // Calculate averages
    const sum = (arr: (number | null | undefined)[]) => 
      arr.filter(Boolean).reduce((acc: number, val) => acc + (val || 0), 0);
    
    const count = (arr: (number | null | undefined)[]) => 
      arr.filter(Boolean).length;
    
    const avg = (arr: (number | null | undefined)[]) => 
      count(arr) > 0 ? sum(arr) / count(arr) : 0;
    
    const recommendCount = feedbacks.filter(f => f.wouldRecommend).length;
    
    return {
      averageOverallRating: avg(feedbacks.map(f => f.overallRating)),
      averageContentRating: avg(feedbacks.map(f => f.contentRating)),
      averageTechnicalRating: avg(feedbacks.map(f => f.technicalRating)),
      averageEngagementRating: avg(feedbacks.map(f => f.engagementRating)),
      recommendationPercentage: (recommendCount / feedbacks.length) * 100,
      totalFeedbackCount: feedbacks.length
    };
  }
  
  // Subscription Plan methods
  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    return this.subscriptionPlans.get(id);
  }
  
  async getSubscriptionPlanByName(name: string): Promise<SubscriptionPlan | undefined> {
    return Array.from(this.subscriptionPlans.values()).find(
      (plan) => plan.name === name
    );
  }
  
  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return Array.from(this.subscriptionPlans.values());
  }
  
  async getActiveSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return Array.from(this.subscriptionPlans.values()).filter(
      (plan) => plan.isActive === true
    );
  }
  
  async createSubscriptionPlan(insertPlan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const id = this.currentSubscriptionPlanId++;
    const now = new Date();
    const plan: SubscriptionPlan = {
      id,
      name: insertPlan.name,
      displayName: insertPlan.displayName ?? null,
      description: insertPlan.description ?? null,
      price: insertPlan.price,
      currency: insertPlan.currency ?? "usd",
      interval: insertPlan.interval ?? "month",
      billingCycle: insertPlan.billingCycle ?? "monthly",
      features: insertPlan.features ?? "[]",
      eventLimit: insertPlan.eventLimit ?? null,
      guestLimit: insertPlan.guestLimit ?? null,
      vendorLimit: insertPlan.vendorLimit ?? null,
      analyticsPeriod: insertPlan.analyticsPeriod ?? null,
      stripeProductId: insertPlan.stripeProductId ?? null,
      stripePriceId: insertPlan.stripePriceId ?? null,
      isActive: insertPlan.isActive ?? true,
      createdAt: now,
      updatedAt: now
    };
    this.subscriptionPlans.set(id, plan);
    return plan;
  }
  
  async updateSubscriptionPlan(id: number, planData: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined> {
    const plan = this.subscriptionPlans.get(id);
    if (!plan) return undefined;
    
    const updatedPlan: SubscriptionPlan = {
      ...plan,
      name: planData.name ?? plan.name,
      displayName: planData.displayName ?? plan.displayName,
      description: planData.description ?? plan.description,
      price: planData.price ?? plan.price,
      currency: planData.currency ?? plan.currency,
      interval: planData.interval ?? plan.interval,
      billingCycle: planData.billingCycle ?? plan.billingCycle,
      features: planData.features ?? plan.features,
      eventLimit: planData.eventLimit ?? plan.eventLimit,
      guestLimit: planData.guestLimit ?? plan.guestLimit,
      vendorLimit: planData.vendorLimit ?? plan.vendorLimit,
      analyticsPeriod: planData.analyticsPeriod ?? plan.analyticsPeriod,
      stripeProductId: planData.stripeProductId ?? plan.stripeProductId,
      stripePriceId: planData.stripePriceId ?? plan.stripePriceId,
      isActive: planData.isActive ?? plan.isActive,
      updatedAt: new Date()
    };
    
    this.subscriptionPlans.set(id, updatedPlan);
    return updatedPlan;
  }
  
  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId
    );
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const now = new Date();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      createdAt: now,
      description: insertTransaction.description ?? null,
      currency: insertTransaction.currency ?? "usd",
      stripePaymentIntentId: insertTransaction.stripePaymentIntentId ?? null,
      stripeInvoiceId: insertTransaction.stripeInvoiceId ?? null,
      metadata: insertTransaction.metadata ?? null
    };
    this.transactions.set(id, transaction);
    return transaction;
  }
  
  async updateTransaction(id: number, transactionData: Partial<Transaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const updatedTransaction: Transaction = {
      ...transaction,
      ...transactionData
    };
    
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }
}

// Implement database storage
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Set up session store with PostgreSQL
    const PostgresSessionStore = connectPgSimple(session);
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
    
    // Initialize default data
    this.initPlanningTips();
    this.initSubscriptionPlans();
  }
  
  // Initialize default subscription plans if they don't exist
  private async initSubscriptionPlans() {
    // Check if plans already exist
    const existingPlans = await db.select().from(subscriptionPlans);
    if (existingPlans.length > 0) return; // Already initialized
    
    const plans: InsertSubscriptionPlan[] = [
      {
        name: "free",
        displayName: "Free Plan",
        description: "Basic features for personal use",
        price: 0,
        currency: "usd",
        interval: "month",
        billingCycle: "monthly",
        features: JSON.stringify([
          "Up to 3 virtual events",
          "Basic analytics",
          "Standard templates"
        ]),
        eventLimit: 3,
        guestLimit: 50,
        vendorLimit: 5,
        analyticsPeriod: 1,
        isActive: true
      },
      {
        name: "pro",
        displayName: "Pro Plan",
        description: "Advanced features for professionals",
        price: 1999, // $19.99 in cents
        currency: "usd",
        interval: "month",
        billingCycle: "monthly",
        features: JSON.stringify([
          "Unlimited virtual events",
          "Advanced analytics",
          "Premium templates",
          "Priority support",
          "Custom branding"
        ]),
        eventLimit: 10,
        guestLimit: 200,
        vendorLimit: 15,
        analyticsPeriod: 3,
        isActive: true
      },
      {
        name: "business",
        displayName: "Business Plan",
        description: "Full-featured solution for businesses",
        price: 4999, // $49.99 in cents
        currency: "usd",
        interval: "month",
        billingCycle: "monthly",
        features: JSON.stringify([
          "Everything in Pro",
          "Dedicated support",
          "Team collaboration",
          "API access",
          "White labeling",
          "Custom integrations"
        ]),
        eventLimit: 30,
        guestLimit: 500,
        vendorLimit: 30,
        analyticsPeriod: 6,
        isActive: true
      },
      {
        name: "enterprise",
        displayName: "Enterprise Plan",
        description: "Custom solution for large organizations",
        price: 19999, // $199.99 in cents
        currency: "usd",
        interval: "month",
        billingCycle: "monthly",
        features: JSON.stringify([
          "Everything in Business",
          "Dedicated account manager",
          "Custom development",
          "SLA guarantees",
          "Advanced security features",
          "Bulk event management"
        ]),
        eventLimit: null, // Unlimited
        guestLimit: null, // Unlimited
        vendorLimit: null, // Unlimited
        analyticsPeriod: 12,
        isActive: true
      }
    ];
    
    for (const plan of plans) {
      await this.createSubscriptionPlan(plan);
    }
  }

  // Initialize with some default planning tips if they don't exist
  private async initPlanningTips() {
    // Check if tips already exist
    const existingTips = await db.select().from(planningTips);
    if (existingTips.length > 0) return; // Already initialized
    
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
    
    for (const tip of tips) {
      await this.createPlanningTip(tip);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      isAdmin: insertUser.isAdmin ?? false,
      subscriptionTier: insertUser.subscriptionTier ?? "free",
      subscriptionStatus: "active",
    }).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async getAdminUsers(): Promise<User[]> {
    return db.select().from(users).where(eq(users.isAdmin, true));
  }
  
  async createAdminUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      isAdmin: true,
      subscriptionTier: "enterprise",
      subscriptionStatus: "active",
    }).returning();
    return user;
  }
  
  async updateStripeCustomerId(userId: number, customerId: string): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }
  
  async updateUserSubscription(userId: number, tier: string, status: string): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ 
        subscriptionTier: tier,
        subscriptionStatus: status
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  // Event methods
  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async getEventsByOwner(ownerId: number): Promise<Event[]> {
    return db.select().from(events).where(eq(events.ownerId, ownerId));
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db.insert(events).values(insertEvent).returning();
    return event;
  }

  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | undefined> {
    // Add updatedAt timestamp
    const [updatedEvent] = await db.update(events)
      .set({
        ...eventData,
        updatedAt: new Date()
      })
      .where(eq(events.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id));
    return result.rowCount > 0;
  }

  // Task methods
  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async getTasksByEvent(eventId: number): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.eventId, eventId));
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }

  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    // Add updatedAt timestamp
    const [updatedTask] = await db.update(tasks)
      .set({
        ...taskData,
        updatedAt: new Date()
      })
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return result.rowCount > 0;
  }

  // Guest methods
  async getGuest(id: number): Promise<Guest | undefined> {
    const [guest] = await db.select().from(guests).where(eq(guests.id, id));
    return guest;
  }

  async getGuestsByEvent(eventId: number): Promise<Guest[]> {
    return db.select().from(guests).where(eq(guests.eventId, eventId));
  }

  async createGuest(insertGuest: InsertGuest): Promise<Guest> {
    const [guest] = await db.insert(guests).values(insertGuest).returning();
    return guest;
  }

  async updateGuest(id: number, guestData: Partial<InsertGuest>): Promise<Guest | undefined> {
    const [updatedGuest] = await db.update(guests)
      .set(guestData)
      .where(eq(guests.id, id))
      .returning();
    return updatedGuest;
  }

  async deleteGuest(id: number): Promise<boolean> {
    const result = await db.delete(guests).where(eq(guests.id, id));
    return result.rowCount > 0;
  }

  // Vendor methods
  async getVendor(id: number): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor;
  }

  async getAllVendors(): Promise<Vendor[]> {
    return db.select().from(vendors);
  }

  async getPartnerVendors(): Promise<Vendor[]> {
    return db.select().from(vendors).where(eq(vendors.isPartner, true));
  }

  async getUserVendors(userId: number): Promise<Vendor[]> {
    return db.select().from(vendors).where(eq(vendors.ownerId, userId));
  }

  async getVendorsByCategory(category: string): Promise<Vendor[]> {
    return db.select().from(vendors).where(eq(vendors.category, category));
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const [vendor] = await db.insert(vendors).values(insertVendor).returning();
    return vendor;
  }

  async updateVendor(id: number, vendorData: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const [updatedVendor] = await db.update(vendors)
      .set(vendorData)
      .where(eq(vendors.id, id))
      .returning();
    return updatedVendor;
  }

  async deleteVendor(id: number): Promise<boolean> {
    const result = await db.delete(vendors).where(eq(vendors.id, id));
    return result.rowCount > 0;
  }

  // Event-Vendor methods
  async getEventVendor(id: number): Promise<EventVendor | undefined> {
    const [eventVendor] = await db.select().from(eventVendors).where(eq(eventVendors.id, id));
    return eventVendor;
  }

  async getVendorsByEvent(eventId: number): Promise<EventVendor[]> {
    return db.select().from(eventVendors).where(eq(eventVendors.eventId, eventId));
  }

  async createEventVendor(insertEventVendor: InsertEventVendor): Promise<EventVendor> {
    const [eventVendor] = await db.insert(eventVendors).values(insertEventVendor).returning();
    return eventVendor;
  }

  // Planning Tip methods
  async getPlanningTip(id: number): Promise<PlanningTip | undefined> {
    const [planningTip] = await db.select().from(planningTips).where(eq(planningTips.id, id));
    return planningTip;
  }

  async getAllPlanningTips(): Promise<PlanningTip[]> {
    return db.select().from(planningTips);
  }

  async getPlanningTipsByCategory(category: string): Promise<PlanningTip[]> {
    return db.select().from(planningTips).where(eq(planningTips.category, category));
  }

  async createPlanningTip(insertTip: InsertPlanningTip): Promise<PlanningTip> {
    const [planningTip] = await db.insert(planningTips).values(insertTip).returning();
    return planningTip;
  }

  // User Preferences methods
  async getUserPreferences(userId: number): Promise<UserPreference | undefined> {
    const [userPreference] = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
    return userPreference;
  }

  async createUserPreferences(insertPreference: InsertUserPreference): Promise<UserPreference> {
    const [userPreference] = await db.insert(userPreferences).values(insertPreference).returning();
    return userPreference;
  }

  async updateUserPreferences(userId: number, preferenceData: Partial<InsertUserPreference>): Promise<UserPreference | undefined> {
    const [updatedPreference] = await db.update(userPreferences)
      .set({
        ...preferenceData,
        updatedAt: new Date()
      })
      .where(eq(userPreferences.userId, userId))
      .returning();
    return updatedPreference;
  }

  // Event Analytics methods
  async getEventAnalytics(id: number): Promise<EventAnalytics | undefined> {
    const [eventAnalytic] = await db.select().from(eventAnalytics).where(eq(eventAnalytics.id, id));
    return eventAnalytic;
  }

  async getAnalyticsByEvent(eventId: number): Promise<EventAnalytics[]> {
    return db.select()
      .from(eventAnalytics)
      .where(eq(eventAnalytics.eventId, eventId))
      .orderBy(desc(eventAnalytics.createdAt));
  }

  async createEventAnalytics(insertAnalytics: InsertEventAnalytics): Promise<EventAnalytics> {
    const [eventAnalytic] = await db.insert(eventAnalytics).values(insertAnalytics).returning();
    return eventAnalytic;
  }

  async updateEventAnalytics(id: number, analyticsData: Partial<InsertEventAnalytics>): Promise<EventAnalytics | undefined> {
    const [updatedAnalytics] = await db.update(eventAnalytics)
      .set({
        ...analyticsData,
        updatedAt: new Date()
      })
      .where(eq(eventAnalytics.id, id))
      .returning();
    return updatedAnalytics;
  }

  // Attendee Feedback methods
  async getAttendeeFeedback(id: number): Promise<AttendeeFeedback | undefined> {
    const [feedback] = await db.select().from(attendeeFeedback).where(eq(attendeeFeedback.id, id));
    return feedback;
  }

  async getFeedbackByEvent(eventId: number): Promise<AttendeeFeedback[]> {
    return db.select()
      .from(attendeeFeedback)
      .where(eq(attendeeFeedback.eventId, eventId))
      .orderBy(desc(attendeeFeedback.createdAt));
  }

  async createAttendeeFeedback(insertFeedback: InsertAttendeeFeedback): Promise<AttendeeFeedback> {
    const [feedback] = await db.insert(attendeeFeedback).values(insertFeedback).returning();
    return feedback;
  }

  async getEventFeedbackSummary(eventId: number): Promise<{
    averageOverallRating: number;
    averageContentRating: number;
    averageTechnicalRating: number;
    averageEngagementRating: number;
    recommendationPercentage: number;
    totalFeedbackCount: number;
  }> {
    const feedbacks = await this.getFeedbackByEvent(eventId);
    
    if (feedbacks.length === 0) {
      return {
        averageOverallRating: 0,
        averageContentRating: 0,
        averageTechnicalRating: 0,
        averageEngagementRating: 0,
        recommendationPercentage: 0,
        totalFeedbackCount: 0
      };
    }
    
    // Calculate averages
    const totalFeedbackCount = feedbacks.length;
    
    const overallRatingSum = feedbacks.reduce((sum, feedback) => sum + feedback.overallRating, 0);
    const averageOverallRating = overallRatingSum / totalFeedbackCount;
    
    // Content rating (some might be null)
    const contentRatings = feedbacks.filter(feedback => feedback.contentRating !== null);
    const contentRatingSum = contentRatings.reduce((sum, feedback) => sum + (feedback.contentRating || 0), 0);
    const averageContentRating = contentRatings.length > 0 ? contentRatingSum / contentRatings.length : 0;
    
    // Technical rating
    const technicalRatings = feedbacks.filter(feedback => feedback.technicalRating !== null);
    const technicalRatingSum = technicalRatings.reduce((sum, feedback) => sum + (feedback.technicalRating || 0), 0);
    const averageTechnicalRating = technicalRatings.length > 0 ? technicalRatingSum / technicalRatings.length : 0;
    
    // Engagement rating
    const engagementRatings = feedbacks.filter(feedback => feedback.engagementRating !== null);
    const engagementRatingSum = engagementRatings.reduce((sum, feedback) => sum + (feedback.engagementRating || 0), 0);
    const averageEngagementRating = engagementRatings.length > 0 ? engagementRatingSum / engagementRatings.length : 0;
    
    // Recommendation percentage
    const recommendations = feedbacks.filter(feedback => feedback.wouldRecommend !== null);
    const recommendationCount = recommendations.filter(feedback => feedback.wouldRecommend === true).length;
    const recommendationPercentage = recommendations.length > 0 ? (recommendationCount / recommendations.length) * 100 : 0;
    
    return {
      averageOverallRating,
      averageContentRating,
      averageTechnicalRating,
      averageEngagementRating,
      recommendationPercentage,
      totalFeedbackCount
    };
  }

  // Subscription Plan methods
  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan;
  }

  async getSubscriptionPlanByName(name: string): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.name, name));
    return plan;
  }

  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return db.select().from(subscriptionPlans);
  }

  async getActiveSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true));
  }

  async createSubscriptionPlan(insertPlan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [plan] = await db.insert(subscriptionPlans).values(insertPlan).returning();
    return plan;
  }

  async updateSubscriptionPlan(id: number, planData: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined> {
    const [updatedPlan] = await db.update(subscriptionPlans)
      .set({
        ...planData,
        updatedAt: new Date()
      })
      .where(eq(subscriptionPlans.id, id))
      .returning();
    return updatedPlan;
  }

  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return db.select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(insertTransaction).returning();
    return transaction;
  }

  async updateTransaction(id: number, transactionData: Partial<Transaction>): Promise<Transaction | undefined> {
    const [updatedTransaction] = await db.update(transactions)
      .set(transactionData)
      .where(eq(transactions.id, id))
      .returning();
    return updatedTransaction;
  }
}

// Use the database storage implementation
export const storage = new DatabaseStorage();
