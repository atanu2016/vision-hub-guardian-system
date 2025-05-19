
import FirewallSettings from '@/components/settings/security/FirewallSettings';
import MFAEnrollment from '@/components/settings/security/MFAEnrollment';

export function SecurityTab() {
  return (
    <div className="space-y-6">
      <FirewallSettings />
      <MFAEnrollment />
    </div>
  );
}
