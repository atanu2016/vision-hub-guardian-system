
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Camera, CameraConnectionType, CameraStatus } from "@/types/camera";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AddCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (camera: Omit<Camera, "id">) => void;
  existingGroups: string[];
}

const AddCameraModal = ({ isOpen, onClose, onAdd, existingGroups }: AddCameraModalProps) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [port, setPort] = useState("8080");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [group, setGroup] = useState("Ungrouped");
  const [newGroupName, setNewGroupName] = useState("");
  const [model, setModel] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [connectionType, setConnectionType] = useState<CameraConnectionType>("ip");
  const [rtmpUrl, setRtmpUrl] = useState("");
  const [onvifPath, setOnvifPath] = useState("/onvif/device_service");
  const [isVerifying, setIsVerifying] = useState(false);
  const [connectionTab, setConnectionTab] = useState("ip");

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!name || !location) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Connection type specific validation
    if (connectionType === "ip") {
      if (!ipAddress || !port) {
        toast({
          title: "Validation Error",
          description: "IP address and port are required",
          variant: "destructive",
        });
        return;
      }

      // Simple IP validation
      const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipRegex.test(ipAddress)) {
        toast({
          title: "Invalid IP Address",
          description: "Please enter a valid IP address",
          variant: "destructive",
        });
        return;
      }
    } else if (connectionType === "rtmp") {
      if (!rtmpUrl) {
        toast({
          title: "Validation Error",
          description: "RTMP URL is required",
          variant: "destructive",
        });
        return;
      }
      
      // Basic RTMP URL validation
      if (!rtmpUrl.startsWith("rtmp://")) {
        toast({
          title: "Invalid RTMP URL",
          description: "RTMP URL should start with rtmp://",
          variant: "destructive",
        });
        return;
      }
    } else if (connectionType === "onvif") {
      if (!ipAddress || !port) {
        toast({
          title: "Validation Error",
          description: "IP address and port are required for ONVIF",
          variant: "destructive",
        });
        return;
      }
      
      if (!username || !password) {
        toast({
          title: "Validation Error", 
          description: "Username and password are required for ONVIF",
          variant: "destructive",
        });
        return;
      }
    }

    // Process group information
    let finalGroup = group;
    if (group === "new" && newGroupName) {
      finalGroup = newGroupName.trim();
    } else if (group === "new" && !newGroupName) {
      toast({
        title: "Validation Error",
        description: "Please provide a name for the new group",
        variant: "destructive",
      });
      return;
    }

    // Verify connection (simulated for now)
    setIsVerifying(true);
    
    try {
      // In a real app, this would make an API call to verify the camera connection
      await simulateConnectionTest();
      
      const newCamera: Omit<Camera, "id"> = {
        name,
        location,
        ipAddress: connectionType === "rtmp" ? "" : ipAddress,
        port: connectionType === "rtmp" ? 0 : parseInt(port),
        username,
        password,
        status: "online", // Assuming successful verification sets it to online
        model,
        manufacturer,
        lastSeen: new Date().toISOString(),
        recording: false,
        group: finalGroup,
        connectionType,
        rtmpUrl: connectionType === "rtmp" ? rtmpUrl : undefined,
        onvifPath: connectionType === "onvif" ? onvifPath : undefined,
      };

      onAdd(newCamera);
      toast({
        title: "Camera Added Successfully",
        description: `${name} has been added to ${finalGroup}`,
      });
      resetForm();
      onClose();
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Could not connect to camera. Check credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Simulated connection test
  const simulateConnectionTest = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 90% chance of success for demo purposes
        if (Math.random() < 0.9) {
          resolve();
        } else {
          reject(new Error("Connection failed"));
        }
      }, 1000); // Simulate network delay
    });
  };

  const resetForm = () => {
    setName("");
    setLocation("");
    setIpAddress("");
    setPort("8080");
    setUsername("admin");
    setPassword("");
    setGroup("Ungrouped");
    setNewGroupName("");
    setModel("");
    setManufacturer("");
    setConnectionType("ip");
    setRtmpUrl("");
    setOnvifPath("/onvif/device_service");
    setConnectionTab("ip");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Camera</DialogTitle>
          <DialogDescription>
            Enter the details of the camera you want to add to the system.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Camera Name*</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Front Door Camera"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location*</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Main Entrance"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Connection Type</Label>
            <Tabs 
              value={connectionTab} 
              onValueChange={tab => {
                setConnectionTab(tab);
                setConnectionType(tab as CameraConnectionType);
              }}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ip">IP Camera</TabsTrigger>
                <TabsTrigger value="onvif">ONVIF</TabsTrigger>
                <TabsTrigger value="rtmp">RTMP</TabsTrigger>
              </TabsList>
              
              <TabsContent value="ip" className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ipAddress">IP Address*</Label>
                    <Input
                      id="ipAddress"
                      value={ipAddress}
                      onChange={(e) => setIpAddress(e.target.value)}
                      placeholder="192.168.1.100"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="port">Port*</Label>
                    <Input
                      id="port"
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                      placeholder="8080"
                      type="number"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="•••••••••"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="onvif" className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="onvifIp">IP Address*</Label>
                    <Input
                      id="onvifIp"
                      value={ipAddress}
                      onChange={(e) => setIpAddress(e.target.value)}
                      placeholder="192.168.1.100"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="onvifPort">Port*</Label>
                    <Input
                      id="onvifPort"
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                      placeholder="8080"
                      type="number"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="onvifUsername">Username*</Label>
                    <Input
                      id="onvifUsername"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="onvifPassword">Password*</Label>
                    <Input
                      id="onvifPassword"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="•••••••••"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="onvifPath">ONVIF Path</Label>
                  <Input
                    id="onvifPath"
                    value={onvifPath}
                    onChange={(e) => setOnvifPath(e.target.value)}
                    placeholder="/onvif/device_service"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="rtmp" className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="rtmpUrl">RTMP URL*</Label>
                  <Input
                    id="rtmpUrl"
                    value={rtmpUrl}
                    onChange={(e) => setRtmpUrl(e.target.value)}
                    placeholder="rtmp://server:1935/live/stream"
                    required
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="group">Camera Group</Label>
            <Select 
              value={group} 
              onValueChange={val => {
                setGroup(val);
                if (val !== "new") {
                  setNewGroupName("");
                }
              }}
            >
              <SelectTrigger id="group">
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ungrouped">Ungrouped</SelectItem>
                {existingGroups.map((groupName) => (
                  <SelectItem key={groupName} value={groupName}>
                    {groupName}
                  </SelectItem>
                ))}
                <SelectItem value="new">+ Create New Group</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {group === "new" && (
            <div className="space-y-2">
              <Label htmlFor="newGroup">New Group Name</Label>
              <Input
                id="newGroup"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="New Group Name"
                autoFocus
              />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model">Model (Optional)</Label>
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="DS-2CD2385G1-I"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer (Optional)</Label>
              <Input
                id="manufacturer"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="Hikvision"
              />
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="outline" onClick={() => {
              resetForm();
              onClose();
            }}>
              Cancel
            </Button>
            <Button type="submit" disabled={isVerifying}>
              {isVerifying ? "Verifying..." : "Add Camera"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCameraModal;
