
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, PauseCircle, PlayCircle, Settings, Share2, Video } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/components/layout/AppLayout";
import { useState } from "react";

// This would normally come from an API
const getMockCamera = (id: string) => {
  return {
    id,
    name: "Front Door Camera",
    location: "Main Entrance",
    ipAddress: "192.168.1.100",
    port: 8080,
    username: "admin",
    status: "online" as const,
    model: "Hikvision DS-2CD2385G1-I",
    manufacturer: "Hikvision",
    lastSeen: "2023-05-13T12:30:45Z",
    recording: true
  };
};

const CameraDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [isStreaming, setIsStreaming] = useState(true);
  
  if (!id) return <div>Camera not found</div>;
  
  const camera = getMockCamera(id);
  const isOnline = camera.status === "online";
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">{camera.name}</h1>
            <Badge variant={isOnline ? "default" : "outline"} className="ml-2">
              {isOnline ? "Online" : "Offline"}
            </Badge>
            {camera.recording && (
              <Badge variant="outline" className="bg-vision-dark-700 text-red-500">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  Recording
                </span>
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/cameras/${id}/settings`}>
                <Settings className="mr-2 h-4 w-4" /> Configure
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative aspect-video rounded-lg overflow-hidden border border-border bg-vision-dark-900">
              {isOnline ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Video size={48} className="mx-auto mb-4 text-vision-blue-500" />
                    <p className="text-lg">Live stream would appear here</p>
                    <p className="text-sm text-muted-foreground">
                      Connected to {camera.ipAddress}:{camera.port}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-lg">Camera offline</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Last seen: {new Date(camera.lastSeen || "").toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant={isStreaming ? "default" : "outline"}
                    className="flex-shrink-0"
                    onClick={() => setIsStreaming(!isStreaming)}
                  >
                    {isStreaming ? (
                      <>
                        <PauseCircle className="mr-2 h-4 w-4" /> Pause
                      </>
                    ) : (
                      <>
                        <PlayCircle className="mr-2 h-4 w-4" /> Play
                      </>
                    )}
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Snapshot
                  </Button>
                </div>
                
                <Badge variant="outline" className="bg-vision-dark-800/70 h-9 px-4 flex items-center">
                  Live
                </Badge>
              </div>
            </div>
            
            <Tabs defaultValue="recordings" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="recordings">Recordings</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              <TabsContent value="recordings" className="border rounded-md p-4 mt-2">
                <div className="text-center p-8">
                  <h3 className="text-lg font-medium mb-2">No recordings available</h3>
                  <p className="text-muted-foreground">Recordings will appear here when available</p>
                </div>
              </TabsContent>
              <TabsContent value="events" className="border rounded-md p-4 mt-2">
                <div className="text-center p-8">
                  <h3 className="text-lg font-medium mb-2">No events detected</h3>
                  <p className="text-muted-foreground">Events will appear here when detected</p>
                </div>
              </TabsContent>
              <TabsContent value="analytics" className="border rounded-md p-4 mt-2">
                <div className="text-center p-8">
                  <h3 className="text-lg font-medium mb-2">Analytics not available</h3>
                  <p className="text-muted-foreground">
                    Enable analytics in settings to view data
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <div className="border rounded-md p-4">
              <h2 className="text-lg font-medium mb-4">Camera Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p>{camera.location}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Model</p>
                  <p>{camera.model}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Manufacturer</p>
                  <p>{camera.manufacturer}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">IP Address</p>
                  <p>{camera.ipAddress}:{camera.port}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`}></span>
                    {isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  View Full Screen
                </Button>
                <Button className="w-full" variant="outline">
                  Begin Recording
                </Button>
                <Button className="w-full" variant="outline">
                  Configure Motion Detection
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CameraDetail;
