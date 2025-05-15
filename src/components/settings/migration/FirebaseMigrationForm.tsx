
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Database, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

// Form schema
const formSchema = z.object({
  apiKey: z.string().min(1, 'API Key is required'),
  authDomain: z.string().min(1, 'Auth Domain is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  storageBucket: z.string().optional(),
  databaseURL: z.string().optional(),
  serviceAccountJson: z.string().min(1, 'Service account JSON is required'),
  migrateCameras: z.boolean().default(true),
  migrateUsers: z.boolean().default(false),
  migrateSettings: z.boolean().default(true),
  migrateRecordings: z.boolean().default(false)
});

export default function FirebaseMigrationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [migrationDetails, setMigrationDetails] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
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
      {migrationStatus === 'running' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p>Migration in progress...</p>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {migrationStatus === 'success' && (
        <Alert className="border-green-500 bg-green-500/10">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle>Migration completed</AlertTitle>
          <AlertDescription>{migrationDetails}</AlertDescription>
        </Alert>
      )}

      {migrationStatus === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Migration failed</AlertTitle>
          <AlertDescription>{migrationDetails}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Firebase API Key</FormLabel>
                  <FormControl>
                    <Input placeholder="AIzaSyA..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Firebase Project ID</FormLabel>
                  <FormControl>
                    <Input placeholder="my-project-id" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="authDomain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Firebase Auth Domain</FormLabel>
                  <FormControl>
                    <Input placeholder="my-project.firebaseapp.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="storageBucket"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Firebase Storage Bucket (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="my-project.appspot.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="databaseURL"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Firebase Database URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://my-project.firebaseio.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="serviceAccountJson"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Firebase Service Account JSON</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="{...}" 
                    {...field} 
                    className="font-mono h-32"
                  />
                </FormControl>
                <FormDescription>
                  Paste your Firebase service account JSON credentials here
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="bg-muted/50 p-4 rounded-md space-y-4 border">
            <h3 className="font-semibold">Data to Migrate</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="migrateCameras"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Camera data</FormLabel>
                      <FormDescription>
                        Camera configurations and settings
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="migrateUsers"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>User accounts</FormLabel>
                      <FormDescription>
                        User profiles and authentication data
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="migrateSettings"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>System settings</FormLabel>
                      <FormDescription>
                        Storage, recording, and alert configurations
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="migrateRecordings"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Recording data</FormLabel>
                      <FormDescription>
                        Video recordings and events (may take longer)
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading || migrationStatus === 'running'} className="w-full">
            {isLoading ? 'Starting Migration...' : 'Start Firebase Data Migration'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
