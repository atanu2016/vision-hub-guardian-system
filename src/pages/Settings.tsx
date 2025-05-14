
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Link as LinkIcon, AlertTriangle, DatabaseZap, HardDrive, Bell, Shield } from 'lucide-react';
import SettingsMenuSection from '@/components/layout/SettingsMenuSection';

const Settings = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('storage');

  // Function to determine if a path is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

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
              <SettingsMenuSection 
                isActive={isActive} 
                title="Storage"
                description="Configure video storage options"
                items={[
                  {
                    title: "Storage Settings",
                    description: "Configure where recordings are saved",
                    href: "/settings/storage",
                    icon: <HardDrive className="w-4 h-4" />
                  },
                  {
                    title: "Recordings",
                    description: "Manage recorded video footage",
                    href: "/settings/recordings",
                    icon: <FileSpreadsheet className="w-4 h-4" />
                  }
                ]}
              />
              
              {/* Notifications Section */}
              <SettingsMenuSection 
                isActive={isActive}
                title="Notifications"
                description="Configure alert notifications"
                items={[
                  {
                    title: "Alerts",
                    description: "Set up email and push notifications",
                    href: "/settings/alerts",
                    icon: <Bell className="w-4 h-4" />
                  },
                  {
                    title: "Webhooks",
                    description: "Connect to external services",
                    href: "/settings/webhooks",
                    icon: <LinkIcon className="w-4 h-4" />
                  }
                ]}
              />
              
              {/* System Section */}
              <SettingsMenuSection 
                isActive={isActive}
                title="System"
                description="System-wide settings and configurations"
                items={[
                  {
                    title: "Advanced Settings",
                    description: "Configure security and advanced options",
                    href: "/settings/advanced",
                    icon: <Shield className="w-4 h-4" />
                  },
                  {
                    title: "Database",
                    description: "Configure database connection",
                    href: "/settings/database",
                    icon: <DatabaseZap className="w-4 h-4" />,
                    disabled: false
                  },
                  {
                    title: "Logs",
                    description: "View system logs and debug information",
                    href: "/settings/logs",
                    icon: <AlertTriangle className="w-4 h-4" />,
                    disabled: true
                  }
                ]}
              />
            </nav>
          </div>
          
          {/* Settings content */}
          <div className="col-span-12 md:col-span-8 lg:col-span-9 p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
