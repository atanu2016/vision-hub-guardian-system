
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

export async function signIn(email: string, password: string): Promise<boolean> {
  try {
    console.log("[AUTH ACTION] Signing in:", email);
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      console.error("[AUTH ACTION] Sign in error:", error.message);
      throw error;
    }
    
    if (!data.session || !data.user) {
      console.error("[AUTH ACTION] Sign in failed: No session or user returned");
      throw new Error("Authentication failed. Please try again.");
    }
    
    console.log("[AUTH ACTION] Sign in successful for:", email);
    
    // Set a small timeout to ensure state updates before redirects
    await new Promise(resolve => setTimeout(resolve, 100));
    return true;
  } catch (error: any) {
    console.error("[AUTH ACTION] Sign in exception:", error.message);
    throw error;
  }
}

export async function signOut(): Promise<void> {
  try {
    console.log("[AUTH ACTION] Signing out user");
    
    // Show a loading message
    toast.loading('Signing out...');
    
    // Clear Supabase stored session first
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("[AUTH ACTION] Sign out error:", error.message);
      toast.dismiss();
      toast.error(error.message || 'Failed to sign out');
      throw error;
    }
    
    // Clear any stored tokens from browser's local/session storage
    localStorage.removeItem("supabase.auth.token");
    sessionStorage.removeItem("supabase.auth.token");
    
    // Show success message before redirect
    toast.dismiss();
    toast.success('Successfully signed out');
    
    // Force hard navigation to auth page with a small delay
    // This ensures the auth state is fully cleared
    setTimeout(() => {
      console.log("[AUTH ACTION] Redirecting to auth page after successful logout");
      window.location.href = '/auth';
    }, 800);
  } catch (error: any) {
    console.error("[AUTH ACTION] Sign out exception:", error.message);
    toast.dismiss();
    toast.error(error.message || 'Error signing out');
    throw error;
  }
}

export async function resetPassword(email: string): Promise<void> {
  try {
    // Improved email validation with more explicit error message
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      toast.error('Please enter a valid email address (e.g. user@example.com)');
      throw new Error('Invalid email format');
    }

    console.log("[AUTH ACTION] Resetting password for:", email);
    
    // Add a redirect URL that includes the full origin
    const redirectUrl = `${window.location.origin}/auth?reset=true`;
    console.log("[AUTH ACTION] Using redirect URL:", redirectUrl);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    
    if (error) {
      console.error("[AUTH ACTION] Reset password error:", error.message);
      throw error;
    }
    
    toast.success('Password reset email sent. Please check your inbox.');
  } catch (error: any) {
    console.error("[AUTH ACTION] Reset password exception:", error.message);
    toast.error(error.message || 'Error sending password reset email');
    throw error;
  }
}

// New function for admin to reset user's password directly
export async function adminResetUserPassword(userId: string, newPassword: string): Promise<void> {
  try {
    // Validate password strength
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      throw new Error('Password too short');
    }
    
    console.log("[AUTH ACTION] Admin resetting password for user:", userId);
    
    // Use Supabase Edge Function for admin password reset
    const { error } = await supabase.functions.invoke('admin-reset-password', {
      body: { userId, newPassword }
    });
    
    if (error) {
      console.error("[AUTH ACTION] Admin password reset error:", error.message);
      throw error;
    }
    
    toast.success('User password has been reset successfully');
  } catch (error: any) {
    console.error("[AUTH ACTION] Admin password reset exception:", error.message);
    toast.error(error.message || 'Error resetting user password');
    throw error;
  }
}
