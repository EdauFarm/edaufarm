-- Create site_settings table for configurable homepage content
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default video URL
INSERT INTO site_settings (key, value) VALUES
  ('farm_story_video_url', 'https://www.youtube.com/embed/dQw4w9WgXcQ')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read
CREATE POLICY "site_settings_public_read" ON site_settings
  FOR SELECT TO anon, authenticated USING (true);

-- Create policies for admin write (insert)
CREATE POLICY "site_settings_admin_insert" ON site_settings
  FOR INSERT TO authenticated WITH CHECK (true);

-- Create policies for admin write (update)
CREATE POLICY "site_settings_admin_update" ON site_settings
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Create policies for admin write (delete)
CREATE POLICY "site_settings_admin_delete" ON site_settings
  FOR DELETE TO authenticated USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();