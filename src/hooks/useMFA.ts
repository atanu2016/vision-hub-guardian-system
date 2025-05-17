
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import {
  updatePersonalMfaSetting,
  generateTotpSecret,
  generateQrCodeUrl,
  verifyTotpCode
} from "@/services/userService";

export function useMFA() {
  const { user } = useAuth();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if MFA is already enabled for this specific user
  useEffect(() => {
    const checkMFAStatus = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Query the user's specific profile
        const { data, error } = await supabase
          .from('profiles')
          .select('mfa_enrolled, mfa_secret')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        setMfaEnabled(data?.mfa_enrolled || false);
        setSecret(data?.mfa_secret || null);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to check MFA status:', error);
        setIsLoading(false);
      }
    };
    
    checkMFAStatus();
  }, [user]);

  const generateQRCode = async () => {
    if (!user) return;
    
    setIsEnrolling(true);
    try {
      // Generate a new secret
      const mfaSecret = generateTotpSecret();
      
      // Generate QR code
      const qrCodeUrl = await generateQrCodeUrl(user.email, mfaSecret);
      
      setQrCode(qrCodeUrl);
      setSecret(mfaSecret);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      toast.error("Failed to generate MFA enrollment code");
    } finally {
      setIsEnrolling(false);
    }
  };

  const verifyMFACode = async () => {
    if (!secret || !verificationCode || !user) return;
    
    setIsVerifying(true);
    try {
      // Verify the TOTP code
      const isValid = await verifyTotpCode(secret, verificationCode);
      
      if (isValid) {
        // Save the MFA secret and enrolled status to the database
        await updatePersonalMfaSetting(true);
        
        setMfaEnabled(true);
        toast.success("MFA successfully enabled");
      } else {
        toast.error("Invalid verification code. Please try again.");
      }
    } catch (error) {
      console.error('Failed to verify MFA code:', error);
      toast.error("Failed to enable MFA");
    } finally {
      setIsVerifying(false);
      setVerificationCode("");
    }
  };

  const disableMFA = async () => {
    if (!user) return;
    
    setIsVerifying(true);
    try {
      await updatePersonalMfaSetting(false);
      
      setMfaEnabled(false);
      setSecret(null);
      setQrCode(null);
      
      toast.success("MFA has been disabled");
    } catch (error) {
      console.error('Failed to disable MFA:', error);
      toast.error("Failed to disable MFA");
    } finally {
      setIsVerifying(false);
    }
  };

  return {
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
  };
}
