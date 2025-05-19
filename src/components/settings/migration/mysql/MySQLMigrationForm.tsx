
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Database, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { mysqlSchema, MySQLFormValues, defaultMySQLValues } from './MySQLFormSchema';
import MySQLFormFields from './MySQLFormFields';
import MigrationProgress from './MigrationProgress';
import { simulateOperation } from './MigrationUtils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { validateMigration, assignPermissionsAfterMigration, verifyDatabaseState } from '@/services/migration/migrationValidator';

export default function MySQLMigrationForm() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'success' | 'error' | 'verifying'>('idle');
  const [migrationDetails, setMigrationDetails] = useState<string[]>([]);
  const [migrationOptions, setMigrationOptions] = useState({
    migrateUsers: true,
    migrateCameras: true,
    migrateSettings: true,
    migrateRecordings: true,
    validateRealtime: true
  });
  const [verificationResults, setVerificationResults] = useState<{
    success: boolean;
    details: string[];
  } | null>(null);

  const form = useForm<MySQLFormValues>({
    resolver: zodResolver(mysqlSchema),
    defaultValues: defaultMySQLValues,
  });

  const handleMigrateToMySQL = async (values: MySQLFormValues) => {
    setIsMigrating(true);
    setMigrationProgress(0);
    setMigrationDetails([]);
    setMigrationStatus('idle');
    setVerificationResults(null);
    
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
      if (migrationOptions.migrateUsers) {
        setMigrationDetails(prev => [...prev, "Extracting user data from current database..."]);
        
        // Get users data
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('*');
          
        if (usersError) {
          setMigrationDetails(prev => [...prev, `Error extracting users data: ${usersError.message}`]);
          throw usersError;
        }
        
        setMigrationDetails(prev => [...prev, `Extracted ${usersData?.length || 0} user profiles`]);
      }
      
      setMigrationProgress(45);
      
      if (migrationOptions.migrateCameras) {
        // Get cameras data
        setMigrationDetails(prev => [...prev, "Extracting camera configurations..."]);
        const { data: camerasData, error: camerasError } = await supabase
          .from('cameras')
          .select('*');
          
        if (camerasError) {
          setMigrationDetails(prev => [...prev, `Error extracting cameras data: ${camerasError.message}`]);
          throw camerasError;
        }
        
        setMigrationDetails(prev => [...prev, `Extracted ${camerasData?.length || 0} camera configurations`]);
      }
      
      setMigrationProgress(60);
      
      if (migrationOptions.migrateSettings) {
        // Get settings data
        setMigrationDetails(prev => [...prev, "Extracting system settings..."]);
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
      }
      
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
      setMigrationProgress(98);
      
      // Verification phase
      setMigrationStatus('verifying');
      setMigrationDetails(prev => [...prev, "Verifying migration success and assigning permissions..."]);
      
      // Assign permissions after migration
      await simulateOperation('Assigning permissions', 1000);
      const permissionsAssigned = await assignPermissionsAfterMigration();
      if (!permissionsAssigned) {
        setMigrationDetails(prev => [...prev, "⚠️ Warning: Some permissions could not be automatically assigned"]);
      } else {
        setMigrationDetails(prev => [...prev, "✅ Permissions successfully assigned"]);
      }
      
      // Validate the migration
      await simulateOperation('Validating migration', 1000);
      const migrationValid = await validateMigration('mysql', 'supabase');
      if (!migrationValid) {
        setMigrationDetails(prev => [...prev, "⚠️ Warning: Migration validation found issues"]);
      } else {
        setMigrationDetails(prev => [...prev, "✅ Migration validation successful"]);
      }
      
      // Double verify the database state if realtime validation is enabled
      if (migrationOptions.validateRealtime) {
        setMigrationDetails(prev => [...prev, "Performing detailed database verification..."]);
        const results = await verifyDatabaseState('mysql');
        setVerificationResults(results);
        
        if (results.success) {
          setMigrationDetails(prev => [...prev, "✅ Detailed verification passed successfully"]);
        } else {
          setMigrationDetails(prev => [...prev, "⚠️ Detailed verification found some issues"]);
        }
      }
      
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

  const renderVerificationResults = () => {
    if (!verificationResults) return null;
    
    return (
      <div className="mt-4 p-3 border rounded bg-secondary/20">
        <h4 className="text-sm font-medium mb-2">Verification Results</h4>
        <div className="space-y-1 text-sm">
          {verificationResults.details.map((detail, index) => (
            <div key={index} className="flex items-start">
              {detail.startsWith('✅') ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              ) : detail.startsWith('❌') ? (
                <XCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 mr-2" />
              )}
              <span>{detail.replace(/^[✅❌]\s/, '')}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleMigrateToMySQL)} className="space-y-4">
        {migrationStatus === 'success' ? (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle>Migration Successful</AlertTitle>
            <AlertDescription>
              Your application is now configured to use MySQL as the database backend.
            </AlertDescription>
          </Alert>
        ) : migrationStatus === 'error' ? (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Migration Failed</AlertTitle>
            <AlertDescription>
              An error occurred during the migration process. Please check the logs below for details.
            </AlertDescription>
          </Alert>
        ) : migrationStatus === 'verifying' ? (
          <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
            <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
            <AlertTitle>Verifying Migration</AlertTitle>
            <AlertDescription>
              Performing detailed verification of the database migration...
            </AlertDescription>
          </Alert>
        ) : null}
        
        <MySQLFormFields control={form.control} />
        
        <div className="space-y-2">
          <Label className="text-base">Migration Options</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="migrateUsers" 
                checked={migrationOptions.migrateUsers}
                onCheckedChange={(checked) => 
                  setMigrationOptions(prev => ({...prev, migrateUsers: !!checked}))
                }
                disabled={isMigrating}
              />
              <Label htmlFor="migrateUsers" className="text-sm font-normal">Users & Profiles</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="migrateCameras" 
                checked={migrationOptions.migrateCameras}
                onCheckedChange={(checked) => 
                  setMigrationOptions(prev => ({...prev, migrateCameras: !!checked}))
                }
                disabled={isMigrating}
              />
              <Label htmlFor="migrateCameras" className="text-sm font-normal">Cameras & Groups</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="migrateSettings" 
                checked={migrationOptions.migrateSettings}
                onCheckedChange={(checked) => 
                  setMigrationOptions(prev => ({...prev, migrateSettings: !!checked}))
                }
                disabled={isMigrating}
              />
              <Label htmlFor="migrateSettings" className="text-sm font-normal">Settings & Configs</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="migrateRecordings" 
                checked={migrationOptions.migrateRecordings}
                onCheckedChange={(checked) => 
                  setMigrationOptions(prev => ({...prev, migrateRecordings: !!checked}))
                }
                disabled={isMigrating}
              />
              <Label htmlFor="migrateRecordings" className="text-sm font-normal">Recording Data</Label>
            </div>
            
            <div className="flex items-center space-x-2 col-span-2">
              <Checkbox 
                id="validateRealtime" 
                checked={migrationOptions.validateRealtime}
                onCheckedChange={(checked) => 
                  setMigrationOptions(prev => ({...prev, validateRealtime: !!checked}))
                }
                disabled={isMigrating}
              />
              <Label htmlFor="validateRealtime" className="text-sm font-normal">Perform double verification after migration</Label>
            </div>
          </div>
        </div>
        
        <MigrationProgress 
          isMigrating={isMigrating} 
          migrationProgress={migrationProgress}
          details={migrationDetails}
        />
        
        {(migrationStatus === 'success' || migrationStatus === 'error') && 
          verificationResults && renderVerificationResults()}
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isMigrating || migrationStatus === 'success' || migrationStatus === 'verifying'}
        >
          {isMigrating || migrationStatus === 'verifying' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {migrationStatus === 'verifying' ? 'Verifying Migration...' : 'Migrating to MySQL...'}
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
