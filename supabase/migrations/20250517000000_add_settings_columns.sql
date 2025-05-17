
-- Add missing columns to advanced_settings
ALTER TABLE public.advanced_settings 
ADD COLUMN IF NOT EXISTS dark_mode BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS audio_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS motion_sensitivity INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS version TEXT DEFAULT '1.0.0',
ADD COLUMN IF NOT EXISTS license_status TEXT DEFAULT 'Active',
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add missing columns to storage_settings
ALTER TABLE public.storage_settings
ADD COLUMN IF NOT EXISTS max_storage_gb INTEGER DEFAULT 500,
ADD COLUMN IF NOT EXISTS backup_schedule TEXT DEFAULT 'never';
