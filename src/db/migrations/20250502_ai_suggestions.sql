-- AI Suggestions Table Migration
-- This table stores AI-generated suggestions for events

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create AI suggestions table
CREATE TABLE IF NOT EXISTS public.ai_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    suggestion_type TEXT NOT NULL,
    content TEXT NOT NULL,
    is_implemented BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_event ON public.ai_suggestions(event_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_type ON public.ai_suggestions(suggestion_type);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_implemented ON public.ai_suggestions(is_implemented);

-- Enable Row Level Security
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Event team members can view suggestions
CREATE POLICY "Event team can view AI suggestions"
    ON public.ai_suggestions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = ai_suggestions.event_id 
            AND owner_id = auth.uid()
        ) OR 
        EXISTS (
            SELECT 1 FROM public.event_team 
            WHERE event_id = ai_suggestions.event_id 
            AND user_id = auth.uid()
        )
    );

-- Only event owners can create suggestions
CREATE POLICY "Event owners can create AI suggestions"
    ON public.ai_suggestions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id 
            AND owner_id = auth.uid()
        )
    );

-- Only event owners can update suggestions
CREATE POLICY "Event owners can update AI suggestions"
    ON public.ai_suggestions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id 
            AND owner_id = auth.uid()
        )
    );

-- Only event owners can delete suggestions
CREATE POLICY "Event owners can delete AI suggestions"
    ON public.ai_suggestions
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id 
            AND owner_id = auth.uid()
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_suggestions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating updated_at
CREATE TRIGGER update_ai_suggestions_timestamp
    BEFORE UPDATE ON public.ai_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_suggestions_updated_at();

-- Add comment for documentation
COMMENT ON TABLE public.ai_suggestions IS 'Stores AI-generated suggestions for events, including task recommendations, planning tips, and improvements'; 