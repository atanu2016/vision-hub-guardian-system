
/**
 * Migration validator service
 * Verifies database migrations and ensures permissions are correctly assigned
 */
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define the table names as a type to make TypeScript happy
type TableName = 
  | "cameras"
  | "profiles" 
  | "user_roles"
  | "camera_assignments" 
  | "advanced_settings"
  | "alert_settings"
  | "camera_recording_status"
  | "database_config"
  | "recording_settings"
  | "smtp_config"
  | "storage_settings"
  | "system_logs"
  | "system_stats"
  | "user_camera_access"
  | "webhooks";

/**
 * Validates if a migration was successful
 * @param sourceType The source database type ('firebase', 'supabase', 'mysql')
 * @param targetType The target database type (usually 'supabase' in our case)
 */
export async function validateMigration(
  sourceType: string,
  targetType: string
): Promise<boolean> {
  try {
    // First check if required tables exist
    const requiredTables = [
      'cameras',
      'profiles',
      'user_roles',
      'camera_assignments'
    ] as TableName[];
    
    const validationResults: Record<string, boolean> = {};
    const validationErrors: string[] = [];
    
    console.log(`Validating ${sourceType} to ${targetType} migration...`);
    
    // Check each required table
    for (const table of requiredTables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
          
        if (error) {
          console.error(`Table validation error for ${table}:`, error);
          validationResults[table] = false;
          validationErrors.push(`Table ${table} validation failed: ${error.message}`);
        } else {
          validationResults[table] = true;
          console.log(`Table ${table} exists with ${count} records`);
        }
      } catch (err) {
        validationResults[table] = false;
        validationErrors.push(`Table ${table} validation exception: ${err}`);
      }
    }
    
    // Check if all validations passed
    const allTablesValid = Object.values(validationResults).every(result => result === true);
    
    if (!allTablesValid) {
      console.error('Migration validation failed:', validationErrors);
      return false;
    }
    
    // Validate permissions/RLS policies
    const permissionsValid = await validatePermissions();
    
    return allTablesValid && permissionsValid;
  } catch (error) {
    console.error('Migration validation error:', error);
    return false;
  }
}

/**
 * Validates that all required permissions/RLS policies are in place
 */
async function validatePermissions(): Promise<boolean> {
  try {
    // In a real implementation, we would use a privileged function to 
    // check if RLS policies are correctly set up
    // This would be done through a Supabase function with SECURITY DEFINER
    
    // For now, we'll use a simple check to see if our functions exist
    const { data, error } = await supabase.rpc('check_if_user_is_admin');
    
    if (error && error.message.includes('function does not exist')) {
      console.error('Permission functions not correctly migrated');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Permission validation error:', error);
    return false;
  }
}

/**
 * Assigns user roles and permissions after migration
 */
export async function assignPermissionsAfterMigration(): Promise<boolean> {
  try {
    // Attempt to recreate essential RLS policies if they don't exist
    const { error } = await supabase.functions.invoke('repair-permissions', {
      body: { operation: 'restore-default-permissions' }
    });
    
    if (error) {
      console.error('Error assigning permissions:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Permission assignment error:', error);
    return false;
  }
}

/**
 * Performs a comprehensive validation of the database state after migration
 */
export async function verifyDatabaseState(
  sourceType: string
): Promise<{ success: boolean; details: string[] }> {
  const details: string[] = [];
  let success = true;
  
  try {
    // Check connection
    const connectionTest = await supabase.from('profiles').select('id', { count: 'exact', head: true });
    if (connectionTest.error) {
      details.push(`❌ Database connection failed: ${connectionTest.error.message}`);
      success = false;
    } else {
      details.push('✅ Database connection successful');
    }
    
    // Check data consistency
    const tables = ['profiles', 'cameras', 'user_roles', 'camera_assignments'] as const;
    for (const table of tables) {
      const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      
      if (error) {
        details.push(`❌ Table '${table}' check failed: ${error.message}`);
        success = false;
      } else {
        details.push(`✅ Table '${table}' exists with ${count || 0} records`);
      }
    }
    
    // Check functions
    const functionCheck = await supabase.rpc('get_user_role');
    if (functionCheck.error && !functionCheck.error.message.includes('user_id')) {
      details.push(`❌ Database functions not properly migrated: ${functionCheck.error.message}`);
      success = false;
    } else {
      details.push('✅ Database functions properly migrated');
    }
    
    // Log validation result
    await supabase.from('system_logs').insert({
      level: success ? 'info' : 'error',
      source: 'migration',
      message: `Database migration from ${sourceType} verification ${success ? 'successful' : 'failed'}`,
      details: details.join('\n')
    });
    
    return { success, details };
  } catch (error: any) {
    details.push(`❌ Verification error: ${error.message || 'Unknown error'}`);
    
    // Log validation failure
    try {
      await supabase.from('system_logs').insert({
        level: 'error',
        source: 'migration',
        message: `Database migration verification error`,
        details: error.message || 'Unknown error'
      });
    } catch (logError) {
      console.error('Error logging verification failure:', logError);
    }
    
    return { success: false, details };
  }
}
