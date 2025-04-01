-- EventraAI Production Database Schema
-- Migration file to create all necessary tables and relationships

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-secret-key-here';

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table - stores user profiles beyond auth.users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    is_admin BOOLEAN NOT NULL DEFAULT false,
    stripe_customer_id TEXT,
    subscription_tier TEXT NOT NULL DEFAULT 'free',
    subscription_status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    preferred_themes JSONB,
    preferred_event_types JSONB,
    dark_mode BOOLEAN DEFAULT false,
    notifications_enabled BOOLEAN DEFAULT true,
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Events
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    format TEXT NOT NULL DEFAULT 'in-person',
    description TEXT,
    location TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    estimated_guests INTEGER,
    budget DECIMAL(12,2),
    status TEXT NOT NULL DEFAULT 'draft',
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    due_date TIMESTAMPTZ,
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vendors
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    website TEXT,
    logo TEXT,
    is_partner BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    rating DECIMAL(3,1),
    price_range TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Event Vendors
CREATE TABLE IF NOT EXISTS public.event_vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    budget DECIMAL(12,2),
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, vendor_id)
);

-- Guests
CREATE TABLE IF NOT EXISTS public.guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'invited',
    rsvp_status TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Event Analytics
CREATE TABLE IF NOT EXISTS public.event_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    views INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    rsvp_count INTEGER DEFAULT 0,
    attendee_count INTEGER DEFAULT 0,
    feedback_score DECIMAL(3,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Usage - tracking AI service requests
CREATE TABLE IF NOT EXISTS public.ai_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL,
    tokens_used INTEGER,
    input_data JSONB,
    success BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Files
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Event Team Members (collaborators)
CREATE TABLE IF NOT EXISTS public.event_team (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'viewer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Subscription Plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    interval TEXT NOT NULL,
    features JSONB NOT NULL,
    event_limit INTEGER,
    ai_call_limit INTEGER,
    guest_limit INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security Policies
-- Users: Users can only see and modify their own data
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_policy ON public.users 
    USING (id = auth.uid() OR is_admin = true)
    WITH CHECK (id = auth.uid() OR is_admin = true);

-- Events: Users can only see and modify their own events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY events_own_policy ON public.events 
    USING (owner_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM public.event_team WHERE event_id = events.id AND user_id = auth.uid()))
    WITH CHECK (owner_id = auth.uid());

-- Tasks: Users can only see and modify tasks for their events
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tasks_policy ON public.tasks 
    USING (created_by = auth.uid() OR 
           EXISTS (SELECT 1 FROM public.events WHERE id = tasks.event_id AND owner_id = auth.uid()) OR
           EXISTS (SELECT 1 FROM public.event_team WHERE event_id = tasks.event_id AND user_id = auth.uid()));

-- Vendors: Public read, but only admin can modify
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY vendors_read_policy ON public.vendors FOR SELECT USING (true);
CREATE POLICY vendors_write_policy ON public.vendors FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY vendors_update_policy ON public.vendors FOR UPDATE USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true));

-- Event Vendors: Users can only see and modify vendors for their events
ALTER TABLE public.event_vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY event_vendors_policy ON public.event_vendors 
    USING (EXISTS (SELECT 1 FROM public.events WHERE id = event_vendors.event_id AND owner_id = auth.uid()) OR
           EXISTS (SELECT 1 FROM public.event_team WHERE event_id = event_vendors.event_id AND user_id = auth.uid()));

-- Guests: Users can only see and modify guests for their events
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
CREATE POLICY guests_policy ON public.guests 
    USING (EXISTS (SELECT 1 FROM public.events WHERE id = guests.event_id AND owner_id = auth.uid()) OR
           EXISTS (SELECT 1 FROM public.event_team WHERE event_id = guests.event_id AND user_id = auth.uid()));

-- Files: Users can only see and modify their own files
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
CREATE POLICY files_policy ON public.files 
    USING (user_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM public.events WHERE id = files.event_id AND owner_id = auth.uid()) OR
           EXISTS (SELECT 1 FROM public.event_team WHERE event_id = files.event_id AND user_id = auth.uid()));

-- Functions and Triggers
-- Update updated_at timestamp on record change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_vendors_updated_at
    BEFORE UPDATE ON public.vendors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Insert default data
-- Default subscription plans
INSERT INTO public.subscription_plans (name, display_name, description, price, interval, features, event_limit, ai_call_limit, guest_limit)
VALUES 
    ('free', 'Free', 'Basic event planning features', 0, 'month', 
     '["3 events", "Basic AI suggestions", "50 guests per event"]'::jsonb, 3, 5, 50),
    ('starter', 'Starter', 'Enhanced features for small events', 9.99, 'month', 
     '["10 events", "Enhanced AI suggestions", "100 guests per event", "Priority support"]'::jsonb, 10, 20, 100),
    ('pro', 'Professional', 'Advanced features for professionals', 29.99, 'month', 
     '["Unlimited events", "Advanced AI assistance", "500 guests per event", "Premium support", "Team collaboration"]'::jsonb, NULL, 100, 500),
    ('business', 'Business', 'Enterprise-grade event platform', 99.99, 'month', 
     '["Unlimited everything", "Custom branding", "API access", "Dedicated support"]'::jsonb, NULL, 500, NULL)
ON CONFLICT (name) DO NOTHING;
