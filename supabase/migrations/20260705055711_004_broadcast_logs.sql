-- Broadcast logs table for tracking marketing emails
CREATE TABLE IF NOT EXISTS broadcast_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  subject text NOT NULL,
  recipients_count integer NOT NULL,
  sent_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE broadcast_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view broadcast logs
CREATE POLICY "admin_view_broadcasts" ON broadcast_logs
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_broadcasts_created ON broadcast_logs(sent_at DESC);