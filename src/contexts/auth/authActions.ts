
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
    
    // Clear Supabase stored session first
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("[AUTH ACTION] Sign out error:", error.message);
      throw error;
    }
    
    // Clear any stored tokens from browsers local/session storage
    localStorage.removeItem("supabase.auth.token");
    sessionStorage.removeItem("supabase.auth.token");
    
    // Show success message and redirect
    toast.success('Successfully signed out');
    
    // Use a proper timeout to allow state to update and toast to display
    setTimeout(() => {
      console.log("[AUTH ACTION] Redirecting to auth page after successful logout");
      window.location.href = '/auth';
    }, 500);
  } catch (error: any) {
    console.error("[AUTH ACTION] Sign out exception:", error.message);
    toast.error(error.message || 'Error signing out');
    throw error;
  }
}

export async function resetPassword(email: string): Promise<void> {
  try {
    console.log("[AUTH ACTION] Resetting password for:", email);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
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
