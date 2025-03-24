import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  email: true,
});

// Event schema
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // conference, birthday, webinar, other
  format: text("format").notNull(), // virtual, in-person, hybrid
  date: timestamp("date").notNull(),
  ownerId: integer("owner_id").notNull(),
  estimatedGuests: integer("estimated_guests"),
  description: text("description"),
  status: text("status").default("draft").notNull(), // draft, planning, active, completed, cancelled
  theme: text("theme"),
  budget: integer("budget"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEventSchema = createInsertSchema(events).pick({
  name: true,
  type: true,
  format: true,
  date: true,
  ownerId: true,
  estimatedGuests: true,
  description: true,
  status: true,
  theme: true,
  budget: true,
});

// Task schema
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("pending").notNull(), // pending, in-progress, completed
  dueDate: timestamp("due_date"),
  assignedTo: integer("assigned_to"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  eventId: true,
  title: true,
  description: true,
  status: true,
  dueDate: true,
  assignedTo: true,
});

// Guest schema
export const guests = pgTable("guests", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  status: text("status").default("invited").notNull(), // invited, confirmed, declined
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGuestSchema = createInsertSchema(guests).pick({
  eventId: true,
  name: true,
  email: true,
  status: true,
});

// Vendor schema
export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // catering, venue, technology, entertainment
  description: text("description"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  website: text("website"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVendorSchema = createInsertSchema(vendors).pick({
  name: true,
  category: true,
  description: true,
  contactEmail: true,
  contactPhone: true,
  website: true,
});

// Event-Vendor relationship schema
export const eventVendors = pgTable("event_vendors", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  vendorId: integer("vendor_id").notNull(),
  status: text("status").default("pending").notNull(), // pending, confirmed, cancelled
  budget: integer("budget"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEventVendorSchema = createInsertSchema(eventVendors).pick({
  eventId: true,
  vendorId: true,
  status: true,
  budget: true,
  notes: true,
});

// Planning Tip schema
export const planningTips = pgTable("planning_tips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // budget, engagement, timing, etc.
  icon: text("icon").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPlanningTipSchema = createInsertSchema(planningTips).pick({
  title: true,
  description: true,
  category: true,
  icon: true,
});

// User Preferences schema
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  preferredThemes: jsonb("preferred_themes").default("[]"),
  preferredEventTypes: jsonb("preferred_event_types").default("[]"),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserPreferenceSchema = createInsertSchema(userPreferences).pick({
  userId: true,
  preferredThemes: true,
  preferredEventTypes: true,
  notificationsEnabled: true,
  onboardingCompleted: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Guest = typeof guests.$inferSelect;
export type InsertGuest = z.infer<typeof insertGuestSchema>;

export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;

export type EventVendor = typeof eventVendors.$inferSelect;
export type InsertEventVendor = z.infer<typeof insertEventVendorSchema>;

export type PlanningTip = typeof planningTips.$inferSelect;
export type InsertPlanningTip = z.infer<typeof insertPlanningTipSchema>;

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = z.infer<typeof insertUserPreferenceSchema>;
