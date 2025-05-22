
import { useState, useEffect } from "react";
import { Camera, CameraConnectionType } from "@/types/camera";
import { CameraUIProps, toDatabaseCamera } from "@/utils/cameraPropertyMapper"; 
import { useToast } from "@/hooks/use-toast";

interface UseCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (camera: Omit<Camera, "id">) => void;
  existingGroups: string[];
}

export function useCameraModal({ isOpen, onClose, onAdd, existingGroups }: UseCameraModalProps) {
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
  const [hlsUrl, setHlsUrl] = useState("");
  const [onvifPath, setOnvifPath] = useState("/onvif/device_service");
  const [isVerifying, setIsVerifying] = useState(false);
  const [connectionTab, setConnectionTab] = useState("ip");

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleFieldChange = (field: string, value: string) => {
    switch (field) {
      case "name": setName(value); break;
      case "location": setLocation(value); break;
      case "ipAddress": setIpAddress(value); break;
      case "port": setPort(value); break;
      case "username": setUsername(value); break;
      case "password": setPassword(value); break;
      case "model": setModel(value); break;
      case "manufacturer": setManufacturer(value); break;
      case "rtmpUrl": setRtmpUrl(value); break;
      case "hlsUrl": setHlsUrl(value); break;
      case "onvifPath": setOnvifPath(value); break;
      default: break;
    }
  };

  const handleTabChange = (tab: string) => {
    setConnectionTab(tab);
    setConnectionType(tab as CameraConnectionType);
  };

  const handleGroupChange = (value: string) => {
    setGroup(value);
    if (value !== "new") {
      setNewGroupName("");
    }
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
    setHlsUrl("");
    setOnvifPath("/onvif/device_service");
    setConnectionTab("ip");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!name || !location) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Connection type specific validation
    if (connectionType === "ip") {
      if (!ipAddress || !port) {
        toast({
          title: "Error",
          description: "IP address and port are required",
          variant: "destructive"
        });
        return;
      }

      // Simple IP validation
      const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipRegex.test(ipAddress)) {
        toast({
          title: "Error",
          description: "Please enter a valid IP address",
          variant: "destructive"
        });
        return;
      }
    } else if (connectionType === "rtmp") {
      if (!rtmpUrl) {
        toast({
          title: "Error",
          description: "RTMP URL is required",
          variant: "destructive"
        });
        return;
      }
      
      // Basic RTMP URL validation
      if (!rtmpUrl.startsWith("rtmp://")) {
        toast({
          title: "Error",
          description: "RTMP URL should start with rtmp://",
          variant: "destructive"
        });
        return;
      }
    } else if (connectionType === "hls") {
      if (!hlsUrl) {
        toast({
          title: "Error",
          description: "HLS URL is required",
          variant: "destructive"
        });
        return;
      }
      
      // Basic HLS URL validation
      if (!hlsUrl.includes(".m3u8")) {
        toast({
          title: "Error",
          description: "HLS URL should include .m3u8 format",
          variant: "destructive"
        });
        return;
      }
    } else if (connectionType === "onvif") {
      if (!ipAddress || !port) {
        toast({
          title: "Error",
          description: "IP address and port are required for ONVIF",
          variant: "destructive"
        });
        return;
      }
      
      if (!username || !password) {
        toast({
          title: "Error",
          description: "Username and password are required for ONVIF",
          variant: "destructive"
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
        title: "Error",
        description: "Please provide a name for the new group",
        variant: "destructive"
      });
      return;
    }

    // Verify connection (simulated for now)
    setIsVerifying(true);
    
    try {
      // In a real app, this would make an API call to verify the camera connection
      await simulateConnectionTest();
      
      // Create camera in UI format first
      const newCameraUI: Omit<CameraUIProps, "id" | "lastSeen"> = {
        name,
        location,
        ipAddress: ['rtmp', 'hls'].includes(connectionType) ? "" : ipAddress,
        port: ['rtmp', 'hls'].includes(connectionType) ? 0 : parseInt(port),
        username,
        password,
        status: "online", // Assuming successful verification sets it to online
        model,
        manufacturer,
        recording: false,
        group: finalGroup,
        connectionType,
        rtmpUrl: connectionType === "rtmp" ? rtmpUrl : undefined,
        hlsUrl: connectionType === "hls" ? hlsUrl : undefined,
        onvifPath: connectionType === "onvif" ? onvifPath : undefined,
      };

      // Convert to database format for saving
      const dbCamera = toDatabaseCamera({
        ...newCameraUI,
        id: "", // Will be generated on the server
        lastSeen: new Date().toISOString()
      });

      // Remove the id as it will be generated
      const { id, ...newCameraWithoutId } = dbCamera;
      
      onAdd(newCameraWithoutId);
      toast({
        title: "Success",
        description: `${name} has been added to ${finalGroup}`
      });
      resetForm();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not connect to camera. Check credentials and try again.",
        variant: "destructive"
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

  return {
    formValues: {
      name,
      location,
      ipAddress,
      port,
      username,
      password,
      group,
      newGroupName,
      model,
      manufacturer,
      connectionType,
      rtmpUrl,
      hlsUrl,
      onvifPath,
      connectionTab,
      isVerifying
    },
    handlers: {
      handleFieldChange,
      handleTabChange,
      handleGroupChange,
      handleSubmit,
      setNewGroupName,
      resetForm
    }
  };
}
