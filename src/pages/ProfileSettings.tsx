
import AppLayout from "@/components/layout/AppLayout";
import { PersonalInfoCard } from "@/components/profile/PersonalInfoCard";
import { SecuritySettingsCard } from "@/components/profile/SecuritySettingsCard";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/admin';
import { usePermissions } from '@/hooks/usePermissions';

const ProfileSettings = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const { currentRole } = usePermissions(); // Get role from usePermissions which is more reliable
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

  // Immediately set initial data from auth context as soon as available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        fullName: profile?.full_name || '',
      }));
      
      // Use the role from usePermissions which is directly from the database
      setRole(currentRole);
      setLoading(false);
    } else if (!authLoading) {
      // Only set loading to false if auth is done loading and user is still null
      setLoading(false);
    }
  }, [user, profile, currentRole, authLoading]);

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
          }
        } catch (error) {
          console.error("[PROFILE] Failed to fetch user role:", error);
        }
      };

      fetchUserRole();
    }
  }, [user]);
  
  // Special handling for operator@home.local
  useEffect(() => {
    if (user?.email === 'operator@home.local' && role !== 'operator') {
      console.log("[PROFILE] operator@home.local detected, but role is", role);
      console.log("[PROFILE] Forcing role update to 'operator'");
      
      const updateOperatorRole = async () => {
        try {
          await supabase
            .from('user_roles')
            .upsert({
              user_id: user.id,
              role: 'operator'
            });
            
          setRole('operator');
          console.log("[PROFILE] Role updated to operator");
        } catch (error) {
          console.error("[PROFILE] Error updating role:", error);
        }
      };
      
      updateOperatorRole();
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

    try {
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
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

  // Add logging for debugging
  useEffect(() => {
    console.log("ProfileSettings component:", {
      userExists: !!user,
      profileExists: !!profile,
      authLoading,
      role,
      permissionRole: currentRole,
      formData,
      loading
    });
  }, [user, profile, role, currentRole, formData, loading, authLoading]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p>Loading profile information...</p>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <p>Please log in to view your profile settings.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <PersonalInfoCard
            formData={formData}
            role={role}
            avatarPreview={avatarPreview}
            getInitials={getInitials}
            handleInputChange={handleInputChange}
            handleAvatarChange={handleAvatarChange}
            handleProfileUpdate={handleProfileUpdate}
          />

          <SecuritySettingsCard
            formData={formData}
            handleInputChange={handleInputChange}
            handlePasswordUpdate={handlePasswordUpdate}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfileSettings;
