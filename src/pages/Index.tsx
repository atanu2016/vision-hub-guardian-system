
import { Camera, Cpu, HardDrive, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import AppLayout from "@/components/layout/AppLayout";
import CameraGrid from "@/components/cameras/CameraGrid";
import StatsCard from "@/components/dashboard/StatsCard";
import { mockCameras, getSystemStats } from "@/data/mockData";

const Dashboard = () => {
  const stats = getSystemStats();
  const onlineCameras = mockCameras.filter(camera => camera.status === "online");
  const offlineCameras = mockCameras.filter(camera => camera.status === "offline");
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor your camera system status and activity
            </p>
          </div>
          <div>
            <Button>
              <Camera className="mr-2 h-4 w-4" /> Add Camera
            </Button>
          </div>
        </div>

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
            description={`${Math.round((stats.onlineCameras / stats.totalCameras) * 100)}% online`}
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Storage Usage</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1">
              <HardDrive className="h-4 w-4" /> Details
            </Button>
          </CardHeader>
          <CardContent>
            <div className="mt-2">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">
                  {stats.storageUsed} used of {stats.storageTotal}
                </div>
                <div className="text-sm font-medium">{stats.storagePercentage}%</div>
              </div>
              <Progress value={stats.storagePercentage} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium">Est. Recording Time Left</span>
                <span className="text-2xl font-bold">14 Days</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium">System Uptime</span>
                <span className="text-2xl font-bold">{stats.uptimeHours} Hours</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Cameras</TabsTrigger>
              <TabsTrigger value="online">Online</TabsTrigger>
              <TabsTrigger value="offline">Offline</TabsTrigger>
              <TabsTrigger value="recording">Recording</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <CameraGrid cameras={mockCameras} />
            </TabsContent>
            <TabsContent value="online" className="mt-4">
              <CameraGrid cameras={onlineCameras} />
            </TabsContent>
            <TabsContent value="offline" className="mt-4">
              <CameraGrid cameras={offlineCameras} />
            </TabsContent>
            <TabsContent value="recording" className="mt-4">
              <CameraGrid cameras={mockCameras.filter(c => c.recording)} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
