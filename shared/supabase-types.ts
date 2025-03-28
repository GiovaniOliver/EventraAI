export type User = {
  id: number;
  username: string;
  password: string;
  display_name: string;
  email: string;
  is_admin: boolean;
  stripe_customer_id?: string;
  subscription_tier: string; // starter, pro, business, enterprise
  subscription_status: string; // active, past_due, canceled, unpaid
  created_at: string;
};

export type Event = {
  id: number;
  name: string;
  type: string; // conference, birthday, webinar, other
  format: string; // virtual, in-person, hybrid
  date: string;
  owner_id: number;
  estimated_guests?: number;
  description?: string;
  status: string; // draft, planning, active, completed, cancelled
  theme?: string;
  budget?: number;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: number;
  event_id: number;
  title: string;
  description?: string;
  status: string; // pending, in-progress, completed
  due_date?: string;
  assigned_to?: number;
  created_at: string;
  updated_at: string;
};

export type Guest = {
  id: number;
  event_id: number;
  name: string;
  email: string;
  status: string; // invited, confirmed, declined
  created_at: string;
};

export type Vendor = {
  id: number;
  name: string;
  category: string; // catering, venue, technology, entertainment
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  is_partner: boolean; // Partner vendors vs user-added
  is_approved: boolean; // Admin approval status
  logo?: string; // URL for vendor logo
  services: any[]; // List of services offered
  rating?: number; // 1-5 rating
  owner_id?: number; // User who added this vendor (null for partner vendors)
  affiliate_links: any[]; // Array of affiliate links with product info
  featured: boolean; // Whether this is a featured vendor
  created_at: string;
};

export type EventVendor = {
  id: number;
  event_id: number;
  vendor_id: number;
  status: string; // pending, confirmed, cancelled
  budget?: number;
  notes?: string;
  created_at: string;
};

export type PlanningTip = {
  id: number;
  title: string;
  description: string;
  category: string; // budget, engagement, timing, etc.
  icon: string;
  created_at: string;
};

export type UserPreference = {
  id: number;
  user_id: number;
  preferred_themes: any[];
  preferred_event_types: any[];
  notifications_enabled: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type EventAnalytics = {
  id: number;
  event_id: number;
  attendee_count: number;
  engagement_score: number; // 0-100 score
  average_attendance_time?: number; // in minutes
  max_concurrent_users: number;
  total_interactions: number;
  feedback_score?: number; // average feedback score 1-5
  analytics_date: string; // when these analytics were collected
  detailed_metrics: Record<string, any>; // for storing complex metrics as JSON
  created_at: string;
  updated_at: string;
};

export type AttendeeFeedback = {
  id: number;
  event_id: number;
  attendee_email: string;
  overall_rating: number; // 1-5 stars
  content_rating?: number; // 1-5 stars
  technical_rating?: number; // 1-5 stars 
  engagement_rating?: number; // 1-5 stars
  comments?: string;
  would_recommend?: boolean;
  created_at: string;
};

export type SubscriptionPlan = {
  id: number;
  name: string;
  display_name?: string;
  description?: string;
  price: number;
  currency: string;
  interval: string; // month, year
  billing_cycle: string; // monthly, annually
  features: any[]; // JSON array of features
  event_limit?: number; // null means unlimited
  storage_limit?: number; // in MB
  ai_call_limit?: number; // number of AI calls per month
  guest_limit?: number; // max number of guests
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: number;
  user_id: number;
  amount: number;
  currency: string;
  status: string; // completed, pending, failed
  payment_method: string;
  payment_id?: string; // payment provider reference
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
};

// Define table names to ensure consistency
export const TABLES = {
  USERS: 'users',
  EVENTS: 'events',
  TASKS: 'tasks',
  GUESTS: 'guests',
  VENDORS: 'vendors',
  EVENT_VENDORS: 'event_vendors',
  PLANNING_TIPS: 'planning_tips',
  USER_PREFERENCES: 'user_preferences',
  EVENT_ANALYTICS: 'event_analytics',
  ATTENDEE_FEEDBACK: 'attendee_feedback',
  SUBSCRIPTION_PLANS: 'subscription_plans',
  TRANSACTIONS: 'transactions'
}; 