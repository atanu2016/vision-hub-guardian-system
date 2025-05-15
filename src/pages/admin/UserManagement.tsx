
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Shield, ShieldCheck, ShieldX, User } from 'lucide-react';
import { toast } from 'sonner';

type UserRole = 'superadmin' | 'admin' | 'operator' | 'user';

type UserData = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  mfa_enrolled: boolean;
  mfa_required: boolean;
  created_at: string;
};

export default function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const { isSuperAdmin, user } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      
      // Get all auth users - only available to superadmin
      const { data: authUsers, error: authError } = await supabase
        .from('profiles')
        .select('id, full_name, mfa_enrolled, mfa_required, created_at');
      
      if (authError) throw authError;

      // Get emails separately - admin users won't have direct access to auth.users
      const userEmails = new Map();
      
      // For each user, get roles
      const usersWithRoles = await Promise.all(
        authUsers.map(async (user) => {
          // Get user role
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle();
            
          // Get user email
          const { data: userData } = await supabase.auth.admin.getUserById(user.id);
          
          return {
            ...user,
            email: userData?.user?.email || 'No email',
            role: (roleData?.role as UserRole) || 'user',
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function updateUserRole(userId: string, newRole: UserRole) {
    try {
      // Don't allow changing your own role if you're a superadmin
      if (userId === user?.id && newRole !== 'superadmin') {
        toast.error("You cannot downgrade your own superadmin role");
        return;
      }

      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      let error;
      
      if (existingRole) {
        // Update existing role
        const { error: updateError } = await supabase
          .from('user_roles')
          .update({ role: newRole, updated_at: new Date().toISOString() })
          .eq('user_id', userId);
          
        error = updateError;
      } else {
        // Insert new role
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole });
          
        error = insertError;
      }

      if (error) throw error;
      
      toast.success(`User role updated to ${newRole}`);
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
      
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  }

  async function toggleMfaRequirement(userId: string, required: boolean) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ mfa_required: required })
        .eq('id', userId);
        
      if (error) throw error;
      
      toast.success(`MFA requirement ${required ? 'enabled' : 'disabled'}`);
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, mfa_required: required } : u
      ));
      
    } catch (error) {
      console.error('Error updating MFA requirement:', error);
      toast.error('Failed to update MFA requirement');
    }
  }

  function getRoleIcon(role: UserRole) {
    switch (role) {
      case 'superadmin': 
        return <Shield className="h-5 w-5 text-red-500" />;
      case 'admin': 
        return <ShieldCheck className="h-5 w-5 text-amber-500" />;
      case 'operator': 
        return <ShieldX className="h-5 w-5 text-blue-500" />;
      default: 
        return <User className="h-5 w-5 text-gray-500" />;
    }
  }

  if (!isSuperAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            You need superadmin privileges to access this page.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <span>User Management</span>
        </CardTitle>
        <CardDescription>
          Manage user roles and security settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
          </div>
        ) : (
          <div className="overflow-auto max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>MFA Status</TableHead>
                  <TableHead>MFA Required</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.full_name || 'N/A'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <Select
                          defaultValue={user.role}
                          onValueChange={(value) => updateUserRole(user.id, value as UserRole)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="superadmin">Superadmin</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="operator">Operator</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={user.mfa_enrolled ? "text-green-500" : "text-amber-500"}>
                        {user.mfa_enrolled ? "Enrolled" : "Not Enrolled"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={user.mfa_required ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleMfaRequirement(user.id, !user.mfa_required)}
                      >
                        {user.mfa_required ? "Required" : "Optional"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
