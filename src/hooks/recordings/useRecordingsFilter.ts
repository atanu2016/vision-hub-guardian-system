
import { useState, useEffect } from "react";
import { Recording } from "./types";

export const useRecordingsFilter = (recordings: Recording[]) => {
  const [filteredRecordings, setFilteredRecordings] = useState<Recording[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<Date | null>(null);

  useEffect(() => {
    applyFilters();
  }, [recordings, selectedCamera, selectedType, dateFilter]);

  const applyFilters = () => {
    let filtered = [...recordings];

    if (selectedCamera !== "all") {
      filtered = filtered.filter(
        (recording) => recording.cameraName === selectedCamera
      );
    }

    if (selectedType !== "all") {
      filtered = filtered.filter(
        (recording) => recording.type.toLowerCase() === selectedType.toLowerCase()
      );
    }
    
    if (dateFilter) {
      filtered = filtered.filter(recording => {
        if (!recording.dateTime) return false;
        const recordingDate = new Date(recording.dateTime).toDateString();
        const filterDate = dateFilter.toDateString();
        return recordingDate === filterDate;
      });
    }

    setFilteredRecordings(filtered);
  };
  
  const filterRecordingsByDate = (date: Date | null) => {
    setDateFilter(date);
  };

  return {
    filteredRecordings,
    selectedCamera,
    setSelectedCamera,
    selectedType, 
    setSelectedType,
    dateFilter,
    setDateFilter,
    filterRecordingsByDate
  };
};
