
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import FirebaseConfigFields from './firebase/FirebaseConfigFields';
import MigrationOptions from './firebase/MigrationOptions';
import MigrationStatus from './firebase/MigrationStatus';
import { firebaseMigrationFormSchema, FirebaseMigrationFormValues } from './firebase/types';

export default function FirebaseMigrationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [migrationDetails, setMigrationDetails] = useState<string | null>(null);

  const form = useForm<FirebaseMigrationFormValues>({
    resolver: zodResolver(firebaseMigrationFormSchema),
    defaultValues: {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      databaseURL: '',
      serviceAccountJson: '',
      migrateCameras: true,
      migrateUsers: false,
      migrateSettings: true,
      migrateRecordings: false
    }
  });

  const onSubmit = async (values: FirebaseMigrationFormValues) => {
    try {
      if (!confirm('This operation will migrate data from Firebase to your current Supabase instance. This may override existing data. Are you sure you want to continue?')) {
        return;
      }
      
      setIsLoading(true);
      setProgress(0);
      setMigrationStatus('running');
      setMigrationDetails(null);

      // Call the edge function for migration
      const { data, error } = await supabase.functions.invoke('data-migration', {
        body: {
          source: 'firebase',
          config: {
            apiKey: values.apiKey,
            authDomain: values.authDomain,
            projectId: values.projectId,
            storageBucket: values.storageBucket,
            databaseURL: values.databaseURL,
            serviceAccountJson: values.serviceAccountJson,
          },
          options: {
            migrateCameras: values.migrateCameras,
            migrateUsers: values.migrateUsers,
            migrateSettings: values.migrateSettings,
            migrateRecordings: values.migrateRecordings,
          }
        }
      });

      if (error) {
        throw new Error(`Migration error: ${error.message}`);
      }

      // Simulate progress (real progress would come from webhook callbacks)
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 5;
        });
      }, 1000);

      // Wait for migration to complete (this would normally happen asynchronously)
      setTimeout(() => {
        clearInterval(progressInterval);
        setProgress(100);
        setMigrationStatus('success');
        setMigrationDetails(data?.message || 'Migration completed successfully');
        toast.success('Firebase migration complete!', {
          description: `Successfully migrated the selected data from Firebase`
        });
      }, 20000);

    } catch (error: any) {
      console.error('Firebase migration error:', error);
      setMigrationStatus('error');
      setMigrationDetails(error.message);
      toast.error('Migration failed', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <MigrationStatus 
        status={migrationStatus}
        progress={progress}
        details={migrationDetails}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FirebaseConfigFields form={form} />
          <MigrationOptions form={form} />

          <Button type="submit" disabled={isLoading || migrationStatus === 'running'} className="w-full">
            {isLoading ? 'Starting Migration...' : 'Start Firebase Data Migration'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
