
import { useState } from "react";
import { Grid2X2, Grid3X3, LayoutGrid } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { getCameras } from "@/services/apiService";
import { useEffect } from "react";
import { Camera } from "@/types/camera";
import LiveFeed from "@/components/cameras/LiveFeed";

const LiveView = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState<"grid-2" | "grid-4" | "grid-9">("grid-4");

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const camerasData = await getCameras();
        setCameras(camerasData.filter(camera => camera.status === "online"));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cameras for live view:', error);
        setLoading(false);
      }
    };
    
    fetchCameras();
  }, []);

  const getGridClass = () => {
    switch (layout) {
      case "grid-2": return "grid-cols-1 md:grid-cols-2";
      case "grid-4": return "grid-cols-1 md:grid-cols-2 lg:grid-cols-2";
      case "grid-9": return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      default: return "grid-cols-1 md:grid-cols-2";
    }
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
          </div>
        </div>

        <h2 className="text-xl font-medium">Camera Feeds</h2>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p>Loading camera feeds...</p>
          </div>
        ) : cameras.length === 0 ? (
          <div className="flex items-center justify-center h-64 border border-border rounded-lg">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">No online cameras available</p>
              <p className="text-muted-foreground">Add cameras or ensure they are online to view live feeds</p>
            </div>
          </div>
        ) : (
          <div className={`grid ${getGridClass()} gap-4`}>
            {cameras.map(camera => (
              <LiveFeed key={camera.id} camera={camera} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default LiveView;
