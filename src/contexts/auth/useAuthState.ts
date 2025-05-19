
import { useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Profile, UserRole, AuthState } from './types';
import { fetchUserProfile, fetchUserRole } from './authUtils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Helper for handling auth errors
export const handleAuthError = (error: any, defaultMessage = 'Authentication error') => {
  console.error('[AUTH] Error:', error);
  const errorMsg = error?.message || defaultMessage;
  toast.error(errorMsg);
  return errorMsg;
};

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole>('user');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Optimized function to fetch user data with better error handling
  const fetchUserData = useCallback(async (userId: string, currentUser: User) => {
    try {
      console.log("[AUTH] Fetching user data for:", userId);
      
      // Reset errors before new fetch
      setErrors([]);
      
      // Fetch profile and role in parallel for better performance
      // Use Promise.allSettled to handle partial failures
      const results = await Promise.allSettled([
        fetchUserProfile(userId, currentUser),
        fetchUserRole(userId, currentUser)
      ]);
      
      // Process profile result
      if (results[0].status === 'fulfilled' && results[0].value) {
        console.log("[AUTH] Profile data fetched:", results[0].value);
        setProfile(results[0].value);
      } else if (results[0].status === 'rejected') {
        const error = results[0] as PromiseRejectedResult;
        console.error("[AUTH] Error fetching profile:", error.reason);
        setErrors(prev => [...prev, `Profile fetch error: ${error.reason}`]);
        
        // Attempt fallback direct fetch
        try {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          
          if (data) {
            setProfile(data as Profile);
            console.log("[AUTH] Profile fetched via fallback");
          }
        } catch (err) {
          console.error("[AUTH] Fallback profile fetch failed:", err);
        }
      }
      
      // Process role result
      if (results[1].status === 'fulfilled') {
        console.log("[AUTH] Role data fetched:", results[1].value);
        setRole(results[1].value);
      } else {
        const error = results[1] as PromiseRejectedResult;
        console.error("[AUTH] Error fetching role:", error.reason);
        setErrors(prev => [...prev, `Role fetch error: ${error.reason}`]);
        
        // Default to user role for safety
        setRole('user');
        
        // Try fallback method - direct query
        try {
          const { data } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .maybeSingle();
            
          if (data?.role) {
            setRole(data.role as UserRole);
            console.log("[AUTH] Role fetched via fallback:", data.role);
          }
        } catch (err) {
          console.error("[AUTH] Fallback role fetch failed:", err);
        }
      }
      
      // Ensure we have at least a basic profile
      if (!profile) {
        // Create default profile based on user data
        setProfile({
          id: userId,
          full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'User',
          is_admin: false,
          mfa_enrolled: false,
          mfa_required: false
        });
      }
      
      return {
        profile: results[0].status === 'fulfilled' ? results[0].value : null,
        role: results[1].status === 'fulfilled' ? results[1].value : 'user' as UserRole,
        errors: errors
      };
    } catch (error) {
      console.error("[AUTH] Error fetching user data:", error);
      setErrors(prev => [...prev, `General error: ${error}`]);
      return null;
    }
  }, [errors, profile]);

  return {
    user,
    setUser,
    session,
    setSession,
    profile, 
    setProfile,
    role,
    setRole,
    isLoading,
    setIsLoading,
    authInitialized,
    setAuthInitialized,
    fetchUserData,
    errors
  };
}
