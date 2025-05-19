
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { RecordingDayData } from "./types";
import { logRecordingAccess } from "./loggingUtils";

// Simple date key formatter to avoid type issues
const formatDateKey = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const useRecordingCalendar = (cameraId?: string) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [recordingDates, setRecordingDates] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDateRecordings, setSelectedDateRecordings] = useState<RecordingDayData[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string | null>(null);
  
  // Simplified fetch recordings function to avoid excessive type nesting
  const fetchRecordingDates = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('recordings')
        .select('date, date_time');
        
      if (cameraId) {
        query = query.eq('camera_id', cameraId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error loading recording dates:', error);
        return;
      }
      
      // Create a set of date strings
      const datesSet = new Set<string>();
      
      if (data && data.length > 0) {
        data.forEach(item => {
          if (item.date) {
            datesSet.add(item.date);
          } else if (item.date_time) {
            const recordingDate = new Date(item.date_time);
            if (!isNaN(recordingDate.getTime())) {
              const key = formatDateKey(recordingDate);
              datesSet.add(key);
            }
          }
        });
      }
      
      setRecordingDates(datesSet);
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
  
  // Handle date selection - simplified to avoid type recursion
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

  // Simple predicate function to check if a date has recordings
  const isRecordingDate = useCallback((date: Date): boolean => {
    if (!date || isNaN(date.getTime())) {
      return false;
    }
    
    const key = formatDateKey(date);
    return recordingDates.has(key);
  }, [recordingDates]);

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
