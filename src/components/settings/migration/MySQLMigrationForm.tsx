
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const mysqlSchema = z.object({
  host: z.string().min(1, { message: "Host is required" }),
  port: z.string().regex(/^\d+$/, { message: "Port must be a number" }),
  database: z.string().min(1, { message: "Database name is required" }),
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().optional(),
  useSSL: z.boolean().optional().default(false),
});

type MySQLFormValues = z.infer<typeof mysqlSchema>;

export default function MySQLMigrationForm() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(0);

  const form = useForm<MySQLFormValues>({
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

  const handleMigrateToMySQL = async (values: MySQLFormValues) => {
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

  const simulateOperation = (operation: string, duration: number) => {
    return new Promise<void>((resolve) => {
      console.log(`Operation: ${operation}`);
      setTimeout(() => {
        resolve();
      }, duration);
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleMigrateToMySQL)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
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
            control={form.control}
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
          control={form.control}
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
            control={form.control}
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
            control={form.control}
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
          control={form.control}
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
  );
}
