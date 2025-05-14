import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import SettingsMenuSection from "@/components/layout/SettingsMenuSection";

type SettingsTab = "general" | "storage" | "notifications" | "security" | "advanced";

const Settings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  // Determine the active tab based on the URL path
  const getActiveTab = (): SettingsTab => {
    if (path.includes("/storage")) return "storage";
    if (path.includes("/notifications")) return "notifications";
    if (path.includes("/security")) return "security";
    if (path.includes("/advanced")) return "advanced";
    return "general";
  };

  const activeTab = getActiveTab();

  // Handle tab change
  const handleTabChange = (value: string) => {
    switch (value) {
      case "storage":
        navigate("/settings/storage");
        break;
      case "notifications":
        navigate("/settings/alerts");
        break;
      case "security":
        navigate("/profile-settings");
        break;
      case "advanced":
        navigate("/settings/advanced");
        break;
      default:
        navigate("/settings");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your system settings and preferences.
          </p>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === "general" && (
          <div className="space-y-6">
            <SettingsMenuSection
              title="System Settings"
              description="Configure general system settings"
              items={[
                {
                  title: "Recording Settings",
                  description: "Configure recording quality and retention",
                  href: "/settings/recordings",
                },
                {
                  title: "Alert Settings",
                  description: "Configure notifications and alerts",
                  href: "/settings/alerts",
                },
              ]}
            />

            <SettingsMenuSection
              title="User Interface"
              description="Customize the user interface"
              items={[
                {
                  title: "Appearance",
                  description: "Customize the theme and layout",
                  href: "#",
                },
                {
                  title: "Dashboard",
                  description: "Configure dashboard widgets and layout",
                  href: "#",
                },
              ]}
            />

            <SettingsMenuSection
              title="System Information"
              description="View system information and status"
              items={[
                {
                  title: "Version",
                  description: "Vision Hub v1.0.0",
                  href: "#",
                  disabled: true,
                },
                {
                  title: "License",
                  description: "Standard License - Expires in 365 days",
                  href: "#",
                  disabled: true,
                },
              ]}
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Settings;
