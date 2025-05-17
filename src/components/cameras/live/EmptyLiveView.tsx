
import React from "react";
import { UserRole } from "@/types/admin";

interface EmptyLiveViewProps {
  role: UserRole | undefined;
}

const EmptyLiveView: React.FC<EmptyLiveViewProps> = ({ role }) => {
  return (
    <div className="flex items-center justify-center h-64 border border-border rounded-lg">
      <div className="text-center">
        <p className="text-lg font-medium mb-2">No cameras available</p>
        <p className="text-muted-foreground">
          {role === 'user' 
            ? "You don't have access to any cameras yet. Please contact an administrator to get access."
            : "Add cameras or check your connection to view live feeds"
          }
        </p>
      </div>
    </div>
  );
};

export default EmptyLiveView;
