
import { useState, useEffect, useCallback } from "react";
import { supabase, supabaseUrl } from "@/integrations/supabase/client";
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
      
      // Use direct fetch to avoid TypeScript recursion issues with Supabase client
      const url = `${supabaseUrl}/rest/v1/recordings?date=eq.${formattedDate}${cameraId ? `&camera_id=eq.${cameraId}` : ''}`;
      
      const response = await fetch(url, {
        headers: {
          "apikey": process.env.SUPABASE_ANON_KEY || "",
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform database records to UI format with explicit typing
      const recordingsData: RecordingDayData[] = [];
      
      if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
          const rec = data[i];
          recordingsData.push({
            id: String(rec.id || ''),
            time: String(rec.time || ''),
            duration: rec.duration ? `${rec.duration} minutes` : '0 minutes',
            motion: rec.type === 'Motion',
            size: String(rec.file_size || '')
          });
        }
      }
      
      setSelectedDateRecordings(recordingsData);
      
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
