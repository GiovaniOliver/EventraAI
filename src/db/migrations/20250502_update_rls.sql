-- Update RLS Policies Migration
-- This migration removes admin shortcuts and implements proper role-based access

-- First, add role column to users if not exists
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Update existing admin users to have admin role
UPDATE public.users SET role = CASE WHEN is_admin THEN 'admin' ELSE 'user' END;

-- Create roles enum type
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'editor', 'viewer', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Alter role column to use enum
ALTER TABLE public.users 
    ALTER COLUMN role TYPE user_role 
    USING role::user_role;

-- Update users RLS policies
DROP POLICY IF EXISTS users_policy ON public.users;
CREATE POLICY users_own_data ON public.users 
    FOR ALL
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Update events RLS policies
DROP POLICY IF EXISTS events_own_policy ON public.events;
CREATE POLICY events_access ON public.events 
    FOR ALL
    USING (
        owner_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.event_team 
            WHERE event_id = events.id 
            AND user_id = auth.uid()
        )
    )
    WITH CHECK (owner_id = auth.uid());

-- Update tasks RLS policies
DROP POLICY IF EXISTS tasks_policy ON public.tasks;
CREATE POLICY tasks_access ON public.tasks 
    FOR ALL
    USING (
        created_by = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = tasks.event_id 
            AND owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.event_team 
            WHERE event_id = tasks.event_id 
            AND user_id = auth.uid()
        )
    )
    WITH CHECK (
        created_by = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = tasks.event_id 
            AND owner_id = auth.uid()
        )
    );

-- Update guests RLS policies
DROP POLICY IF EXISTS guests_policy ON public.guests;
CREATE POLICY guests_access ON public.guests 
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = guests.event_id 
            AND owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.event_team 
            WHERE event_id = guests.event_id 
            AND user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = guests.event_id 
            AND owner_id = auth.uid()
        )
    );

-- Update files RLS policies
DROP POLICY IF EXISTS files_policy ON public.files;
CREATE POLICY files_access ON public.files 
    FOR ALL
    USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = files.event_id 
            AND owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.event_team 
            WHERE event_id = files.event_id 
            AND user_id = auth.uid()
        )
    )
    WITH CHECK (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = files.event_id 
            AND owner_id = auth.uid()
        )
    );

-- Update vendors RLS policies
DROP POLICY IF EXISTS vendors_read_policy ON public.vendors;
DROP POLICY IF EXISTS vendors_write_policy ON public.vendors;
DROP POLICY IF EXISTS vendors_update_policy ON public.vendors;

CREATE POLICY vendors_read ON public.vendors 
    FOR SELECT USING (true);

CREATE POLICY vendors_write ON public.vendors 
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY vendors_modify ON public.vendors 
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Create helper function for role checks
CREATE OR REPLACE FUNCTION check_user_role(required_role user_role)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND (
            CASE role
                WHEN 'admin' THEN true  -- Admin can do everything
                WHEN 'editor' THEN required_role IN ('editor', 'viewer', 'user')
                WHEN 'viewer' THEN required_role IN ('viewer', 'user')
                ELSE role = required_role
            END
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 