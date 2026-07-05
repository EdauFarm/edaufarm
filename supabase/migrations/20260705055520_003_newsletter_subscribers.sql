-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  phone text,
  is_active boolean DEFAULT true,
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz,
  preferences jsonb DEFAULT '{"marketing": true, "harvest_updates": true, "promotions": true}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Public policies for subscription
CREATE POLICY "anyone_can_subscribe" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "public_read_own_subscription" ON newsletter_subscribers
  FOR SELECT USING (true);

CREATE POLICY "anyone_can_unsubscribe" ON newsletter_subscribers
  FOR UPDATE USING (true);

-- Admin can manage all
CREATE POLICY "admin_manage_subscribers" ON newsletter_subscribers
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Index for quick email lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_active ON newsletter_subscribers(is_active);