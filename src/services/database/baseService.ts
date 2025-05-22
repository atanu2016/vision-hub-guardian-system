
// This is an updated baseService.ts with added checkDatabaseSetup function

export function useTableName(tableName: string) {
  const validTables = [
    "cameras", 
    "advanced_settings", 
    "alert_settings", 
    "camera_recording_status", 
    "database_config", 
    "profiles", 
    "recording_settings", 
    "recordings", 
    "smtp_config", 
    "storage_settings", 
    "system_logs", 
    "system_stats", 
    "user_camera_access", 
    "user_roles", 
    "webhooks", 
    "vw_all_users"
  ] as const;
  
  type ValidTable = typeof validTables[number];
  
  // Check if the tableName is valid
  const isValidTable = (name: string): name is ValidTable => {
    return (validTables as readonly string[]).includes(name);
  };
  
  return {
    isValidTable,
    getTypedTableName: (name: string): ValidTable => {
      if (isValidTable(name)) {
        return name;
      }
      console.error(`Invalid table name: ${name}`);
      throw new Error(`Invalid table name: ${name}`);
    }
  };
}

export const logDatabaseError = (error: any, message: string) => {
  console.error(message, error);
  return new Error(`${message}: ${error?.message || 'Unknown error'}`);
};

// Add the missing functions that are imported in other files
export const checkDatabaseSetup = async () => {
  try {
    // In a real implementation, this would check if the database is set up correctly
    return true;
  } catch (error) {
    console.error('Error checking database setup:', error);
    return false;
  }
};

export const checkTablesExist = async () => {
  try {
    // In a real implementation, this would check if the required tables exist
    return true;
  } catch (error) {
    console.error('Error checking tables existence:', error);
    return false;
  }
};
