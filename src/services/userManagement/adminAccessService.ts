
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Check if user has admin access for migration tools
 */
export async function checkMigrationAccess(userId: string): Promise<boolean> {
  try {
    console.log("Checking migration access for userId:", userId);

    if (!userId) {
      console.log("No user ID provided");
      return false;
    }

    // Check the current user's session to check email
    const { data: sessionData } = await supabase.auth.getSession();
    const userEmail = sessionData?.session?.user?.email;
    
    // Special case for admin@home.local
    if (userEmail === 'admin@home.local') {
      console.log("User is admin@home.local, granting access");
      
      // Ensure the user has admin rights
      const success = await ensureUserIsAdmin(userId);
      if (success) {
        console.log("Successfully granted admin rights to admin@home.local");
        return true;
      }
    }
    
    try {
      // First try the check_admin_status RPC function
      const { data: isAdmin, error: rpcError } = await supabase
        .rpc('check_admin_status');
        
      if (!rpcError && isAdmin === true) {
        console.log("User is admin via check_admin_status function");
        return true;
      }
    } catch (rpcError) {
      console.error("Error checking admin status via RPC:", rpcError);
      // Continue with fallback checks
    }
    
    // Check if the user has admin role directly from user_roles
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (roleError) {
      console.error('Error checking user role:', roleError);
      // Don't return early, continue checking other methods
    }
    
    // Grant access if user has admin or superadmin role
    if (roleData && (roleData.role === 'admin' || roleData.role === 'superadmin')) {
      console.log("User has admin role:", roleData.role);
      return true;
    }
    
    // Check if the user is an admin based on profile flag 
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .maybeSingle();
      
    if (profileError) {
      console.error('Error checking profile admin status:', profileError);
      // Continue execution
    }
    
    // If user has admin flag in profile, grant access
    if (profileData && profileData.is_admin === true) {
      console.log("User has is_admin=true, granting access");
      return true;
    }
    
    console.log("No admin access granted");
    return false;
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
    // First ensure they have a superadmin role
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({ 
        user_id: userId, 
        role: 'superadmin',
        updated_at: new Date().toISOString()
      });
    
    if (roleError) {
      console.error('Error updating user role:', roleError);
      
      // Try to insert if upsert failed
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ 
          user_id: userId, 
          role: 'superadmin',
          updated_at: new Date().toISOString()
        });
        
      if (insertError) {
        console.error('Error inserting user role:', insertError);
        return false;
      }
    }
    
    // Then update profile to have admin flag
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
    
    console.log("Successfully granted admin privileges to user:", userId);
    toast.success("Admin privileges granted");
    return true;
  } catch (error) {
    console.error('Error ensuring user is admin:', error);
    return false;
  }
}
