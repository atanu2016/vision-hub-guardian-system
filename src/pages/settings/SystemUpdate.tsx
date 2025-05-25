
import { useSystemUpdate } from '@/hooks/useSystemUpdate';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { SystemUpdateCard } from '@/components/settings/update/SystemUpdateCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Shield } from 'lucide-react';
import { useAdminAccess } from '@/hooks/useAdminAccess';

const SystemUpdate = () => {
  const { 
    updateSystem, 
    restartSystem, 
    checkForUpdates,
    setAutoUpdate,
    isLoading,
    checkingForUpdates,
    autoUpdateEnabled
  } = useSystemUpdate();
  
  const { systemInformation } = useSystemSettings();
  const { hasAccess, loading: accessLoading } = useAdminAccess();
  
  if (accessLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-pulse">Loading access permissions...</div>
      </div>
    );
  }
  
  if (!hasAccess) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to access system update functionality.
            Please contact your administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Update</h1>
        <p className="text-muted-foreground">
          Update your application code and restart the server. Auto-update can monitor GitHub for changes.
        </p>
      </div>
      
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Restarting the server will cause a brief interruption to the service.
          Users might experience temporary disconnection during this process.
        </AlertDescription>
      </Alert>
      
      <SystemUpdateCard 
        onUpdate={updateSystem}
        onRestart={restartSystem}
        onCheckUpdates={checkForUpdates}
        onSetAutoUpdate={setAutoUpdate}
        version={systemInformation?.systemInfo?.version || "1.0.0"}
        lastUpdated={systemInformation?.systemInfo?.lastUpdated || new Date().toLocaleString()}
        autoUpdateEnabled={autoUpdateEnabled}
        checkingForUpdates={checkingForUpdates}
      />
    </div>
  );
};

export default SystemUpdate;
