
import { useState } from "react";
import { CameraConnectionType } from "@/types/camera";
import { CameraFormValues } from "../types/cameraModalTypes";

export function useCameraForm() {
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

  return {
    formState: {
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
    } as CameraFormValues,
    formActions: {
      handleFieldChange,
      handleTabChange,
      handleGroupChange,
      setNewGroupName,
      setIsVerifying,
      resetForm
    }
  };
}
