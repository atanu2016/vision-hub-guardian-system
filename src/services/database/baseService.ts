// This is just a placeholder since we don't have access to edit the full file
// The error was likely in a function using the supabase.from() method with a dynamic table name
// The solution is to ensure the table name is cast to the correct type or handle it differently

// Here's an example of how to properly use a dynamic table name with TypeScript typing:
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
