
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Database, Server, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DatabaseSettings = () => {
  const [activeTab, setActiveTab] = useState('supabase');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isCreatingTables, setIsCreatingTables] = useState(false);
  const [mysqlDetails, setMysqlDetails] = useState({
    host: 'localhost',
    port: '3306',
    username: 'root',
    password: '',
    database: 'vision_hub'
  });

  const handleMySQLInputChange = (field: string, value: string) => {
    setMysqlDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      // Simulating connection test
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Connection successful!');
    } catch (error) {
      toast.error('Connection failed. Please check your details.');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const createDatabase = async () => {
    setIsCreatingTables(true);
    try {
      // Simulating database creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Database tables created successfully!');
    } catch (error) {
      toast.error('Failed to create database tables.');
    } finally {
      setIsCreatingTables(false);
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
                    placeholder="https://your-project.supabase.co" 
                    defaultValue="https://csmsqglfbycodrqipbca.supabase.co"
                    readOnly 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="supabase-key">Supabase API Key</Label>
                  <Input id="supabase-key" placeholder="your-supabase-api-key" type="password" />
                  <p className="text-sm text-muted-foreground">
                    You can find your API key in the Supabase dashboard under Project Settings &gt; API
                  </p>
                </div>
                
                <Alert>
                  <AlertDescription className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    <span>Your Supabase project is currently connected and active.</span>
                  </AlertDescription>
                </Alert>
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
            </div>
            <div className="flex flex-col space-y-2">
              <Button onClick={testConnection} disabled={isTestingConnection}>
                {isTestingConnection ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>
              <Button
                variant="outline" 
                onClick={createDatabase}
                disabled={isCreatingTables}
              >
                {isCreatingTables ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Tables...
                  </>
                ) : (
                  'Create Database Tables'
                )}
              </Button>
            </div>
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
