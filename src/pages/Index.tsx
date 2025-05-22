import { useState, useEffect, useMemo } from "react";
import { Camera, CameraStatus } from "@/types/camera";
import { Recording } from "@/hooks/recordings";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useRecordings } from "@/hooks/useRecordings";
import { useCameraData } from "@/hooks/useCameraData";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from 'next/navigation';
import AppLayout from "@/components/layout/AppLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import StorageCard from "@/components/dashboard/StorageCard";
import CameraCard from "@/components/dashboard/CameraCard";
import RecordingCard from "@/components/dashboard/RecordingCard";
import CameraControls from "@/components/dashboard/CameraControls";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Video as VideoIcon,
  Wifi as WifiIcon,
  WifiOff,
  ArrowDown,
  ArrowUp,
  Grip,
  List,
  Plus,
  Download,
  Share2,
  Edit,
  Trash2
} from "lucide-react";

type SortKey = 'name' | 'location' | 'status' | 'lastSeen';
type SortDirection = 'asc' | 'desc';

interface CameraControlsProps {
  onSortChange: (key: SortKey) => void;
  currentSort: SortKey;
  onSortDirectionToggle: () => void;
  currentSortDirection: SortDirection;
  onGroupChange: () => void;
  currentGrouping: 'none' | 'location';
}

const useCameraSorting = (cameras: Camera[]) => {
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const changeSortBy = (key: SortKey) => {
    if (sortBy === key) {
      toggleSortDirection();
    } else {
      setSortBy(key);
    }
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const sortedCameras = useMemo(() => {
    const sortFunction = (a: Camera, b: Camera): number => {
      let aValue: string | CameraStatus | number = a[sortBy];
      let bValue: string | CameraStatus | number = b[sortBy];

      if (sortBy === 'status') {
        const statusOrder: Record<CameraStatus, number> = {
          online: 1,
          recording: 2,
          offline: 3,
        };
        aValue = statusOrder[a.status];
        bValue = statusOrder[b.status];
      } else if (sortBy === 'lastSeen') {
        aValue = new Date(a.lastseen).getTime();
        bValue = new Date(b.lastseen).getTime();
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return aValue - bValue;
      } else {
        return 0;
      }
    };

    const sorted = [...cameras].sort(sortFunction);
    return sortDirection === 'asc' ? sorted : sorted.reverse();
  }, [cameras, sortBy, sortDirection]);

  return {
    sortedCameras,
    sortBy,
    sortDirection,
    changeSortBy,
    toggleSortDirection
  };
};

const Dashboard = () => {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const { toast } = useToast();
  const { cameras, loading: cameraLoading } = useCameraData();
  const { recordings, loading: recordingsLoading } = useRecordings();
  const [stats, setStats] = useState({
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
    toggleSortDirection
  } = useCameraSorting(cameras);

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
          storageUsed: data.storageUsed || '0 GB',
          storageTotal: data.storageTotal || '1 TB',
          storagePercentage: data.storagePercentage || 0,
          uptimeHours: data.uptimeHours || 0,
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
        <DashboardHeader />
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Cameras"
            value={stats.totalCameras}
            icon={<Camera className="h-4 w-4 text-muted-foreground" />}
          />
          <StatsCard
            title="Online"
            value={stats.onlineCameras}
            icon={<WifiIcon className="h-4 w-4 text-muted-foreground" />}
          />
          <StatsCard
            title="Offline"
            value={stats.offlineCameras}
            icon={<WifiOff className="h-4 w-4 text-muted-foreground" />}
          />
          <StatsCard
            title="Recording"
            value={stats.recordingCameras}
            icon={<VideoIcon className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
        
        <StorageCard 
          usedSpace={dashboardData.storageUsed || "0 GB"}
          totalSpace={dashboardData.storageTotal || "1 TB"}
          usedPercent={dashboardData.storagePercentage || 0}
          uptimeHours={dashboardData.uptimeHours || 0}
        />
        
        <Tabs defaultValue="cameras" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="cameras">All Cameras</TabsTrigger>
              <TabsTrigger value="recordings">Recent Recordings</TabsTrigger>
            </TabsList>
            <div className="items-center flex gap-2">
              {/* Fix CameraControls props to match expected interface */}
              <CameraControls 
                onSortChange={changeSortBy}
                currentSort={sortBy}
                onSortDirectionToggle={toggleSortDirection}
                currentSortDirection={sortDirection}
                onGroupChange={() => {}} // Empty function since we don't implement grouping here
                currentGrouping="none"
              />
            </div>
          </div>
          
          <TabsContent value="cameras" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cameraLoading ? (
                <>
                  <Skeleton className="h-48 w-full rounded-md" />
                  <Skeleton className="h-48 w-full rounded-md" />
                  <Skeleton className="h-48 w-full rounded-md" />
                </>
              ) : sortedCameras.length > 0 ? (
                sortedCameras.map((camera) => (
                  <CameraCard key={camera.id} camera={camera} />
                ))
              ) : (
                <div className="col-span-3 text-center">No cameras found.</div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="recordings" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recordingsLoading ? (
                <>
                  <Skeleton className="h-48 w-full rounded-md" />
                  <Skeleton className="h-48 w-full rounded-md" />
                  <Skeleton className="h-48 w-full rounded-md" />
                </>
              ) : recordings.length > 0 ? (
                recordings.map((recording) => (
                  <RecordingCard key={recording.id} recording={recording} />
                ))
              ) : (
                <div className="col-span-3 text-center">No recordings found.</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
