
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Server, Database, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DatabaseStatusProps {
  databaseStatus: {
    connected: boolean;
    type: string;
    tablesExist: boolean;
    tablesStatus: Record<string, boolean>;
  };
  tables: readonly string[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

export default function DatabaseStatus({ databaseStatus, tables, isLoading, onRefresh }: DatabaseStatusProps) {
  const [dbStatsLoading, setDbStatsLoading] = useState(false);
  const [dbStats, setDbStats] = useState<{
    totalRows: number;
    totalSize: string;
    tableStats: Record<string, { rows: number; size: string }>;
  }>({
    totalRows: 0,
    totalSize: '0 MB',
    tableStats: {}
  });

  // Fetch actual database usage statistics
  useEffect(() => {
    fetchDatabaseUsage();
  }, [databaseStatus.connected]);

  const fetchDatabaseUsage = async () => {
    if (!databaseStatus.connected) return;
    
    setDbStatsLoading(true);
    try {
      // Start with empty stats
      const tableStats: Record<string, { rows: number; size: string }> = {};
      let totalRows = 0;
      
      // For each existing table, get row count
      const existingTables = tables.filter(table => databaseStatus.tablesStatus[table]);
      
      for (const table of existingTables) {
        try {
          // Count rows in the table - use table as a direct literal value, not a dynamically constructed string
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
      setDbStatsLoading(false);
    }
  };

  const getTableStatusCount = () => {
    if (!databaseStatus.tablesStatus) return { existing: 0, missing: 0 };
    
    const existing = Object.values(databaseStatus.tablesStatus).filter(Boolean).length;
    const total = tables.length;
    return { existing, missing: total - existing };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          <span>Database Status</span>
        </CardTitle>
        <CardDescription>
          Check the status of your database connection and tables
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Connection Status:</span>
            <Badge variant={databaseStatus.connected ? "secondary" : "destructive"}>
              {databaseStatus.connected ? "Connected" : "Not Connected"}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Database Type:</span>
            <Badge variant="outline">
              {databaseStatus.type === 'supabase' ? 'Supabase' : 
               databaseStatus.type === 'mysql' ? 'MySQL' : 'Unknown'}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Tables Status:</span>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-green-500/20">
                {getTableStatusCount().existing} Existing
              </Badge>
              <Badge variant="outline" className="bg-red-500/20">
                {getTableStatusCount().missing} Missing
              </Badge>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Database Usage:</span>
            {dbStatsLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading stats...</span>
              </div>
            ) : (
              <Badge variant="outline" className="bg-blue-500/20">
                {dbStats.totalRows} Rows / {dbStats.totalSize}
              </Badge>
            )}
          </div>
          
          <div className="pt-2">
            <h4 className="text-sm font-medium mb-2">Table Details:</h4>
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium">Table Name</th>
                    <th scope="col" className="px-4 py-2 text-center text-xs font-medium">Status</th>
                    <th scope="col" className="px-4 py-2 text-right text-xs font-medium">Size</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {tables.map(table => (
                    <tr key={table}>
                      <td className="px-4 py-2 text-sm">{table}</td>
                      <td className="px-4 py-2 text-center">
                        <Badge variant={
                          isLoading ? "outline" : 
                          databaseStatus.tablesStatus[table] ? "secondary" : "destructive"
                        }>
                          {isLoading ? "Checking..." : 
                           databaseStatus.tablesStatus[table] ? "Exists" : "Missing"}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-right text-sm">
                        {databaseStatus.tablesStatus[table] && dbStats.tableStats[table] ? 
                          `${dbStats.tableStats[table]?.rows || 0} rows (${dbStats.tableStats[table]?.size || '0 KB'})` : 
                          '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          onClick={() => {
            onRefresh();
            fetchDatabaseUsage();
          }} 
          className="w-full"
          disabled={isLoading || dbStatsLoading}
        >
          {isLoading || dbStatsLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            'Refresh Status'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
