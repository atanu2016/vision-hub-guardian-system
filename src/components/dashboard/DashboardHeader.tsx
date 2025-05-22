
import { Button } from "@/components/ui/button";
import { CameraIcon } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
}

const DashboardHeader = ({ title, subtitle }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
};

export default DashboardHeader;
