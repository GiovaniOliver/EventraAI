-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    display_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    is_admin BOOLEAN DEFAULT false NOT NULL,
    stripe_customer_id TEXT,
    subscription_tier TEXT DEFAULT 'starter' NOT NULL,
    subscription_status TEXT DEFAULT 'active' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create events table matching the backup structure but with UUID
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    format TEXT NOT NULL,
    date TEXT,
    owner_id UUID REFERENCES public.users(id) NOT NULL,
    estimated_guests INTEGER,
    description TEXT,
    status TEXT DEFAULT 'draft' NOT NULL,
    theme TEXT,
    budget DECIMAL,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create tasks table matching the backup structure but with UUID
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create guests table
CREATE TABLE IF NOT EXISTS public.guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    status TEXT DEFAULT 'invited' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create vendors table
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    website TEXT,
    is_partner BOOLEAN DEFAULT false NOT NULL,
    logo TEXT,
    services JSONB DEFAULT '[]' NOT NULL,
    rating INTEGER,
    owner_id UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    is_approved BOOLEAN DEFAULT false NOT NULL,
    affiliate_links JSONB DEFAULT '[]' NOT NULL,
    featured BOOLEAN DEFAULT false
);

-- Create event vendors table
CREATE TABLE IF NOT EXISTS public.event_vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) NOT NULL,
    vendor_id UUID REFERENCES public.vendors(id) NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    budget INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create analytics tables
CREATE TABLE IF NOT EXISTS public.event_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) NOT NULL,
    attendee_count INTEGER DEFAULT 0,
    engagement_score INTEGER DEFAULT 0,
    average_attendance_time INTEGER,
    max_concurrent_users INTEGER DEFAULT 0,
    total_interactions INTEGER DEFAULT 0,
    feedback_score INTEGER,
    analytics_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    detailed_metrics JSONB DEFAULT '{}' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create attendee feedback table
CREATE TABLE IF NOT EXISTS public.attendee_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) NOT NULL,
    attendee_email TEXT NOT NULL,
    overall_rating INTEGER NOT NULL,
    content_rating INTEGER,
    technical_rating INTEGER,
    engagement_rating INTEGER,
    comments TEXT,
    would_recommend BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create planning tips table
CREATE TABLE IF NOT EXISTS public.planning_tips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    icon TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create subscription plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    display_name TEXT,
    description TEXT,
    price INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd' NOT NULL,
    "interval" TEXT DEFAULT 'month' NOT NULL,
    billing_cycle TEXT DEFAULT 'monthly' NOT NULL,
    features JSONB DEFAULT '[]' NOT NULL,
    event_limit INTEGER,
    guest_limit INTEGER,
    vendor_limit INTEGER,
    analytics_period INTEGER,
    stripe_product_id TEXT,
    stripe_price_id TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    ai_call_limit INTEGER
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) NOT NULL,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd' NOT NULL,
    status TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    stripe_payment_intent_id TEXT,
    stripe_invoice_id TEXT,
    metadata JSONB DEFAULT '{}' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) NOT NULL,
    preferred_themes JSONB DEFAULT '[]' NOT NULL,
    preferred_event_types JSONB DEFAULT '[]' NOT NULL,
    notifications_enabled BOOLEAN DEFAULT true,
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create RLS policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendee_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planning_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create function to handle new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, display_name, email, is_admin, password, subscription_tier, subscription_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false),
    '', -- Password is handled by Supabase Auth
    COALESCE(NEW.raw_user_meta_data->>'subscription_tier', 'starter'),
    COALESCE(NEW.raw_user_meta_data->>'subscription_status', 'active')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for handling new users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 