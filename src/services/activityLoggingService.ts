
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/admin";
import { toast } from "sonner";

/**
 * Log user activities for audit trail
 */
export async function logUserActivity(
  action: string,
  details: string,
  affectedUserId?: string,
  actorEmail?: string,
  actorRole?: UserRole
): Promise<void> {
  try {
    // Get current user if not provided
    if (!actorEmail || !actorRole) {
      const { data: sessionData } = await supabase.auth.getSession();
      actorEmail = sessionData?.session?.user?.email || 'Unknown';
      
      // Get user role if not provided
      if (!actorRole && sessionData?.session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', sessionData.session.user.id)
          .single();
        
        actorRole = profile?.role || 'user';
      }
    }

    // Insert log entry
    const { error } = await supabase.from('system_logs').insert({
      level: 'info',
      source: 'user_management',
      message: `${action} by ${actorEmail} (${actorRole || 'Unknown role'})`,
      details: `${details}${affectedUserId ? ` (User ID: ${affectedUserId})` : ''}`,
      timestamp: new Date().toISOString()
    });
    
    if (error) {
      console.error('Error logging activity:', error);
    }
  } catch (error) {
    console.error('Failed to log user activity:', error);
  }
}

/**
 * Log a role change event
 */
export async function logRoleChange(
  userId: string, 
  oldRole: UserRole, 
  newRole: UserRole,
  actorId?: string,
  actorEmail?: string
): Promise<void> {
  try {
    // Get current user details if not provided
    if (!actorEmail) {
      const { data } = await supabase.auth.getSession();
      actorEmail = data.session?.user?.email || 'Unknown';
      actorId = data.session?.user?.id;
    }
    
    const details = `Role changed from ${oldRole} to ${newRole}`;
    
    await logUserActivity(
      'Role changed',
      details,
      userId,
      actorEmail
    );
    
  } catch (error) {
    console.error('Error logging role change:', error);
  }
}

/**
 * Log access attempts
 */
export async function logAccessAttempt(
  page: string,
  success: boolean,
  userEmail?: string,
  userRole?: UserRole
): Promise<void> {
  try {
    // Get current user if not provided
    if (!userEmail || !userRole) {
      const { data: sessionData } = await supabase.auth.getSession();
      userEmail = sessionData?.session?.user?.email || 'Unknown';
      
      // Get user role if not provided
      if (!userRole && sessionData?.session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', sessionData.session.user.id)
          .single();
        
        userRole = profile?.role || 'user';
      }
    }

    const action = success ? 'Access granted' : 'Access denied';
    const details = `${action} to ${page}`;
    
    // Insert log entry
    const { error } = await supabase.from('system_logs').insert({
      level: success ? 'info' : 'warning',
      source: 'access_control',
      message: `${action} for ${userEmail} (${userRole || 'Unknown role'})`,
      details,
      timestamp: new Date().toISOString()
    });
    
    if (error) {
      console.error('Error logging access attempt:', error);
    }
  } catch (error) {
    console.error('Failed to log access attempt:', error);
  }
}
