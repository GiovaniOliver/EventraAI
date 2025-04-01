-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'event', 'task', 'system', etc.
  status VARCHAR(20) NOT NULL DEFAULT 'unread', -- 'unread', 'read'
  link VARCHAR(255), -- Optional link to related content
  data JSONB, -- Additional data specific to notification type
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  
  -- Indexes for faster querying
  CONSTRAINT idx_notifications_user_id_created UNIQUE (id, user_id, created_at)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- Add RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only update their own notifications (e.g., marking as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Only the system can insert notifications
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_as_read(notification_ids UUID[])
RETURNS SETOF notifications AS $$
BEGIN
  RETURN QUERY
  UPDATE notifications
  SET 
    status = 'read',
    read_at = NOW()
  WHERE 
    id = ANY(notification_ids)
    AND user_id = auth.uid()
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 