
import { TabsContent, Tabs } from "@/components/ui/tabs";
import AppLayout from "@/components/layout/AppLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import StorageCard from "@/components/dashboard/StorageCard";
import CameraControls from "@/components/dashboard/CameraControls";
import CameraTabContent from "@/components/dashboard/CameraTabContent";
import { Camera, Cpu, AlertTriangle } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useCameraSorting } from "@/hooks/useCameraSorting";

const Dashboard = () => {
  const { stats, cameras, loading } = useDashboardData();
  const {
    sortOption, setSortOption,
    sortOrder, setSortOrder,
    groupBy, setGroupBy,
    getCameraList,
  } = useCameraSorting(cameras);

  return (
    <AppLayout>
      <div className="space-y-6">
        <DashboardHeader 
          title="Dashboard" 
          subtitle="Monitor your camera system status and activity" 
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Cameras"
            value={stats.totalCameras}
            icon={<Camera className="h-4 w-4 text-vision-blue-500" />}
            description="Connected to system"
          />
          <StatsCard
            title="Online Cameras"
            value={stats.onlineCameras}
            icon={<Cpu className="h-4 w-4 text-green-500" />}
            description={`${stats.totalCameras > 0 ? Math.round((stats.onlineCameras / stats.totalCameras) * 100) : 0}% online`}
            trend={{
              value: "1",
              positive: true,
            }}
          />
          <StatsCard
            title="Recording"
            value={stats.recordingCameras}
            icon={<Camera className="h-4 w-4 text-red-500" />}
            description={`${stats.recordingCameras} active recordings`}
          />
          <StatsCard
            title="Offline"
            value={stats.offlineCameras}
            icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
            description="Require attention"
            trend={{
              value: "1",
              positive: false,
            }}
          />
        </div>

        <StorageCard 
          storageUsed={stats.storageUsed}
          storageTotal={stats.storageTotal}
          storagePercentage={stats.storagePercentage}
          uptimeHours={stats.uptimeHours}
        />

        <div className="space-y-4">
          <Tabs defaultValue="all" className="w-full">
            <CameraControls 
              sortOption={sortOption}
              setSortOption={setSortOption}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              groupBy={groupBy}
              setGroupBy={setGroupBy}
            />
            
            {loading ? (
              <div className="py-10 text-center">Loading camera data...</div>
            ) : (
              <>
                <TabsContent value="all" className="mt-4">
                  <CameraTabContent
                    groupedCameras={getCameraList("all")}
                    groupBy={groupBy}
                    emptyCamerasMessage="No cameras found"
                    emptyCamerasDescription="Go to the Cameras page to add cameras to your system"
                    showManageCamerasButton={true}
                  />
                </TabsContent>
                
                <TabsContent value="online" className="mt-4">
                  <CameraTabContent
                    groupedCameras={getCameraList("online")}
                    groupBy={groupBy}
                    emptyCamerasMessage="No online cameras found"
                    emptyCamerasDescription="There are currently no cameras online"
                  />
                </TabsContent>
                
                <TabsContent value="offline" className="mt-4">
                  <CameraTabContent
                    groupedCameras={getCameraList("offline")}
                    groupBy={groupBy}
                    emptyCamerasMessage="No offline cameras"
                    emptyCamerasDescription="All cameras are currently online"
                  />
                </TabsContent>
                
                <TabsContent value="recording" className="mt-4">
                  <CameraTabContent
                    groupedCameras={getCameraList("recording")}
                    groupBy={groupBy}
                    emptyCamerasMessage="No recording cameras"
                    emptyCamerasDescription="No cameras are currently recording"
                  />
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
