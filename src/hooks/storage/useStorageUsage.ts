
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
      console.log("Fetching real storage usage from storage backend...");
      
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

      // Get real total space and used space based on actual storage type
      let totalSpace = 1000; // Default fallback
      let actualUsedSpace = calculatedUsedSpace;
      
      if (storageSettings) {
        switch (storageSettings.type) {
          case 'nas':
            // For NAS/SMB, get real capacity from system API
            try {
              const response = await fetch('/api/storage/nas-capacity', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                body: JSON.stringify({
                  address: storageSettings.nasaddress,
                  path: storageSettings.naspath,
                  username: storageSettings.nasusername,
                  password: storageSettings.naspassword
                })
              });
              
              if (response.ok) {
                const capacityData = await response.json();
                console.log("Real NAS capacity data:", capacityData);
                totalSpace = Math.floor(capacityData.total / (1024 * 1024 * 1024)); // Convert to GB
                actualUsedSpace = Math.floor(capacityData.used / (1024 * 1024 * 1024)); // Use real used space
                console.log(`NAS Real capacity: ${totalSpace}GB, Used: ${actualUsedSpace}GB`);
              } else {
                console.warn("Could not get real NAS capacity, using calculated values");
                // Use df command as fallback for mounted SMB shares
                try {
                  const dfResponse = await fetch('/api/system/disk-usage', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: storageSettings.naspath || '/mnt/nas' })
                  });
                  
                  if (dfResponse.ok) {
                    const dfData = await dfResponse.json();
                    totalSpace = Math.floor(dfData.total / (1024 * 1024 * 1024));
                    actualUsedSpace = Math.floor(dfData.used / (1024 * 1024 * 1024));
                    console.log(`DF command results: ${totalSpace}GB total, ${actualUsedSpace}GB used`);
                  } else {
                    totalSpace = 2000; // 2TB fallback for NAS
                  }
                } catch (dfError) {
                  console.error("DF command failed:", dfError);
                  totalSpace = 2000;
                }
              }
            } catch (error) {
              console.error("Error getting NAS capacity:", error);
              totalSpace = 2000; // 2TB fallback for NAS
            }
            break;
            
          case 's3':
            // S3 doesn't have fixed capacity, use virtual limit
            totalSpace = 5000; // 5TB virtual limit for S3
            actualUsedSpace = calculatedUsedSpace; // S3 only counts actual file usage
            break;
            
          case 'local':
          default:
            // For local storage, get actual disk space
            try {
              const response = await fetch('/api/storage/local-capacity', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
              });
              
              if (response.ok) {
                const capacityData = await response.json();
                console.log("Local storage capacity:", capacityData);
                totalSpace = Math.floor(capacityData.total / (1024 * 1024 * 1024));
                actualUsedSpace = Math.floor(capacityData.used / (1024 * 1024 * 1024));
                console.log(`Local storage: ${totalSpace}GB total, ${actualUsedSpace}GB used`);
              } else {
                // Fallback: try system disk usage command
                const dfResponse = await fetch('/api/system/disk-usage', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ path: storageSettings.path || '/recordings' })
                });
                
                if (dfResponse.ok) {
                  const dfData = await dfResponse.json();
                  totalSpace = Math.floor(dfData.total / (1024 * 1024 * 1024));
                  actualUsedSpace = Math.floor(dfData.used / (1024 * 1024 * 1024));
                } else {
                  totalSpace = 1000; // 1TB fallback
                }
              }
            } catch (error) {
              console.error("Error getting local capacity:", error);
              totalSpace = 1000; // 1TB fallback
            }
            break;
        }
      }

      const usedPercentage = totalSpace > 0 ? Math.round((actualUsedSpace / totalSpace) * 100) : 0;
      const usedSpaceFormatted = formatStorageSize(actualUsedSpace);
      const totalSpaceFormatted = formatStorageSize(totalSpace);

      console.log("Final real storage calculation:", {
        usedSpace: actualUsedSpace,
        totalSpace,
        usedPercentage,
        usedSpaceFormatted,
        totalSpaceFormatted
      });

      setStorageUsage({
        usedSpace: actualUsedSpace,
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
      // Fallback only if everything fails
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
