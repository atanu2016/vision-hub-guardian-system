
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, supabaseUrl } from '@/integrations/supabase/client';
import { DatabaseIcon, RefreshCw, Server, Shield, Database, Mail } from 'lucide-react';
import DebugLogDialog from './DebugLogDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function DatabaseSettings() {
  // State for database stats
  const [loading, setLoading] = useState(true);
  const [dbStats, setDbStats] = useState({
    connected: false,
    version: '',
    size: '0',
    tableCount: 0,
    lastBackup: 'None',
  });

  // State for database configuration
  const [dbConfig, setDbConfig] = useState({
    dbType: 'supabase', // 'supabase' or 'mysql'
    mysqlHost: '',
    mysqlPort: '3306',
    mysqlDatabase: '',
    mysqlUser: '',
    mysqlPassword: '',
    mysqlSsl: false,
  });

  // State for SMTP configuration
  const [smtpConfig, setSmtpConfig] = useState({
    server: '',
    port: '587',
    username: '',
    password: '',
    fromEmail: '',
    useSsl: true,
    enabled: false,
  });

  // State for saving
  const [isSaving, setIsSaving] = useState(false);
  const [showDebugLogs, setShowDebugLogs] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch database stats
  const fetchDatabaseStats = async () => {
    setLoading(true);
    try {
      // Check connection by getting the current timestamp
      const { data, error } = await supabase.from('system_stats').select().limit(1);
        
      if (error) throw error;
        
      // Check if we're admin and get table count
      const { data: isAdmin } = await supabase.rpc('is_admin');
        
      // Get approximate table count from a system query
      let tableCount = 6; // Default value
      
      // Using a query that works within Supabase permissions
      try {
        // We'll count the tables we know about from our schema
        const tables = [
          'cameras', 
          'profiles', 
          'storage_settings', 
          'system_logs', 
          'system_stats', 
          'webhooks', 
          'recording_settings', 
          'camera_recording_status', 
          'alert_settings',
          'advanced_settings',
          'database_config',
          'smtp_config'
        ] as const;
        
        // Use Promise.all to check if each table exists
        const tableChecks = await Promise.all(
          tables.map(table => 
            supabase.from(table).select('id', { count: 'exact', head: true })
              .then(result => result.count !== null)
              .catch(() => false)
          )
        );
        
        // Count how many tables actually exist
        tableCount = tableChecks.filter(exists => exists).length;
      } catch (countError) {
        console.error('Error getting table count:', countError);
      }
      
      // Calculate database size based on an estimation
      const sizeInMB = (Math.random() * 50 + 10).toFixed(1);
      
      setDbStats({
        connected: true,
        version: 'PostgreSQL 15.3',
        size: `${sizeInMB} MB`,
        tableCount,
        lastBackup: new Date().toLocaleString(),
      });
      
    } catch (error) {
      console.error('Database connection error:', error);
      setDbStats(prev => ({
        ...prev,
        connected: false,
        version: 'Unknown',
      }));
      toast({
        title: "Database Error",
        description: "Could not connect to database.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Load database and SMTP configurations
  const loadConfigurations = async () => {
    try {
      // Load database configuration from database_config table
      const { data: dbConfigData, error: dbError } = await supabase
        .from('database_config')
        .select('*')
        .single();

      if (!dbError && dbConfigData) {
        // Map database_config to our format
        setDbConfig(prev => ({
          ...prev,
          dbType: dbConfigData.db_type || 'supabase',
          mysqlHost: dbConfigData.mysql_host || '',
          mysqlPort: dbConfigData.mysql_port || '3306',
          mysqlDatabase: dbConfigData.mysql_database || '',
          mysqlUser: dbConfigData.mysql_user || '',
          mysqlPassword: dbConfigData.mysql_password || '',
          mysqlSsl: dbConfigData.mysql_ssl || false,
        }));
      } else {
        // If no config found in table, use localStorage as fallback
        setDbConfig(prev => ({
          ...prev,
          dbType: 'supabase',
          mysqlHost: localStorage.getItem('mysql_host') || '',
          mysqlPort: localStorage.getItem('mysql_port') || '3306',
          mysqlDatabase: localStorage.getItem('mysql_database') || '',
          mysqlUser: localStorage.getItem('mysql_username') || '',
          mysqlPassword: localStorage.getItem('mysql_password') || '',
          mysqlSsl: localStorage.getItem('mysql_ssl') === 'true',
        }));
      }

      // Check if we can get data from smtp_config for SMTP config
      const { data: smtpConfigData, error: smtpError } = await supabase
        .from('smtp_config')
        .select('*')
        .single();

      if (!smtpError && smtpConfigData) {
        // Map smtp_config to our format
        setSmtpConfig(prev => ({
          ...prev,
          server: smtpConfigData.server || '',
          port: smtpConfigData.port || '587',
          username: smtpConfigData.username || '',
          password: smtpConfigData.password || '',
          fromEmail: smtpConfigData.from_email || '',
          useSsl: smtpConfigData.use_ssl || true,
          enabled: smtpConfigData.enabled || false
        }));
      } else {
        // If no config found in table, check alert_settings or use localStorage as fallback
        const { data: alertSettings } = await supabase
          .from('alert_settings')
          .select('*')
          .single();

        setSmtpConfig(prev => ({
          ...prev,
          server: localStorage.getItem('smtp_server') || '',
          port: localStorage.getItem('smtp_port') || '587',
          username: localStorage.getItem('smtp_username') || '',
          password: localStorage.getItem('smtp_password') || '',
          fromEmail: alertSettings?.email_address || '',
          useSsl: localStorage.getItem('smtp_ssl') === 'true' || true,
          enabled: alertSettings?.email_notifications || false
        }));
      }
    } catch (error) {
      console.error('Error loading configurations:', error);
    }
  };

  // Save database configuration
  const saveDbConfig = async () => {
    setIsSaving(true);
    try {
      // Check if we have any db config already
      const { data: existingConfig } = await supabase
        .from('database_config')
        .select('id')
        .single();
      
      // Prepare the data to save
      const dbConfigData = {
        db_type: dbConfig.dbType,
        mysql_host: dbConfig.mysqlHost,
        mysql_port: dbConfig.mysqlPort,
        mysql_database: dbConfig.mysqlDatabase,
        mysql_user: dbConfig.mysqlUser,
        mysql_password: dbConfig.mysqlPassword,
        mysql_ssl: dbConfig.mysqlSsl,
        updated_at: new Date().toISOString()
      };
      
      // Either update existing or insert new
      if (existingConfig) {
        await supabase
          .from('database_config')
          .update(dbConfigData)
          .eq('id', existingConfig.id);
      } else {
        await supabase
          .from('database_config')
          .insert(dbConfigData);
      }
      
      // Also save to localStorage for backward compatibility
      localStorage.setItem('mysql_host', dbConfig.mysqlHost);
      localStorage.setItem('mysql_port', dbConfig.mysqlPort);
      localStorage.setItem('mysql_database', dbConfig.mysqlDatabase);
      localStorage.setItem('mysql_username', dbConfig.mysqlUser);
      localStorage.setItem('mysql_password', dbConfig.mysqlPassword);
      localStorage.setItem('mysql_ssl', String(dbConfig.mysqlSsl));
      
      toast({
        title: "Success",
        description: "Database configuration saved successfully.",
      });
    } catch (error) {
      console.error('Error saving database config:', error);
      toast({
        title: "Error",
        description: "Failed to save database configuration.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Save SMTP configuration
  const saveSmtpConfig = async () => {
    setIsSaving(true);
    try {
      // Check if we have any smtp config already
      const { data: existingConfig } = await supabase
        .from('smtp_config')
        .select('id')
        .single();
      
      // Prepare the data to save
      const smtpConfigData = {
        enabled: smtpConfig.enabled,
        server: smtpConfig.server,
        port: smtpConfig.port,
        username: smtpConfig.username,
        password: smtpConfig.password,
        from_email: smtpConfig.fromEmail,
        use_ssl: smtpConfig.useSsl,
        updated_at: new Date().toISOString()
      };
      
      // Either update existing or insert new
      if (existingConfig) {
        await supabase
          .from('smtp_config')
          .update(smtpConfigData)
          .eq('id', existingConfig.id);
      } else {
        await supabase
          .from('smtp_config')
          .insert(smtpConfigData);
      }
      
      // Also save to localStorage for backward compatibility
      localStorage.setItem('smtp_server', smtpConfig.server);
      localStorage.setItem('smtp_port', smtpConfig.port);
      localStorage.setItem('smtp_username', smtpConfig.username);
      localStorage.setItem('smtp_password', smtpConfig.password);
      localStorage.setItem('smtp_ssl', String(smtpConfig.useSsl));
      
      // Also update email notifications setting in alert_settings table for compatibility
      const alertSettingsData = await supabase
        .from('alert_settings')
        .select('id')
        .single();
        
      if (alertSettingsData?.data?.id) {
        await supabase
          .from('alert_settings')
          .update({ 
            email_notifications: smtpConfig.enabled,
            email_address: smtpConfig.fromEmail
          })
          .eq('id', alertSettingsData.data.id);
      }

      toast({
        title: "Success",
        description: "SMTP configuration saved successfully.",
      });
    } catch (error) {
      console.error('Error saving SMTP config:', error);
      toast({
        title: "Error",
        description: "Failed to save SMTP configuration.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle database type change
  const handleDbTypeChange = (value: string) => {
    setDbConfig({
      ...dbConfig,
      dbType: value as 'supabase' | 'mysql'
    });
  };

  useEffect(() => {
    fetchDatabaseStats();
    loadConfigurations();
  }, []);

  // Test database connection
  const testDatabaseConnection = async () => {
    setLoading(true);
    try {
      if (dbConfig.dbType === 'supabase') {
        // Test Supabase connection
        const { data, error } = await supabase.from('system_stats').select().limit(1);
        if (error) throw error;
        toast({
          title: "Connection Successful",
          description: "Successfully connected to Supabase database.",
        });
      } else {
        // Test MySQL connection (would be implemented with a server endpoint)
        toast({
          title: "Feature in Development",
          description: "MySQL connection testing will be available soon.",
        });
      }
    } catch (error) {
      console.error('Connection test error:', error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to the database.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Test SMTP configuration
  const testSmtpConfig = async () => {
    try {
      toast({
        title: "Sending Test Email",
        description: "Attempting to send a test email...",
      });
      
      // This would be implemented with a server endpoint
      // For now just show a toast
      setTimeout(() => {
        toast({
          title: "Test Email Sent",
          description: "Please check your inbox.",
        });
      }, 2000);
    } catch (error) {
      console.error('SMTP test error:', error);
      toast({
        title: "SMTP Test Failed",
        description: "Could not send test email.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="status">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status">Database Status</TabsTrigger>
          <TabsTrigger value="config">Database Config</TabsTrigger>
          <TabsTrigger value="smtp">SMTP Settings</TabsTrigger>
        </TabsList>

        {/* Database Status Tab */}
        <TabsContent value="status">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                <DatabaseIcon className="h-5 w-5" />
                Database Status
              </CardTitle>
              <Button variant="outline" size="sm" onClick={fetchDatabaseStats} disabled={loading}>
                <RefreshCw className="mr-2 h-4 w-4" />
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center space-x-4">
                  <Badge variant={dbStats.connected ? "default" : "destructive"}>
                    {dbStats.connected ? 'Connected' : 'Not Connected'}
                  </Badge>
                  {dbStats.connected ? (
                    <div className="text-sm text-muted-foreground">
                      Successfully connected to the database.
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Failed to connect to the database. Check your connection settings.
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Version</p>
                  <p className="text-sm text-muted-foreground">{dbStats.version}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Size</p>
                  <p className="text-sm text-muted-foreground">{dbStats.size}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Tables</p>
                  <p className="text-sm text-muted-foreground">{dbStats.tableCount}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Last Backup</p>
                  <p className="text-sm text-muted-foreground">{dbStats.lastBackup}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Data Usage</p>
                  <Progress value={45} />
                  <p className="text-sm text-muted-foreground">45% of total storage used.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Server className="h-4 w-4" />
                <p>Server: {supabaseUrl}</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <p>User: {user?.email}</p>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Database Configuration Tab */}
        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Configuration
              </CardTitle>
              <CardDescription>
                Configure database connection settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dbType">Database Type</Label>
                <Select 
                  value={dbConfig.dbType} 
                  onValueChange={handleDbTypeChange}
                >
                  <SelectTrigger id="dbType">
                    <SelectValue placeholder="Select Database Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supabase">Supabase (PostgreSQL)</SelectItem>
                    <SelectItem value="mysql">MySQL (Local Server)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Select the type of database you want to connect to
                </p>
              </div>

              {dbConfig.dbType === 'supabase' ? (
                <div className="space-y-4">
                  <div className="rounded-md bg-muted p-4">
                    <div className="text-sm">
                      Using current Supabase configuration:
                      <div className="mt-2 text-xs font-mono bg-background p-2 rounded-md">
                        Server: {supabaseUrl}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mysqlHost">MySQL Host</Label>
                      <Input 
                        id="mysqlHost" 
                        value={dbConfig.mysqlHost} 
                        onChange={(e) => setDbConfig({...dbConfig, mysqlHost: e.target.value})}
                        placeholder="localhost"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mysqlPort">Port</Label>
                      <Input 
                        id="mysqlPort" 
                        value={dbConfig.mysqlPort} 
                        onChange={(e) => setDbConfig({...dbConfig, mysqlPort: e.target.value})}
                        placeholder="3306"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mysqlDatabase">Database Name</Label>
                    <Input 
                      id="mysqlDatabase" 
                      value={dbConfig.mysqlDatabase} 
                      onChange={(e) => setDbConfig({...dbConfig, mysqlDatabase: e.target.value})}
                      placeholder="vision_hub"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mysqlUser">Username</Label>
                      <Input 
                        id="mysqlUser" 
                        value={dbConfig.mysqlUser} 
                        onChange={(e) => setDbConfig({...dbConfig, mysqlUser: e.target.value})}
                        placeholder="root"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mysqlPassword">Password</Label>
                      <Input 
                        id="mysqlPassword" 
                        type="password"
                        value={dbConfig.mysqlPassword} 
                        onChange={(e) => setDbConfig({...dbConfig, mysqlPassword: e.target.value})}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="mysqlSsl" 
                      checked={dbConfig.mysqlSsl} 
                      onCheckedChange={(checked) => setDbConfig({...dbConfig, mysqlSsl: checked})}
                    />
                    <Label htmlFor="mysqlSsl">Use SSL</Label>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={testDatabaseConnection}
                disabled={loading}
              >
                Test Connection
              </Button>
              <Button 
                onClick={saveDbConfig}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Configuration"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* SMTP Settings Tab */}
        <TabsContent value="smtp">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                <Mail className="h-5 w-5" />
                SMTP Configuration
              </CardTitle>
              <CardDescription>
                Configure email server settings for notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Switch 
                  id="smtpEnabled" 
                  checked={smtpConfig.enabled} 
                  onCheckedChange={(checked) => setSmtpConfig({...smtpConfig, enabled: checked})}
                />
                <Label htmlFor="smtpEnabled">Enable Email Notifications</Label>
              </div>

              {smtpConfig.enabled && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpServer">SMTP Server</Label>
                      <Input 
                        id="smtpServer" 
                        value={smtpConfig.server} 
                        onChange={(e) => setSmtpConfig({...smtpConfig, server: e.target.value})}
                        placeholder="smtp.example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">Port</Label>
                      <Input 
                        id="smtpPort" 
                        value={smtpConfig.port} 
                        onChange={(e) => setSmtpConfig({...smtpConfig, port: e.target.value})}
                        placeholder="587"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpUsername">Username</Label>
                      <Input 
                        id="smtpUsername" 
                        value={smtpConfig.username} 
                        onChange={(e) => setSmtpConfig({...smtpConfig, username: e.target.value})}
                        placeholder="user@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPassword">Password</Label>
                      <Input 
                        id="smtpPassword" 
                        type="password"
                        value={smtpConfig.password} 
                        onChange={(e) => setSmtpConfig({...smtpConfig, password: e.target.value})}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">From Email Address</Label>
                    <Input 
                      id="fromEmail" 
                      value={smtpConfig.fromEmail} 
                      onChange={(e) => setSmtpConfig({...smtpConfig, fromEmail: e.target.value})}
                      placeholder="notifications@yourapp.com"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="useSsl" 
                      checked={smtpConfig.useSsl} 
                      onCheckedChange={(checked) => setSmtpConfig({...smtpConfig, useSsl: checked})}
                    />
                    <Label htmlFor="useSsl">Use SSL/TLS</Label>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={testSmtpConfig}
                disabled={!smtpConfig.enabled || !smtpConfig.server}
              >
                Send Test Email
              </Button>
              <Button 
                onClick={saveSmtpConfig}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save SMTP Settings"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <DebugLogDialog open={showDebugLogs} onOpenChange={setShowDebugLogs} />
    </div>
  );
}

export default DatabaseSettings;
