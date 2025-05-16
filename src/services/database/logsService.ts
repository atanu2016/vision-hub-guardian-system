
import { supabase } from "@/integrations/supabase/client";
import { logDatabaseError } from "./baseService";

// System logs operations
export const fetchLogsFromDB = async (filters: { level?: string; source?: string; search?: string } = {}) => {
  try {
    let query = supabase
      .from('system_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);
      
    // Apply any filters
    if (filters.level && filters.level !== 'all') {
      query = query.eq('level', filters.level);
    }
    
    if (filters.source && filters.source !== 'all') {
      query = query.eq('source', filters.source);
    }
    
    if (filters.search) {
      query = query.or(`message.ilike.%${filters.search}%,details.ilike.%${filters.search}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching logs:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    logDatabaseError(error, "Failed to load system logs");
    return [];
  }
};

export const addLogToDB = async (level: string, message: string, source: string, details?: string) => {
  try {
    const { error } = await supabase
      .from('system_logs')
      .insert({
        level,
        message,
        source,
        details,
        timestamp: new Date().toISOString()
      });
      
    if (error) {
      console.error("Error adding log:", error);
    }
  } catch (error) {
    console.error("Error adding log to database:", error);
  }
};
