
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';

interface ModalActionsProps {
  onClose: () => void;
  onSubmit: () => void;
  isSaving: boolean;
  savingComplete: boolean;
  loading: boolean;
  error: string | null;
  canAssignCameras: boolean;
  isAuthenticated: boolean;
}

export const ModalActions = ({
  onClose,
  onSubmit,
  isSaving,
  savingComplete,
  loading,
  error,
  canAssignCameras,
  isAuthenticated
}: ModalActionsProps) => {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={onClose} disabled={isSaving && !savingComplete}>
        {savingComplete ? "Close" : "Cancel"}
      </Button>
      {!savingComplete && (
        <Button 
          onClick={onSubmit} 
          disabled={loading || isSaving || !!error || !canAssignCameras || !isAuthenticated}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      )}
    </div>
  );
};
