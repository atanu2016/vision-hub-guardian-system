
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StorageInfo } from "./storageTypes";
import { Recording } from "@/hooks/recordings/types";
import { parseStorageValue } from "@/utils/storageUtils";
import { calculateStorageFromRecordings } from "./useStorageCalculations";

/**
 * Hook to manage storage usage statistics for recordings
 */
export const useRecordingsStorage = (initialRecordings: Recording[]) => {
  const [storageUsed, setStorageUsed] = useState<StorageInfo>({ 
    used: 0, 
    total: 1000,
    percentage: 0 
  });

  // Load actual storage data on mount
  useEffect(() => {
    fetchActualStorageUsage();
  }, []);

  /**
   * Fetch actual storage usage from the database
   */
  const fetchActualStorageUsage = async () => {
    try {
      // Get system stats which contains storage info
      const { data: systemStats, error } = await supabase
        .from('system_stats')
        .select('storage_used, storage_total, storage_percentage')
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching storage usage:", error);
        return;
      }

      if (systemStats) {
        // Parse storage values
        const usedValue = parseStorageValue(systemStats.storage_used || "0 GB");
        const totalValue = parseStorageValue(systemStats.storage_total || "1 TB");
        const percentage = systemStats.storage_percentage || 
          (totalValue > 0 ? Math.round((usedValue / totalValue) * 100) : 0);
        
        setStorageUsed({
          used: usedValue,
          total: totalValue,
          percentage: percentage
        });
      }
    } catch (error) {
      console.error("Failed to fetch storage usage:", error);
    }
  };

  /**
   * Updates storage usage when recordings are added or removed
   */
  const updateStorageUsed = async (recordings: Recording[], deletedId?: string) => {
    // First fetch the latest storage data
    await fetchActualStorageUsage();
    
    // Then calculate the adjustment based on recordings change
    const usedGB = calculateStorageFromRecordings(recordings, deletedId);
      
    // Update with the new calculation
    setStorageUsed(prev => ({
      ...prev,
      used: usedGB
    }));
  };

  /**
   * Updates storage after deleting a recording
   */
  const updateStorageAfterDelete = async (recordings: Recording[], deletedRecordingId: string) => {
    const deletedRecording = recordings.find((r) => r.id === deletedRecordingId);
    if (deletedRecording) {
      const sizeInMB = parseFloat(deletedRecording.fileSize.replace(' MB', ''));
      const sizeInGB = sizeInMB / 1000;
      
      // First get the latest usage data
      await fetchActualStorageUsage();
      
      // Then update with the adjustment
      setStorageUsed(prev => ({
        ...prev,
        used: Math.max(0, prev.used - sizeInGB),
        percentage: Math.max(0, prev.total > 0 ? Math.round(((prev.used - sizeInGB) / prev.total) * 100) : 0)
      }));
    }
  };

  return {
    storageUsed,
    updateStorageUsed,
    updateStorageAfterDelete,
    fetchActualStorageUsage
  };
};
