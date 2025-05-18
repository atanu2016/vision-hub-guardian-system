
import { useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Profile, UserRole, AuthState } from './types';
import { fetchUserProfile, fetchUserRole } from './authUtils';
import { toast } from 'sonner';

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

  // Optimized function to fetch user data
  const fetchUserData = useCallback(async (userId: string, currentUser: User) => {
    try {
      console.log("[AUTH] Fetching user data for:", userId);
      
      // Fetch profile and role in parallel for better performance
      const [profileData, roleData] = await Promise.all([
        fetchUserProfile(userId, currentUser),
        fetchUserRole(userId, currentUser)
      ]);
      
      if (profileData) {
        console.log("[AUTH] Profile data fetched:", profileData);
        setProfile(profileData);
      }
      
      console.log("[AUTH] Role data fetched:", roleData);
      setRole(roleData);
      
      return { profile: profileData, role: roleData };
    } catch (error) {
      console.error("[AUTH] Error fetching user data:", error);
      return null;
    }
  }, []);

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
    fetchUserData
  };
}
