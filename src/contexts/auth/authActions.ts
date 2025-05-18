
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { NavigateFunction } from 'react-router-dom';

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

export async function signOut(navigate: NavigateFunction): Promise<void> {
  try {
    console.log("[AUTH ACTION] Signing out user");
    
    // Clear any stored state first
    localStorage.removeItem("supabase.auth.token");
    sessionStorage.removeItem("supabase.auth.token");
    
    // Then sign out from Supabase
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    
    if (error) {
      console.error("[AUTH ACTION] Sign out error:", error.message);
      throw error;
    }
    
    // Navigate after successful sign out
    toast.success('Successfully signed out');
    
    // Add a small delay before navigation to let the state update
    setTimeout(() => {
      navigate('/auth');
    }, 300);
  } catch (error: any) {
    console.error("[AUTH ACTION] Sign out exception:", error.message);
    toast.error(error.message || 'Error signing out');
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
