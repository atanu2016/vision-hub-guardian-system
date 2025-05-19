
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { RecordingDayData } from "./types";
import { logRecordingAccess } from "./loggingUtils";

export const useRecordingCalendar = (cameraId?: string) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [recordingDatesMap, setRecordingDatesMap] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDateRecordings, setSelectedDateRecordings] = useState<RecordingDayData[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string | null>(null);
  
  // Format date for use as map key - separate pure function to avoid type issues
  const formatDateKey = useCallback((date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  }, []);

  // Fetch recording dates from the database
  const fetchRecordingDates = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('recordings')
        .select('date_time');
        
      if (cameraId) {
        query = query.eq('camera_id', cameraId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error loading recording dates:', error);
        return;
      }
      
      // Create a simple map of date strings to boolean values
      const datesMap: Record<string, boolean> = {};
      
      if (data && data.length > 0) {
        data.forEach(item => {
          const recordingDate = new Date(item.date_time);
          if (!isNaN(recordingDate.getTime())) {
            const key = format(recordingDate, 'yyyy-MM-dd');
            datesMap[key] = true;
          }
        });
      }
      
      setRecordingDatesMap(datesMap);
    } catch (error) {
      console.error('Error loading recording dates:', error);
    } finally {
      setIsLoading(false);
    }
  }, [cameraId]);

  // Load recording dates on initial mount
  useEffect(() => {
    fetchRecordingDates();
  }, [fetchRecordingDates]);
  
  // Handle date selection
  const handleDateSelect = useCallback(async (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    
    if (!selectedDate) {
      setSelectedDateRecordings([]);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Format date for database comparison
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Query recordings for this date
      let query = supabase
        .from('recordings')
        .select('*')
        .like('date', `${formattedDate}%`);
        
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
          duration: `${rec.duration} minutes`,
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

  // Simple function to check if a date has recordings
  const isRecordingDate = useCallback((date: Date): boolean => {
    if (!date || isNaN(date.getTime())) {
      return false;
    }
    
    const key = format(date, 'yyyy-MM-dd');
    return !!recordingDatesMap[key];
  }, [recordingDatesMap]);

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
