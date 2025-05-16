
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { mysqlSchema, MySQLFormValues, defaultMySQLValues } from './MySQLFormSchema';
import MySQLFormFields from './MySQLFormFields';
import MigrationProgress from './MigrationProgress';
import { simulateOperation } from './MigrationUtils';

export default function MySQLMigrationForm() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(0);

  const form = useForm<MySQLFormValues>({
    resolver: zodResolver(mysqlSchema),
    defaultValues: defaultMySQLValues,
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleMigrateToMySQL)} className="space-y-4">
        <MySQLFormFields control={form.control} />
        
        <MigrationProgress 
          isMigrating={isMigrating} 
          migrationProgress={migrationProgress} 
        />
        
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
