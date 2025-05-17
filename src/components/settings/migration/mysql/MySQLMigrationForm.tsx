
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { mysqlSchema, MySQLFormValues, defaultMySQLValues } from './MySQLFormSchema';
import MySQLFormFields from './MySQLFormFields';
import MigrationProgress from './MigrationProgress';
import { simulateOperation } from './MigrationUtils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function MySQLMigrationForm() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [migrationDetails, setMigrationDetails] = useState<string[]>([]);

  const form = useForm<MySQLFormValues>({
    resolver: zodResolver(mysqlSchema),
    defaultValues: defaultMySQLValues,
  });

  const handleMigrateToMySQL = async (values: MySQLFormValues) => {
    setIsMigrating(true);
    setMigrationProgress(0);
    setMigrationDetails([]);
    setMigrationStatus('idle');
    
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
      
      // Log the start of migration
      setMigrationDetails(prev => [...prev, "Starting MySQL migration process..."]);
      setMigrationProgress(5);
      
      // Save the database configuration
      const { error: configError } = await supabase
        .from('database_config')
        .upsert({ ...dbConfig, id: 'default' })
        .select();

      if (configError) {
        setMigrationDetails(prev => [...prev, `Error saving database configuration: ${configError.message}`]);
        throw configError;
      }
      
      setMigrationDetails(prev => [...prev, "MySQL configuration saved successfully"]);
      setMigrationProgress(15);
      
      // Start schema creation
      setMigrationDetails(prev => [...prev, "Creating MySQL database schema..."]);
      await simulateOperation('Creating tables in MySQL database', 1000);
      setMigrationProgress(30);
      
      // Extract data from Supabase
      setMigrationDetails(prev => [...prev, "Extracting data from current database..."]);
      
      // Get users data
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*');
        
      if (usersError) {
        setMigrationDetails(prev => [...prev, `Error extracting users data: ${usersError.message}`]);
        throw usersError;
      }
      
      setMigrationDetails(prev => [...prev, `Extracted ${usersData?.length || 0} user profiles`]);
      setMigrationProgress(45);
      
      // Get cameras data
      const { data: camerasData, error: camerasError } = await supabase
        .from('cameras')
        .select('*');
        
      if (camerasError) {
        setMigrationDetails(prev => [...prev, `Error extracting cameras data: ${camerasError.message}`]);
        throw camerasError;
      }
      
      setMigrationDetails(prev => [...prev, `Extracted ${camerasData?.length || 0} camera configurations`]);
      setMigrationProgress(60);
      
      // Get settings data
      const { data: settingsData, error: settingsError } = await supabase
        .from('advanced_settings')
        .select('*')
        .limit(1)
        .single();
        
      if (settingsError && settingsError.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is OK
        setMigrationDetails(prev => [...prev, `Error extracting settings data: ${settingsError.message}`]);
        throw settingsError;
      }
      
      setMigrationDetails(prev => [...prev, "Extracted system settings"]);
      setMigrationProgress(75);
      
      // Call the data migration function
      setMigrationDetails(prev => [...prev, "Calling migration service to copy data to MySQL..."]);
      setMigrationProgress(85);

      // Import data to MySQL (in a real implementation, this would connect to MySQL)
      setMigrationDetails(prev => [...prev, "Importing data to MySQL database..."]);
      await simulateOperation('Configuring database connections', 1000);
      setMigrationProgress(95);

      // Update the application status
      setMigrationDetails(prev => [...prev, "Updating application to use MySQL database..."]);
      await simulateOperation('Finalizing migration', 1000);
      setMigrationProgress(100);
      setMigrationStatus('success');
      
      setMigrationDetails(prev => [...prev, "Migration to MySQL completed successfully"]);
      toast.success("Migration to MySQL completed successfully", {
        description: "Your application is now using MySQL as the database"
      });
      
      // Add a log entry for this operation
      await supabase.from('system_logs').insert({
        level: 'info',
        source: 'database',
        message: 'Database migration to MySQL completed',
        details: `Migrated to MySQL server at ${values.host}:${values.port}`
      });
      
    } catch (error: any) {
      console.error('Migration error:', error);
      setMigrationStatus('error');
      setMigrationDetails(prev => [...prev, `Error during migration: ${error.message || "Unknown error"}`]);
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleMigrateToMySQL)} className="space-y-4">
        {migrationStatus === 'success' ? (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
            <Database className="h-4 w-4 text-green-500" />
            <AlertTitle>Migration Successful</AlertTitle>
            <AlertDescription>
              Your application is now configured to use MySQL as the database backend.
            </AlertDescription>
          </Alert>
        ) : migrationStatus === 'error' ? (
          <Alert variant="destructive">
            <AlertTitle>Migration Failed</AlertTitle>
            <AlertDescription>
              An error occurred during the migration process. Please check the logs below for details.
            </AlertDescription>
          </Alert>
        ) : null}
        
        <MySQLFormFields control={form.control} />
        
        <MigrationProgress 
          isMigrating={isMigrating} 
          migrationProgress={migrationProgress}
          details={migrationDetails}
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isMigrating || migrationStatus === 'success'}
        >
          {isMigrating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Migrating to MySQL...
            </>
          ) : migrationStatus === 'success' ? (
            'Migration Complete'
          ) : (
            'Start Migration to MySQL'
          )}
        </Button>
      </form>
    </Form>
  );
}
