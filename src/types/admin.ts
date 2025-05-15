
export type UserRole = 'superadmin' | 'admin' | 'operator' | 'user';

export type UserData = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  mfa_enrolled: boolean;
  mfa_required: boolean;
  created_at: string;
};
