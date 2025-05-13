
import { useState } from "react";
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
import { Camera, CameraStatus } from "@/types/camera";

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
  const [group, setGroup] = useState("Ungrouped");
  const [model, setModel] = useState("");
  const [manufacturer, setManufacturer] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !location || !ipAddress || !port) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
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

    const newCamera: Omit<Camera, "id"> = {
      name,
      location,
      ipAddress,
      port: parseInt(port),
      username,
      status: "offline" as CameraStatus, // Default to offline until connection is established
      model,
      manufacturer,
      lastSeen: new Date().toISOString(),
      recording: false,
      group: group || "Ungrouped",
    };

    onAdd(newCamera);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setLocation("");
    setIpAddress("");
    setPort("8080");
    setUsername("admin");
    setGroup("Ungrouped");
    setModel("");
    setManufacturer("");
    onClose();
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
              <Label htmlFor="group">Camera Group</Label>
              <Select value={group} onValueChange={setGroup}>
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
              <div className="space-y-2 col-span-full">
                <Label htmlFor="newGroup">New Group Name</Label>
                <Input
                  id="newGroup"
                  onChange={(e) => setGroup(e.target.value)}
                  placeholder="New Group Name"
                />
              </div>
            )}
          </div>
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
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit">Add Camera</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCameraModal;
