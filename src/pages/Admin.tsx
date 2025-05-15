
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Shield, UserCheck } from 'lucide-react';

type UserWithProfile = {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
};

const Admin = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Get all profiles from Supabase
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          is_admin,
          created_at
        `);

      if (profilesError) throw profilesError;

      if (!profiles || profiles.length === 0) {
        console.log("No profiles found in Supabase");
        setUsers([]);
        setLoading(false);
        return;
      }

      // For each profile, try to get the user email
      const usersWithEmail = await Promise.all(
        profiles.map(async (profile) => {
          try {
            // Try to get user from Supabase Auth
            const { data: userData, error: userError } = await supabase.auth.admin.getUserById(profile.id);
            
            if (userError) {
              console.error("Error fetching user:", userError);
              return {
                ...profile,
                email: 'Unknown',
              };
            }

            return {
              ...profile,
              email: userData?.user?.email || 'Unknown',
            };
          } catch (error) {
            console.error("Error processing user:", error);
            return {
              ...profile,
              email: 'Unknown',
            };
          }
        })
      );

      setUsers(usersWithEmail as UserWithProfile[]);
    } catch (error: any) {
      toast.error('Failed to load users: ' + error.message);
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      // Update user's admin status in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, is_admin: !currentStatus } : user
        )
      );

      toast.success(`User admin status updated successfully`);
    } catch (error: any) {
      toast.error('Failed to update user: ' + error.message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
        <Shield className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground text-center">
          You don't have permission to view this page. Please contact an administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users and system settings</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCheck className="mr-2 h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>View and manage all users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Joined</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        No users found. Make sure you're connected to Supabase.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="py-3 px-4">{user.full_name || 'N/A'}</td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">
                          {user.is_admin ? (
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800/30 dark:text-gray-400">
                              User
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                          >
                            {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
