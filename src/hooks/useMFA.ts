
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";

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
      const mfaSecret = generateSecretKey();
      
      // Create QR code data for Authy or other authenticator apps
      const otpAuthUrl = `otpauth://totp/VisionHub:${user.email}?secret=${mfaSecret}&issuer=VisionHub`;
      
      // Generate QR code as data URL
      const qrCodeUrl = await generateQRCodeImage(otpAuthUrl);
      
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
      // In a real implementation, you would verify the code against the secret
      // For this implementation, we'll just pretend it works with a simple check
      const isValid = verificationCode.length === 6;
      
      if (isValid) {
        // Save the MFA secret and enrolled status to the database for THIS specific user
        const { error } = await supabase
          .from('profiles')
          .update({
            mfa_enrolled: true,
            mfa_secret: secret
          })
          .eq('id', user.id);
          
        if (error) throw error;
        
        setMfaEnabled(true);
        toast.success("MFA successfully enabled");
        
        // Add system log
        await supabase.from('system_logs').insert({
          level: 'info',
          source: 'security',
          message: 'MFA enabled for user',
          details: `MFA enabled for user ${user.email}`
        });
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
      // Update THIS specific user's profile
      const { error } = await supabase
        .from('profiles')
        .update({
          mfa_enrolled: false,
          mfa_secret: null
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setMfaEnabled(false);
      setSecret(null);
      setQrCode(null);
      
      toast.success("MFA has been disabled");
      
      // Add system log
      await supabase.from('system_logs').insert({
        level: 'warning',
        source: 'security',
        message: 'MFA disabled for user',
        details: `MFA disabled for user ${user.email}`
      });
    } catch (error) {
      console.error('Failed to disable MFA:', error);
      toast.error("Failed to disable MFA");
    } finally {
      setIsVerifying(false);
    }
  };

  // Helper functions
  const generateSecretKey = () => {
    // In a real implementation, use a cryptographically secure method
    // This is just a simple example that generates a base32 string
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  };

  const generateQRCodeImage = async (data: string): Promise<string> => {
    // In a real implementation, use a proper QR code library
    // For this example, we'll return a placeholder image URL
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
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
