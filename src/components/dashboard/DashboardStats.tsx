
import StatsCard from "@/components/dashboard/StatsCard";
import { Video as VideoIcon, Wifi as WifiIcon, WifiOff } from "lucide-react";
import { Camera as CameraIcon } from "lucide-react";

interface DashboardStatsProps {
  totalCameras: number;
  onlineCameras: number;
  offlineCameras: number;
  recordingCameras: number;
}

const DashboardStats = ({
  totalCameras,
  onlineCameras,
  offlineCameras,
  recordingCameras
}: DashboardStatsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Cameras"
        value={totalCameras}
        icon={<CameraIcon className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Online"
        value={onlineCameras}
        icon={<WifiIcon className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Offline"
        value={offlineCameras}
        icon={<WifiOff className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Recording"
        value={recordingCameras}
        icon={<VideoIcon className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  );
};

export default DashboardStats;
