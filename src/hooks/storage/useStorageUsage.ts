
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StorageUsage } from './storageTypes';
import { parseStorageValue, formatStorageSize } from '@/utils/storageUtils';

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
      console.log("Fetching real storage usage from SMB/NAS...");
      
      // Get storage settings to determine actual storage configuration
      const { data: storageSettings } = await supabase
        .from('storage_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      console.log("Storage settings:", storageSettings);

      // Calculate real used space from actual recordings
      const { data: recordings, error: recordingsError } = await supabase
        .from('recordings')
        .select('file_size');

      if (recordingsError) {
        console.error("Error fetching recordings:", recordingsError);
        throw recordingsError;
      }

      let calculatedUsedSpace = 0;
      
      if (recordings && recordings.length > 0) {
        recordings.forEach(recording => {
          if (recording.file_size) {
            calculatedUsedSpace += parseStorageValue(recording.file_size);
          }
        });
      }

      console.log("Calculated used space from recordings:", calculatedUsedSpace, "GB");

      // Get real total space based on actual storage type
      let totalSpace = 1000; // Default fallback
      
      if (storageSettings) {
        switch (storageSettings.type) {
          case 'nas':
            // For NAS/SMB, we need to check actual available space
            // This would typically come from a system API call
            try {
              // Try to get real NAS capacity - this would be from your backend API
              const response = await fetch('/api/storage/capacity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'nas',
                  address: storageSettings.nasaddress,
                  path: storageSettings.naspath,
                  username: storageSettings.nasusername,
                  password: storageSettings.naspassword
                })
              });
              
              if (response.ok) {
                const capacityData = await response.json();
                totalSpace = Math.floor(capacityData.total / (1024 * 1024 * 1024)); // Convert to GB
                calculatedUsedSpace = Math.floor(capacityData.used / (1024 * 1024 * 1024)); // Use real used space
              } else {
                console.warn("Could not get real NAS capacity, using fallback");
                totalSpace = 2000; // 2TB fallback for NAS
              }
            } catch (error) {
              console.error("Error getting NAS capacity:", error);
              totalSpace = 2000; // 2TB fallback for NAS
            }
            break;
          case 's3':
            totalSpace = 5000; // 5TB virtual limit for S3
            break;
          case 'local':
          default:
            // For local storage, try to get actual disk space
            try {
              const response = await fetch('/api/storage/local-capacity');
              if (response.ok) {
                const capacityData = await response.json();
                totalSpace = Math.floor(capacityData.total / (1024 * 1024 * 1024));
                calculatedUsedSpace = Math.floor(capacityData.used / (1024 * 1024 * 1024));
              } else {
                totalSpace = 1000; // 1TB fallback
              }
            } catch (error) {
              console.error("Error getting local capacity:", error);
              totalSpace = 1000; // 1TB fallback
            }
            break;
        }
      }

      const usedPercentage = totalSpace > 0 ? Math.round((calculatedUsedSpace / totalSpace) * 100) : 0;
      const usedSpaceFormatted = formatStorageSize(calculatedUsedSpace);
      const totalSpaceFormatted = formatStorageSize(totalSpace);

      console.log("Final storage calculation:", {
        usedSpace: calculatedUsedSpace,
        totalSpace,
        usedPercentage,
        usedSpaceFormatted,
        totalSpaceFormatted
      });

      setStorageUsage({
        usedSpace: calculatedUsedSpace,
        totalSpace,
        usedPercentage,
        usedSpaceFormatted,
        totalSpaceFormatted
      });

      // Update system_stats with real values
      const { error: updateError } = await supabase
        .from('system_stats')
        .upsert({
          storage_used: usedSpaceFormatted,
          storage_total: totalSpaceFormatted,
          storage_percentage: usedPercentage,
          last_updated: new Date().toISOString()
        });

      if (updateError) {
        console.error("Error updating system stats:", updateError);
      }

    } catch (error) {
      console.error("Failed to fetch real storage usage:", error);
      // Only use fallback if everything fails
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
