
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DatabaseStats {
  totalRows: number;
  totalSize: string;
  tableStats: Record<string, { rows: number; size: string }>;
}

/**
 * Hook to fetch and manage database usage statistics
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

  const fetchDatabaseUsage = async () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    try {
      // Start with empty stats
      const tableStats: Record<string, { rows: number; size: string }> = {};
      let totalRows = 0;
      
      // For each existing table, get row count
      const existingTables = tables.filter(table => tablesStatus[table]);
      
      for (const table of existingTables) {
        try {
          // Count rows in the table
          const { count, error } = await supabase
            .from(table as any) // Type assertion to avoid TypeScript errors
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
      }
      
      // Calculate total size (rough estimate for demo)
      const totalSizeMB = (totalRows * 2 / 1024).toFixed(2) + ' MB';
      
      setDbStats({
        totalRows,
        totalSize: totalSizeMB,
        tableStats
      });
      
    } catch (error) {
      console.error('Error fetching database stats:', error);
      toast.error('Failed to fetch database usage statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchDatabaseUsage();
    }
  }, [isConnected, JSON.stringify(tablesStatus)]);

  return { dbStats, isLoading, fetchDatabaseUsage };
}
