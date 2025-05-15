
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { UseFormReturn } from 'react-hook-form';
import { FirebaseMigrationFormValues } from './types';

interface MigrationOptionsProps {
  form: UseFormReturn<FirebaseMigrationFormValues>;
}

export default function MigrationOptions({ form }: MigrationOptionsProps) {
  return (
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
  );
}
