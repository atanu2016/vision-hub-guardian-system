
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// List of valid table names in Supabase
const VALID_TABLES = [
  'cameras',
  'advanced_settings',
  'alert_settings',
  'camera_recording_status',
  'database_config',
  'profiles',
  'recording_settings',
  'recordings',
  'smtp_config',
  'storage_settings',
  'system_logs',
  'system_stats',
  'user_camera_access',
  'user_roles',
  'webhooks',
  'vw_all_users'
] as const;

type ValidTableName = typeof VALID_TABLES[number];

// Helper function to check if a string is a valid table name
function isValidTable(tableName: string): tableName is ValidTableName {
  return (VALID_TABLES as readonly string[]).includes(tableName);
}

export const logDatabaseError = (error: any, message: string) => {
  console.error(`${message}:`, error);
  
  // Extract useful error info for the user
  let userMessage = message;
  if (error?.message) {
    userMessage += ` - ${error.message}`;
  }
  
  // Show toast notification
  toast.error(userMessage);
  
  // Return the error for further handling
  return error;
};

export const logToDatabase = async (level: string, source: string, message: string, details?: string) => {
  try {
    const { error } = await supabase
      .from('system_logs')
      .insert({
        level,
        source,
        message,
        details,
        timestamp: new Date().toISOString()
      });
      
    if (error) throw error;
  } catch (err) {
    console.error('Failed to log to database:', err);
    // Don't throw here to prevent error cascading
  }
};

export const checkTableExists = async (tableName: string): Promise<boolean> => {
  // Validate table name before querying
  if (!isValidTable(tableName)) {
    console.error(`Invalid table name: ${tableName}`);
    return false;
  }

  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
      
    if (error) {
      // Table likely doesn't exist or permissions issue
      return false;
    }
    
    return true;
  } catch (err) {
    console.error(`Error checking if table exists: ${tableName}`, err);
    return false;
  }
};
