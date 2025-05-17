
import React from "react";
import { Button } from "@/components/ui/button";

interface MFASetupViewProps {
  isEnrolling: boolean;
  onEnroll: () => Promise<void>;
}

export default function MFASetupView({ isEnrolling, onEnroll }: MFASetupViewProps) {
  return (
    <div className="space-y-4">
      <div className="bg-secondary/30 rounded-md p-4">
        <p className="text-sm">
          Multi-factor authentication adds an extra layer of security to your account by
          requiring a verification code from your authenticator app when logging in.
        </p>
      </div>
      
      <Button 
        onClick={onEnroll}
        disabled={isEnrolling}
      >
        {isEnrolling ? "Generating..." : "Enable MFA"}
      </Button>
    </div>
  );
}
