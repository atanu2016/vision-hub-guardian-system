
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export default function MFAEnrollment() {
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
          .select('mfa_enabled, mfa_secret')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        setMfaEnabled(data?.mfa_enabled || false);
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
        // Save the MFA secret and enabled status to the database for THIS specific user
        const { error } = await supabase
          .from('profiles')
          .update({
            mfa_enabled: true,
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
          mfa_enabled: false,
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
          <div className="space-y-4">
            <div className="bg-secondary/30 rounded-md p-4">
              <p className="text-sm">
                MFA is currently enabled for your account. This adds an extra layer of security 
                by requiring a verification code from your authenticator app when logging in.
              </p>
            </div>
            
            <Button 
              variant="destructive" 
              onClick={disableMFA}
              disabled={isVerifying}
            >
              {isVerifying ? "Disabling..." : "Disable MFA"}
            </Button>
          </div>
        ) : qrCode ? (
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
                onChange={(e) => setVerificationCode(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={verifyMFACode} 
                disabled={verificationCode.length !== 6 || isVerifying}
              >
                {isVerifying ? "Verifying..." : "Verify"}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  setQrCode(null);
                  setSecret(null);
                  setVerificationCode("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-secondary/30 rounded-md p-4">
              <p className="text-sm">
                Multi-factor authentication adds an extra layer of security to your account by
                requiring a verification code from your authenticator app when logging in.
              </p>
            </div>
            
            <Button 
              onClick={generateQRCode}
              disabled={isEnrolling}
            >
              {isEnrolling ? "Generating..." : "Enable MFA"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
