
import { ReactNode } from "react";

interface SettingsGridProps {
  children: ReactNode;
}

const SettingsGrid = ({ children }: SettingsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {children}
    </div>
  );
};

export default SettingsGrid;
