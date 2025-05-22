
import { ReactNode } from "react";

interface SettingsSectionProps {
  children: ReactNode;
}

const SettingsSection = ({ children }: SettingsSectionProps) => {
  return (
    <div className="border rounded-lg p-6 bg-card shadow-sm">
      {children}
    </div>
  );
};

export default SettingsSection;
