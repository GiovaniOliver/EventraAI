-- Update event_types enum in the database
DO $$ BEGIN
    -- Create new event type enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
        CREATE TYPE event_type AS ENUM (
            'virtual_conference',
            'workshop',
            'webinar',
            'team_building',
            'product_launch',
            'networking_event',
            'training_session',
            'panel_discussion',
            'award_ceremony'
        );
    ELSE
        -- If the type exists, we need to add new values
        ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'virtual_conference';
        ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'workshop';
        ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'webinar';
        ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'team_building';
        ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'product_launch';
        ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'networking_event';
        ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'training_session';
        ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'panel_discussion';
        ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'award_ceremony';
    END IF;
END $$;

-- Update the events table to use the new type
ALTER TABLE events
    ALTER COLUMN type TYPE event_type USING type::event_type; 