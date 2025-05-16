import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Loader2 } from 'lucide-react';
import MySQLMigrationForm from './migration/MySQLMigrationForm';
import SupabaseConnectionForm from './migration/SupabaseConnectionForm';
import MigrationAlert from './migration/MigrationAlert';
import FirebaseMigrationForm from './migration/FirebaseMigrationForm';
import SupabaseMigrationForm from './migration/SupabaseMigrationForm';
import { useAuth } from '@/contexts/AuthContext';
import { checkMigrationAccess, ensureUserIsAdmin } from '@/services/userService';
import { toast } from 'sonner';

export default function DatabaseMigration() {
  const [activeTab, setActiveTab] = useState('supabase');
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, profile, role } = useAuth();
  
  useEffect(() => {
    const checkAccess = async () => {
      if (user) {
        setLoading(true);
        
        // Check via profile is_admin first
        if (profile?.is_admin) {
          setHasAccess(true);
          setLoading(false);
          return;
        }
        
        // Check via role
        if (role === 'admin' || role === 'superadmin') {
          setHasAccess(true);
          setLoading(false);
          return;
        }
        
        // Special case for admin@home.local
        const userEmail = user.email;
        if (userEmail === 'admin@home.local') {
          // Force update to ensure admin privileges
          await ensureUserIsAdmin(user.id);
          setHasAccess(true);
          setLoading(false);
          return;
        }
        
        // Fallback to full DB check
        const access = await checkMigrationAccess(user.id);
        setHasAccess(access);
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
            <span>Database Migration</span>
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
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="supabase">Supabase Migration</TabsTrigger>
            <TabsTrigger value="firebase">Firebase Migration</TabsTrigger>
            <TabsTrigger value="mysql">MySQL Migration</TabsTrigger>
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
  );
}
