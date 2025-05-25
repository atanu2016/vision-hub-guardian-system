
import { supabase } from "@/integrations/supabase/client";

export interface ApplicationLog {
  id?: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  source: string;
  details?: string;
  context?: Record<string, any>;
  created_at?: string;
}

class ApplicationLogsService {
  private static instance: ApplicationLogsService;

  static getInstance(): ApplicationLogsService {
    if (!ApplicationLogsService.instance) {
      ApplicationLogsService.instance = new ApplicationLogsService();
    }
    return ApplicationLogsService.instance;
  }

  private validateLevel(level: string): 'debug' | 'info' | 'warning' | 'error' {
    const validLevels = ['debug', 'info', 'warning', 'error'] as const;
    return validLevels.includes(level as any) ? level as 'debug' | 'info' | 'warning' | 'error' : 'info';
  }

  async addLog(log: Omit<ApplicationLog, 'id' | 'created_at'>) {
    try {
      const { error } = await supabase
        .from('application_logs')
        .insert([log]);
      
      if (error) {
        console.error('Failed to save application log:', error);
      }
    } catch (error) {
      console.error('Error saving application log:', error);
    }
  }

  async getLogs(filters?: {
    level?: string;
    source?: string;
    limit?: number;
  }): Promise<ApplicationLog[]> {
    try {
      let query = supabase
        .from('application_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filters?.level && filters.level !== 'all') {
        query = query.eq('level', filters.level);
      }

      if (filters?.source && filters.source !== 'all') {
        query = query.eq('source', filters.source);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to fetch application logs:', error);
        return [];
      }

      // Transform the data to ensure proper typing
      return (data || []).map(log => ({
        id: log.id,
        timestamp: log.timestamp,
        level: this.validateLevel(log.level),
        message: log.message,
        source: log.source,
        details: log.details,
        context: log.context,
        created_at: log.created_at
      }));
    } catch (error) {
      console.error('Error fetching application logs:', error);
      return [];
    }
  }

  async clearAllLogs(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('application_logs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) {
        console.error('Failed to clear application logs:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error clearing application logs:', error);
      return false;
    }
  }

  // Convenience methods for different log levels
  debug(message: string, source: string, details?: string, context?: Record<string, any>) {
    return this.addLog({ level: 'debug', message, source, details, context, timestamp: new Date().toISOString() });
  }

  info(message: string, source: string, details?: string, context?: Record<string, any>) {
    return this.addLog({ level: 'info', message, source, details, context, timestamp: new Date().toISOString() });
  }

  warning(message: string, source: string, details?: string, context?: Record<string, any>) {
    return this.addLog({ level: 'warning', message, source, details, context, timestamp: new Date().toISOString() });
  }

  error(message: string, source: string, details?: string, context?: Record<string, any>) {
    return this.addLog({ level: 'error', message, source, details, context, timestamp: new Date().toISOString() });
  }
}

export const applicationLogger = ApplicationLogsService.getInstance();
