
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trash2 } from "lucide-react";
import { Camera, StorageInfo } from "@/hooks/useRecordings";

interface RecordingsSidebarProps {
  cameras: Camera[];
  selectedCamera: string;
  setSelectedCamera: (camera: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  storageUsed: StorageInfo;
}

export default function RecordingsSidebar({
  cameras,
  selectedCamera,
  setSelectedCamera,
  selectedType,
  setSelectedType,
  storageUsed
}: RecordingsSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Camera selection */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Cameras</h2>
        <div className="space-y-1">
          <Button 
            variant={selectedCamera === "all" ? "secondary" : "ghost"} 
            className="w-full justify-start"
            onClick={() => setSelectedCamera("all")}
          >
            All Cameras
          </Button>
          
          {cameras.map(camera => (
            <Button 
              key={camera.id}
              variant={selectedCamera === camera.name ? "secondary" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setSelectedCamera(camera.name)}
            >
              <span className={`h-2 w-2 rounded-full mr-2 ${camera.name.includes('Parking') ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {camera.name}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Recording type selection */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recording Type</h2>
        <div className="space-y-1">
          <Button 
            variant={selectedType === "all" ? "secondary" : "ghost"} 
            className="w-full justify-start"
            onClick={() => setSelectedType("all")}
          >
            All Types
          </Button>
          <Button 
            variant={selectedType === "scheduled" ? "secondary" : "ghost"} 
            className="w-full justify-start"
            onClick={() => setSelectedType("scheduled")}
          >
            Scheduled
          </Button>
          <Button 
            variant={selectedType === "manual" ? "secondary" : "ghost"} 
            className="w-full justify-start"
            onClick={() => setSelectedType("manual")}
          >
            Manual
          </Button>
          <Button 
            variant={selectedType === "motion" ? "secondary" : "ghost"} 
            className="w-full justify-start"
            onClick={() => setSelectedType("motion")}
          >
            Motion
          </Button>
        </div>
      </div>

      {/* Storage section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Storage</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="flex justify-between text-sm">
              <span>Used Space</span>
              <span className="font-medium">{storageUsed.used} GB / {storageUsed.total} GB</span>
            </p>
            <Progress className="h-2 mt-2" value={(storageUsed.used / storageUsed.total) * 100} />
            
            <Button 
              variant="outline"
              className="w-full mt-4"
              size="sm"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Cleanup Old Recordings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
