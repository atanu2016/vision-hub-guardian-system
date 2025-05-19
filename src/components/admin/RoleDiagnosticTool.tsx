
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/contexts/auth/types';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRoleFixer } from '@/hooks/useRoleFixer';
import { invalidateRoleCache } from '@/services/userManagement/roleServices';
import { Loader2, RefreshCw } from 'lucide-react';

export function RoleDiagnosticTool() {
  const { user, role: currentRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { diagnoseRoles, fixUserRole } = useRoleFixer();

  const checkUserRole = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Clear role cache first
      invalidateRoleCache(user.id);
      
      // Get role from user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role, updated_at')
        .eq('user_id', user.id)
        .maybeSingle();
      
      // Get auth session
      const { data: sessionData } = await supabase.auth.getSession();
      
      // Get cached role from browser storage
      let localStorageRole;
      try {
        localStorageRole = localStorage.getItem(`user_role_${user.id}`);
      } catch (e) {
        console.error('Error accessing localStorage:', e);
      }
      
      // Build debug info
      setDebugInfo({
        userId: user.id,
        userEmail: user.email,
        currentAuthRole: currentRole,
        databaseRole: roleData?.role || 'Not found in database',
        databaseRoleUpdated: roleData?.updated_at ? new Date(roleData.updated_at).toLocaleString() : 'N/A',
        sessionData: sessionData.session ? 'Active' : 'No active session',
        localStorageRole: localStorageRole || 'Not cached',
        timestamp: new Date().toLocaleString()
      });

      await diagnoseRoles();
    } catch (error) {
      console.error('Error checking role:', error);
      toast.error('Error checking role information');
    } finally {
      setLoading(false);
    }
  };

  const forceRoleRefresh = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Clear existing role info
      invalidateRoleCache(user.id);
      
      // Force session refresh
      await supabase.auth.refreshSession();
      
      // Get current role from database
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (roleData?.role) {
        // Force fix the role to ensure it's applied
        await fixUserRole(user.id, roleData.role as UserRole);
      }
      
      toast.success('Role information refreshed');
      
      // Update debug info
      await checkUserRole();
    } catch (error) {
      console.error('Error refreshing role:', error);
      toast.error('Error refreshing role information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkUserRole();
    }
  }, [user]);

  if (!user) {
    return (
      <Alert>
        <AlertDescription>
          Please log in to view role diagnostic information
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">User Role Diagnostic Tool</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center my-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : debugInfo ? (
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="font-medium">User ID:</div>
              <div className="font-mono text-xs break-all">{debugInfo.userId}</div>
              
              <div className="font-medium">Email:</div>
              <div>{debugInfo.userEmail}</div>
              
              <div className="font-medium">Current Auth Role:</div>
              <div className="font-semibold">{debugInfo.currentAuthRole}</div>
              
              <div className="font-medium">Database Role:</div>
              <div className={`font-semibold ${debugInfo.databaseRole !== debugInfo.currentAuthRole ? 'text-red-500' : 'text-green-500'}`}>
                {debugInfo.databaseRole}
              </div>
              
              <div className="font-medium">Role Last Updated:</div>
              <div>{debugInfo.databaseRoleUpdated}</div>
              
              <div className="font-medium">Session:</div>
              <div>{debugInfo.sessionData}</div>
              
              <div className="font-medium">Cached Role:</div>
              <div>{debugInfo.localStorageRole}</div>
              
              <div className="font-medium">Checked at:</div>
              <div>{debugInfo.timestamp}</div>
            </div>
            
            <div className="pt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={forceRoleRefresh}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Force Role Refresh
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">No role information available</div>
        )}
      </CardContent>
    </Card>
  );
}
