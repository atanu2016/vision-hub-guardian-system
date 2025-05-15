
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, RefreshCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
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

const supabaseSchema = z.object({
  url: z.string().url({ message: "Please enter a valid Supabase URL" }),
  anonKey: z.string().min(1, { message: "Anon key is required" }),
});

type SupabaseFormValues = z.infer<typeof supabaseSchema>;

export default function SupabaseConnectionForm() {
  const [isConfiguring, setIsConfiguring] = useState(false);

  const form = useForm<SupabaseFormValues>({
    resolver: zodResolver(supabaseSchema),
    defaultValues: {
      url: "",
      anonKey: "",
    },
  });

  const handleConnectToSupabase = async (values: SupabaseFormValues) => {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleConnectToSupabase)} className="space-y-4">
        <FormField
          control={form.control}
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
          control={form.control}
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
  );
}
