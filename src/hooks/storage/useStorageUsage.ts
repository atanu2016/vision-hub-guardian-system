
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
      console.log("Fetching real storage usage from system...");
      
      // Get storage settings to determine storage type
      const { data: storageSettings } = await supabase
        .from('storage_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      console.log("Storage settings:", storageSettings);

      let totalSpace = 0;
      let usedSpace = 0;
      
      if (storageSettings) {
        switch (storageSettings.type) {
          case 'nas':
            // For NAS/SMB, get real capacity from mounted share
            try {
              console.log("Getting NAS storage capacity...");
              const response = await fetch('/api/storage/nas-usage', {
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
                const nasData = await response.json();
                console.log("Real NAS usage data:", nasData);
                totalSpace = Math.floor(nasData.total / (1024 * 1024 * 1024)); // Convert to GB
                usedSpace = Math.floor(nasData.used / (1024 * 1024 * 1024)); // Convert to GB
                console.log(`NAS Real usage: ${usedSpace}GB used of ${totalSpace}GB total`);
              } else {
                console.warn("NAS API not available, using system df command");
                // Fallback to df command on mounted SMB share
                const dfResponse = await fetch('/api/system/storage-usage', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    path: storageSettings.naspath || '/mnt/recordings',
                    type: 'nas'
                  })
                });
                
                if (dfResponse.ok) {
                  const dfData = await dfResponse.json();
                  totalSpace = Math.floor(dfData.total / (1024 * 1024 * 1024));
                  usedSpace = Math.floor(dfData.used / (1024 * 1024 * 1024));
                  console.log(`DF command results: ${usedSpace}GB used of ${totalSpace}GB total`);
                } else {
                  throw new Error("Cannot get NAS storage information");
                }
              }
            } catch (error) {
              console.error("Error getting NAS capacity:", error);
              throw new Error(`NAS storage error: ${error.message}`);
            }
            break;
            
          case 's3':
            // S3 usage calculation
            try {
              console.log("Getting S3 storage usage...");
              const { data: recordings } = await supabase
                .from('recordings')
                .select('file_size');

              let s3UsedBytes = 0;
              if (recordings && recordings.length > 0) {
                recordings.forEach(recording => {
                  if (recording.file_size) {
                    s3UsedBytes += parseStorageValue(recording.file_size) * 1024 * 1024 * 1024; // Convert GB to bytes
                  }
                });
              }
              
              usedSpace = Math.floor(s3UsedBytes / (1024 * 1024 * 1024)); // Convert to GB
              totalSpace = 5000; // 5TB virtual limit for S3
              console.log(`S3 usage: ${usedSpace}GB used of ${totalSpace}GB limit`);
            } catch (error) {
              console.error("Error getting S3 usage:", error);
              throw new Error(`S3 storage error: ${error.message}`);
            }
            break;
            
          case 'local':
          default:
            // For local storage, get actual disk space
            try {
              console.log("Getting local storage usage...");
              const response = await fetch('/api/system/storage-usage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  path: storageSettings.path || '/recordings',
                  type: 'local'
                })
              });
              
              if (response.ok) {
                const localData = await response.json();
                console.log("Local storage data:", localData);
                totalSpace = Math.floor(localData.total / (1024 * 1024 * 1024));
                usedSpace = Math.floor(localData.used / (1024 * 1024 * 1024));
                console.log(`Local storage: ${usedSpace}GB used of ${totalSpace}GB total`);
              } else {
                throw new Error("Cannot get local storage information");
              }
            } catch (error) {
              console.error("Error getting local capacity:", error);
              throw new Error(`Local storage error: ${error.message}`);
            }
            break;
        }
      } else {
        // No storage settings, try to get system default
        console.log("No storage settings found, getting system default...");
        try {
          const response = await fetch('/api/system/storage-usage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              path: '/',
              type: 'system'
            })
          });
          
          if (response.ok) {
            const systemData = await response.json();
            totalSpace = Math.floor(systemData.total / (1024 * 1024 * 1024));
            usedSpace = Math.floor(systemData.used / (1024 * 1024 * 1024));
            console.log(`System storage: ${usedSpace}GB used of ${totalSpace}GB total`);
          } else {
            throw new Error("Cannot get system storage information");
          }
        } catch (error) {
          console.error("Error getting system storage:", error);
          throw new Error(`System storage error: ${error.message}`);
        }
      }

      const usedPercentage = totalSpace > 0 ? Math.round((usedSpace / totalSpace) * 100) : 0;
      const usedSpaceFormatted = formatStorageSize(usedSpace);
      const totalSpaceFormatted = formatStorageSize(totalSpace);

      console.log("Final real storage calculation:", {
        usedSpace,
        totalSpace,
        usedPercentage,
        usedSpaceFormatted,
        totalSpaceFormatted
      });

      setStorageUsage({
        usedSpace,
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
      // Show error message instead of fallback mock data
      setStorageUsage({
        totalSpace: 0,
        usedSpace: 0,
        usedPercentage: 0,
        usedSpaceFormatted: "Error",
        totalSpaceFormatted: "Error"
      });
    }
  };

  return {
    storageUsage,
    fetchStorageUsage
  };
};
