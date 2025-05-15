
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Mail, Send } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const smtpSchema = z.object({
  enabled: z.boolean(),
  server: z.string().min(1, { message: "SMTP server is required" }).optional().or(z.literal('')),
  port: z.string().regex(/^\d+$/, { message: "Port must be a number" }).optional().or(z.literal('')),
  username: z.string().optional(),
  password: z.string().optional(),
  from_email: z.string().email({ message: "Please enter a valid email" }).optional().or(z.literal('')),
  use_ssl: z.boolean(),
});

type SMTPFormValues = z.infer<typeof smtpSchema>;

export default function SMTPSettings() {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  
  const form = useForm<SMTPFormValues>({
    resolver: zodResolver(smtpSchema),
    defaultValues: {
      enabled: false,
      server: '',
      port: '587',
      username: '',
      password: '',
      from_email: '',
      use_ssl: true,
    },
  });

  const isEnabled = form.watch("enabled");
  
  // Load SMTP settings when component mounts
  useState(() => {
    loadSMTPSettings();
  }, []);

  const loadSMTPSettings = async () => {
    try {
      setIsConfiguring(true);
      const { data, error } = await supabase
        .from('smtp_config')
        .select('*')
        .single();
        
      if (error) {
        console.error('Error loading SMTP settings:', error);
        toast.error("Failed to load SMTP settings");
        return;
      }
      
      if (data) {
        form.reset({
          enabled: data.enabled || false,
          server: data.server || '',
          port: data.port || '587',
          username: data.username || '',
          password: data.password || '',
          from_email: data.from_email || '',
          use_ssl: data.use_ssl === false ? false : true,
        });
      }
    } catch (error) {
      console.error('Error loading SMTP settings:', error);
      toast.error("Failed to load SMTP settings");
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleSaveSMTP = async (values: SMTPFormValues) => {
    try {
      setIsConfiguring(true);
      
      // If SMTP is enabled, validate required fields
      if (values.enabled) {
        if (!values.server) {
          toast.error("SMTP server is required when email is enabled");
          return;
        }
        
        if (!values.port) {
          toast.error("SMTP port is required when email is enabled");
          return;
        }
        
        if (!values.from_email) {
          toast.error("From email is required when email is enabled");
          return;
        }
      }
      
      // Update the SMTP configuration
      const { error } = await supabase
        .from('smtp_config')
        .update({
          enabled: values.enabled,
          server: values.server,
          port: values.port,
          username: values.username,
          password: values.password,
          from_email: values.from_email,
          use_ssl: values.use_ssl,
          updated_at: new Date(),
        })
        .eq('id', '1');
        
      if (error) {
        console.error('Error saving SMTP settings:', error);
        toast.error("Failed to save SMTP settings");
        return;
      }
      
      toast.success("SMTP settings saved successfully");
    } catch (error) {
      console.error('Error saving SMTP settings:', error);
      toast.error("Failed to save SMTP settings");
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast.error("Please enter a recipient email address");
      return;
    }
    
    if (!form.getValues("server") || !form.getValues("port") || !form.getValues("from_email")) {
      toast.error("Please fill out all required SMTP fields before sending a test");
      return;
    }
    
    try {
      setIsSending(true);
      
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: {
          host: form.getValues("server"),
          port: parseInt(form.getValues("port")),
          username: form.getValues("username"),
          password: form.getValues("password"),
          sender: form.getValues("from_email"),
          recipient: testEmail,
          secure: form.getValues("use_ssl"),
        }
      });
      
      if (error) {
        console.error('Error sending test email:', error);
        toast.error("Failed to send test email: " + error.message);
        return;
      }
      
      toast.success("Test email sent successfully");
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error("Failed to send test email");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          <span>SMTP Settings</span>
        </CardTitle>
        <CardDescription>
          Configure outgoing email server for notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSaveSMTP)}>
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Email Notifications</FormLabel>
                    <FormDescription>
                      Enable email notifications for alerts and system events
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
            
            {isEnabled && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="server"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Server</FormLabel>
                        <FormControl>
                          <Input placeholder="smtp.example.com" {...field} />
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
                          <Input placeholder="587" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="username" {...field} />
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
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="from_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Email</FormLabel>
                      <FormControl>
                        <Input placeholder="alerts@your-domain.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="use_ssl"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Use SSL/TLS</FormLabel>
                        <FormDescription>
                          Enable secure connection for email sending
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
                
                <div className="flex flex-col space-y-2 pt-4">
                  <div className="text-sm font-medium">Send Test Email</div>
                  <div className="text-sm text-muted-foreground">
                    Verify your SMTP settings by sending a test email
                  </div>
                  
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="recipient@example.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSendTestEmail}
                      disabled={isSending}
                    >
                      {isSending ? (
                        <>Sending...</>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Test
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
            
            <CardFooter className="flex justify-end px-0 pt-4">
              <Button 
                type="submit" 
                disabled={isConfiguring}
              >
                {isConfiguring ? "Saving..." : "Save Settings"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
