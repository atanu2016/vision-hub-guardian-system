
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MFAEnrollment from '@/components/settings/security/MFAEnrollment';
import MigrationSettings from '@/components/settings/MigrationSettings';

export default function AdvancedSettings() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Advanced Settings</h1>
        <p className="text-muted-foreground">
          Configure system security and advanced options
        </p>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="migrations">Data Migration</TabsTrigger>
          <TabsTrigger value="debugging">Debugging</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Server Settings</CardTitle>
              <CardDescription>Configure server and network options</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Server settings will be implemented in a future update</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <MFAEnrollment />
        </TabsContent>
        
        <TabsContent value="migrations" className="space-y-6">
          <MigrationSettings />
        </TabsContent>
        
        <TabsContent value="debugging" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Debug Options</CardTitle>
              <CardDescription>Configure logging and diagnostic options</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Debug options will be implemented in a future update</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
