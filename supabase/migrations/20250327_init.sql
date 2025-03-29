-- Enable uuid generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Create RLS policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own data
CREATE POLICY users_select_policy ON public.users
    FOR SELECT
    USING (id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
    ));

CREATE POLICY events_select_policy ON public.events
    FOR SELECT
    USING (owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
    ));

CREATE POLICY tasks_select_policy ON public.tasks
    FOR SELECT
    USING (assigned_to = auth.uid() OR EXISTS (
        SELECT 1 FROM public.events WHERE id = event_id AND owner_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
    ));

-- Allow users to update their own data
CREATE POLICY users_update_policy ON public.users
    FOR UPDATE
    USING (id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
    ));

CREATE POLICY events_update_policy ON public.events
    FOR UPDATE
    USING (owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
    ));

CREATE POLICY tasks_update_policy ON public.tasks
    FOR UPDATE
    USING (assigned_to = auth.uid() OR EXISTS (
        SELECT 1 FROM public.events WHERE id = event_id AND owner_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
    ));

-- Allow users to insert their own data
CREATE POLICY users_insert_policy ON public.users
    FOR INSERT
    WITH CHECK (id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
    ));

CREATE POLICY events_insert_policy ON public.events
    FOR INSERT
    WITH CHECK (owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
    ));

CREATE POLICY tasks_insert_policy ON public.tasks
    FOR INSERT
    WITH CHECK (assigned_to = auth.uid() OR EXISTS (
        SELECT 1 FROM public.events WHERE id = event_id AND owner_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
    ));

-- Allow users to delete their own data
CREATE POLICY users_delete_policy ON public.users
    FOR DELETE
    USING (id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
    ));

CREATE POLICY events_delete_policy ON public.events
    FOR DELETE
    USING (owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
    ));

CREATE POLICY tasks_delete_policy ON public.tasks
    FOR DELETE
    USING (assigned_to = auth.uid() OR EXISTS (
        SELECT 1 FROM public.events WHERE id = event_id AND owner_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
    ));

-- Create functions to manage users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, display_name, email, is_admin, subscription_tier, subscription_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false),
    COALESCE(NEW.raw_user_meta_data->>'subscription_tier', 'free'),
    COALESCE(NEW.raw_user_meta_data->>'subscription_status', 'active')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for handling new users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 