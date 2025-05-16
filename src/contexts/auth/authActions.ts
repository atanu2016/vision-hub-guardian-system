
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { NavigateFunction } from 'react-router-dom';

export async function signIn(email: string, password: string): Promise<void> {
  try {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    toast.success('Successfully signed in');
  } catch (error: any) {
    toast.error(error.message || 'Error signing in');
    throw error;
  }
}

export async function signOut(navigate: NavigateFunction): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Navigate after successful sign out
    toast.success('Successfully signed out');
    navigate('/auth');
  } catch (error: any) {
    toast.error(error.message || 'Error signing out');
  }
}

export async function resetPassword(email: string): Promise<void> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    toast.success('Password reset email sent. Please check your inbox.');
  } catch (error: any) {
    toast.error(error.message || 'Error sending password reset email');
    throw error;
  }
}
