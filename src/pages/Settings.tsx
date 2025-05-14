
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { FileSpreadsheet, Link as LinkIcon, AlertTriangle, DatabaseZap, HardDrive, Bell, Shield } from 'lucide-react';

// Import all settings pages
import StorageSettings from '@/pages/settings/StorageSettings';
import RecordingsPage from '@/pages/settings/RecordingsPage';
import AlertsPage from '@/pages/settings/AlertsPage';
import WebhooksSettings from '@/pages/settings/WebhooksSettings';
import AdvancedSettings from '@/pages/settings/AdvancedSettings';
import DatabaseSettings from '@/components/settings/DatabaseSettings';
import LogsSettings from '@/pages/settings/LogsSettings';

const Settings = () => {
  const location = useLocation();
  const path = location.pathname.split('/settings/')[1] || '';
  const [activeSection, setActiveSection] = useState(path || 'storage');

  return (
    <AppLayout>
      <div className="container px-0 mx-auto">
        <div className="grid grid-cols-12 gap-4 xl:gap-8">
          {/* Settings sidebar */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3 border-r">
            <nav className="sticky top-4 space-y-6 py-6 pr-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your system settings and preferences
                </p>
              </div>
              
              {/* Storage Section */}
              <div className="space-y-3">
                <div className="px-2">
                  <h3 className="text-lg font-medium">Storage</h3>
                  <p className="text-sm text-muted-foreground">Configure video storage options</p>
                </div>
                <div className="grid gap-1">
                  <div
                    className={`flex items-start gap-4 rounded-lg border p-3 text-left text-sm transition-all cursor-pointer
                      ${activeSection === 'storage' ? 'bg-accent' : 'hover:bg-accent'}`}
                    onClick={() => setActiveSection('storage')}
                  >
                    <div className="flex items-center">
                      <HardDrive className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="font-medium">Storage Settings</div>
                      <div className="text-xs text-muted-foreground">
                        Configure where recordings are saved
                      </div>
                    </div>
                  </div>
                  
                  <div
                    className={`flex items-start gap-4 rounded-lg border p-3 text-left text-sm transition-all cursor-pointer
                      ${activeSection === 'recordings' ? 'bg-accent' : 'hover:bg-accent'}`}
                    onClick={() => setActiveSection('recordings')}
                  >
                    <div className="flex items-center">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="font-medium">Recordings</div>
                      <div className="text-xs text-muted-foreground">
                        Manage recorded video footage
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Notifications Section */}
              <div className="space-y-3">
                <div className="px-2">
                  <h3 className="text-lg font-medium">Notifications</h3>
                  <p className="text-sm text-muted-foreground">Configure alert notifications</p>
                </div>
                <div className="grid gap-1">
                  <div
                    className={`flex items-start gap-4 rounded-lg border p-3 text-left text-sm transition-all cursor-pointer
                      ${activeSection === 'alerts' ? 'bg-accent' : 'hover:bg-accent'}`}
                    onClick={() => setActiveSection('alerts')}
                  >
                    <div className="flex items-center">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="font-medium">Alerts</div>
                      <div className="text-xs text-muted-foreground">
                        Set up email and push notifications
                      </div>
                    </div>
                  </div>
                  
                  <div
                    className={`flex items-start gap-4 rounded-lg border p-3 text-left text-sm transition-all cursor-pointer
                      ${activeSection === 'webhooks' ? 'bg-accent' : 'hover:bg-accent'}`}
                    onClick={() => setActiveSection('webhooks')}
                  >
                    <div className="flex items-center">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="font-medium">Webhooks</div>
                      <div className="text-xs text-muted-foreground">
                        Connect to external services
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* System Section */}
              <div className="space-y-3">
                <div className="px-2">
                  <h3 className="text-lg font-medium">System</h3>
                  <p className="text-sm text-muted-foreground">System-wide settings and configurations</p>
                </div>
                <div className="grid gap-1">
                  <div
                    className={`flex items-start gap-4 rounded-lg border p-3 text-left text-sm transition-all cursor-pointer
                      ${activeSection === 'advanced' ? 'bg-accent' : 'hover:bg-accent'}`}
                    onClick={() => setActiveSection('advanced')}
                  >
                    <div className="flex items-center">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="font-medium">Advanced Settings</div>
                      <div className="text-xs text-muted-foreground">
                        Configure security and advanced options
                      </div>
                    </div>
                  </div>
                  
                  <div
                    className={`flex items-start gap-4 rounded-lg border p-3 text-left text-sm transition-all cursor-pointer
                      ${activeSection === 'database' ? 'bg-accent' : 'hover:bg-accent'}`}
                    onClick={() => setActiveSection('database')}
                  >
                    <div className="flex items-center">
                      <DatabaseZap className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="font-medium">Database</div>
                      <div className="text-xs text-muted-foreground">
                        Configure database connection
                      </div>
                    </div>
                  </div>
                  
                  <div
                    className={`flex items-start gap-4 rounded-lg border p-3 text-left text-sm transition-all cursor-pointer
                      ${activeSection === 'logs' ? 'bg-accent' : 'hover:bg-accent'}`}
                    onClick={() => setActiveSection('logs')}
                  >
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="font-medium">Logs</div>
                      <div className="text-xs text-muted-foreground">
                        View system logs and debug information
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </nav>
          </div>
          
          {/* Settings content */}
          <div className="col-span-12 md:col-span-8 lg:col-span-9 p-6">
            {activeSection === 'storage' && <StorageSettings />}
            {activeSection === 'recordings' && <RecordingsPage />}
            {activeSection === 'alerts' && <AlertsPage />}
            {activeSection === 'webhooks' && <WebhooksSettings />}
            {activeSection === 'advanced' && <AdvancedSettings />}
            {activeSection === 'database' && <DatabaseSettings />}
            {activeSection === 'logs' && <LogsSettings />}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
