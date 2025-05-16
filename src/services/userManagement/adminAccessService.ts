
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Check if user has admin access for migration tools
 */
export async function checkMigrationAccess(userId: string): Promise<boolean> {
  try {
    console.log("Checking migration access for userId:", userId);

    // Check if the current user's session to check email
    const { data: sessionData } = await supabase.auth.getSession();
    const userEmail = sessionData?.session?.user?.email;
    
    if (userEmail === 'admin@home.local') {
      console.log("User is admin@home.local, granting access");
      return true;
    }
    
    // Check if the user is an admin based on profile flag
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error('Error checking profile admin status:', profileError);
    }
    
    // If user has admin flag in profile, grant access
    if (profileData && profileData.is_admin === true) {
      console.log("User has is_admin=true, granting access");
      return true;
    }
    
    // Also check for admin or superadmin role in user_roles table
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (roleError) {
      console.error('Error checking user role:', roleError);
    }
    
    // Grant access if user has admin or superadmin role
    const hasAdminRole = roleData && (roleData.role === 'admin' || roleData.role === 'superadmin');
    console.log("User has admin role:", hasAdminRole);
    return hasAdminRole || false;
  } catch (error) {
    console.error('Error checking migration access:', error);
    return false;
  }
}

/**
 * Ensure a user has admin rights
 */
export async function ensureUserIsAdmin(userId: string): Promise<boolean> {
  console.log("Ensuring user is admin:", userId);
  try {
    // First update profile to have admin flag
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', userId);
    
    if (profileError) {
      console.error('Error updating profile admin status:', profileError);
      
      // If update failed, try insert
      const { data: userData } = await supabase.auth.getSession();
      if (userData?.session?.user) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ 
            id: userId,
            full_name: userData.session.user.email?.split('@')[0] || 'Administrator',
            is_admin: true,
            mfa_required: false
          });
          
        if (insertError) {
          console.error('Error inserting profile:', insertError);
          return false;
        }
      }
    }
    
    // Then ensure they have a superadmin role
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({ 
        user_id: userId, 
        role: 'superadmin',
        updated_at: new Date().toISOString()
      });
    
    if (roleError) {
      console.error('Error updating user role:', roleError);
      return false;
    }
    
    console.log("Successfully granted admin privileges to user:", userId);
    return true;
  } catch (error) {
    console.error('Error ensuring user is admin:', error);
    return false;
  }
}
