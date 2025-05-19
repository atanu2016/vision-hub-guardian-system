
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { RecordingDayData } from "./types";
import { logRecordingAccess } from "./loggingUtils";

// Separate utility function outside of component to avoid type recursion
const formatDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const useRecordingCalendar = (cameraId?: string) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [recordingDates, setRecordingDates] = useState<Date[]>([]);
  const [recordingDatesMap, setRecordingDatesMap] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDateRecordings, setSelectedDateRecordings] = useState<RecordingDayData[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string | null>(null);
  
  // Fetch recording dates on initial load
  useEffect(() => {
    fetchRecordingDates();
  }, []);
  
  // Create a separate effect to update the recording dates map
  useEffect(() => {
    const newMap: Record<string, boolean> = {};
    
    // Use for loop instead of forEach or map to minimize type inference issues
    for (let i = 0; i < recordingDates.length; i++) {
      const recordingDate = recordingDates[i];
      if (recordingDate instanceof Date && !isNaN(recordingDate.getTime())) {
        const key = formatDateKey(recordingDate);
        newMap[key] = true;
      }
    }
    
    setRecordingDatesMap(newMap);
  }, [recordingDates]);
  
  // Plain function to fetch recording dates
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
        console.error('Error loading recording dates:', error);
        return;
      }
      
      if (data && data.length > 0) {
        const dates = data.map(item => new Date(item.date_time));
        setRecordingDates(dates);
      } else {
        setRecordingDates([]);
      }
    } catch (error) {
      console.error('Error loading recording dates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Plain function to handle date selection with minimal type dependencies
  const handleDateSelect = async (selectedDate: Date | undefined) => {
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
        // Transform database records to UI format with explicit type
        const recordingsData: RecordingDayData[] = data.map(rec => ({
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
  };

  // Plain function to check if a date has recordings
  const isRecordingDate = (date: Date): boolean => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return false;
    }
    
    const key = formatDateKey(date);
    return !!recordingDatesMap[key];
  };

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
