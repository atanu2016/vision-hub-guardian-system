
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, Server, Info, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { checkDatabaseSetup } from '@/services/databaseService';
import { supabase } from '@/integrations/supabase/client';

const DatabaseSettings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('supabase');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState<boolean | null>(null);
  const [mysqlDetails, setMysqlDetails] = useState({
    host: 'localhost',
    port: '3306',
    username: 'root',
    password: '',
    database: 'vision_hub'
  });

  // Check the database connection status when component mounts
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await checkDatabaseSetup();
        setIsDbConnected(isConnected);
      } catch (error) {
        console.error('Error checking database setup:', error);
        setIsDbConnected(false);
      }
    };
    
    checkConnection();
  }, []);

  const handleMySQLInputChange = (field: string, value: string) => {
    setMysqlDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      if (activeTab === 'supabase') {
        // Test Supabase connection by running a simple query
        const { error } = await supabase.from('cameras').select('id').limit(1);
        
        // If error code is PGRST109, the table doesn't exist but the connection is working
        const isConnected = !error || error.code === 'PGRST109';
        
        setIsDbConnected(isConnected);
        
        toast({
          title: isConnected ? "Connection successful!" : "Connection failed!",
          description: isConnected 
            ? "Successfully connected to Supabase database" 
            : "Could not connect to Supabase. Please check your credentials."
        });
      } else {
        // Simulating MySQL connection test
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast({
          title: "Connection successful!",
          description: "MySQL connection test passed. Note: This is a simulation in the demo."
        });
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setIsDbConnected(false);
      toast({
        title: "Connection failed",
        description: "Could not connect to the database. Please check your credentials.",
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Configuration</CardTitle>
        <CardDescription>
          Configure where your camera data and recordings will be stored
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="supabase" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>Supabase</span>
            </TabsTrigger>
            <TabsTrigger value="mysql" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              <span>MySQL</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="supabase" className="space-y-4 mt-4">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Supabase is a cloud database service that provides all the backend functionality you need.
              </p>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="supabase-url">Supabase URL</Label>
                  <Input 
                    id="supabase-url" 
                    value="https://csmsqglfbycodrqipbca.supabase.co"
                    readOnly 
                  />
                </div>
                
                {isDbConnected !== null && (
                  <Alert variant={isDbConnected ? "default" : "destructive"}>
                    <AlertDescription className="flex items-center gap-2">
                      {isDbConnected ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Your Supabase project is currently connected and active.</span>
                        </>
                      ) : (
                        <>
                          <Info className="h-4 w-4" />
                          <span>Unable to connect to Supabase. Please check your connection settings.</span>
                        </>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
            <Button onClick={testConnection} disabled={isTestingConnection} className="w-full">
              {isTestingConnection ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
          </TabsContent>
          <TabsContent value="mysql" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="mysql-host">Host</Label>
                  <Input 
                    id="mysql-host" 
                    value={mysqlDetails.host}
                    onChange={(e) => handleMySQLInputChange('host', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mysql-port">Port</Label>
                  <Input 
                    id="mysql-port" 
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={mysqlDetails.port}
                    onChange={(e) => handleMySQLInputChange('port', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mysql-username">Username</Label>
                <Input 
                  id="mysql-username" 
                  value={mysqlDetails.username}
                  onChange={(e) => handleMySQLInputChange('username', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mysql-password">Password</Label>
                <Input 
                  id="mysql-password" 
                  type="password" 
                  value={mysqlDetails.password}
                  onChange={(e) => handleMySQLInputChange('password', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mysql-database">Database</Label>
                <Input 
                  id="mysql-database" 
                  value={mysqlDetails.database}
                  onChange={(e) => handleMySQLInputChange('database', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Enter an existing database name or a new one that will be created
                </p>
              </div>
              <Alert variant="destructive">
                <AlertDescription className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <span>MySQL support is not available in this version.</span>
                </AlertDescription>
              </Alert>
            </div>
            <Button onClick={testConnection} disabled={isTestingConnection || true}>
              {isTestingConnection ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-xs text-muted-foreground">
          All database connections are encrypted and secure.
        </p>
      </CardFooter>
    </Card>
  );
};

export default DatabaseSettings;
