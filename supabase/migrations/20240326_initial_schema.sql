-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  stripe_customer_id TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'starter',
  subscription_status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  format TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  owner_id INTEGER NOT NULL,
  estimated_guests INTEGER,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  theme TEXT,
  budget INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_to INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create guests table
CREATE TABLE IF NOT EXISTS guests (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'invited',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  is_partner BOOLEAN NOT NULL DEFAULT FALSE,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  logo TEXT,
  services JSONB DEFAULT '[]',
  rating INTEGER,
  owner_id INTEGER,
  affiliate_links JSONB DEFAULT '[]',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create event_vendors table
CREATE TABLE IF NOT EXISTS event_vendors (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  vendor_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  budget INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create planning_tips table
CREATE TABLE IF NOT EXISTS planning_tips (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  preferred_themes JSONB DEFAULT '[]',
  preferred_event_types JSONB DEFAULT '[]',
  notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create event_analytics table
CREATE TABLE IF NOT EXISTS event_analytics (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  attendee_count INTEGER NOT NULL DEFAULT 0,
  engagement_score INTEGER NOT NULL DEFAULT 0,
  average_attendance_time INTEGER,
  max_concurrent_users INTEGER NOT NULL DEFAULT 0,
  total_interactions INTEGER NOT NULL DEFAULT 0,
  feedback_score INTEGER,
  analytics_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  detailed_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create attendee_feedback table
CREATE TABLE IF NOT EXISTS attendee_feedback (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  attendee_email TEXT NOT NULL,
  overall_rating INTEGER NOT NULL,
  content_rating INTEGER,
  technical_rating INTEGER,
  engagement_rating INTEGER,
  comments TEXT,
  would_recommend BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT,
  description TEXT,
  price INTEGER NOT NULL,
  currency TEXT NOT NULL,
  interval TEXT NOT NULL,
  billing_cycle TEXT NOT NULL,
  features JSONB NOT NULL DEFAULT '[]',
  event_limit INTEGER,
  storage_limit INTEGER,
  ai_call_limit INTEGER,
  guest_limit INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_id TEXT,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add foreign key constraints
ALTER TABLE events
  ADD CONSTRAINT fk_events_owner
  FOREIGN KEY (owner_id)
  REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE tasks
  ADD CONSTRAINT fk_tasks_event
  FOREIGN KEY (event_id)
  REFERENCES events(id)
  ON DELETE CASCADE;

ALTER TABLE tasks
  ADD CONSTRAINT fk_tasks_assigned_to
  FOREIGN KEY (assigned_to)
  REFERENCES users(id)
  ON DELETE SET NULL;

ALTER TABLE guests
  ADD CONSTRAINT fk_guests_event
  FOREIGN KEY (event_id)
  REFERENCES events(id)
  ON DELETE CASCADE;

ALTER TABLE vendors
  ADD CONSTRAINT fk_vendors_owner
  FOREIGN KEY (owner_id)
  REFERENCES users(id)
  ON DELETE SET NULL;

ALTER TABLE event_vendors
  ADD CONSTRAINT fk_event_vendors_event
  FOREIGN KEY (event_id)
  REFERENCES events(id)
  ON DELETE CASCADE;

ALTER TABLE event_vendors
  ADD CONSTRAINT fk_event_vendors_vendor
  FOREIGN KEY (vendor_id)
  REFERENCES vendors(id)
  ON DELETE CASCADE;

ALTER TABLE user_preferences
  ADD CONSTRAINT fk_user_preferences_user
  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE event_analytics
  ADD CONSTRAINT fk_event_analytics_event
  FOREIGN KEY (event_id)
  REFERENCES events(id)
  ON DELETE CASCADE;

ALTER TABLE attendee_feedback
  ADD CONSTRAINT fk_attendee_feedback_event
  FOREIGN KEY (event_id)
  REFERENCES events(id)
  ON DELETE CASCADE;

ALTER TABLE transactions
  ADD CONSTRAINT fk_transactions_user
  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE; 