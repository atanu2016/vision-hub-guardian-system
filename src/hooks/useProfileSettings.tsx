
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserRole } from '@/contexts/auth/types';

export function useProfileSettings() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>('user');
  const [updateInProgress, setUpdateInProgress] = useState(false);

  // Immediately set initial data from auth context as soon as available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        fullName: profile?.full_name || '',
      }));
      
      setLoading(false);
    } else if (!authLoading) {
      // Only set loading to false if auth is done loading and user is still null
      setLoading(false);
    }
  }, [user, profile, authLoading]);

  // Always fetch up-to-date role directly from database for the profile page
  useEffect(() => {
    if (user?.id) {
      const fetchUserRole = async () => {
        try {
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle();

          if (roleData && !roleError) {
            console.log("[PROFILE] Fetched user role from database:", roleData.role);
            setRole(roleData.role as UserRole);
          } else if (roleError) {
            console.error("[PROFILE] Failed to fetch user role:", roleError);
          } else {
            console.log("[PROFILE] No role record found, defaulting to user");
            setRole('user');
          }
        } catch (error) {
          console.error("[PROFILE] Failed to fetch user role:", error);
        }
      };

      // Initial fetch
      fetchUserRole();
      
      // Set up realtime subscription for role changes
      const channel = supabase
        .channel('profile-role-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'user_roles',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          console.log('[PROFILE] Role change detected:', payload);
          if (payload.new && 'role' in payload.new) {
            setRole(payload.new.role as UserRole);
          }
        })
        .subscribe();

      // Refresh role every 10 seconds
      const intervalId = setInterval(fetchUserRole, 10000);

      return () => {
        clearInterval(intervalId);
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  // Special handling for test accounts
  useEffect(() => {
    if (user?.email === 'user@home.local' && role !== 'user') {
      console.log("[PROFILE] user@home.local detected, but role is", role);
      console.log("[PROFILE] Updating role to 'user'");
      
      const updateUserRole = async () => {
        try {
          await supabase
            .from('user_roles')
            .upsert({
              user_id: user.id,
              role: 'user',
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            });
            
          setRole('user');
          console.log("[PROFILE] Role updated to user");
        } catch (error) {
          console.error("[PROFILE] Error updating role:", error);
        }
      };
      
      updateUserRole();
    }
    
    if (user?.email === 'operator@home.local' && role !== 'user') {
      console.log("[PROFILE] operator@home.local detected, but role is", role);
      console.log("[PROFILE] Updating role to 'user'");
      
      const updateOperatorRole = async () => {
        try {
          await supabase
            .from('user_roles')
            .upsert({
              user_id: user.id,
              role: 'user',
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            });
            
          setRole('user');
          console.log("[PROFILE] Role updated to user");
        } catch (error) {
          console.error("[PROFILE] Error updating role:", error);
        }
      };
      
      updateOperatorRole();
    }
    
    if (user?.email === 'test@home.local') {
      console.log("[PROFILE] test@home.local detected, current role:", role);
    }
  }, [user, role]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setUpdateInProgress(true);
    try {
      // Check if the profile exists first
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
        
      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 means no rows returned - that's expected if the profile doesn't exist yet
        throw checkError;
      }

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.fullName,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: formData.fullName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error?.message || 'Failed to update profile');
    } finally {
      setUpdateInProgress(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Simple validation
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    
    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setUpdateInProgress(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) throw error;
      
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      toast.success('Password updated successfully');
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error.message || 'Failed to update password');
    } finally {
      setUpdateInProgress(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return {
    user,
    loading,
    formData,
    avatarPreview,
    role,
    updateInProgress,
    handleInputChange,
    handleAvatarChange,
    handleProfileUpdate,
    handlePasswordUpdate,
    getInitials
  };
}
