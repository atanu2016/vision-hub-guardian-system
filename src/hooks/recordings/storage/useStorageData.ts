
import { useState } from "react";
import { StorageInfo, Recording } from "../types";

/**
 * Hook to manage storage usage statistics for recordings
 */
export const useStorageData = (initialRecordings: Recording[]) => {
  const [storageUsed, setStorageUsed] = useState<StorageInfo>({ used: 134.5, total: 500 });

  /**
   * Updates storage usage when recordings are added or removed
   */
  const updateStorageUsed = (recordings: Recording[], deletedId?: string) => {
    // Calculate storage based on file sizes of recordings
    const relevantRecordings = deletedId 
      ? recordings.filter((r) => r.id !== deletedId)
      : recordings;
      
    const totalSizeInMB = relevantRecordings.reduce((total, recording) => {
      const sizeInMB = parseFloat(recording.fileSize.replace(' MB', ''));
      return total + sizeInMB;
    }, 0);
    
    setStorageUsed(prev => ({
      ...prev,
      used: Math.max(0, totalSizeInMB / 1000) // Convert to GB
    }));
  };

  /**
   * Updates storage after deleting a recording
   */
  const updateStorageAfterDelete = (recordings: Recording[], deletedRecordingId: string) => {
    const deletedRecording = recordings.find((r) => r.id === deletedRecordingId);
    if (deletedRecording) {
      const sizeInMB = parseFloat(deletedRecording.fileSize.replace(' MB', ''));
      const sizeInGB = sizeInMB / 1000;
      setStorageUsed(prev => ({
        ...prev,
        used: Math.max(0, prev.used - sizeInGB)
      }));
    }
  };

  return {
    storageUsed,
    updateStorageUsed,
    updateStorageAfterDelete
  };
};
