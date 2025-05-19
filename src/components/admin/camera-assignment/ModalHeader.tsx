
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import { Loader2, RefreshCcw } from 'lucide-react';

interface ModalHeaderProps {
  userName: string;
  isRefreshing: boolean;
  loading: boolean;
  isSaving: boolean;
  isAuthenticated: boolean;
  onRefresh: () => void;
}

export const ModalHeader = ({ 
  userName, 
  isRefreshing, 
  loading, 
  isSaving, 
  isAuthenticated,
  onRefresh 
}: ModalHeaderProps) => {
  return (
    <DialogTitle className="flex items-center justify-between">
      <span>Assign Cameras to {userName}</span>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh} 
        disabled={loading || isRefreshing || isSaving || !isAuthenticated}
        className="ml-auto"
      >
        {isRefreshing ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <RefreshCcw className="h-4 w-4 mr-2" />
        )}
        Refresh
      </Button>
    </DialogTitle>
  );
};
