
import { useState, useEffect } from "react";
import { Camera, CameraConnectionType } from "@/types/camera";
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
      toast.error("Please fill in all required fields");
      return;
    }

    // Connection type specific validation
    if (connectionType === "ip") {
      if (!ipAddress || !port) {
        toast.error("IP address and port are required");
        return;
      }

      // Simple IP validation
      const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipRegex.test(ipAddress)) {
        toast.error("Please enter a valid IP address");
        return;
      }
    } else if (connectionType === "rtmp") {
      if (!rtmpUrl) {
        toast.error("RTMP URL is required");
        return;
      }
      
      // Basic RTMP URL validation
      if (!rtmpUrl.startsWith("rtmp://")) {
        toast.error("RTMP URL should start with rtmp://");
        return;
      }
    } else if (connectionType === "hls") {
      if (!hlsUrl) {
        toast.error("HLS URL is required");
        return;
      }
      
      // Basic HLS URL validation
      if (!hlsUrl.includes(".m3u8")) {
        toast.error("HLS URL should include .m3u8 format");
        return;
      }
    } else if (connectionType === "onvif") {
      if (!ipAddress || !port) {
        toast.error("IP address and port are required for ONVIF");
        return;
      }
      
      if (!username || !password) {
        toast.error("Username and password are required for ONVIF");
        return;
      }
    }

    // Process group information
    let finalGroup = group;
    if (group === "new" && newGroupName) {
      finalGroup = newGroupName.trim();
    } else if (group === "new" && !newGroupName) {
      toast.error("Please provide a name for the new group");
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
        ipAddress: ['rtmp', 'hls'].includes(connectionType) ? "" : ipAddress,
        port: ['rtmp', 'hls'].includes(connectionType) ? 0 : parseInt(port),
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
        hlsUrl: connectionType === "hls" ? hlsUrl : undefined,
        onvifPath: connectionType === "onvif" ? onvifPath : undefined,
      };

      onAdd(newCamera);
      toast.success(`${name} has been added to ${finalGroup}`);
      resetForm();
      onClose();
    } catch (error) {
      toast.error("Could not connect to camera. Check credentials and try again.");
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
