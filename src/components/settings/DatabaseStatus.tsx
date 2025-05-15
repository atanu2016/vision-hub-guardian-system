
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Server } from 'lucide-react';

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
          
          <div className="pt-2">
            <h4 className="text-sm font-medium mb-2">Table Details:</h4>
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium">Table Name</th>
                    <th scope="col" className="px-4 py-2 text-right text-xs font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {tables.map(table => (
                    <tr key={table}>
                      <td className="px-4 py-2 text-sm">{table}</td>
                      <td className="px-4 py-2 text-right">
                        <Badge variant={
                          isLoading ? "outline" : 
                          databaseStatus.tablesStatus[table] ? "secondary" : "destructive"
                        }>
                          {isLoading ? "Checking..." : 
                           databaseStatus.tablesStatus[table] ? "Exists" : "Missing"}
                        </Badge>
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
          onClick={onRefresh} 
          className="w-full"
          disabled={isLoading}
        >
          Refresh Status
        </Button>
      </CardFooter>
    </Card>
  );
}
