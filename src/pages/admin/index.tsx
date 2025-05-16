
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Database, LayoutDashboard, UserPlus } from 'lucide-react';
import UserManagement from './UserManagement';
import DatabaseMigration from '@/components/settings/DatabaseMigration';
import { useAuth } from '@/contexts/auth';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users');
  const { isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  const handleCreateUser = () => {
    navigate('/admin/users/create');
  };

  const handleDashboardClick = () => {
    navigate('/');
  };

  return (
    <div className="container mx-auto max-w-7xl py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            System administration and management tools
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleDashboardClick}
            className="flex items-center gap-2"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button 
            onClick={handleCreateUser}
            className="bg-vision-blue hover:bg-vision-blue-600"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Create User
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>User Management</span>
          </TabsTrigger>
          <TabsTrigger value="migration" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>Migration Tools</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="migration" className="space-y-4">
          <DatabaseMigration />
        </TabsContent>
      </Tabs>
    </div>
  );
}
