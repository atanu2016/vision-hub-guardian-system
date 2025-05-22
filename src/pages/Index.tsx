
import { useEffect, useState } from "react";
import { useCameraData } from "@/hooks/useCameraData";
import { useToast } from "@/hooks/use-toast";
import { useRecordings } from "@/hooks/useRecordings";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useDashboardCameras } from "@/hooks/useDashboardCameras";
import AppLayout from "@/components/layout/AppLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import StorageCard from "@/components/dashboard/StorageCard";
import DashboardTabs from "@/components/dashboard/DashboardTabs";

// Simplified type for dashboard stats
interface DashboardStats {
  totalCameras: number;
  onlineCameras: number;
  offlineCameras: number;
  recordingCameras: number;
}

const Dashboard = () => {
  const { toast } = useToast();
  const { cameras, loading: cameraLoading } = useCameraData();
  const { recordings, loading: recordingsLoading } = useRecordings();
  const [stats, setStats] = useState<DashboardStats>({
    totalCameras: 0,
    onlineCameras: 0,
    offlineCameras: 0,
    recordingCameras: 0,
  });
  const [dashboardData, setDashboardData] = useState({
    storageUsed: '0 GB',
    storageTotal: '1 TB',
    storagePercentage: 0,
    uptimeHours: 0,
  });
  const [loading, setLoading] = useState(true);

  const {
    sortedCameras,
    sortBy,
    sortDirection,
    changeSortBy,
    toggleSortDirection,
    grouping,
    setGrouping
  } = useDashboardCameras(cameras);

  useEffect(() => {
    const calculateStats = () => {
      const onlineCameras = cameras.filter(cam => cam.status === 'online').length;
      const offlineCameras = cameras.filter(cam => cam.status === 'offline').length;
      const recordingCameras = cameras.filter(cam => cam.status === 'recording').length;

      setStats({
        totalCameras: cameras.length,
        onlineCameras,
        offlineCameras,
        recordingCameras,
      });
    };

    calculateStats();
  }, [cameras]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await useDashboardData();
        setDashboardData({
          storageUsed: data.stats.storageUsed || '0 GB',
          storageTotal: data.stats.storageTotal || '1 TB',
          storagePercentage: data.stats.storagePercentage || 0,
          uptimeHours: data.stats.uptimeHours || 0,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast({
          title: "Could not load dashboard data",
          description: "Using fallback data.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  return (
    <AppLayout>
      <div className="space-y-6 pb-8">
        <DashboardHeader 
          title="Dashboard" 
          subtitle="Monitor your cameras and recordings"
        />
        
        <DashboardStats
          totalCameras={stats.totalCameras}
          onlineCameras={stats.onlineCameras}
          offlineCameras={stats.offlineCameras}
          recordingCameras={stats.recordingCameras}
        />
        
        <StorageCard 
          storageUsed={dashboardData.storageUsed}
          storageTotal={dashboardData.storageTotal}
          storagePercentage={dashboardData.storagePercentage}
          uptimeHours={dashboardData.uptimeHours}
        />
        
        <DashboardTabs
          cameras={cameras}
          recordings={recordings}
          cameraLoading={cameraLoading}
          recordingsLoading={recordingsLoading}
          sortBy={sortBy}
          sortDirection={sortDirection}
          grouping={grouping}
          sortedCameras={sortedCameras}
          changeSortBy={changeSortBy}
          toggleSortDirection={toggleSortDirection}
          setGrouping={setGrouping}
        />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
