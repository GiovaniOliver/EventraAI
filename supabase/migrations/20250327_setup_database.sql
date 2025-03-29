-- Add extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password TEXT,
    display_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    is_admin BOOLEAN DEFAULT false NOT NULL,
    stripe_customer_id TEXT,
    subscription_tier TEXT DEFAULT 'starter' NOT NULL,
    subscription_status TEXT DEFAULT 'active' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    format TEXT NOT NULL, 
    date TEXT,
    owner_id UUID REFERENCES public.users(id) NOT NULL,
    estimated_guests INTEGER,
    description TEXT,
    status TEXT DEFAULT 'planning' NOT NULL,
    theme TEXT,
    budget DECIMAL,
    location TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

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

-- Create planning tips table
CREATE TABLE IF NOT EXISTS public.planning_tips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    icon TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create subscription_plans table
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

-- Insert admin user
INSERT INTO public.users (
    username, 
    password, 
    display_name, 
    email, 
    is_admin, 
    subscription_tier, 
    subscription_status
) 
VALUES (
    'admin', 
    '510696027db8c02e5295da3d4a35b166bd3571c25edd0878ba9149fd3e1c7d98cf80022831c4c1c703ce40218b4e01f256c809defabb726e00ad02aa6bd5a269.21ab173064b7950f26adfd1032d424d9',
    'Administrator', 
    'admin@socialtizemg.com', 
    true, 
    'enterprise', 
    'active'
)
ON CONFLICT (email) DO NOTHING;

-- Insert planning tips from backup
INSERT INTO public.planning_tips (
    title, 
    description, 
    category, 
    icon
) 
VALUES 
    ('5 Ways to Engage Virtual Attendees', 'Keep your audience engaged and interactive during online events', 'engagement', 'tips_and_updates'),
    ('Perfect Timing for Event Activities', 'Learn how to schedule your event for maximum participation', 'timing', 'schedule'),
    ('Budget Planning Essentials', 'Smart strategies to allocate resources effectively', 'budget', 'wysiwyg')
ON CONFLICT DO NOTHING;

-- Insert subscription plans from backup
INSERT INTO public.subscription_plans (
    name, 
    display_name, 
    description, 
    price, 
    features, 
    event_limit, 
    guest_limit, 
    vendor_limit, 
    analytics_period, 
    ai_call_limit
) 
VALUES 
    ('starter', 'Starter', 'Perfect for individuals and small events', 1499, '["Up to 5 events", "Basic analytics", "Standard templates", "50 AI assistant calls per month", "Email support", "1 team member"]', 5, 75, 10, 1, 50),
    ('pro', 'Professional', 'Advanced features for professionals and growing businesses', 2999, '["Up to 15 events", "Advanced analytics", "Premium templates", "Priority support", "Custom branding", "200 AI assistant calls per month", "3 team members"]', 15, 250, 25, 3, 200),
    ('business', 'Business', 'Full-featured solution for established businesses', 5999, '["Up to 50 events", "Comprehensive analytics", "Team collaboration", "API access", "White labeling", "Custom integrations", "500 AI assistant calls per month", "10 team members"]', 50, 750, 50, 6, 500),
    ('enterprise', 'Enterprise', 'Custom solution for large organizations', 19999, '["Unlimited events", "Advanced reporting and data", "Unlimited team members", "Dedicated account manager", "Custom feature development", "Enterprise SLA", "Onboarding support", "Unlimited AI assistant calls"]', 1000, 5000, 200, 12, 1000)
ON CONFLICT DO NOTHING; 