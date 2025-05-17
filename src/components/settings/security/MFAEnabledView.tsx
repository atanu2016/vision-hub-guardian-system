
import React from "react";
import { Button } from "@/components/ui/button";

interface MFAEnabledViewProps {
  isVerifying: boolean;
  onDisable: () => Promise<void>;
}

export default function MFAEnabledView({ isVerifying, onDisable }: MFAEnabledViewProps) {
  return (
    <div className="space-y-4">
      <div className="bg-secondary/30 rounded-md p-4">
        <p className="text-sm">
          MFA is currently enabled for your account. This adds an extra layer of security 
          by requiring a verification code from your authenticator app when logging in.
        </p>
      </div>
      
      <Button 
        variant="destructive" 
        onClick={onDisable}
        disabled={isVerifying}
      >
        {isVerifying ? "Disabling..." : "Disable MFA"}
      </Button>
    </div>
  );
}
