
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import { useMFA } from "@/hooks/useMFA";
import MFAEnabledView from "./MFAEnabledView";
import MFAEnrollmentView from "./MFAEnrollmentView";
import MFASetupView from "./MFASetupView";

export default function MFAEnrollment() {
  const { user } = useAuth();
  const {
    mfaEnabled,
    isLoading,
    qrCode,
    secret,
    verificationCode,
    setVerificationCode,
    isVerifying,
    isEnrolling,
    generateQRCode,
    verifyMFACode,
    disableMFA
  } = useMFA();

  const handleCancel = () => {
    setVerificationCode("");
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Multi-Factor Authentication</CardTitle>
          <CardDescription>
            Please sign in to manage MFA settings
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Multi-Factor Authentication</CardTitle>
          <CardDescription>Loading MFA settings...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multi-Factor Authentication</CardTitle>
        <CardDescription>
          {mfaEnabled 
            ? "Your account is protected with multi-factor authentication" 
            : "Add an extra layer of security to your account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mfaEnabled ? (
          <MFAEnabledView 
            isVerifying={isVerifying}
            onDisable={disableMFA}
          />
        ) : qrCode ? (
          <MFAEnrollmentView
            qrCode={qrCode}
            secret={secret}
            verificationCode={verificationCode}
            onVerificationCodeChange={setVerificationCode}
            isVerifying={isVerifying}
            onVerify={verifyMFACode}
            onCancel={() => {
              handleCancel();
              qrCode && secret && handleCancel();
            }}
          />
        ) : (
          <MFASetupView
            isEnrolling={isEnrolling}
            onEnroll={generateQRCode}
          />
        )}
      </CardContent>
    </Card>
  );
}
