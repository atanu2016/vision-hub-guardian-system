
export type MfaAction = 'enable' | 'disable' | 'revoke' | 'enroll';

export interface MfaStatus {
  isRequired: boolean;
  isEnrolled: boolean;
  needsSetup: boolean;
}
