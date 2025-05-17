
export type UserRole = 'superadmin' | 'admin' | 'operator' | 'user';

export interface UserData {
  id: string;
  email: string | null;
  full_name?: string | null;
  role: UserRole;
  is_admin?: boolean;
  mfa_required: boolean;
  mfa_enrolled: boolean;
  last_sign_in?: string | null;
}

export interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  is_admin?: boolean;
  mfa_required?: boolean;
  mfa_enrolled?: boolean;
  mfa_secret?: string;
}

export interface AuthState {
  user: any;
  profile: UserProfile | null;
  session: any;
  loading: boolean;
}

// MFA Toggle Props for the component
export interface MfaToggleProps {
  userId: string;
  mfaRequired: boolean;
  mfaEnrolled: boolean;
  onToggleMfaRequirement: (userId: string, required: boolean) => Promise<void>;
  onRevokeMfaEnrollment: (userId: string) => Promise<void>;
}

// Delete User Button Props
export interface DeleteUserButtonProps {
  userId: string;
  userEmail: string;
  onDelete: (userId: string) => Promise<void>;
}
