
import { useState, useEffect } from "react";
import { StorageInfo, Recording } from "../types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to manage storage usage statistics for recordings
 */
export const useStorageData = (initialRecordings: Recording[]) => {
  const [storageUsed, setStorageUsed] = useState<StorageInfo>({ used: 0, total: 1000 });

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
        
        setStorageUsed({
          used: usedValue,
          total: totalValue
        });
      }
    } catch (error) {
      console.error("Failed to fetch storage usage:", error);
    }
  };

  /**
   * Parse storage values from formatted strings (e.g. "500 GB" to 500)
   */
  const parseStorageValue = (storageString: string): number => {
    const matches = storageString.match(/(\d+(?:\.\d+)?)\s*([KMGTP]B)/i);
    if (!matches) return 0;
    
    const value = parseFloat(matches[1]);
    const unit = matches[2].toUpperCase();
    
    // Convert all to GB for consistent comparison
    switch (unit) {
      case 'KB': return value / 1024 / 1024;
      case 'MB': return value / 1024;
      case 'GB': return value;
      case 'TB': return value * 1024;
      case 'PB': return value * 1024 * 1024;
      default: return value;
    }
  };

  /**
   * Updates storage usage when recordings are added or removed
   */
  const updateStorageUsed = async (recordings: Recording[], deletedId?: string) => {
    // First fetch the latest storage data
    await fetchActualStorageUsage();
    
    // Then calculate the adjustment based on recordings change
    const relevantRecordings = deletedId 
      ? recordings.filter((r) => r.id !== deletedId)
      : recordings;
      
    const totalSizeInMB = relevantRecordings.reduce((total, recording) => {
      const sizeInMB = parseFloat(recording.fileSize.replace(' MB', ''));
      return total + sizeInMB;
    }, 0);
    
    // Update with the new calculation
    setStorageUsed(prev => ({
      ...prev,
      used: Math.max(0, totalSizeInMB / 1000) // Convert to GB
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
        used: Math.max(0, prev.used - sizeInGB)
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
