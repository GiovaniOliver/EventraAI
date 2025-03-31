-- This migration adds tables for tracking event shares and views

-- Table for tracking event shares
CREATE TABLE IF NOT EXISTS event_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL DEFAULT 'direct', -- e.g., 'twitter', 'facebook', 'email', etc.
  share_type VARCHAR(20) NOT NULL DEFAULT 'link', -- e.g., 'link', 'qr', 'social', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Index for quick filtering by event
  CONSTRAINT idx_event_shares_event_id UNIQUE (id, event_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_event_shares_event ON event_shares(event_id);
CREATE INDEX IF NOT EXISTS idx_event_shares_user ON event_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_event_shares_platform ON event_shares(platform);

-- Add comment for documentation
COMMENT ON TABLE event_shares IS 'Records each time an event is shared, including the platform and method';

-- Table for tracking event views
CREATE TABLE IF NOT EXISTS event_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  count INTEGER NOT NULL DEFAULT 0,
  first_viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Enforce one record per event
  CONSTRAINT unique_event_view UNIQUE (event_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_event_views_event ON event_views(event_id);

-- Add comment for documentation
COMMENT ON TABLE event_views IS 'Aggregated view counts for shared event pages';

-- Table for detailed view logs (anonymized for privacy)
CREATE TABLE IF NOT EXISTS event_view_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  referrer VARCHAR(255),
  ip_hash VARCHAR(64), -- Hashed IP for privacy
  user_agent TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_event_view_logs_event ON event_view_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_event_view_logs_viewed_at ON event_view_logs(viewed_at);

-- Add comment for documentation
COMMENT ON TABLE event_view_logs IS 'Detailed logs of event page views with anonymized visitor data';

-- Function to get share statistics for an event
CREATE OR REPLACE FUNCTION get_event_share_stats(p_event_id UUID)
RETURNS TABLE (
  total_shares BIGINT,
  total_views BIGINT,
  shares_by_platform JSONB,
  shares_by_type JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM event_shares WHERE event_id = p_event_id) AS total_shares,
    (SELECT COALESCE(count, 0) FROM event_views WHERE event_id = p_event_id) AS total_views,
    (
      SELECT jsonb_object_agg(platform, count)
      FROM (
        SELECT platform, COUNT(*) AS count
        FROM event_shares
        WHERE event_id = p_event_id
        GROUP BY platform
      ) AS platforms
    ) AS shares_by_platform,
    (
      SELECT jsonb_object_agg(share_type, count)
      FROM (
        SELECT share_type, COUNT(*) AS count
        FROM event_shares
        WHERE event_id = p_event_id
        GROUP BY share_type
      ) AS types
    ) AS shares_by_type;
END;
$$ LANGUAGE plpgsql; 