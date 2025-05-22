
import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface SettingsSectionProps {
  children: ReactNode;
}

const SettingsSection = ({ children }: SettingsSectionProps) => {
  return (
    <Card className="p-6">
      {children}
    </Card>
  );
};

export default SettingsSection;
