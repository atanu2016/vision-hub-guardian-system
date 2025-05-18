
import React from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";

interface UserActionsProps {
  onCameraAssignmentButtonClick: () => void;
}

export const UserActions: React.FC<UserActionsProps> = ({
  onCameraAssignmentButtonClick,
}) => {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission('assign-cameras')) {
    return null;
  }

  return (
    <div className="flex justify-end mt-4">
      <Button 
        variant="outline" 
        onClick={onCameraAssignmentButtonClick}
        className="ml-2"
      >
        <Camera className="h-4 w-4 mr-1" />
        Assign Cameras to Users
      </Button>
    </div>
  );
};
