import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";
import { Globe, Mail, Settings } from "lucide-react";

const generalFormSchema = z.object({
  systemName: z.string().min(2, "System name must be at least 2 characters"),
  language: z.string(),
  timezone: z.string(),
  darkMode: z.boolean(),
  autoUpdate: z.boolean(),
});

type GeneralFormValues = z.infer<typeof generalFormSchema>;

const smtpFormSchema = z.object({
  smtpHost: z.string().min(1, "SMTP host is required"),
  smtpPort: z.string().min(1, "SMTP port is required"),
  smtpUsername: z.string().min(1, "SMTP username is required"),
  smtpPassword: z.string().min(1, "SMTP password is required"),
  smtpSender: z.string().email("Must be a valid email"),
  smtpSecure: z.boolean(),
  enableEmailNotifications: z.boolean(),
  enablePushNotifications: z.boolean(),
  enableMotionAlerts: z.boolean(),
  enableOfflineAlerts: z.boolean(),
});

type SmtpFormValues = z.infer<typeof smtpFormSchema>;

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Español (Spanish)" },
  { value: "fr", label: "Français (French)" },
  { value: "de", label: "Deutsch (German)" },
  { value: "it", label: "Italiano (Italian)" },
  { value: "pt", label: "Português (Portuguese)" },
  { value: "ru", label: "Русский (Russian)" },
  { value: "ja", label: "日本語 (Japanese)" },
  { value: "zh", label: "中文 (Chinese)" },
  { value: "ar", label: "العربية (Arabic)" },
  { value: "hi", label: "हिन्दी (Hindi)" },
];

const timezones = [
  { value: "utc", label: "UTC (Coordinated Universal Time)" },
  { value: "est", label: "EST (Eastern Standard Time)" },
  { value: "cst", label: "CST (Central Standard Time)" },
  { value: "mst", label: "MST (Mountain Standard Time)" },
  { value: "pst", label: "PST (Pacific Standard Time)" },
  { value: "gmt", label: "GMT (Greenwich Mean Time)" },
  { value: "cet", label: "CET (Central European Time)" },
  { value: "eet", label: "EET (Eastern European Time)" },
  { value: "jst", label: "JST (Japan Standard Time)" },
  { value: "ist", label: "IST (Indian Standard Time)" },
  { value: "aest", label: "AEST (Australian Eastern Standard Time)" },
];

