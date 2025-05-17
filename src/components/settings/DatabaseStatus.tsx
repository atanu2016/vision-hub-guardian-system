
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Server, Loader2 } from 'lucide-react';
import DatabaseStatusInfo from './database/DatabaseStatusInfo';
import TableStatusList from './database/TableStatusList';
import useDatabaseStats from './database/hooks/useDatabaseStats';

interface DatabaseStatusProps {
  databaseStatus: {
    connected: boolean;
    type: string;
    tablesExist: boolean;
    tablesStatus: Record<string, boolean>;
  };
  tables: readonly string[];
  isLoading: boolean;
  onRefresh: () => Promise<void>; // This prop requires a function returning Promise<void>
}

export default function DatabaseStatus({ databaseStatus, tables, isLoading, onRefresh }: DatabaseStatusProps) {
  // Use the custom hook to fetch and manage database statistics
  const { dbStats, isLoading: dbStatsLoading, fetchDatabaseUsage } = 
    useDatabaseStats(databaseStatus.connected, databaseStatus.tablesStatus, tables);

  // Handle refresh - update both database status and statistics
  const handleRefresh = async () => {
    await onRefresh();
    fetchDatabaseUsage();
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
          {/* Database connection and usage information */}
          <DatabaseStatusInfo 
            connected={databaseStatus.connected}
            type={databaseStatus.type}
            tablesStatus={databaseStatus.tablesStatus}
            tables={tables}
            dbStats={dbStats}
            dbStatsLoading={dbStatsLoading}
          />
          
          {/* Table details section */}
          <div className="pt-2">
            <h4 className="text-sm font-medium mb-2">Table Details:</h4>
            <TableStatusList 
              tables={tables}
              tablesStatus={databaseStatus.tablesStatus}
              isLoading={isLoading}
              tableStats={dbStats.tableStats}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          onClick={handleRefresh} 
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
