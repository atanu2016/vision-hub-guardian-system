
import { useState, useEffect } from "react";
import { Grid2X2, Grid3X3, LayoutGrid, Info } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { fetchCamerasFromDB } from "@/services/database/camera/fetchCameras";
import { Camera } from "@/types/camera";
import LiveFeed from "@/components/cameras/LiveFeed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useAuth } from "@/contexts/auth";
import { getAccessibleCameras } from "@/services/userManagement/cameraAssignmentService";

const LiveView = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState<"grid-2" | "grid-4" | "grid-9">("grid-4");
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const { user, role } = useAuth();

  useEffect(() => {
    fetchCameras();
  }, [user, role]);

  const fetchCameras = async () => {
    try {
      setLoading(true);
      
      // If user is not authenticated yet, return
      if (!user) {
        setCameras([]);
        return;
      }

      // Use the role-based access control for cameras
      let camerasData;
      
      // For admin and superadmin, show all cameras
      if (role === 'admin' || role === 'superadmin') {
        const dbCameras = await fetchCamerasFromDB();
        camerasData = dbCameras;
      } else {
        // For users and operators, show only assigned cameras
        camerasData = await getAccessibleCameras(user.id, role);
      }
      
      setCameras(camerasData);
    } catch (error) {
      console.error('Error fetching cameras for live view:', error);
      toast.error("Failed to fetch cameras");
    } finally {
      setLoading(false);
    }
  };

  const getGridClass = () => {
    switch (layout) {
      case "grid-2": return "grid-cols-1 md:grid-cols-2";
      case "grid-4": return "grid-cols-1 md:grid-cols-2 lg:grid-cols-2";
      case "grid-9": return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      default: return "grid-cols-1 md:grid-cols-2";
    }
  };

  const handleCameraSelect = (camera: Camera) => {
    setSelectedCamera(camera);
  };

  return (
    <AppLayout fullWidth>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Live View</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant={layout === "grid-2" ? "secondary" : "outline"} 
              size="icon"
              onClick={() => setLayout("grid-2")}
              className="h-8 w-8"
            >
              <Grid2X2 className="h-4 w-4" />
            </Button>
            <Button 
              variant={layout === "grid-4" ? "secondary" : "outline"} 
              size="icon"
              onClick={() => setLayout("grid-4")}
              className="h-8 w-8"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button 
              variant={layout === "grid-9" ? "secondary" : "outline"} 
              size="icon"
              onClick={() => setLayout("grid-9")}
              className="h-8 w-8"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={fetchCameras}
              className="ml-2"
            >
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-video bg-vision-dark-900">
                  <Skeleton className="h-full w-full" />
                </div>
                <div className="p-2">
                  <Skeleton className="h-6 w-32" />
                </div>
              </Card>
            ))}
          </div>
        ) : cameras.length === 0 ? (
          <div className="flex items-center justify-center h-64 border border-border rounded-lg">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">No cameras available</p>
              <p className="text-muted-foreground">
                {role === 'user' 
                  ? "You don't have access to any cameras yet. Please contact an administrator to get access."
                  : "Add cameras or check your connection to view live feeds"
                }
              </p>
            </div>
          </div>
        ) : (
          <div className={`grid ${getGridClass()} gap-4`}>
            {cameras.map(camera => (
              <Drawer key={camera.id}>
                <DrawerTrigger asChild>
                  <div onClick={() => handleCameraSelect(camera)}>
                    <LiveFeed camera={camera} />
                  </div>
                </DrawerTrigger>
                <DrawerContent className="max-h-[90vh]">
                  <DrawerHeader>
                    <DrawerTitle className="flex items-center">
                      <span className="mr-2">{camera.name}</span>
                      {camera.recording && (
                        <span className="bg-red-600 text-white px-2 py-0.5 text-xs rounded-md flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
                          REC
                        </span>
                      )}
                    </DrawerTitle>
                  </DrawerHeader>
                  <div className="p-4 space-y-6">
                    <div className="aspect-video w-full overflow-hidden rounded-lg">
                      <LiveFeed camera={camera} />
                    </div>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Camera Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <p className="font-medium">
                              {camera.status === "online" ? (
                                <span className="text-green-500">Online</span>
                              ) : (
                                <span className="text-red-500">Offline</span>
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Location</p>
                            <p className="font-medium">{camera.location || "Not specified"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">IP Address</p>
                            <p className="font-medium">{camera.ipAddress}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Model</p>
                            <p className="font-medium">{camera.model || "Unknown"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Connection Type</p>
                            <p className="font-medium">{camera.connectionType?.toUpperCase() || "IP"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Last Seen</p>
                            <p className="font-medium">
                              {new Date(camera.lastSeen).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </DrawerContent>
              </Drawer>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default LiveView;
