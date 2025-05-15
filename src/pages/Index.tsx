import { useState, useEffect } from "react";
import { Camera as CameraIcon, Cpu, HardDrive, AlertTriangle, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import AppLayout from "@/components/layout/AppLayout";
import CameraGrid from "@/components/cameras/CameraGrid";
import StatsCard from "@/components/dashboard/StatsCard";
import { getCameras, getSystemStats } from "@/data/mockData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Camera as CameraType } from "@/types/camera";
import { toast, useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [stats, setStats] = useState<any>({
    totalCameras: 0,
    onlineCameras: 0,
    offlineCameras: 0,
    recordingCameras: 0,
    storageUsed: "0 GB",
    storageTotal: "1 TB",
    storagePercentage: 0,
    uptimeHours: 0
  });
  const [cameras, setCameras] = useState<CameraType[]>([]);
  const [sortOption, setSortOption] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [groupBy, setGroupBy] = useState<"none" | "group" | "location">("none");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch cameras
      const camerasData = await getCameras();
      setCameras(camerasData);
      
      // Fetch system stats
      const statsData = await getSystemStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast("Error fetching data", {
        description: "Could not connect to the server. Using cached data instead.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Refresh data periodically
  useEffect(() => {
    // Get initial data
    fetchData();
    
    // Set up refresh interval
    const interval = setInterval(() => {
      fetchData();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const onlineCameras = cameras.filter(camera => camera.status === "online");
  const offlineCameras = cameras.filter(camera => camera.status === "offline");
  const recordingCameras = cameras.filter(camera => camera.recording);

  // Sort cameras based on selected option
  const sortCameras = (camerasToSort: CameraType[]) => {
    return [...camerasToSort].sort((a, b) => {
      let valueA, valueB;
      
      switch (sortOption) {
        case "name":
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case "location":
          valueA = a.location.toLowerCase();
          valueB = b.location.toLowerCase();
          break;
        case "status":
          valueA = a.status;
          valueB = b.status;
          break;
        case "lastSeen":
          valueA = a.lastSeen || "";
          valueB = b.lastSeen || "";
          break;
        default:
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
      }
      
      if (sortOrder === "asc") {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });
  };

  // Group cameras if groupBy is selected
  const groupCameras = (camerasToGroup: CameraType[]) => {
    if (groupBy === "none") {
      return [{
        id: "all",
        name: "All Cameras",
        cameras: sortCameras(camerasToGroup)
      }];
    }
    
    const grouped = camerasToGroup.reduce((acc, camera) => {
      const key = groupBy === "group" 
        ? (camera.group || "Ungrouped") 
        : camera.location;
        
      if (!acc[key]) {
        acc[key] = [];
      }
      
      acc[key].push(camera);
      return acc;
    }, {} as Record<string, CameraType[]>);
    
    return Object.entries(grouped).map(([name, groupCameras]) => ({
      id: name,
      name,
      cameras: sortCameras(groupCameras)
    }));
  };

  // Get camera list based on tab and apply sorting/grouping
  const getCameraList = (tabValue: string) => {
    let cameraList;
    
    switch (tabValue) {
      case "all":
        cameraList = cameras;
        break;
      case "online":
        cameraList = onlineCameras;
        break;
      case "offline":
        cameraList = offlineCameras;
        break;
      case "recording":
        cameraList = recordingCameras;
        break;
      default:
        cameraList = cameras;
    }
    
    return groupCameras(cameraList);
  };
  
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
          {/* "Add Camera" button removed from dashboard as requested */}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Cameras"
            value={stats.totalCameras}
            icon={<CameraIcon className="h-4 w-4 text-vision-blue-500" />}
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
            icon={<CameraIcon className="h-4 w-4 text-red-500" />}
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
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1" 
              onClick={() => window.location.href = "/settings/storage"}
            >
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
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
              <TabsList>
                <TabsTrigger value="all">All Cameras</TabsTrigger>
                <TabsTrigger value="online">Online</TabsTrigger>
                <TabsTrigger value="offline">Offline</TabsTrigger>
                <TabsTrigger value="recording">Recording</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Sort & Group
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={sortOption} onValueChange={setSortOption}>
                      <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="location">Location</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="status">Status</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="lastSeen">Last Seen</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuLabel>Order</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={sortOrder} onValueChange={(value) => setSortOrder(value as "asc" | "desc")}>
                      <DropdownMenuRadioItem value="asc">Ascending</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="desc">Descending</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuLabel>Group by</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={groupBy} onValueChange={(value) => setGroupBy(value as "none" | "group" | "location")}>
                      <DropdownMenuRadioItem value="none">No Grouping</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="group">Camera Group</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="location">Location</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {loading ? (
              <div className="py-10 text-center">Loading camera data...</div>
            ) : (
              <>
                <TabsContent value="all" className="mt-4">
                  {getCameraList("all").map(group => (
                    <div key={group.id} className="mb-8">
                      {groupBy !== "none" && <h3 className="text-xl font-semibold mb-4">{group.name}</h3>}
                      <CameraGrid cameras={group.cameras} />
                    </div>
                  ))}
                  {cameras.length === 0 && (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-medium">No cameras found</h3>
                      <p className="text-muted-foreground mt-2">
                        Go to the Cameras page to add cameras to your system
                      </p>
                      <Button 
                        className="mt-4"
                        onClick={() => window.location.href = "/cameras"}
                      >
                        <CameraIcon className="mr-2 h-4 w-4" />
                        Manage Cameras
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="online" className="mt-4">
                  {getCameraList("online").map(group => (
                    <div key={group.id} className="mb-8">
                      {groupBy !== "none" && <h3 className="text-xl font-semibold mb-4">{group.name}</h3>}
                      <CameraGrid cameras={group.cameras} />
                    </div>
                  ))}
                  {onlineCameras.length === 0 && (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-medium">No online cameras found</h3>
                      <p className="text-muted-foreground mt-2">
                        There are currently no cameras online
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="offline" className="mt-4">
                  {getCameraList("offline").map(group => (
                    <div key={group.id} className="mb-8">
                      {groupBy !== "none" && <h3 className="text-xl font-semibold mb-4">{group.name}</h3>}
                      <CameraGrid cameras={group.cameras} />
                    </div>
                  ))}
                  {offlineCameras.length === 0 && (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-medium">No offline cameras</h3>
                      <p className="text-muted-foreground mt-2">
                        All cameras are currently online
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="recording" className="mt-4">
                  {getCameraList("recording").map(group => (
                    <div key={group.id} className="mb-8">
                      {groupBy !== "none" && <h3 className="text-xl font-semibold mb-4">{group.name}</h3>}
                      <CameraGrid cameras={group.cameras} />
                    </div>
                  ))}
                  {recordingCameras.length === 0 && (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-medium">No recording cameras</h3>
                      <p className="text-muted-foreground mt-2">
                        No cameras are currently recording
                      </p>
                    </div>
                  )}
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
