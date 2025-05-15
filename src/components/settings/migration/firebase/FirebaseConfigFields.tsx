
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { FirebaseMigrationFormValues } from './types';

interface FirebaseConfigFieldsProps {
  form: UseFormReturn<FirebaseMigrationFormValues>;
}

export default function FirebaseConfigFields({ form }: FirebaseConfigFieldsProps) {
  return (
    <>
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
    </>
  );
}
