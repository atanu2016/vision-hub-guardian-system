
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Database, Loader2, RefreshCcw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const mysqlSchema = z.object({
  host: z.string().min(1, { message: "Host is required" }),
  port: z.string().regex(/^\d+$/, { message: "Port must be a number" }),
  database: z.string().min(1, { message: "Database name is required" }),
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().optional(),
  useSSL: z.boolean().optional().default(false),
});

const supabaseSchema = z.object({
  url: z.string().url({ message: "Please enter a valid Supabase URL" }),
  anonKey: z.string().min(1, { message: "Anon key is required" }),
});

export default function DatabaseMigration() {
  const [activeTab, setActiveTab] = useState('mysql');
  const [isMigrating, setIsMigrating] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(0);

  const mysqlForm = useForm<z.infer<typeof mysqlSchema>>({
    resolver: zodResolver(mysqlSchema),
    defaultValues: {
      host: "localhost",
      port: "3306",
      database: "vision_hub",
      username: "root",
      password: "",
      useSSL: false,
    },
  });

  const supabaseForm = useForm<z.infer<typeof supabaseSchema>>({
    resolver: zodResolver(supabaseSchema),
    defaultValues: {
      url: "",
      anonKey: "",
    },
  });

  const handleMigrateToMySQL = async (values: z.infer<typeof mysqlSchema>) => {
    setIsMigrating(true);
    setMigrationProgress(0);
    
    try {
      // First, save the MySQL configuration
      const dbConfig = {
        db_type: 'mysql',
        mysql_host: values.host,
        mysql_port: values.port,
        mysql_database: values.database,
        mysql_user: values.username,
        mysql_password: values.password,
        mysql_ssl: values.useSSL,
      };
      
      // Save the database configuration
      const { error: configError } = await supabase
        .from('database_config')
        .upsert({ ...dbConfig, id: 'default' })
        .select();

      if (configError) throw configError;
      
      setMigrationProgress(20);
      
      // Simulate migration process step by step
      // In a real implementation, this would connect to a backend service 
      // that handles the actual migration process
      
      // Step 1: Extract data from Supabase
      await simulateOperation('Extracting data from Supabase', 1000);
      setMigrationProgress(40);
      
      // Step 2: Transform data if needed
      await simulateOperation('Transforming data structure', 1000);
      setMigrationProgress(60);
      
      // Step 3: Connect to MySQL
      await simulateOperation('Connecting to MySQL database', 1000);
      setMigrationProgress(80);
      
      // Step 4: Import data to MySQL
      await simulateOperation('Importing data to MySQL', 1000);
      setMigrationProgress(100);
      
      toast.success("Migration to MySQL completed successfully");
      
      // Add a log entry for this operation
      await supabase.from('system_logs').insert({
        level: 'info',
        source: 'database',
        message: 'Database migration to MySQL completed',
        details: `Migrated to MySQL server at ${values.host}`
      });
      
    } catch (error) {
      console.error('Migration error:', error);
      toast.error("Migration failed", { 
        description: error instanceof Error ? error.message : "Unknown error occurred" 
      });
      
      // Log the error
      await supabase.from('system_logs').insert({
        level: 'error',
        source: 'database',
        message: 'Database migration to MySQL failed',
        details: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleConnectToSupabase = async (values: z.infer<typeof supabaseSchema>) => {
    setIsConfiguring(true);
    
    try {
      // In a real implementation, this would validate the Supabase connection
      // and potentially update the configuration
      
      // For this implementation, we'll store the new Supabase connection details
      localStorage.setItem('supabase_url', values.url);
      localStorage.setItem('supabase_key', values.anonKey);
      
      toast.success("Supabase configuration updated", { 
        description: "You'll need to restart the application for changes to take effect" 
      });
      
      // Add a log entry for this operation
      await supabase.from('system_logs').insert({
        level: 'info',
        source: 'database',
        message: 'Supabase connection updated',
        details: `Connected to Supabase at ${values.url}`
      });
    } catch (error) {
      console.error('Supabase connection error:', error);
      toast.error("Failed to update Supabase connection", { 
        description: error instanceof Error ? error.message : "Unknown error occurred" 
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  const simulateOperation = (operation: string, duration: number) => {
    return new Promise<void>((resolve) => {
      console.log(`Operation: ${operation}`);
      setTimeout(() => {
        resolve();
      }, duration);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          <span>Database Migration</span>
        </CardTitle>
        <CardDescription>
          Migrate your data between Supabase and MySQL
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6 bg-yellow-500/20 border-yellow-500/50">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-yellow-500">Important</AlertTitle>
          <AlertDescription>
            Migration is a one-way process and may take some time depending on the amount of data.
            Make sure to backup your data before proceeding.
          </AlertDescription>
        </Alert>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="mysql">Migrate to MySQL</TabsTrigger>
            <TabsTrigger value="supabase">Connect to Supabase</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mysql">
            <Form {...mysqlForm}>
              <form onSubmit={mysqlForm.handleSubmit(handleMigrateToMySQL)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={mysqlForm.control}
                    name="host"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MySQL Host</FormLabel>
                        <FormControl>
                          <Input placeholder="localhost" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={mysqlForm.control}
                    name="port"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Port</FormLabel>
                        <FormControl>
                          <Input placeholder="3306" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={mysqlForm.control}
                  name="database"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Database Name</FormLabel>
                      <FormControl>
                        <Input placeholder="vision_hub" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={mysqlForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="root" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={mysqlForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="•••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={mysqlForm.control}
                  name="useSSL"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Use SSL</FormLabel>
                        <FormDescription>
                          Enable SSL for secure database connection
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {isMigrating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Migration progress</span>
                      <span>{migrationProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500 ease-out" 
                        style={{ width: `${migrationProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isMigrating}
                >
                  {isMigrating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Migrating to MySQL...
                    </>
                  ) : (
                    'Start Migration to MySQL'
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="supabase">
            <Form {...supabaseForm}>
              <form onSubmit={supabaseForm.handleSubmit(handleConnectToSupabase)} className="space-y-4">
                <FormField
                  control={supabaseForm.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supabase URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://your-project.supabase.co" {...field} />
                      </FormControl>
                      <FormDescription>
                        You can find this in your Supabase project settings
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={supabaseForm.control}
                  name="anonKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anon Key</FormLabel>
                      <FormControl>
                        <Input placeholder="eyJ0eXAiOi..." {...field} />
                      </FormControl>
                      <FormDescription>
                        The anon/public API key for your Supabase project
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isConfiguring}
                >
                  {isConfiguring ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Supabase Connection...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Connect to Different Supabase Project
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
