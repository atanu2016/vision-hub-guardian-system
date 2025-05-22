
import { Recording } from './storageTypes';
import { parseStorageValue } from '@/utils/storageUtils';

/**
 * Calculate remaining recording time based on available storage
 */
export const calculateRecordingTimeLeft = (storageUsed: string, storageTotal: string): string => {
  try {
    // Calculate remaining days based on used space and total space
    const used = parseStorageValue(storageUsed);
    const total = parseStorageValue(storageTotal);
    const free = total - used;
    
    // Roughly estimate how many days of recording are left
    // Assuming an average of 10GB per day for recordings
    const avgDailyUsage = 10; // GB per day
    const daysLeft = Math.max(0, Math.floor(free / avgDailyUsage));
    
    if (daysLeft > 365) {
      return "Over 1 Year";
    } else if (daysLeft > 30) {
      return `${Math.floor(daysLeft / 30)} Months`;
    } else {
      return `${daysLeft} Days`;
    }
  } catch (error) {
    console.error("Error calculating recording time left:", error);
    return "Unknown";
  }
};

/**
 * Update storage usage based on recordings collection
 */
export const calculateStorageFromRecordings = (recordings: Recording[], deletedId?: string): number => {
  const relevantRecordings = deletedId 
    ? recordings.filter((r) => r.id !== deletedId)
    : recordings;
    
  const totalSizeInMB = relevantRecordings.reduce((total, recording) => {
    const sizeInMB = parseFloat(recording.fileSize.replace(' MB', ''));
    return total + sizeInMB;
  }, 0);
  
  return Math.max(0, totalSizeInMB / 1000); // Convert to GB
};
