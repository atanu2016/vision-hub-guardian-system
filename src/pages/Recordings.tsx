
import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Play, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

// Mocked recording data for demonstration
interface Recording {
  id: string;
  cameraName: string;
  date: string;
  time: string;
  duration: number;
  fileSize: string;
  type: "Scheduled" | "Motion" | "Manual";
  important: boolean;
  thumbnailUrl?: string;
}

// Later this should be fetched from an actual API
const mockRecordings: Recording[] = [
  {
    id: "rec1",
    cameraName: "Front Entrance",
    date: "2025-05-17",
    time: "08:00:00",
    duration: 165,
    fileSize: "290 MB",
    type: "Scheduled",
    important: true,
    thumbnailUrl: "/placeholder.svg"
  },
  {
    id: "rec2",
    cameraName: "Front Entrance",
    date: "2025-05-17",
    time: "14:00:00",
    duration: 105,
    fileSize: "128 MB",
    type: "Motion",
    important: false,
    thumbnailUrl: "/placeholder.svg"
  },
  {
    id: "rec3",
    cameraName: "Front Entrance",
    date: "2025-05-17",
    time: "11:00:00",
    duration: 15,
    fileSize: "40 MB",
    type: "Motion",
    important: false,
    thumbnailUrl: "/placeholder.svg"
  },
  {
    id: "rec4",
    cameraName: "Front Entrance",
    date: "2025-05-17",
    time: "18:00:00",
    duration: 45,
    fileSize: "103 MB",
    type: "Motion",
    important: true,
    thumbnailUrl: "/placeholder.svg"
  },
  {
    id: "rec5",
    cameraName: "Parking Lot",
    date: "2025-05-17",
    time: "14:00:00",
    duration: 90,
    fileSize: "151 MB",
    type: "Scheduled",
    important: false,
    thumbnailUrl: "/placeholder.svg"
  },
  {
    id: "rec6",
    cameraName: "Parking Lot",
    date: "2025-05-17",
    time: "16:00:00",
    duration: 120,
    fileSize: "280 MB",
    type: "Manual",
    important: true,
    thumbnailUrl: "/placeholder.svg"
  },
  {
    id: "rec7",
    cameraName: "Parking Lot",
    date: "2025-05-17", 
    time: "08:00:00",
    duration: 105,
    fileSize: "283 MB",
    type: "Scheduled",
    important: false,
    thumbnailUrl: "/placeholder.svg"
  }
];

const Recordings = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [cameras, setCameras] = useState<{id: string, name: string}[]>([]);
  const [storageUsed, setStorageUsed] = useState({ used: 134.5, total: 500 });

  // Format minutes to display as "X minutes"
  const formatDuration = (minutes: number) => {
    return `${minutes} minutes`;
  };

  useEffect(() => {
    // Simulate API call to get recordings and cameras
    setTimeout(() => {
      setRecordings(mockRecordings);
      
      // Extract unique cameras from recordings
      const uniqueCameras = Array.from(new Set(mockRecordings.map(r => r.cameraName)))
        .map(name => ({ id: name.toLowerCase().replace(/\s+/g, '-'), name }));
      
      setCameras(uniqueCameras);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter recordings based on selected camera and type
  const filteredRecordings = recordings.filter(recording => {
    const matchesCamera = selectedCamera === "all" || recording.cameraName === selectedCamera;
    const matchesType = selectedType === "all" || recording.type.toLowerCase() === selectedType.toLowerCase();
    return matchesCamera && matchesType;
  });

  // Get the display date for the header
  const displayDate = recordings.length > 0 ? format(new Date(recordings[0].date), "MMM dd, yyyy") : "";

  return (
    <AppLayout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recordings</h1>
          <p className="text-muted-foreground">
            View and manage your camera recordings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          {/* Left sidebar */}
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

          {/* Main content area */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <p>Loading recordings...</p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold">{filteredRecordings.length} Recordings from {displayDate}</h2>
                
                <div className="space-y-4">
                  {filteredRecordings.map(recording => (
                    <div 
                      key={recording.id}
                      className="bg-secondary/25 rounded-lg p-4 flex flex-col sm:flex-row gap-4 border border-border"
                    >
                      <div className="relative w-full sm:w-[140px]">
                        <div className="aspect-video bg-vision-dark-900 rounded overflow-hidden flex items-center justify-center">
                          <Play className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </div>
                      
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{recording.cameraName}</h3>
                            <Badge variant={recording.type === "Motion" ? "default" : "outline"}>
                              {recording.type}
                            </Badge>
                            {recording.important && (
                              <Badge className="bg-green-700">Important</Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{format(new Date(`${recording.date}T${recording.time}`), "MMM dd, yyyy")}</span>
                            </div>
                            <div>
                              <span>{recording.time}</span>
                            </div>
                            <div>
                              <span>{formatDuration(recording.duration)}</span>
                            </div>
                            <div>
                              <span>{recording.fileSize}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-2 sm:mt-0">
                          <Button size="sm" variant="outline">
                            <Play className="mr-1 h-4 w-4" />
                            Play
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="mr-1 h-4 w-4" />
                            Download
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Recordings;
