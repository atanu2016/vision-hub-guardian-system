
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { checkMigrationAccess, ensureUserIsAdmin } from '@/services/userService';
import { toast } from 'sonner';

/**
 * Hook to check if a user has admin access
 * Handles all the logic for checking various ways a user might have admin privileges
 */
export function useAdminAccess() {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, profile, role } = useAuth();
  
  useEffect(() => {
    const checkAccess = async () => {
      if (user) {
        setLoading(true);
        
        // First check - via profile object (quickest)
        if (profile?.is_admin) {
          console.log("Access granted via profile.is_admin");
          setHasAccess(true);
          setLoading(false);
          return;
        }
        
        // Second check - via role (if available)
        if (role === 'superadmin') {
          console.log("Access granted via role:", role);
          setHasAccess(true);
          setLoading(false);
          return;
        }
        
        // Special case for admin@home.local, auth@home.local
        const userEmail = user.email;
        if (userEmail && (
            userEmail.toLowerCase() === 'admin@home.local' || 
            userEmail.toLowerCase() === 'auth@home.local'
        )) {
          console.log("Granting access to special admin email:", userEmail);
          const success = await ensureUserIsAdmin(user.id);
          if (success) {
            toast.success('Admin access granted');
            setHasAccess(true);
            setLoading(false);
            return;
          }
        }
        
        // Regular database check for migration access
        try {
          console.log("Checking access via database for user:", user.id);
          const access = await checkMigrationAccess(user.id);
          console.log("Database access check result:", access);
          setHasAccess(access);
        } catch (error) {
          console.error("Error checking migration access:", error);
          setHasAccess(false);
        } finally {
          setLoading(false);
        }
      } else {
        setHasAccess(false);
        setLoading(false);
      }
    };
    
    checkAccess();
  }, [user, profile, role]);
  
  return { hasAccess, loading };
}
