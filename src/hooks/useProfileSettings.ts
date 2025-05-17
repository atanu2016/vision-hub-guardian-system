
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserRole } from '@/types/admin';

export function useProfileSettings() {
  const { user, profile, role: authRole } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [isSaving, setIsSaving] = useState(false);

  // Immediately set initial data from auth context
  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setFullName(profile?.full_name || '');
      
      // Get the role directly from auth context
      setUserRole(authRole);
      
      setIsLoading(false);
    }
  }, [user, profile, authRole]);

  // Also fetch the role directly from the database to ensure accuracy
  useEffect(() => {
    if (user?.id) {
      const fetchUserRole = async () => {
        try {
          // Try to get role from user_roles table
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();

          if (roleData && !roleError) {
            console.log("[PROFILE] Fetched user role from database:", roleData.role);
            setUserRole(roleData.role as UserRole);
          } else if (roleError && roleError.code !== 'PGRST116') {
            // PGRST116 is "no rows returned" error - it's normal if user has no explicit role
            console.error("[PROFILE] Error fetching user role:", roleError);
          }
        } catch (error) {
          console.error("[PROFILE] Failed to fetch user role:", error);
        }
      };

      fetchUserRole();
    }
  }, [user]);

  const handleSaveChanges = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    fullName,
    email,
    userRole,
    isLoading,
    isSaving,
    setFullName,
    handleSaveChanges
  };
}
