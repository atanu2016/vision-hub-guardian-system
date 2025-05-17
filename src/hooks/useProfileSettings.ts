
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserRole } from '@/types/admin';

export interface ProfileFormData {
  fullName: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function useProfileSettings() {
  const { user, profile, role: authRole } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Load initial data from auth context
  useEffect(() => {
    console.log("[PROFILE SETTINGS] Auth context data:", { user, profile, authRole });
    if (user) {
      setEmail(user.email || '');
      
      if (profile?.full_name) {
        setFullName(profile.full_name);
        setFormData(prev => ({ ...prev, fullName: profile.full_name || '' }));
      }
      
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
          console.log("[PROFILE] Fetching user role for user ID:", user.id);
          
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

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'fullName') {
      setFullName(value);
    }
  };

  // Handle avatar change
  const handleAvatarChange = async (file: File) => {
    if (!user) return;
    
    try {
      // Preview the avatar
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setAvatarPreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      
      // Upload avatar logic would go here
    } catch (error) {
      console.error('Error handling avatar:', error);
    }
  };

  // Save profile changes
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSaveChanges();
  };

  // Handle saving changes
  const handleSaveChanges = async () => {
    if (!user) {
      console.error("[PROFILE] Cannot save changes: No user found");
      return;
    }

    setIsSaving(true);
    try {
      console.log("[PROFILE] Saving profile changes for user:", user.id);
      
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

  // Handle password update
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });
      
      if (error) throw error;
      
      toast.success('Password updated successfully');
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  // Get initials from full name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || '';
  };

  return {
    user,
    profile,
    role: userRole,
    fullName,
    email,
    userRole,
    isLoading,
    isSaving,
    formData,
    avatarPreview,
    loading: isLoading,
    setFullName,
    handleInputChange,
    handleAvatarChange,
    handleProfileUpdate,
    handlePasswordUpdate,
    handleSaveChanges,
    getInitials
  };
}
