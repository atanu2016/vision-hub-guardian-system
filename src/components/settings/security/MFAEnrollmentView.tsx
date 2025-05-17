
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface MFAEnrollmentViewProps {
  qrCode: string;
  secret: string | null;
  verificationCode: string;
  onVerificationCodeChange: (code: string) => void;
  isVerifying: boolean;
  onVerify: () => Promise<void>;
  onCancel: () => void;
}

export default function MFAEnrollmentView({
  qrCode,
  secret,
  verificationCode,
  onVerificationCodeChange,
  isVerifying,
  onVerify,
  onCancel
}: MFAEnrollmentViewProps) {
  return (
    <div className="space-y-4">
      <div className="bg-secondary/30 rounded-md p-4">
        <p className="text-sm mb-4">
          Scan this QR code with your authenticator app (like Google Authenticator or Authy)
          to set up multi-factor authentication.
        </p>
        
        <div className="flex justify-center mb-4">
          <div className="w-48">
            <AspectRatio ratio={1}>
              <img src={qrCode} alt="MFA QR Code" className="rounded-md" />
            </AspectRatio>
          </div>
        </div>
        
        <p className="text-sm font-medium">Or enter this code manually:</p>
        <p className="mt-1 text-sm font-mono bg-secondary p-2 rounded select-all">
          {secret}
        </p>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="verificationCode" className="text-sm font-medium">
          Enter the 6-digit verification code from your authenticator app
        </label>
        <Input 
          id="verificationCode"
          placeholder="123456" 
          maxLength={6}
          value={verificationCode}
          onChange={(e) => onVerificationCodeChange(e.target.value)}
        />
      </div>
      
      <div className="flex space-x-2">
        <Button 
          onClick={onVerify} 
          disabled={verificationCode.length !== 6 || isVerifying}
        >
          {isVerifying ? "Verifying..." : "Verify"}
        </Button>
        
        <Button 
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
