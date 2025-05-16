
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database } from 'lucide-react';
import MySQLMigrationForm from './migration/mysql/MySQLMigrationForm';
import SupabaseConnectionForm from './migration/SupabaseConnectionForm';
import MigrationAlert from './migration/MigrationAlert';
import FirebaseMigrationForm from './migration/FirebaseMigrationForm';
import SupabaseMigrationForm from './migration/SupabaseMigrationForm';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import AdminAccessRequired from '@/components/shared/AdminAccessRequired';

export default function DatabaseMigration() {
  const [activeTab, setActiveTab] = useState('supabase');
  const { hasAccess, loading } = useAdminAccess();
  
  return (
    <AdminAccessRequired 
      loading={loading} 
      hasAccess={hasAccess}
      title="Database Migration"
      description="Migrate your data between different database providers"
    >
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
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="supabase">Supabase</TabsTrigger>
              <TabsTrigger value="firebase">Firebase</TabsTrigger>
              <TabsTrigger value="mysql">MySQL</TabsTrigger>
              <TabsTrigger value="connection">Connection Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="supabase">
              <SupabaseMigrationForm />
            </TabsContent>
            
            <TabsContent value="firebase">
              <FirebaseMigrationForm />
            </TabsContent>
            
            <TabsContent value="mysql">
              <MySQLMigrationForm />
            </TabsContent>
            
            <TabsContent value="connection">
              <SupabaseConnectionForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AdminAccessRequired>
  );
}
