
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

const DashboardHeader = ({ 
  title = "Dashboard", 
  subtitle = "Monitor your cameras and recordings"
}: DashboardHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      <Button 
        onClick={() => navigate("/cameras")} 
        className="sm:self-end gap-1"
      >
        <PlusCircle className="h-4 w-4" /> Add Camera
      </Button>
    </div>
  );
};

export default DashboardHeader;
