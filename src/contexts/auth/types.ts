
import { Session, User } from '@supabase/supabase-js';

export type UserRole = 'superadmin' | 'admin' | 'user' | 'observer';

export type Profile = {
  id: string;
  full_name: string | null;
  is_admin: boolean;
  mfa_enrolled: boolean;
  mfa_required: boolean;
};

export interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: UserRole;
  isLoading: boolean;
  authInitialized?: boolean;
}

export interface AuthContextType extends AuthState {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  authInitialized: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  requiresMFA: boolean;
}
