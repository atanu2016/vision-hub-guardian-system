
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { NavigateFunction } from 'react-router-dom';

export async function signIn(email: string, password: string): Promise<void> {
  try {
    console.log("[AUTH ACTION] Signing in:", email);
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      console.error("[AUTH ACTION] Sign in error:", error.message);
      throw error;
    }
    
    console.log("[AUTH ACTION] Sign in successful for:", email);
    
    // Set a small timeout to ensure state updates before redirects
    await new Promise(resolve => setTimeout(resolve, 100));
    return;
  } catch (error: any) {
    console.error("[AUTH ACTION] Sign in exception:", error.message);
    throw error;
  }
}

export async function signOut(navigate: NavigateFunction): Promise<void> {
  try {
    console.log("[AUTH ACTION] Signing out user");
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("[AUTH ACTION] Sign out error:", error.message);
      throw error;
    }
    
    // Clear any stored state
    localStorage.removeItem("supabase.auth.token");
    sessionStorage.removeItem("supabase.auth.token");
    
    // Navigate after successful sign out
    toast.success('Successfully signed out');
    navigate('/auth');
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
