
-- Create cameras table
CREATE TABLE IF NOT EXISTS public.cameras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'offline',
  location TEXT NOT NULL,
  ipAddress TEXT NOT NULL,
  port INTEGER DEFAULT 80,
  username TEXT,
  password TEXT,
  model TEXT,
  manufacturer TEXT,
  lastSeen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  recording BOOLEAN DEFAULT false,
  thumbnail TEXT,
  group_name TEXT,
  connectionType TEXT DEFAULT 'ip',
  rtmpUrl TEXT,
  onvifPath TEXT,
  motionDetection BOOLEAN DEFAULT false
);

-- Create storage_settings table
CREATE TABLE IF NOT EXISTS public.storage_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'local',
  path TEXT,
  retentionDays INTEGER NOT NULL DEFAULT 30,
  overwriteOldest BOOLEAN NOT NULL DEFAULT true,
  nasAddress TEXT,
  nasPath TEXT,
  nasUsername TEXT,
  nasPassword TEXT,
  s3Endpoint TEXT,
  s3Bucket TEXT,
  s3AccessKey TEXT,
  s3SecretKey TEXT,
  s3Region TEXT
);

-- Create system_stats table
CREATE TABLE IF NOT EXISTS public.system_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_cameras INTEGER DEFAULT 0,
  online_cameras INTEGER DEFAULT 0,
  offline_cameras INTEGER DEFAULT 0,
  recording_cameras INTEGER DEFAULT 0,
  uptime_hours INTEGER DEFAULT 0,
  storage_used TEXT DEFAULT '0 GB',
  storage_total TEXT DEFAULT '1 TB',
  storage_percentage NUMERIC DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable row level security
ALTER TABLE public.cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_stats ENABLE ROW LEVEL SECURITY;

-- Create policies that allow anyone to read the tables
CREATE POLICY "Allow public read access to cameras" ON public.cameras
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to storage_settings" ON public.storage_settings
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to system_stats" ON public.system_stats
    FOR SELECT USING (true);

-- Create policies that allow authenticated users to insert, update, and delete
CREATE POLICY "Allow authenticated users to insert cameras" ON public.cameras
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update cameras" ON public.cameras
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete cameras" ON public.cameras
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert storage_settings" ON public.storage_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update storage_settings" ON public.storage_settings
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert system_stats" ON public.system_stats
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update system_stats" ON public.system_stats
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create a realtime publication for the tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.cameras, public.storage_settings, public.system_stats;
