
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
import { Loader2, RefreshCw, AlertTriangle } from 'lucide-react';

export function RoleDiagnosticTool() {
  const { user, role: currentRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { diagnoseRoles, fixUserRole } = useRoleFixer();
  const [adminFixAttempted, setAdminFixAttempted] = useState(false);

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

      // Automatically fix roles for admin users if missing or wrong
      if (user.email === 'admin@home.local' && (!roleData || roleData.role !== 'superadmin') && !adminFixAttempted) {
        setAdminFixAttempted(true);
        await fixAdminRole();
      }
      
      await diagnoseRoles();
    } catch (error) {
      console.error('Error checking role:', error);
      toast.error('Error checking role information');
    } finally {
      setLoading(false);
    }
  };
  
  const fixAdminRole = async () => {
    if (!user) return;
    
    toast.info("Attempting to restore admin privileges...");
    
    try {
      // Force admin rights for admin@home.local
      if (user.email === 'admin@home.local') {
        console.log('Fixing admin role for admin@home.local');
        await fixUserRole(user.id, 'superadmin');
        
        // Update profile to ensure is_admin flag is set
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ is_admin: true })
          .eq('id', user.id);
          
        if (profileError) {
          console.error('Error updating profile admin flag:', profileError);
        } else {
          toast.success('Admin privileges restored! Page will reload shortly.');
          
          // Force browser reload after a delay
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error fixing admin role:', error);
      toast.error('Failed to restore admin privileges');
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
      
      // Check if this is admin@home.local and fix if needed
      if (user.email === 'admin@home.local') {
        await fixAdminRole();
      } else {
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
        <CardTitle className="text-lg flex items-center justify-between">
          <span>User Role Diagnostic Tool</span>
          {user.email === 'admin@home.local' && debugInfo?.databaseRole !== 'superadmin' && !loading && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={fixAdminRole}
              className="flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Restore Admin Access
            </Button>
          )}
        </CardTitle>
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
            
            <div className="pt-4 flex gap-2">
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
              
              {user.email === 'admin@home.local' && debugInfo.databaseRole !== 'superadmin' && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={fixAdminRole}
                  disabled={loading}
                >
                  Restore Admin Access
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">No role information available</div>
        )}
      </CardContent>
    </Card>
  );
}
