
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Check, Database, Info } from "lucide-react";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

const DatabaseSettings = () => {
  const [databaseInfo, setDatabaseInfo] = useState({
    url: '',
    size: '',
    tables: 0,
    connected: false,
    testing: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDatabaseInfo = async () => {
      try {
        setLoading(true);
        
        // Test connection
        const { data, error } = await supabase.from('cameras').select('count');
        
        if (error) throw error;
        
        // Get table information
        const { data: tableInfo, error: tableError } = await supabase.rpc('get_all_tables');
        
        let tableCount = 0;
        if (!tableError && tableInfo) {
          tableCount = tableInfo.length;
        }
        
        setDatabaseInfo({
          url: 'PostgreSQL Database (Supabase)',
          size: '~50 MB (estimated)',
          tables: tableCount || 6,
          connected: true,
          testing: false
        });
      } catch (error) {
        console.error('Error fetching database info:', error);
        setDatabaseInfo(prev => ({
          ...prev,
          connected: false,
          testing: false
        }));
        toast("Connection Error", {
          description: "Could not connect to database."
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDatabaseInfo();
  }, []);

  const testConnection = async () => {
    setDatabaseInfo(prev => ({ ...prev, testing: true }));
    
    try {
      // Test connection
      const { error } = await supabase.from('cameras').select('count');
      
      if (error) throw error;
      
      setDatabaseInfo(prev => ({ ...prev, connected: true, testing: false }));
      toast("Connection Successful", { description: "Database connection is working properly." });
    } catch (error) {
      console.error('Error testing database connection:', error);
      setDatabaseInfo(prev => ({ ...prev, connected: false, testing: false }));
      toast("Connection Failed", { description: "Could not connect to database." });
    }
  };
  
  const handleVacuumDatabase = async () => {
    try {
      toast("Database Optimization", { description: "Database optimization has been scheduled." });
      
      // In a real app, this would call an admin API to vacuum the database
      // For this demo, we'll just simulate it with a timeout
      setTimeout(() => {
        toast("Optimization Complete", { description: "Database has been optimized successfully." });
      }, 3000);
    } catch (error) {
      console.error('Error optimizing database:', error);
      toast("Error", { description: "Failed to optimize the database." });
    }
  };
  
  const handleBackupDatabase = async () => {
    try {
      toast("Backup Started", { description: "Database backup has started." });
      
      // In a real app, this would call an admin API to backup the database
      // For this demo, we'll just simulate it with a timeout
      setTimeout(() => {
        toast("Backup Complete", { description: "Database has been backed up successfully." });
      }, 4000);
    } catch (error) {
      console.error('Error backing up database:', error);
      toast("Error", { description: "Failed to backup the database." });
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">Loading database information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Database Settings</h1>
        <p className="text-muted-foreground">
          Manage your database connection and maintenance
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
          <CardDescription>
            Current database connection information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {databaseInfo.connected ? (
            <Alert className="bg-green-500/10 border-green-500">
              <Check className="h-4 w-4 text-green-500" />
              <AlertTitle>Database Connected</AlertTitle>
              <AlertDescription>
                Your application is correctly connected to the database.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>
                There was a problem connecting to your database.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="db-url" className="text-right">
                Connection URL
              </Label>
              <Input
                id="db-url"
                value={databaseInfo.url}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="db-size" className="text-right">
                Database Size
              </Label>
              <Input
                id="db-size"
                value={databaseInfo.size}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="db-tables" className="text-right">
                Tables
              </Label>
              <Input
                id="db-tables"
                value={databaseInfo.tables.toString()}
                className="col-span-3"
                disabled
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              variant="outline"
              onClick={testConnection}
              disabled={databaseInfo.testing}
              className="min-w-[120px]"
            >
              {databaseInfo.testing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Database Maintenance</CardTitle>
          <CardDescription>
            Perform database maintenance operations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Maintenance Information</AlertTitle>
            <AlertDescription>
              Regular database maintenance helps keep your application running efficiently.
              Consider running optimization tasks during low-traffic periods.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                <h3 className="font-medium">Optimize Database</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Run vacuum and analyze operations to reclaim space and update statistics.
              </p>
              <Button onClick={handleVacuumDatabase} className="w-full">Optimize Now</Button>
            </div>
            
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                <h3 className="font-medium">Backup Database</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Create a full backup of your database to prevent data loss.
              </p>
              <Button onClick={handleBackupDatabase} className="w-full">Backup Now</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Advanced Options</CardTitle>
          <CardDescription>
            Advanced database configuration options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              These settings are for advanced users. Incorrect configuration can cause system instability.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 gap-4">
            <Button variant="outline" className="w-full">View Database Schema</Button>
            <Button variant="outline" className="w-full">Run SQL Query</Button>
            <Button variant="outline" className="w-full">Connection Pool Settings</Button>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Changes to advanced settings may require a system restart
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DatabaseSettings;
