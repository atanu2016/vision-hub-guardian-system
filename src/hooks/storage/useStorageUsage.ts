
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StorageUsage } from './storageTypes';
import { parseStorageValue } from '@/utils/storageUtils';

export const useStorageUsage = () => {
  const [storageUsage, setStorageUsage] = useState<StorageUsage>({
    totalSpace: 1000,
    usedSpace: 0,
    usedPercentage: 0,
    usedSpaceFormatted: "0 GB",
    totalSpaceFormatted: "1 TB"
  });

  // Fetch storage usage on component mount
  useEffect(() => {
    fetchStorageUsage();
  }, []);

  // Fetch real storage usage from the database
  const fetchStorageUsage = async () => {
    try {
      // Get system stats which contains storage info
      const { data: systemStats, error } = await supabase
        .from('system_stats')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        throw error;
      }

      if (systemStats) {
        // Convert storage values
        const usedSpace = parseStorageValue(systemStats.storage_used);
        const totalSpace = parseStorageValue(systemStats.storage_total);
        const usedPercentage = systemStats.storage_percentage || 
          (totalSpace > 0 ? Math.round((usedSpace / totalSpace) * 100) : 0);
        
        setStorageUsage({
          usedSpace,
          totalSpace,
          usedPercentage,
          usedSpaceFormatted: systemStats.storage_used || "0 GB",
          totalSpaceFormatted: systemStats.storage_total || "1 TB"
        });
      }
    } catch (error) {
      console.error("Failed to fetch storage usage:", error);
      // Fallback to default values if we can't get real data
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
