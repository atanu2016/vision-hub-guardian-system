
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Server } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import DatabaseMigration from './DatabaseMigration';

export default function DatabaseSettings() {
  const [activeTab, setActiveTab] = useState('status');
  const [databaseStatus, setDatabaseStatus] = useState<{
    connected: boolean;
    type: string;
    tablesExist: boolean;
    tablesStatus: Record<string, boolean>;
  }>({
    connected: false,
    type: 'supabase',
    tablesExist: false,
    tablesStatus: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Define table names with a type assertion to help TypeScript
  const tables = ['cameras', 'storage_settings', 'recording_settings', 'alert_settings', 
    'webhooks', 'advanced_settings', 'system_logs', 'system_stats', 
    'profiles', 'database_config', 'smtp_config', 'camera_recording_status'] as const;

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const checkDatabaseStatus = async () => {
    setIsLoading(true);

    try {
      // Check database type from config
      const { data: dbConfigData } = await supabase
        .from('database_config')
        .select('*')
        .maybeSingle();
        
      const dbType = dbConfigData?.db_type || 'supabase';
      
      // Use Promise.all to check if each table exists
      const tableChecks = await Promise.all(
        tables.map(table => 
          // Modified this line to properly handle the Promise with error handling
          supabase.from(table).select('id', { count: 'exact', head: true })
            .then(result => result.count !== null)
            .then(
              exists => exists, 
              () => false // Error handler within then() instead of catch()
            )
        )
      );
      
      // Create a status object for each table
      const tablesStatus = tables.reduce((acc, table, index) => {
        acc[table] = tableChecks[index];
        return acc;
      }, {} as Record<string, boolean>);
      
      // Check if any tables exist
      const anyTableExists = tableChecks.some(exists => exists);

      setDatabaseStatus({
        connected: true,
        type: dbType,
        tablesExist: anyTableExists,
        tablesStatus
      });
      
    } catch (error) {
      console.error('Error checking database status:', error);
      toast.error("Failed to check database status");
      setDatabaseStatus({
        connected: false,
        type: 'unknown',
        tablesExist: false,
        tablesStatus: {}
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTableStatusCount = () => {
    if (!databaseStatus.tablesStatus) return { existing: 0, missing: 0 };
    
    const existing = Object.values(databaseStatus.tablesStatus).filter(Boolean).length;
    const total = tables.length;
    return { existing, missing: total - existing };
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status">Database Status</TabsTrigger>
          <TabsTrigger value="config">Database Config</TabsTrigger>
          <TabsTrigger value="migration">Migration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="status">
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
                onClick={checkDatabaseStatus} 
                className="w-full"
                disabled={isLoading}
              >
                Refresh Status
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                <span>Database Configuration</span>
              </CardTitle>
              <CardDescription>
                View and modify your current database connection settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {databaseStatus.type === 'supabase' ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Connection Type:</span>
                      <Badge>Supabase</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Your application is currently connected to a Supabase project. 
                      To modify your connection or migrate to a MySQL database, use the Migration tab.
                    </div>
                  </>
                ) : databaseStatus.type === 'mysql' ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Connection Type:</span>
                      <Badge>MySQL</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium">Host</h4>
                        <p className="text-sm text-muted-foreground">
                          {/* We would fetch the actual values from the database_config table */}
                          localhost
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Port</h4>
                        <p className="text-sm text-muted-foreground">3306</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Database</h4>
                        <p className="text-sm text-muted-foreground">vision_hub</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Username</h4>
                        <p className="text-sm text-muted-foreground">root</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Unable to determine database configuration. Please check your connection settings.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="migration">
          <DatabaseMigration />
        </TabsContent>
      </Tabs>
    </div>
  );
}
