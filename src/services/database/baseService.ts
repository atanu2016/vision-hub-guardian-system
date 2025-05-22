
// Base service functionality for database operations

import { supabase } from '@/integrations/supabase/client';

/**
 * Verifies database setup and connection
 * @returns Promise resolving to a boolean indicating if the database is properly set up
 */
export const checkDatabaseSetup = async (): Promise<boolean> => {
  try {
    // Check if we can connect to the database by querying a simple table
    const { data, error } = await supabase
      .from('database_config')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Database setup check failed:', error);
      return false;
    }
    
    // Successful query indicates database is accessible
    return true;
  } catch (err) {
    console.error('Error checking database setup:', err);
    return false;
  }
};

/**
 * Checks if required tables exist in the database
 * @returns Promise resolving to an object with table existence status
 */
export const checkTablesExist = async (): Promise<Record<string, boolean>> => {
  const tables = [
    'cameras',
    'storage_settings',
    'recording_settings',
    'alert_settings',
    'webhooks',
    'advanced_settings',
    'system_logs',
    'system_stats'
  ];
  
  const result: Record<string, boolean> = {};
  
  try {
    // Check each table existence
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
          
        result[table] = !error;
      } catch {
        result[table] = false;
      }
    }
    
    return result;
  } catch (err) {
    console.error('Error checking tables existence:', err);
    return tables.reduce((acc, table) => {
      acc[table] = false;
      return acc;
    }, {} as Record<string, boolean>);
  }
};
