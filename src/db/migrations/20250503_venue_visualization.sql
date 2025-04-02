-- Venue Visualization Feature Migration
-- This migration adds theme to events and creates the venue_visualizations table

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add theme field to events table if it doesn't exist
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS theme TEXT;

-- Create venue_visualizations table
CREATE TABLE IF NOT EXISTS public.venue_visualizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    original_image_path TEXT NOT NULL,
    generated_image_path TEXT,
    theme TEXT NOT NULL,
    prompt TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    generation_params JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_venue_vis_event_id ON public.venue_visualizations(event_id);
CREATE INDEX IF NOT EXISTS idx_venue_vis_status ON public.venue_visualizations(status);

-- Enable Row Level Security
ALTER TABLE public.venue_visualizations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Event team members can view visualizations
CREATE POLICY "Users can view their own venue visualizations"
    ON public.venue_visualizations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = venue_visualizations.event_id 
            AND owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.event_team 
            WHERE event_id = venue_visualizations.event_id 
            AND user_id = auth.uid()
        )
    );

-- Only event owners can create visualizations
CREATE POLICY "Users can create venue visualizations for their events"
    ON public.venue_visualizations
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id 
            AND owner_id = auth.uid()
        )
    );

-- Only event owners can update visualizations
CREATE POLICY "Users can update their own venue visualizations"
    ON public.venue_visualizations
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id 
            AND owner_id = auth.uid()
        )
    );

-- Only event owners can delete visualizations
CREATE POLICY "Users can delete their own venue visualizations"
    ON public.venue_visualizations
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id 
            AND owner_id = auth.uid()
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_venue_visualization_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating updated_at
CREATE TRIGGER update_venue_visualization_timestamp
    BEFORE UPDATE ON public.venue_visualizations
    FOR EACH ROW
    EXECUTE FUNCTION update_venue_visualization_updated_at();

-- Update SubscriptionLimits to include AI image generations
ALTER TABLE IF EXISTS public.subscription_plans 
    ADD COLUMN IF NOT EXISTS ai_image_limit INTEGER DEFAULT 0;

-- Set initial AI image limits for existing subscription plans
UPDATE public.subscription_plans SET ai_image_limit = 2 WHERE name = 'free';
UPDATE public.subscription_plans SET ai_image_limit = 10 WHERE name = 'starter';
UPDATE public.subscription_plans SET ai_image_limit = 25 WHERE name = 'pro';
UPDATE public.subscription_plans SET ai_image_limit = 50 WHERE name = 'business';
UPDATE public.subscription_plans SET ai_image_limit = -1 WHERE name = 'enterprise';

-- Create ai_image_usage table to track usage
CREATE TABLE IF NOT EXISTS public.ai_image_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    visualization_id UUID REFERENCES public.venue_visualizations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.ai_image_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own AI image usage"
    ON public.ai_image_usage
    FOR SELECT
    USING (
        user_id = auth.uid()
    );

-- Only system can insert into AI image usage (will be done through service functions)
CREATE POLICY "System can insert AI image usage"
    ON public.ai_image_usage
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
    );

-- Add index for querying usage
CREATE INDEX IF NOT EXISTS idx_ai_image_usage_user ON public.ai_image_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_image_usage_date ON public.ai_image_usage(created_at);

-- Add comment for documentation
COMMENT ON TABLE public.venue_visualizations IS 'Stores AI-generated venue visualizations with their original images and themes';
COMMENT ON TABLE public.ai_image_usage IS 'Tracks AI image generation usage for subscription limit enforcement'; 