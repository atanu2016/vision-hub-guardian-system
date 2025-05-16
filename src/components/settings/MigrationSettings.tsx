
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import FirebaseMigrationForm from './migration/FirebaseMigrationForm';
import SupabaseMigrationForm from './migration/SupabaseMigrationForm';
import { checkMigrationAccess } from '@/services/userService';
import { supabase } from '@/integrations/supabase/client';

export default function MigrationSettings() {
  const [activeTab, setActiveTab] = useState('firebase');
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, profile, role } = useAuth();
  
  useEffect(() => {
    const checkAccess = async () => {
      if (user) {
        setLoading(true);
        
        // First check - via profile object
        if (profile?.is_admin) {
          setHasAccess(true);
          setLoading(false);
          return;
        }
        
        // Second check - via role
        if (role === 'admin' || role === 'superadmin') {
          setHasAccess(true);
          setLoading(false);
          return;
        }
        
        // Third check - via database check (backstop)
        const access = await checkMigrationAccess(user.id);
        setHasAccess(access);
        
        // If user still doesn't have access but they're the only user in the system, grant admin
        if (!access) {
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });
            
          if (count === 1) {
            // This is the first and only user, update them to admin
            await supabase
              .from('profiles')
              .update({ is_admin: true })
              .eq('id', user.id);
              
            await supabase
              .from('user_roles')
              .insert({ user_id: user.id, role: 'superadmin' })
              .onConflict(['user_id'])
              .merge();
              
            setHasAccess(true);
          }
        }
        
        setLoading(false);
      } else {
        setHasAccess(false);
        setLoading(false);
      }
    };
    
    checkAccess();
  }, [user, profile, role]);
  
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
