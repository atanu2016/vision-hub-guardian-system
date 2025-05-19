
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import PermissionAlert from './PermissionAlert';

interface ErrorAlertsProps {
  isAuthenticated: boolean;
  canAssignCameras: boolean;
  error: string | null;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const ErrorAlerts = ({ 
  isAuthenticated, 
  canAssignCameras, 
  error, 
  onRefresh,
  isRefreshing
}: ErrorAlertsProps) => {
  return (
    <>
      {!isAuthenticated && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Authentication required. Please login again.
          </AlertDescription>
        </Alert>
      )}
      
      <PermissionAlert hasPermission={canAssignCameras} />
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="link" 
              className="p-0 h-auto ml-2 text-destructive underline" 
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              Try refreshing
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};
