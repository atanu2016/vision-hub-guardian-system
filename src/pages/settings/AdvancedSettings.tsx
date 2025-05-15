
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Shield, LogOut, Save } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import AuthImageSettings from '@/components/settings/AuthImageSettings';
import ExportControls from '@/components/settings/ExportControls';

const AdvancedSettings = () => {
  const [settings, setSettings] = useState({
    mfaEnabled: false,
    logLevel: 'info',
    debugMode: false,
    serverPort: '8080',
    logRetentionDays: 30,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { signOut } = useAuth();

  // Load settings from database
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('advanced_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      
      if (data) {
        setSettings({
          mfaEnabled: data.mfa_enabled || false,
          logLevel: data.log_level || 'info',
          debugMode: data.debug_mode || false,
          serverPort: data.server_port || '8080',
          logRetentionDays: data.log_retention_days || 30,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load advanced settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Save settings to database
  const saveSettings = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('advanced_settings')
        .update({
          mfa_enabled: settings.mfaEnabled,
          log_level: settings.logLevel,
          debug_mode: settings.debugMode,
          server_port: settings.serverPort,
          log_retention_days: settings.logRetentionDays,
          updated_at: new Date().toISOString(),
        })
        .eq('id', (await supabase.from('advanced_settings').select('id').single()).data?.id);
      
      if (error) throw error;
      
      toast.success('Advanced settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save advanced settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle session logout
  const handleLogout = async () => {
    try {
      await signOut();
      // Navigation is handled in AuthContext
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Failed to log out');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Advanced Settings</h2>
        <p className="text-muted-foreground">
          Configure system-level settings and security features
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Security Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Configure security and authentication options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="mfa-toggle">Multi-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require two-factor authentication for all users
                  </p>
                </div>
                <Switch
                  id="mfa-toggle"
                  checked={settings.mfaEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, mfaEnabled: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="debug-toggle">Debug Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable detailed logging for troubleshooting
                  </p>
                </div>
                <Switch
                  id="debug-toggle"
                  checked={settings.debugMode}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, debugMode: checked })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="log-level">Log Level</Label>
                <Select
                  value={settings.logLevel}
                  onValueChange={(value) =>
                    setSettings({ ...settings, logLevel: value })
                  }
                >
                  <SelectTrigger id="log-level">
                    <SelectValue placeholder="Select log level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debug">Debug</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warn">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Set minimum log level to record
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="server-port">Server Port</Label>
                  <Input
                    id="server-port"
                    value={settings.serverPort}
                    onChange={(e) =>
                      setSettings({ ...settings, serverPort: e.target.value })
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="log-retention">Log Retention (days)</Label>
                  <Input
                    id="log-retention"
                    type="number"
                    value={settings.logRetentionDays}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        logRetentionDays: parseInt(e.target.value) || 30,
                      })
                    }
                  />
                </div>
              </div>
            </div>
            
            <Button onClick={saveSettings} disabled={isLoading} className="w-full">
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </CardContent>
        </Card>
        
        {/* Session Management */}
        <Card>
          <CardHeader>
            <CardTitle>Session Management</CardTitle>
            <CardDescription>
              Manage your current login session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleLogout} className="w-full">
              <LogOut className="mr-2 h-4 w-4" /> Log Out
            </Button>
          </CardContent>
        </Card>
        
        {/* Auth Image Settings */}
        <AuthImageSettings />
        
        {/* Export Controls */}
        <ExportControls />
      </div>
    </div>
  );
};

export default AdvancedSettings;
