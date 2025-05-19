import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Recording } from "./storage/storageTypes";
import { Camera } from "@/types/camera";
import { useRecordingsStorage } from "@/hooks/storage";

export interface StorageInfo {
  used: number;
  total: number;
}

export interface RecordingsHookResult {
  recordings: Recording[];
  filteredRecordings: Recording[];
  selectedCamera: string;
  setSelectedCamera: (camera: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  loading: boolean;
  cameras: Camera[];
  storageUsed: StorageInfo;
  deleteRecording: (recordingId: string) => Promise<void>;
  filterRecordingsByDate: (date: Date | null) => void;
  dateFilter: Date | null;
  setDateFilter: (date: Date | null) => void;
  fetchActualStorageUsage: () => Promise<void>;
}

export const useRecordings = (): RecordingsHookResult => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [filteredRecordings, setFilteredRecordings] = useState<Recording[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [dateFilter, setDateFilter] = useState<Date | null>(null);

  useEffect(() => {
    fetchCameras();
    fetchRecordings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [recordings, selectedCamera, selectedType, dateFilter]);

  const fetchCameras = async () => {
    try {
      const { data, error } = await supabase
        .from('cameras')
        .select('*');

      if (error) {
        console.error("Error fetching cameras:", error);
      }

      if (data) {
        setCameras(data);
      }
    } catch (error) {
      console.error("Failed to fetch cameras:", error);
    }
  };

  const fetchRecordings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('recordings')
        .select('*');

      if (error) {
        console.error("Error fetching recordings:", error);
      }

      if (data) {
        setRecordings(data);
      }
    } catch (error) {
      console.error("Failed to fetch recordings:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...recordings];

    if (selectedCamera !== "all") {
      filtered = filtered.filter(
        (recording) => recording.cameraName === selectedCamera
      );
    }

    if (selectedType !== "all") {
      filtered = filtered.filter(
        (recording) => recording.type === selectedType
      );
    }
    
    if (dateFilter) {
      filtered = filtered.filter(recording => {
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

  const deleteRecording = async (recordingId: string) => {
    try {
      const { error } = await supabase
        .from('recordings')
        .delete()
        .eq('id', recordingId);

      if (error) {
        console.error("Error deleting recording:", error);
      } else {
        // Optimistically update the recordings state
        setRecordings(prevRecordings => prevRecordings.filter(recording => recording.id !== recordingId));
        setFilteredRecordings(prevRecordings => prevRecordings.filter(recording => recording.id !== recordingId));
      }
    } catch (error) {
      console.error("Failed to delete recording:", error);
    }
  };

  const {
    storageUsed,
    updateStorageUsed,
    updateStorageAfterDelete,
    fetchActualStorageUsage
  } = useRecordingsStorage(recordings);

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
    setDateFilter,
    fetchActualStorageUsage
  };
};
