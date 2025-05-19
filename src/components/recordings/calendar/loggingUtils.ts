
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

/**
 * Utility functions for logging recording-related activities
 */

/**
 * Logs access to recordings for a specific date
 * @param selectedDate The date being accessed
 * @param cameraId Optional camera ID filter
 */
export const logRecordingAccess = async (selectedDate: Date, cameraId?: string): Promise<void> => {
  try {
    await supabase.from('system_logs').insert({
      level: 'info',
      source: 'recordings',
      message: `Accessed recordings for date: ${format(selectedDate, 'yyyy-MM-dd')}`,
      details: `Accessed recordings ${cameraId ? `for camera ${cameraId} ` : ''}on date ${format(selectedDate, 'yyyy-MM-dd')}`
    });
  } catch (error) {
    console.error('Failed to log access:', error);
  }
};
