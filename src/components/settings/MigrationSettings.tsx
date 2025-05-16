
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database } from 'lucide-react';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import FirebaseMigrationForm from './migration/FirebaseMigrationForm';
import SupabaseMigrationForm from './migration/SupabaseMigrationForm';
import AdminAccessRequired from '@/components/shared/AdminAccessRequired';

export default function MigrationSettings() {
  const [activeTab, setActiveTab] = useState('firebase');
  const { hasAccess, loading } = useAdminAccess();
  
  return (
    <AdminAccessRequired 
      loading={loading} 
      hasAccess={hasAccess}
      title="Data Migration"
      description="Migrate data between Firebase and Supabase accounts"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <span>Data Migration</span>
          </CardTitle>
          <CardDescription>
            Migrate data between Firebase and Supabase accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="firebase">Firebase Migration</TabsTrigger>
              <TabsTrigger value="supabase">Supabase Migration</TabsTrigger>
            </TabsList>
            
            <TabsContent value="firebase">
              <FirebaseMigrationForm />
            </TabsContent>
            
            <TabsContent value="supabase">
              <SupabaseMigrationForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AdminAccessRequired>
  );
}