const Settings = () => {
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [isTesting, setIsTesting] = useState(false);
  
  const generalForm = useForm<GeneralFormValues>({
    resolver: zodResolver(generalFormSchema),
    defaultValues: {
      systemName: "Vision Hub",
      language: "en",
      timezone: "utc",
      darkMode: true,
      autoUpdate: true,
    },
  });

  const notificationsForm = useForm<SmtpFormValues>({
    resolver: zodResolver(smtpFormSchema),
    defaultValues: {
      smtpHost: "",
      smtpPort: "587",
      smtpUsername: "",
      smtpPassword: "",
      smtpSender: "",
      smtpSecure: true,
      enableEmailNotifications: true,
      enablePushNotifications: true,
      enableMotionAlerts: true,
      enableOfflineAlerts: true,
    },
  });

  const onGeneralSubmit = (data: GeneralFormValues) => {
    console.log("General form data:", data);
    toast({
      title: "Settings Updated",
      description: "Your general settings have been saved.",
    });
    
    addNotification({
      title: "Settings Updated",
      message: "Your system settings have been updated successfully",
      type: "success"
    });
  };

  const onNotificationsSubmit = (data: SmtpFormValues) => {
    console.log("Notification form data:", data);
    toast({
      title: "Notification Settings Updated",
      description: "Your notification settings have been saved.",
    });
    
    addNotification({
      title: "Notification Settings Updated",
      message: "Your notification preferences have been updated successfully",
      type: "success"
    });
  };

  const testSmtpConnection = async () => {
    const formData = notificationsForm.getValues();
    setIsTesting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsTesting(false);
      toast({
        title: "SMTP Test Successful",
        description: "Connection to SMTP server was successful.",
      });
      
      addNotification({
        title: "SMTP Test",
        message: "Test email has been sent successfully",
        type: "success"
      });
    }, 2000);
  };
  
  // Update system language
  const handleLanguageChange = (value: string) => {
    generalForm.setValue("language", value);
    
    // In a real application, you would use i18n library here
    toast({
      title: "Language Changed",
      description: `Interface language changed to ${languages.find(lang => lang.value === value)?.label}`,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your system settings and preferences.
          </p>
        </div>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 h-auto">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>
                  View and update your system settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...generalForm}>
                  <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={generalForm.control}
                        name="systemName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>System Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={generalForm.control}
                        name="timezone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Timezone</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-[300px]">
                                {timezones.map((timezone) => (
                                  <SelectItem 
                                    key={timezone.value} 
                                    value={timezone.value}
                                  >
                                    {timezone.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Choose your local timezone
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Separator />
                    
                    <FormField
                      control={generalForm.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language</FormLabel>
                          <Select 
                            onValueChange={(value) => handleLanguageChange(value)}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {languages.map((language) => (
                                <SelectItem 
                                  key={language.value} 
                                  value={language.value}
                                >
                                  {language.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Interface language preference
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Separator />
                    
                    <FormField
                      control={generalForm.control}
                      name="darkMode"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Dark Mode</FormLabel>
                            <FormDescription>
                              Enable dark mode for the application
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={generalForm.control}
                      name="autoUpdate"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Auto Updates</FormLabel>
                            <FormDescription>
                              Automatically update the application when new versions are available
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end">
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="storage" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Storage Settings</CardTitle>
                <CardDescription>
                  Configure your storage settings for recordings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  For detailed storage configuration including NAS and Cloud options, please visit the dedicated Storage Settings page.
                </p>
                
                <Button asChild>
                  <a href="/settings/storage">Go to Storage Settings</a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how you want to receive alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationsForm}>
                  <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center">
                        <Mail className="mr-2 h-5 w-5" />
                        SMTP Configuration
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Configure your SMTP server to send email notifications
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={notificationsForm.control}
                          name="smtpHost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SMTP Host</FormLabel>
                              <FormControl>
                                <Input placeholder="smtp.example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationsForm.control}
                          name="smtpPort"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SMTP Port</FormLabel>
                              <FormControl>
                                <Input placeholder="587" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={notificationsForm.control}
                          name="smtpUsername"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SMTP Username</FormLabel>
                              <FormControl>
                                <Input placeholder="user@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationsForm.control}
                          name="smtpPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SMTP Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={notificationsForm.control}
                        name="smtpSender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sender Email</FormLabel>
                            <FormControl>
                              <Input placeholder="visionhub@example.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Email address that will be used as the sender
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationsForm.control}
                        name="smtpSecure"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Use Secure Connection (TLS/SSL)</FormLabel>
                              <FormDescription>
                                Enable secure connection for SMTP server
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-start space-x-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={testSmtpConnection} 
                          disabled={isTesting}
                        >
                          {isTesting ? "Testing..." : "Test Connection"}
                        </Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <h3 className="text-lg font-medium">Notification Preferences</h3>
                    
                    <FormField
                      control={notificationsForm.control}
                      name="enableEmailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Email Notifications</FormLabel>
                            <FormDescription>
                              Receive email alerts for important events
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationsForm.control}
                      name="enablePushNotifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Push Notifications</FormLabel>
                            <FormDescription>
                              Receive push notifications in your browser
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationsForm.control}
                      name="enableMotionAlerts"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Motion Detection Alerts</FormLabel>
                            <FormDescription>
                              Get notified when motion is detected
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationsForm.control}
                      name="enableOfflineAlerts"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Camera Offline Alerts</FormLabel>
                            <FormDescription>
                              Get notified when a camera goes offline
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end">
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch id="two-factor" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="session-timeout">Auto Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically log out after 30 minutes of inactivity
                    </p>
                  </div>
                  <Switch id="session-timeout" defaultChecked />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" className="mr-2">
                  Cancel
                </Button>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="advanced" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Configure advanced system settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="port">Server Port</Label>
                  <Input id="port" defaultValue="8080" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="log-level">Log Level</Label>
                  <Select defaultValue="info">
                    <SelectTrigger id="log-level">
                      <SelectValue placeholder="Select log level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debug">Debug</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="debug-mode">Debug Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable detailed logging for troubleshooting
                    </p>
                  </div>
                  <Switch id="debug-mode" />
                </div>
                
                <div className="pt-4">
                  <Button variant="destructive">Reset All Settings</Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" className="mr-2">
                  Cancel
                </Button>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Settings;
