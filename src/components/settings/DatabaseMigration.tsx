
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database } from 'lucide-react';
import MySQLMigrationForm from './migration/MySQLMigrationForm';
import SupabaseConnectionForm from './migration/SupabaseConnectionForm';
import MigrationAlert from './migration/MigrationAlert';

export default function DatabaseMigration() {
  const [activeTab, setActiveTab] = useState('mysql');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          <span>Database Migration</span>
        </CardTitle>
        <CardDescription>
          Migrate your data between Supabase and MySQL
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MigrationAlert />
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="mysql">Migrate to MySQL</TabsTrigger>
            <TabsTrigger value="supabase">Connect to Supabase</TabsTrigger>
          </TabsList>
          
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
