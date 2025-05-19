
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/admin';
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
      const { data, error } = await supabase.functions.invoke('fix-user-roles', {
        body: { action: 'diagnose' }
      });
      
      if (error) throw error;
      
      setDiagnosticData(data);
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
      const { data, error } = await supabase.functions.invoke('fix-user-roles', {
        body: { action: 'fix', userId, role }
      });
      
      if (error) throw error;
      
      // Invalidate the role cache for this user after a successful fix
      invalidateRoleCache(userId);
      
      toast.success(data.message || `User role updated to ${role}`);
      
      // Refresh diagnostic data
      await diagnoseRoles();
      
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
