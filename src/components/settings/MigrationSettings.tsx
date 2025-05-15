
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, MoveRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import FirebaseMigrationForm from './migration/FirebaseMigrationForm';
import SupabaseMigrationForm from './migration/SupabaseMigrationForm';

export default function MigrationSettings() {
  const [activeTab, setActiveTab] = useState('firebase');
  const { isAdmin } = useAuth();
  
  if (!isAdmin) {
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
