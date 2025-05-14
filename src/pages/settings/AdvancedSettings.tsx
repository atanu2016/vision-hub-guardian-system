
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { AlertTriangle, Check, Info } from "lucide-react";
import DebugLogDialog from '@/components/settings/DebugLogDialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { getAdvancedSettings, saveAdvancedSettings, addLog } from "@/services/apiService";

interface AdvancedSettingsData {
  serverPort: string;
  logLevel: string;
  debugMode: boolean;
  mfaEnabled: boolean;
  mfaSecret?: string;
  logRetentionDays: number;
  minLogLevel: string;
}

const AdvancedSettings = () => {
  const [settings, setSettings] = useState<AdvancedSettingsData>({
    serverPort: '8080',
    logLevel: 'info',
    debugMode: false,
    mfaEnabled: false,
    logRetentionDays: 30,
    minLogLevel: 'info'
  });
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [mfaVerificationCode, setMfaVerificationCode] = useState('');
  const [mfaQRCode, setMfaQRCode] = useState('/placeholder.svg');
  const [mfaSecret, setMfaSecret] = useState('');
  const [showDebugLogs, setShowDebugLogs] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await getAdvancedSettings();
        setSettings(data);
        console.log('Loaded advanced settings:', data);
      } catch (error) {
        console.error('Failed to load advanced settings:', error);
        toast("Error", {
          description: "Could not load advanced settings"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    try {
      // Save settings to database
      await saveAdvancedSettings(settings);
      
      // Log the action
      await addLog(
        'info',
        'Advanced settings updated',
        'system',
        `Server port: ${settings.serverPort}, Log level: ${settings.logLevel}`
      );
      
      toast("Settings Saved", {
        description: "Advanced settings have been updated successfully"
      });
      
      // Show debug logs when debug mode is enabled
      if (settings.debugMode) {
        setShowDebugLogs(true);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast("Error", {
        description: "Failed to save advanced settings"
      });
      
      // Log the error
      await addLog(
        'error',
        'Failed to update advanced settings',
        'system',
        error.toString()
      );
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleResetSettings = async () => {
    const confirmReset = window.confirm("Are you sure you want to reset all settings to default? This cannot be undone.");
    if (confirmReset) {
      try {
        // Reset to default settings
        const defaultSettings = {
          serverPort: '8080',
          logLevel: 'info',
          debugMode: false,
          mfaEnabled: false,
          mfaSecret: '',
          logRetentionDays: 30,
          minLogLevel: 'info'
        };
        
        // Save default settings
        await saveAdvancedSettings(defaultSettings);
        
        // Update local state
        setSettings(defaultSettings);
        
        // Log the action
        await addLog(
          'warning',
          'Advanced settings reset to default',
          'system'
        );
        
        toast("Settings Reset", {
          description: "All settings have been reset to default values"
        });
      } catch (error) {
        console.error('Error resetting settings:', error);
        toast("Error", {
          description: "Failed to reset settings"
        });
      }
    }
  };
  
  const setupMFA = () => {
    // Generate a random MFA secret (in a real app, use a crypto library)
    const randomSecret = Array.from({length: 16}, () => 
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".charAt(Math.floor(Math.random() * 32))
    ).join('');
    
    setMfaSecret(randomSecret);
    
    // Generate a QR code URL for the MFA secret
    // In a production app, use a proper TOTP library
    const qrCodeData = `otpauth://totp/VisionHub:user@example.com?secret=${randomSecret}&issuer=VisionHub`;
    setMfaQRCode(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCodeData)}`);
    
    setShowMFASetup(true);
  };
  
  const verifyMFA = async () => {
    // In a real implementation, this would verify the OTP code against the secret
    if (mfaVerificationCode.length === 6) {
      try {
        // Update MFA settings
        const updatedSettings = {
          ...settings,
          mfaEnabled: true,
          mfaSecret: mfaSecret
        };
        
        // Save to database
        await saveAdvancedSettings(updatedSettings);
        
        // Update local state
        setSettings(updatedSettings);
        setShowMFASetup(false);
        
        // Log the action
        await addLog(
          'info',
          'Two-factor authentication enabled',
          'system'
        );
        
        toast("Two-Factor Authentication Enabled", {
          description: "Your account is now protected with two-factor authentication"
        });
      } catch (error) {
        console.error('Error enabling MFA:', error);
        toast("Error", {
          description: "Failed to enable two-factor authentication"
        });
      }
    } else {
      toast("Verification Failed", {
        description: "Please enter a valid 6-digit code from your authenticator app"
      });
    }
  };
  
  const disableMFA = async () => {
    try {
      // Update MFA settings
      const updatedSettings = {
        ...settings,
        mfaEnabled: false,
        mfaSecret: ''
      };
      
      // Save to database
      await saveAdvancedSettings(updatedSettings);
      
      // Update local state
      setSettings(updatedSettings);
      
      // Log the action
      await addLog(
        'warning',
        'Two-factor authentication disabled',
        'system'
      );
      
      toast("Two-Factor Authentication Disabled", {
        description: "Two-factor authentication has been turned off"
      });
    } catch (error) {
      console.error('Error disabling MFA:', error);
      toast("Error", {
        description: "Failed to disable two-factor authentication"
      });
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">Loading advanced settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Advanced Settings</h1>
        <p className="text-muted-foreground">
          Configure advanced system settings
        </p>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Server Configuration</CardTitle>
            <CardDescription>Configure server settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serverPort">Server Port</Label>
              <Input 
                id="serverPort"
                value={settings.serverPort}
                onChange={(e) => setSettings({...settings, serverPort: e.target.value})}
                type="number"
              />
              <p className="text-xs text-muted-foreground">Default port is 8080. Changes require restart.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logLevel">Log Level</Label>
              <Select 
                value={settings.logLevel}
                onValueChange={(value) => setSettings({...settings, logLevel: value})}
              >
                <SelectTrigger id="logLevel">
                  <SelectValue placeholder="Select log level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debug">Debug</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>
              Enhance account security with two-factor authentication (2FA)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.mfaEnabled ? (
              <>
                <Alert className="bg-green-500/10 border-green-500">
                  <Check className="h-4 w-4 text-green-500" />
                  <AlertTitle>Two-Factor Authentication Enabled</AlertTitle>
                  <AlertDescription>
                    Your account is protected with two-factor authentication.
                  </AlertDescription>
                </Alert>
                <Button 
                  variant="destructive" 
                  onClick={disableMFA}
                >
                  Disable Two-Factor Authentication
                </Button>
              </>
            ) : showMFASetup ? (
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Setup Instructions</AlertTitle>
                  <AlertDescription>
                    1. Scan this QR code with your authenticator app<br />
                    2. Enter the 6-digit code from the app<br />
                    3. Click Verify to enable 2FA
                  </AlertDescription>
                </Alert>
                
                <div className="flex flex-col items-center space-y-4">
                  <img 
                    src={mfaQRCode} 
                    alt="QR Code for authenticator app" 
                    className="w-48 h-48 border rounded"
                  />
                  <p className="text-sm text-muted-foreground">
                    Or manually enter this code: <code className="bg-muted p-1 rounded">{mfaSecret}</code>
                  </p>
                  
                  <div className="space-y-2 w-full max-w-sm">
                    <Label htmlFor="verification-code">Verification Code</Label>
                    <InputOTP 
                      maxLength={6}
                      value={mfaVerificationCode}
                      onChange={setMfaVerificationCode}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowMFASetup(false)}>
                      Cancel
                    </Button>
                    <Button onClick={verifyMFA}>
                      Verify and Enable
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Alert variant="destructive" className="bg-yellow-500/10 border-yellow-500">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <AlertTitle>Two-Factor Authentication is Disabled</AlertTitle>
                  <AlertDescription>
                    Enable two-factor authentication to add an extra layer of security to your account.
                  </AlertDescription>
                </Alert>
                <Button onClick={setupMFA}>
                  Enable Two-Factor Authentication
                </Button>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Debug Mode</CardTitle>
            <CardDescription>Enable detailed logging for troubleshooting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="debugMode">Debug Mode</Label>
                <p className="text-sm text-muted-foreground">Enable detailed logging for troubleshooting</p>
              </div>
              <Switch
                id="debugMode"
                checked={settings.debugMode}
                onCheckedChange={(checked) => setSettings({...settings, debugMode: checked})}
              />
            </div>
            
            {settings.debugMode && (
              <Button variant="outline" onClick={() => setShowDebugLogs(true)}>
                View Debug Logs
              </Button>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Reset System</CardTitle>
            <CardDescription>Reset all settings to default values</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                This will reset all settings to their default values. This action cannot be undone.
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <Button variant="destructive" onClick={handleResetSettings}>
                Reset All Settings
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
      
      <DebugLogDialog open={showDebugLogs} onOpenChange={setShowDebugLogs} />
    </div>
  );
};

export default AdvancedSettings;
