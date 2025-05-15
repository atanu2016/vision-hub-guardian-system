
-- Create the database tables for vision hub

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users PRIMARY KEY,
    full_name TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create system_logs table
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    level TEXT NOT NULL,
    message TEXT NOT NULL,
    source TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create system_stats table
CREATE TABLE IF NOT EXISTS public.system_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_cameras INTEGER DEFAULT 0,
    online_cameras INTEGER DEFAULT 0,
    offline_cameras INTEGER DEFAULT 0,
    recording_cameras INTEGER DEFAULT 0,
    storage_used TEXT DEFAULT '0 GB',
    storage_total TEXT DEFAULT '1 TB',
    storage_percentage NUMERIC DEFAULT 0,
    uptime_hours INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create cameras table
CREATE TABLE IF NOT EXISTS public.cameras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    ipaddress TEXT NOT NULL,
    port INTEGER DEFAULT 80,
    username TEXT,
    password TEXT,
    rtmpurl TEXT,
    connectiontype TEXT DEFAULT 'ip',
    onvifpath TEXT,
    manufacturer TEXT,
    model TEXT,
    status TEXT NOT NULL DEFAULT 'offline',
    lastseen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    motiondetection BOOLEAN DEFAULT FALSE,
    recording BOOLEAN DEFAULT FALSE,
    thumbnail TEXT,
    "group" TEXT
);

-- Create storage_settings table
CREATE TABLE IF NOT EXISTS public.storage_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL DEFAULT 'local',
    path TEXT,
    retentiondays INTEGER NOT NULL DEFAULT 30,
    overwriteoldest BOOLEAN NOT NULL DEFAULT TRUE,
    nasaddress TEXT,
    naspath TEXT,
    nasusername TEXT,
    naspassword TEXT,
    s3endpoint TEXT,
    s3accesskey TEXT,
    s3secretkey TEXT,
    s3bucket TEXT,
    s3region TEXT
);

-- Create camera_recording_status table
CREATE TABLE IF NOT EXISTS public.camera_recording_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camera_id UUID NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create recording_settings table
CREATE TABLE IF NOT EXISTS public.recording_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    continuous BOOLEAN NOT NULL DEFAULT TRUE,
    motion_detection BOOLEAN NOT NULL DEFAULT TRUE,
    schedule_type TEXT NOT NULL DEFAULT 'always',
    time_start TEXT DEFAULT '00:00',
    time_end TEXT DEFAULT '23:59',
    days_of_week TEXT[] DEFAULT ARRAY['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    quality TEXT DEFAULT 'medium',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create webhooks table
CREATE TABLE IF NOT EXISTS public.webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    events TEXT[] NOT NULL DEFAULT '{}',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create alert_settings table
CREATE TABLE IF NOT EXISTS public.alert_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    motion_detection BOOLEAN NOT NULL DEFAULT TRUE,
    camera_offline BOOLEAN NOT NULL DEFAULT TRUE,
    storage_warning BOOLEAN NOT NULL DEFAULT TRUE,
    email_notifications BOOLEAN NOT NULL DEFAULT FALSE,
    push_notifications BOOLEAN NOT NULL DEFAULT FALSE,
    email_address TEXT,
    notification_sound TEXT DEFAULT 'default',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create advanced_settings table
CREATE TABLE IF NOT EXISTS public.advanced_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    server_port TEXT DEFAULT '8080',
    log_level TEXT DEFAULT 'info',
    debug_mode BOOLEAN DEFAULT FALSE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret TEXT,
    log_retention_days INTEGER DEFAULT 30,
    min_log_level TEXT DEFAULT 'info',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create database_config table for storing database configuration
CREATE TABLE IF NOT EXISTS public.database_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    db_type TEXT NOT NULL DEFAULT 'supabase',
    mysql_host TEXT,
    mysql_port TEXT DEFAULT '3306',
    mysql_database TEXT,
    mysql_user TEXT,
    mysql_password TEXT,
    mysql_ssl BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create smtp_config table for storing email server settings
CREATE TABLE IF NOT EXISTS public.smtp_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enabled BOOLEAN DEFAULT FALSE,
    server TEXT,
    port TEXT DEFAULT '587',
    username TEXT,
    password TEXT,
    from_email TEXT,
    use_ssl BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, is_admin)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
  admin_status BOOLEAN;
BEGIN
  SELECT is_admin INTO admin_status FROM public.profiles WHERE id = user_id;
  RETURN admin_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert initial data if not exists
INSERT INTO public.system_stats (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM public.system_stats);

INSERT INTO public.storage_settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM public.storage_settings);

INSERT INTO public.recording_settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM public.recording_settings);

INSERT INTO public.alert_settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM public.alert_settings);

INSERT INTO public.advanced_settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM public.advanced_settings);

INSERT INTO public.database_config (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM public.database_config);

INSERT INTO public.smtp_config (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM public.smtp_config);
