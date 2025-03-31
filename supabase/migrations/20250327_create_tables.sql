-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    password TEXT,
    stripe_customer_id TEXT,
    subscription_tier TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    format TEXT NOT NULL,
    date TEXT,
    owner_id UUID REFERENCES public.users(id) NOT NULL,
    estimated_guests INTEGER,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'planning',
    theme TEXT,
    budget DECIMAL,
    location TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    due_date TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add admin user to public.users table directly without relying on user_metadata
INSERT INTO public.users (id, username, display_name, email, is_admin, subscription_tier, subscription_status)
SELECT 
    id,
    email, -- Use email as username if user_metadata not available
    COALESCE(raw_user_meta_data->>'display_name', email), -- Extract from raw_user_meta_data or use email
    email,
    true, -- Explicitly set is_admin to true for admin@example.com
    'enterprise', -- Set subscription tier
    'active' -- Set subscription status
FROM auth.users
WHERE email = 'admin@example.com'
ON CONFLICT (id) DO NOTHING; 