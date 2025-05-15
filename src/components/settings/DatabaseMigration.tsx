
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database } from 'lucide-react';
import MySQLMigrationForm from './migration/MySQLMigrationForm';
import SupabaseConnectionForm from './migration/SupabaseConnectionForm';
import MigrationAlert from './migration/MigrationAlert';
import FirebaseMigrationForm from './migration/FirebaseMigrationForm';
import { useAuth } from '@/contexts/AuthContext';

export default function DatabaseMigration() {
  const [activeTab, setActiveTab] = useState('firebase');
  const { isAdmin } = useAuth();
  
  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <span>Database Migration</span>
          </CardTitle>
          <CardDescription>
            Admin access required to perform data migration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-amber-500">
            You need administrator privileges to access the migration tools.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          <span>Database Migration</span>
        </CardTitle>
        <CardDescription>
          Migrate your data between different database providers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MigrationAlert />
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="firebase">Firebase Migration</TabsTrigger>
            <TabsTrigger value="mysql">MySQL Migration</TabsTrigger>
            <TabsTrigger value="supabase">Supabase Connection</TabsTrigger>
          </TabsList>
          
          <TabsContent value="firebase">
            <FirebaseMigrationForm />
          </TabsContent>
          
          <TabsContent value="mysql">
            <MySQLMigrationForm />
          </TabsContent>
          
          <TabsContent value="supabase">
            <SupabaseConnectionForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
