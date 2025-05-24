import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StorageUsage } from './storageTypes';
import { parseStorageValue } from '@/utils/storageUtils';

export const useStorageUsage = () => {
  const [storageUsage, setStorageUsage] = useState<StorageUsage>({
    totalSpace: 0,
    usedSpace: 0,
    usedPercentage: 0,
    usedSpaceFormatted: "0 GB",
    totalSpaceFormatted: "0 GB"
  });

  useEffect(() => {
    fetchStorageUsage();
  }, []);

  const fetchStorageUsage = async () => {
    try {
      console.log("Fetching real storage usage from database...");
      
      // First try to get storage settings to determine storage type
      const { data: storageSettings } = await supabase
        .from('storage_settings')
        .select('*')
        .limit(1)
        .single();

      console.log("Storage settings:", storageSettings);

      // Calculate used space from recordings table
      const { data: recordings, error: recordingsError } = await supabase
        .from('recordings')
        .select('file_size');

      if (recordingsError) {
        console.error("Error fetching recordings:", recordingsError);
      }

      let calculatedUsedSpace = 0;
      let calculatedUsedFormatted = "0 GB";
      
      if (recordings && recordings.length > 0) {
        // Sum up file sizes from recordings
        recordings.forEach(recording => {
          if (recording.file_size) {
            calculatedUsedSpace += parseStorageValue(recording.file_size);
          }
        });
        
        // Format the used space
        if (calculatedUsedSpace >= 1024) {
          calculatedUsedFormatted = `${(calculatedUsedSpace / 1024).toFixed(1)} TB`;
        } else if (calculatedUsedSpace >= 1) {
          calculatedUsedFormatted = `${calculatedUsedSpace.toFixed(1)} GB`;
        } else {
          calculatedUsedFormatted = `${(calculatedUsedSpace * 1024).toFixed(0)} MB`;
        }
      }

      // Determine total space based on storage configuration
      let totalSpace = 1000; // Default 1TB in GB
      let totalSpaceFormatted = "1 TB";
      
      if (storageSettings) {
        if (storageSettings.type === 'nas') {
          // For NAS, we'll simulate checking the actual capacity
          // In a real implementation, this would query the NAS device
          totalSpace = 2000; // 2TB for NAS
          totalSpaceFormatted = "2 TB";
        } else if (storageSettings.type === 's3') {
          // S3 typically has unlimited space, but we'll set a reasonable limit
          totalSpace = 5000; // 5TB virtual limit
          totalSpaceFormatted = "5 TB";
        }
      }

      const usedPercentage = totalSpace > 0 ? Math.round((calculatedUsedSpace / totalSpace) * 100) : 0;

      console.log("Calculated storage usage:", {
        usedSpace: calculatedUsedSpace,
        totalSpace,
        usedPercentage,
        usedSpaceFormatted: calculatedUsedFormatted,
        totalSpaceFormatted
      });

      setStorageUsage({
        usedSpace: calculatedUsedSpace,
        totalSpace,
        usedPercentage,
        usedSpaceFormatted: calculatedUsedFormatted,
        totalSpaceFormatted
      });

      // Update system_stats table with real values
      const { error: updateError } = await supabase
        .from('system_stats')
        .upsert({
          storage_used: calculatedUsedFormatted,
          storage_total: totalSpaceFormatted,
          storage_percentage: usedPercentage,
          last_updated: new Date().toISOString()
        });

      if (updateError) {
        console.error("Error updating system stats:", updateError);
      }

    } catch (error) {
      console.error("Failed to fetch storage usage:", error);
      // Keep default values as fallback
      setStorageUsage({
        totalSpace: 1000,
        usedSpace: 0,
        usedPercentage: 0,
        usedSpaceFormatted: "0 GB",
        totalSpaceFormatted: "1 TB"
      });
    }
  };

  return {
    storageUsage,
    fetchStorageUsage
  };
};
