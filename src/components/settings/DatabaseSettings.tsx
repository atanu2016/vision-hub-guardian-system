import { useState, useEffect, Suspense, lazy } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from "@/integrations/supabase/client";

// Lazy load components to improve initial loading time
const DatabaseStatus = lazy(() => import('./DatabaseStatus'));
const DatabaseConfig = lazy(() => import('./DatabaseConfig'));
const DatabaseMigration = lazy(() => import('./DatabaseMigration'));

// Simple loading component for Suspense fallback
const TabLoader = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
  </div>
);

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
    'profiles', 'database_config', 'smtp_config', 'camera_recording_status', 'user_roles'] as const;

  // Use a cache key to avoid repeated database calls
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const cacheTimeout = 30000; // 30 seconds

  useEffect(() => {
    checkDatabaseStatus();
    
    // Set up periodic refresh to keep status updated
    const refreshInterval = setInterval(() => {
      // Only refresh if the component is visible/active
      if (document.visibilityState === 'visible') {
        setLastRefresh(Date.now());
      }
    }, cacheTimeout);
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Triggered by lastRefresh changes
  useEffect(() => {
    checkDatabaseStatus();
  }, [lastRefresh]);

  const checkDatabaseStatus = async () => {
    // Check if we have cached status
    const cachedStatus = localStorage.getItem('db_status');
    const cachedTime = localStorage.getItem('db_status_time');
    const now = Date.now();
    
    if (cachedStatus && cachedTime && (now - parseInt(cachedTime, 10) < cacheTimeout)) {
      console.log('[DB Settings] Using cached database status');
      setDatabaseStatus(JSON.parse(cachedStatus));
      setIsLoading(false);
      return;
    }
    
    console.log('[DB Settings] Fetching fresh database status');
    setIsLoading(true);

    try {
      // Check database type from config - optimize with single query
      const { data: dbConfigData } = await supabase
        .from('database_config')
        .select('*')
        .maybeSingle();
        
      const dbType = dbConfigData?.db_type || 'supabase';
      
      // Use Promise.all to check if each table exists in parallel
      const tableChecks = await Promise.all(
        tables.map(async table => {
          try {
            const result = await supabase
              .from(table)
              .select('id', { count: 'exact', head: true });
            return result.count !== null;
          } catch (error) {
            return false;
          }
        })
      );
      
      // Create a status object for each table
      const tablesStatus = tables.reduce((acc, table, index) => {
        acc[table] = tableChecks[index];
        return acc;
      }, {} as Record<string, boolean>);
      
      // Check if any tables exist
      const anyTableExists = tableChecks.some(exists => exists);

      const statusData = {
        connected: true,
        type: dbType,
        tablesExist: anyTableExists,
        tablesStatus
      };
      
      setDatabaseStatus(statusData);
      
      // Cache the result
      localStorage.setItem('db_status', JSON.stringify(statusData));
      localStorage.setItem('db_status_time', now.toString());
      
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

  // Handler to force refresh when needed
  const handleForceRefresh = () => {
    localStorage.removeItem('db_status');
    localStorage.removeItem('db_status_time');
    setLastRefresh(Date.now());
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status">Database Status</TabsTrigger>
          <TabsTrigger value="config">Database Config</TabsTrigger>
          <TabsTrigger value="migration">Migration</TabsTrigger>
        </TabsList>
        
        <Suspense fallback={<TabLoader />}>
          <TabsContent value="status">
            <DatabaseStatus 
              databaseStatus={databaseStatus}
              tables={tables}
              isLoading={isLoading}
              onRefresh={handleForceRefresh}
            />
          </TabsContent>
          
          <TabsContent value="config">
            <DatabaseConfig databaseType={databaseStatus.type} />
          </TabsContent>
          
          <TabsContent value="migration">
            <DatabaseMigration />
          </TabsContent>
        </Suspense>
      </Tabs>
    </div>
  );
}
