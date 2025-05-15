
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from "@/integrations/supabase/client";
import DatabaseMigration from './DatabaseMigration';
import DatabaseStatus from './DatabaseStatus';
import DatabaseConfig from './DatabaseConfig';

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

  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status">Database Status</TabsTrigger>
          <TabsTrigger value="config">Database Config</TabsTrigger>
          <TabsTrigger value="migration">Migration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="status">
          <DatabaseStatus 
            databaseStatus={databaseStatus}
            tables={tables}
            isLoading={isLoading}
            onRefresh={checkDatabaseStatus}
          />
        </TabsContent>
        
        <TabsContent value="config">
          <DatabaseConfig databaseType={databaseStatus.type} />
        </TabsContent>
        
        <TabsContent value="migration">
          <DatabaseMigration />
        </TabsContent>
      </Tabs>
    </div>
  );
}
