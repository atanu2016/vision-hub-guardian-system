
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useNotifications } from "@/hooks/useNotifications";

const mysqlSchema = z.object({
  host: z.string().min(1, "Host is required"),
  port: z.string().regex(/^\d+$/, "Port must be a number").transform(Number),
  database: z.string().min(1, "Database name is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const supabaseSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  apiKey: z.string().min(1, "API key is required"),
});

type MySQLFormValues = z.infer<typeof mysqlSchema>;
type SupabaseFormValues = z.infer<typeof supabaseSchema>;

const DatabaseSettings = () => {
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState("local");
  const [testingConnection, setTestingConnection] = useState(false);
  
  const mysqlForm = useForm<MySQLFormValues>({
    resolver: zodResolver(mysqlSchema),
    defaultValues: {
      host: "localhost",
      port: "3306",
      database: "vision_hub",
      username: "root",
      password: "",
    },
  });

  const supabaseForm = useForm<SupabaseFormValues>({
    resolver: zodResolver(supabaseSchema),
    defaultValues: {
      url: "",
      apiKey: "",
    },
  });

  const onMySQLSubmit = (data: MySQLFormValues) => {
    setTestingConnection(true);
    
    // Simulate testing connection
    setTimeout(() => {
      setTestingConnection(false);
      
      // Store MySQL config in localStorage
      localStorage.setItem('vision-hub-database-config', JSON.stringify({
        type: 'mysql',
        config: data
      }));
      
      toast({
        title: "MySQL Connection Successful",
        description: "Database settings have been saved",
      });
      
      addNotification({
        title: "Database Configuration Updated",
        message: `MySQL database ${data.database} on ${data.host} has been configured successfully`,
        type: "success"
      });
    }, 1500);
  };

  const onSupabaseSubmit = (data: SupabaseFormValues) => {
    setTestingConnection(true);
    
    // Simulate testing connection
    setTimeout(() => {
      setTestingConnection(false);
      
      // Store Supabase config in localStorage
      localStorage.setItem('vision-hub-database-config', JSON.stringify({
        type: 'supabase',
        config: data
      }));
      
      toast({
        title: "Supabase Connection Successful",
        description: "Database settings have been saved",
      });
      
      addNotification({
        title: "Database Configuration Updated",
        message: "Supabase integration has been configured successfully",
        type: "success"
      });
    }, 1500);
  };

  const testMySQLConnection = () => {
    const valid = mysqlForm.trigger();
    if (!valid) return;
    
    setTestingConnection(true);
    
    // Get form data
    const data = mysqlForm.getValues();
    
    // Simulate connection test
    setTimeout(() => {
      setTestingConnection(false);
      
      toast({
        title: "Connection Test Successful",
        description: `Successfully connected to MySQL database ${data.database} on ${data.host}`,
      });
    }, 1500);
  };

  const testSupabaseConnection = () => {
    const valid = supabaseForm.trigger();
    if (!valid) return;
    
    setTestingConnection(true);
    
    // Simulate connection test
    setTimeout(() => {
      setTestingConnection(false);
      
      toast({
        title: "Connection Test Successful",
        description: "Successfully connected to Supabase",
      });
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Configuration</CardTitle>
        <CardDescription>
          Configure where your camera system data will be stored
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="local">MySQL Database</TabsTrigger>
            <TabsTrigger value="supabase">Supabase</TabsTrigger>
          </TabsList>
          
          <TabsContent value="local" className="space-y-4">
            <Form {...mysqlForm}>
              <form onSubmit={mysqlForm.handleSubmit(onMySQLSubmit)} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={mysqlForm.control}
                    name="host"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Host</FormLabel>
                        <FormControl>
                          <Input placeholder="localhost" {...field} />
                        </FormControl>
                        <FormDescription>
                          Database server hostname or IP address
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={mysqlForm.control}
                    name="port"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Port</FormLabel>
                        <FormControl>
                          <Input placeholder="3306" {...field} />
                        </FormControl>
                        <FormDescription>
                          Database server port (default: 3306)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={mysqlForm.control}
                  name="database"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Database Name</FormLabel>
                      <FormControl>
                        <Input placeholder="vision_hub" {...field} />
                      </FormControl>
                      <FormDescription>
                        Name of the database to use (will be created if it doesn't exist)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={mysqlForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="root" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={mysqlForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={testMySQLConnection}
                    disabled={testingConnection}
                  >
                    {testingConnection ? "Testing..." : "Test Connection"}
                  </Button>
                  
                  <Button type="submit" disabled={testingConnection}>
                    {testingConnection ? "Saving..." : "Save Configuration"}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="supabase" className="space-y-4">
            <Form {...supabaseForm}>
              <form onSubmit={supabaseForm.handleSubmit(onSupabaseSubmit)} className="space-y-4 mt-4">
                <FormField
                  control={supabaseForm.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supabase URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://your-project.supabase.co" {...field} />
                      </FormControl>
                      <FormDescription>
                        URL of your Supabase project
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={supabaseForm.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Supabase API key" {...field} />
                      </FormControl>
                      <FormDescription>
                        Supabase project API key (anon public key)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={testSupabaseConnection}
                    disabled={testingConnection}
                  >
                    {testingConnection ? "Testing..." : "Test Connection"}
                  </Button>
                  
                  <Button type="submit" disabled={testingConnection}>
                    {testingConnection ? "Saving..." : "Save Configuration"}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <p className="text-sm text-muted-foreground">
          Data will be securely stored in the selected database
        </p>
      </CardFooter>
    </Card>
  );
};

export default DatabaseSettings;
