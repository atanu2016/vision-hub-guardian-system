
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import FirebaseMigrationForm from './migration/FirebaseMigrationForm';
import SupabaseMigrationForm from './migration/SupabaseMigrationForm';
import { checkMigrationAccess } from '@/services/userService';

export default function MigrationSettings() {
  const [activeTab, setActiveTab] = useState('firebase');
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const checkAccess = async () => {
      if (user) {
        setLoading(true);
        const access = await checkMigrationAccess(user.uid);
        setHasAccess(access);
        setLoading(false);
      } else {
        setHasAccess(false);
        setLoading(false);
      }
    };
    
    checkAccess();
  }, [user]);
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <span>Data Migration</span>
          </CardTitle>
          <CardDescription>
            Checking access...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <span>Data Migration</span>
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
  );
}
