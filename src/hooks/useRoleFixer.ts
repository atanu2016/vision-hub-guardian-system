
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/contexts/auth/types';
import { toast } from 'sonner';
import { invalidateRoleCache } from '@/services/userManagement/roleServices';

interface DiagnosticInfo {
  id: string;
  email: string;
  roleRecord: any;
  hasRoleRecord: boolean;
  currentRole: UserRole;
}

interface DiagnosticResult {
  success: boolean;
  diagnosticInfo: DiagnosticInfo[];
  totalUsers: number;
  usersWithRoles: number;
  usersWithoutRoles: number;
}

export function useRoleFixer() {
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticResult | null>(null);
  
  const diagnoseRoles = async () => {
    setIsLoading(true);
    try {
      // First, check for existing session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        toast.error("You must be logged in to use the diagnostic tool");
        setIsLoading(false);
        return null;
      }
      
      // Call the edge function to diagnose roles
      const { data, error } = await supabase.functions.invoke('fix-user-roles', {
        body: { action: 'diagnose' }
      });
      
      if (error) throw error;
      
      setDiagnosticData(data);
      
      // Let's try to fix the admin role automatically if we're admin@home.local
      if (sessionData.session.user.email === 'admin@home.local') {
        console.log("Detected admin@home.local, attempting automatic role fix");
        await fixUserRole(sessionData.session.user.id, 'superadmin');
      }
      
      return data;
    } catch (error: any) {
      console.error('[Role Fixer] Error diagnosing roles:', error);
      toast.error(`Error diagnosing roles: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const fixUserRole = async (userId: string, role: UserRole) => {
    setIsLoading(true);
    try {
      console.log(`[Role Fixer] Fixing role for user ${userId} to ${role}`);
      
      // Special handling for admin@home.local
      if (role !== 'superadmin') {
        const { data } = await supabase.auth.getUser();
        if (data?.user?.email === 'admin@home.local') {
          toast.warning("Admin account should always have superadmin role");
          role = 'superadmin';
        }
      }
      
      const { data, error } = await supabase.functions.invoke('fix-user-roles', {
        body: { action: 'fix', userId, role }
      });
      
      if (error) throw error;
      
      // Invalidate the role cache for this user after a successful fix
      invalidateRoleCache(userId);
      
      toast.success(data.message || `User role updated to ${role}`);
      
      // Update profiles table to ensure is_admin flag is set
      if (role === 'admin' || role === 'superadmin') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ is_admin: true })
          .eq('id', userId);
          
        if (profileError) {
          console.error('[Role Fixer] Error updating profile admin flag:', profileError);
        }
      }
      
      // Refresh diagnostic data
      await diagnoseRoles();
      
      // Force a browser reload after 1 second to refresh the auth context
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      return true;
    } catch (error: any) {
      console.error('[Role Fixer] Error fixing role:', error);
      toast.error(`Error fixing role: ${error.message || 'Unknown error'}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    diagnoseRoles,
    fixUserRole,
    isLoading,
    diagnosticData
  };
}
