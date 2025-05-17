
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { 
  FileSpreadsheet, Link as LinkIcon, AlertTriangle, DatabaseZap, 
  HardDrive, Bell, Shield, Settings as SettingsIcon, Sliders 
} from 'lucide-react';

// Import all settings pages
import StorageSettings from '@/pages/settings/StorageSettings';
import RecordingsPage from '@/pages/settings/RecordingsPage';
import AlertsPage from '@/pages/settings/AlertsPage';
import WebhooksSettings from '@/pages/settings/WebhooksSettings';
import AdvancedSettings from '@/pages/settings/AdvancedSettings';
import DatabaseSettings from '@/components/settings/DatabaseSettings';
import LogsSettings from '@/pages/settings/LogsSettings';
import SystemSettings from '@/pages/settings/SystemSettings';

const Settings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname.split('/settings/')[1] || '';
  
  // Determine which section is active
  const isStorageActive = path === '' || path === 'storage';
  const isRecordingsActive = path === 'recordings';
  const isAlertsActive = path === 'alerts';
  const isWebhooksActive = path === 'webhooks';
  const isAdvancedActive = path === 'advanced';
  const isDatabaseActive = path === 'database';
  const isLogsActive = path === 'logs';
  const isSystemSettingsActive = path === 'system';

  return (
    <AppLayout>
      <div className="container mx-auto px-4">
        <div className="py-6">
          <h1 className="text-2xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground mb-6">
            Manage your system settings and preferences
          </p>
          
          <div className="grid grid-cols-12 gap-6">
            {/* Settings sidebar */}
            <div className="col-span-12 md:col-span-4 lg:col-span-3">
              <div className="space-y-8">
                {/* System Section */}
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">System</h3>
                  <p className="text-sm text-muted-foreground">System-wide settings and configurations</p>
                  
                  <div className="space-y-2">
                    <div
                      className={`flex items-start gap-4 rounded-lg border p-3 text-left cursor-pointer transition-all
                        ${isSystemSettingsActive ? 'bg-accent' : 'hover:bg-accent/50'}`}
                      onClick={() => navigate('/settings/system')}
                    >
                      <Sliders className="mt-0.5 h-5 w-5" />
                      <div>
                        <p className="font-medium">System Settings</p>
                        <p className="text-sm text-muted-foreground">Configure system appearance and behavior</p>
                      </div>
                    </div>
                    
                    <div
                      className={`flex items-start gap-4 rounded-lg border p-3 text-left cursor-pointer transition-all
                        ${isAdvancedActive ? 'bg-accent' : 'hover:bg-accent/50'}`}
                      onClick={() => navigate('/settings/advanced')}
                    >
                      <Shield className="mt-0.5 h-5 w-5" />
                      <div>
                        <p className="font-medium">Advanced Settings</p>
                        <p className="text-sm text-muted-foreground">Configure security and advanced options</p>
                      </div>
                    </div>
                    
                    <div
                      className={`flex items-start gap-4 rounded-lg border p-3 text-left cursor-pointer transition-all
                        ${isDatabaseActive ? 'bg-accent' : 'hover:bg-accent/50'}`}
                      onClick={() => navigate('/settings/database')}
                    >
                      <DatabaseZap className="mt-0.5 h-5 w-5" />
                      <div>
                        <p className="font-medium">Database</p>
                        <p className="text-sm text-muted-foreground">Configure database connection</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Storage Section */}
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Storage</h3>
                  <p className="text-sm text-muted-foreground">Configure video storage options</p>
                  
                  <div className="space-y-2">
                    <div
                      className={`flex items-start gap-4 rounded-lg border p-3 text-left cursor-pointer transition-all
                        ${isStorageActive ? 'bg-accent' : 'hover:bg-accent/50'}`}
                      onClick={() => navigate('/settings/storage')}
                    >
                      <HardDrive className="mt-0.5 h-5 w-5" />
                      <div>
                        <p className="font-medium">Storage Settings</p>
                        <p className="text-sm text-muted-foreground">Configure where recordings are saved</p>
                      </div>
                    </div>
                    
                    <div
                      className={`flex items-start gap-4 rounded-lg border p-3 text-left cursor-pointer transition-all
                        ${isRecordingsActive ? 'bg-accent' : 'hover:bg-accent/50'}`}
                      onClick={() => navigate('/settings/recordings')}
                    >
                      <FileSpreadsheet className="mt-0.5 h-5 w-5" />
                      <div>
                        <p className="font-medium">Recordings</p>
                        <p className="text-sm text-muted-foreground">Manage recorded video footage</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Notifications Section */}
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Notifications</h3>
                  <p className="text-sm text-muted-foreground">Configure alert notifications</p>
                  
                  <div className="space-y-2">
                    <div
                      className={`flex items-start gap-4 rounded-lg border p-3 text-left cursor-pointer transition-all
                        ${isAlertsActive ? 'bg-accent' : 'hover:bg-accent/50'}`}
                      onClick={() => navigate('/settings/alerts')}
                    >
                      <Bell className="mt-0.5 h-5 w-5" />
                      <div>
                        <p className="font-medium">Alerts</p>
                        <p className="text-sm text-muted-foreground">Set up email and push notifications</p>
                      </div>
                    </div>
                    
                    <div
                      className={`flex items-start gap-4 rounded-lg border p-3 text-left cursor-pointer transition-all
                        ${isWebhooksActive ? 'bg-accent' : 'hover:bg-accent/50'}`}
                      onClick={() => navigate('/settings/webhooks')}
                    >
                      <LinkIcon className="mt-0.5 h-5 w-5" />
                      <div>
                        <p className="font-medium">Webhooks</p>
                        <p className="text-sm text-muted-foreground">Connect to external services</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Logs Section */}
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Monitoring</h3>
                  <p className="text-sm text-muted-foreground">View system logs and debug information</p>
                  
                  <div className="space-y-2">
                    <div
                      className={`flex items-start gap-4 rounded-lg border p-3 text-left cursor-pointer transition-all
                        ${isLogsActive ? 'bg-accent' : 'hover:bg-accent/50'}`}
                      onClick={() => navigate('/settings/logs')}
                    >
                      <AlertTriangle className="mt-0.5 h-5 w-5" />
                      <div>
                        <p className="font-medium">Logs</p>
                        <p className="text-sm text-muted-foreground">View system logs and debug information</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Settings content */}
            <div className="col-span-12 md:col-span-8 lg:col-span-9 border rounded-lg p-6">
              {isSystemSettingsActive && <SystemSettings />}
              {isStorageActive && <StorageSettings />}
              {isRecordingsActive && <RecordingsPage />}
              {isAlertsActive && <AlertsPage />}
              {isWebhooksActive && <WebhooksSettings />}
              {isAdvancedActive && <AdvancedSettings />}
              {isDatabaseActive && <DatabaseSettings />}
              {isLogsActive && <LogsSettings />}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
