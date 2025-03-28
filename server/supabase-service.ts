import { createClient } from '@supabase/supabase-js';
import { 
  User, 
  Event, 
  Task, 
  Guest,
  Vendor, 
  EventVendor, 
  PlanningTip, 
  UserPreference,
  EventAnalytics,
  AttendeeFeedback,
  SubscriptionPlan,
  Transaction,
  TABLES
} from '../shared/supabase-types';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set');
}

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// User functions
export async function getUser(id: number): Promise<User | null> {
  const { data, error } = await supabase
    .from(TABLES.USERS)
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  
  return data;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const { data, error } = await supabase
    .from(TABLES.USERS)
    .select('*')
    .eq('username', username)
    .single();
  
  if (error) {
    console.error('Error getting user by username:', error);
    return null;
  }
  
  return data;
}

export async function createUser(user: Omit<User, 'id' | 'created_at'>): Promise<User | null> {
  const { data, error } = await supabase
    .from(TABLES.USERS)
    .insert([user])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating user:', error);
    return null;
  }
  
  return data;
}

export async function updateUser(id: number, userData: Partial<User>): Promise<User | null> {
  const { data, error } = await supabase
    .from(TABLES.USERS)
    .update(userData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating user:', error);
    return null;
  }
  
  return data;
}

// Event functions
export async function getEvent(id: number): Promise<Event | null> {
  const { data, error } = await supabase
    .from(TABLES.EVENTS)
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error getting event:', error);
    return null;
  }
  
  return data;
}

export async function getEventsByOwner(ownerId: number): Promise<Event[]> {
  const { data, error } = await supabase
    .from(TABLES.EVENTS)
    .select('*')
    .eq('owner_id', ownerId)
    .order('date', { ascending: true });
  
  if (error) {
    console.error('Error getting events by owner:', error);
    return [];
  }
  
  return data || [];
}

export async function createEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event | null> {
  const { data, error } = await supabase
    .from(TABLES.EVENTS)
    .insert([event])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating event:', error);
    return null;
  }
  
  return data;
}

export async function updateEvent(id: number, eventData: Partial<Event>): Promise<Event | null> {
  const { data, error } = await supabase
    .from(TABLES.EVENTS)
    .update({ ...eventData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating event:', error);
    return null;
  }
  
  return data;
}

export async function deleteEvent(id: number): Promise<boolean> {
  const { error } = await supabase
    .from(TABLES.EVENTS)
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting event:', error);
    return false;
  }
  
  return true;
}

// Task functions
export async function getTask(id: number): Promise<Task | null> {
  const { data, error } = await supabase
    .from(TABLES.TASKS)
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error getting task:', error);
    return null;
  }
  
  return data;
}

export async function getTasksByEvent(eventId: number): Promise<Task[]> {
  const { data, error } = await supabase
    .from(TABLES.TASKS)
    .select('*')
    .eq('event_id', eventId)
    .order('due_date', { ascending: true });
  
  if (error) {
    console.error('Error getting tasks by event:', error);
    return [];
  }
  
  return data || [];
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task | null> {
  const { data, error } = await supabase
    .from(TABLES.TASKS)
    .insert([task])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating task:', error);
    return null;
  }
  
  return data;
}

export async function updateTask(id: number, taskData: Partial<Task>): Promise<Task | null> {
  const { data, error } = await supabase
    .from(TABLES.TASKS)
    .update({ ...taskData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating task:', error);
    return null;
  }
  
  return data;
}

export async function deleteTask(id: number): Promise<boolean> {
  const { error } = await supabase
    .from(TABLES.TASKS)
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting task:', error);
    return false;
  }
  
  return true;
}

// Similar patterns for other entities would follow..
// For brevity, we'll implement a few key entities and add the rest as needed

// Vendor functions
export async function getAllVendors(): Promise<Vendor[]> {
  const { data, error } = await supabase
    .from(TABLES.VENDORS)
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error getting all vendors:', error);
    return [];
  }
  
  return data || [];
}

export async function getPartnerVendors(): Promise<Vendor[]> {
  const { data, error } = await supabase
    .from(TABLES.VENDORS)
    .select('*')
    .eq('is_partner', true)
    .order('name');
  
  if (error) {
    console.error('Error getting partner vendors:', error);
    return [];
  }
  
  return data || [];
}

// Planning Tip functions
export async function getAllPlanningTips(): Promise<PlanningTip[]> {
  const { data, error } = await supabase
    .from(TABLES.PLANNING_TIPS)
    .select('*')
    .order('category');
  
  if (error) {
    console.error('Error getting planning tips:', error);
    return [];
  }
  
  return data || [];
}

// User Preferences functions
export async function getUserPreferences(userId: number): Promise<UserPreference | null> {
  const { data, error } = await supabase
    .from(TABLES.USER_PREFERENCES)
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error getting user preferences:', error);
    return null;
  }
  
  return data;
}

// Subscription Plan functions
export async function getActiveSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const { data, error } = await supabase
    .from(TABLES.SUBSCRIPTION_PLANS)
    .select('*')
    .eq('is_active', true)
    .order('price');
  
  if (error) {
    console.error('Error getting active subscription plans:', error);
    return [];
  }
  
  return data || [];
}

// This service can be expanded with more functions as needed for each entity 