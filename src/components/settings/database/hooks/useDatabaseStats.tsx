
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DatabaseStats {
  totalRows: number;
  totalSize: string;
  tableStats: Record<string, { rows: number; size: string }>;
}

/**
 * Hook to fetch and manage database usage statistics with performance optimizations
 */
export default function useDatabaseStats(
  isConnected: boolean, 
  tablesStatus: Record<string, boolean> = {},
  tables: readonly string[] = []
) {
  const [isLoading, setIsLoading] = useState(false);
  const [dbStats, setDbStats] = useState<DatabaseStats>({
    totalRows: 0,
    totalSize: '0 MB',
    tableStats: {}
  });
  
  // Add caching to reduce database queries
  const cacheTimeoutRef = useRef<number>(30000); // 30 seconds cache timeout
  const lastFetchTimeRef = useRef<number>(0);
  const cachedStatsRef = useRef<DatabaseStats | null>(null);

  const fetchDatabaseUsage = async (forceRefresh = false) => {
    if (!isConnected) return;
    
    const now = Date.now();
    
    // Use cached data if available and not forcing refresh
    if (!forceRefresh && 
        cachedStatsRef.current && 
        now - lastFetchTimeRef.current < cacheTimeoutRef.current) {
      console.log('[DB Stats] Using cached statistics');
      return;
    }
    
    console.log('[DB Stats] Fetching fresh database statistics');
    setIsLoading(true);
    try {
      // Start with empty stats
      const tableStats: Record<string, { rows: number; size: string }> = {};
      let totalRows = 0;
      
      // For each existing table, get row count
      const existingTables = tables.filter(table => tablesStatus[table]);
      
      // Process in small batches for better performance
      const batchSize = 4;
      for (let i = 0; i < existingTables.length; i += batchSize) {
        const batch = existingTables.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (table) => {
          try {
            // Count rows in the table
            const { count, error } = await supabase
              .from(table as any) 
              .select('*', { count: 'exact', head: true });
              
            if (error) throw error;
            
            const rowCount = count || 0;
            totalRows += rowCount;
            
            // Estimate size (very rough approximation - in a real app, query database stats)
            // This is just a demo estimation
            const estimatedSize = (rowCount * 2).toFixed(1) + ' KB';
            
            tableStats[table] = {
              rows: rowCount,
              size: estimatedSize
            };
          } catch (err) {
            console.error(`Error counting rows in ${table}:`, err);
            tableStats[table] = {
              rows: 0,
              size: '0 KB'
            };
          }
        }));
      }
      
      // Calculate total size (rough estimate for demo)
      const totalSizeMB = (totalRows * 2 / 1024).toFixed(2) + ' MB';
      
      const newStats = {
        totalRows,
        totalSize: totalSizeMB,
        tableStats
      };
      
      setDbStats(newStats);
      cachedStatsRef.current = newStats;
      lastFetchTimeRef.current = now;
      
    } catch (error) {
      console.error('Error fetching database stats:', error);
      toast.error('Failed to fetch database usage statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load from localStorage on mount if available
    const cachedStats = localStorage.getItem('db_stats');
    const cachedTime = localStorage.getItem('db_stats_time');
    
    if (cachedStats && cachedTime) {
      const parsedStats = JSON.parse(cachedStats);
      setDbStats(parsedStats);
      cachedStatsRef.current = parsedStats;
      lastFetchTimeRef.current = parseInt(cachedTime, 10);
    }
    
    if (isConnected) {
      fetchDatabaseUsage();
    }
    
    // Set up periodic refresh in the background if tab is active
    const refreshInterval = setInterval(() => {
      if (document.visibilityState === 'visible' && isConnected) {
        fetchDatabaseUsage();
      }
    }, 60000); // Refresh every minute when active
    
    return () => clearInterval(refreshInterval);
  }, [isConnected, JSON.stringify(tablesStatus)]);
  
  // Save to localStorage whenever stats change
  useEffect(() => {
    if (dbStats.totalRows > 0) {
      localStorage.setItem('db_stats', JSON.stringify(dbStats));
      localStorage.setItem('db_stats_time', lastFetchTimeRef.current.toString());
    }
  }, [dbStats]);

  return { 
    dbStats, 
    isLoading, 
    fetchDatabaseUsage: () => fetchDatabaseUsage(true) // Force refresh when called explicitly
  };
}
