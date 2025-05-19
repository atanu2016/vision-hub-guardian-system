
import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { Recording } from "./recordings/types";
import { filterRecordings } from "./recordings/utils";
import { useRecordingsData } from "./recordings/useRecordingsData";

// Re-export formatDuration for use by components
export { formatDuration } from "./recordings/utils";

// Re-export types
export type { Camera, StorageInfo } from "./recordings/types";

export const useRecordings = () => {
  const [selectedCamera, setSelectedCamera] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const { role, user } = useAuth();

  const {
    recordings,
    loading,
    cameras,
    storageUsed,
    deleteRecording
  } = useRecordingsData(user?.id, role);

  // Filter recordings by date
  const filterRecordingsByDate = useCallback((date: Date | null) => {
    if (!date) return recordings;
    
    const dateStr = date.toISOString().split('T')[0];
    return recordings.filter((recording) => recording.date === dateStr);
  }, [recordings]);

  // Apply all filters to get the filtered recordings
  const filteredRecordings = filterRecordings(
    recordings, 
    selectedCamera, 
    selectedType,
    dateFilter
  );

  return {
    recordings,
    filteredRecordings,
    selectedCamera,
    setSelectedCamera,
    selectedType,
    setSelectedType,
    loading,
    cameras,
    storageUsed,
    deleteRecording,
    filterRecordingsByDate,
    dateFilter,
    setDateFilter
  };
};
