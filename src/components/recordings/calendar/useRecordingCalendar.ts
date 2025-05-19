
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { RecordingDayData } from "./types";
import { logRecordingAccess } from "./loggingUtils";

export const useRecordingCalendar = (cameraId?: string) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [recordingDates, setRecordingDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDateRecordings, setSelectedDateRecordings] = useState<RecordingDayData[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string | null>(null);
  
  // Fetch recording dates on initial load
  useEffect(() => {
    fetchRecordingDates();
  }, []);
  
  const fetchRecordingDates = async () => {
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
        throw error;
      }
      
      if (data) {
        const dates = data.map(item => new Date(item.date_time));
        setRecordingDates(dates);
      }
    } catch (error) {
      console.error('Error loading recording dates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = async (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (!selectedDate) return;
    
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
        throw error;
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
      
      // Log this action using our separated logging utility
      await logRecordingAccess(selectedDate, cameraId);
    } catch (error) {
      console.error('Error loading recordings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a simple string representation of dates for efficient lookup
  const recordingDatesMap = useMemo(() => {
    const dateMap = new Map<string, boolean>();
    
    recordingDates.forEach(date => {
      if (date) {
        const dateKey = formatDateKey(date);
        dateMap.set(dateKey, true);
      }
    });
    
    return dateMap;
  }, [recordingDates]);
  
  // Helper function to generate consistent date keys
  const formatDateKey = (date: Date): string => {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  };
  
  // New implementation of isRecordingDate using the Map
  const isRecordingDate = useCallback((dateToCheck: Date): boolean => {
    if (!dateToCheck) return false;
    
    const dateKey = formatDateKey(dateToCheck);
    return recordingDatesMap.has(dateKey);
  }, [recordingDatesMap]);

  return {
    date,
    isLoading,
    recordingDates,
    selectedDateRecordings,
    selectedTimeframe,
    setSelectedTimeframe,
    handleDateSelect,
    isRecordingDate
  };
};
