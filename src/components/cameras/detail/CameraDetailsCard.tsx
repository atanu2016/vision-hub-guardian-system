
import { Camera } from "@/types/camera";
import { Separator } from "@/components/ui/separator";

interface CameraDetailsCardProps {
  camera: Camera;
}

const CameraDetailsCard = ({ camera }: CameraDetailsCardProps) => {
  const isOnline = camera.status === "online";
  
  return (
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
          <p>{camera.model || "Not specified"}</p>
        </div>
        <Separator />
        <div>
          <p className="text-sm text-muted-foreground">Manufacturer</p>
          <p>{camera.manufacturer || "Not specified"}</p>
        </div>
        <Separator />
        <div>
          <p className="text-sm text-muted-foreground">IP Address</p>
          <p>{camera.ipAddress}:{camera.port}</p>
        </div>
        <Separator />
        <div>
          <p className="text-sm text-muted-foreground">Connection Type</p>
          <p>{camera.connectionType?.toUpperCase() || "IP"}</p>
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
  );
};

export default CameraDetailsCard;
