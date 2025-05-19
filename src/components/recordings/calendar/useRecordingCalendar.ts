
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { RecordingDayData } from "./types";
import { logRecordingAccess } from "./loggingUtils";

export const useRecordingCalendar = (cameraId?: string) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDateRecordings, setSelectedDateRecordings] = useState<RecordingDayData[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string | null>(null);
  
  // Format date for database queries
  const formatDateKey = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  };
  
  // Fetch recordings for a specific date
  const handleDateSelect = useCallback(async (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    
    if (!selectedDate) {
      setSelectedDateRecordings([]);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Format date for database comparison
      const formattedDate = formatDateKey(selectedDate);
      
      // Query recordings for this date
      let query = supabase
        .from('recordings')
        .select('*')
        .eq('date', formattedDate);
        
      if (cameraId) {
        query = query.eq('camera_id', cameraId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error loading recordings:', error);
        return;
      }
      
      if (data && data.length > 0) {
        // Transform database records to UI format
        const recordingsData = data.map(rec => ({
          id: rec.id,
          time: rec.time,
          duration: rec.duration ? `${rec.duration} minutes` : '0 minutes',
          motion: rec.type === 'Motion',
          size: rec.file_size
        }));
        
        setSelectedDateRecordings(recordingsData);
      } else {
        setSelectedDateRecordings([]);
      }
      
      // Log this action
      await logRecordingAccess(selectedDate, cameraId);
      
    } catch (error) {
      console.error('Error loading recordings:', error);
      setSelectedDateRecordings([]);
    } finally {
      setIsLoading(false);
    }
  }, [cameraId]);

  // Get initial data when component mounts
  useEffect(() => {
    if (date) {
      handleDateSelect(date);
    }
  }, [handleDateSelect, date]);

  // Simple date checking function
  const isRecordingDate = useCallback((date: Date): boolean => {
    return !isNaN(date.getTime());
  }, []);

  return {
    date,
    isLoading,
    selectedDateRecordings,
    selectedTimeframe,
    setSelectedTimeframe,
    handleDateSelect,
    isRecordingDate
  };
};
