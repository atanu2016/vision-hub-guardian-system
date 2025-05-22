
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Save, RefreshCw, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SettingsActionButtonsProps {
  onSave: () => void;
  onReset: () => void;
  isLoading: boolean;
  hasChanges?: boolean;
  isValid?: boolean;
}

const SettingsActionButtons = ({ 
  onSave,
  onReset,
  isLoading,
  hasChanges = true,
  isValid = true
}: SettingsActionButtonsProps) => {
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);
  const [showRestartPrompt, setShowRestartPrompt] = useState(false);
  const { toast } = useToast();
  
  // Animation for successful save
  useEffect(() => {
    if (!isLoading && showSaveAnimation) {
      const timer = setTimeout(() => {
        setShowSaveAnimation(false);
        setShowRestartPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, showSaveAnimation]);

  // Hide restart prompt after some time
  useEffect(() => {
    if (showRestartPrompt) {
      const timer = setTimeout(() => {
        setShowRestartPrompt(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [showRestartPrompt]);

  const handleSave = () => {
    onSave();
    setShowSaveAnimation(true);
    
    // Show toast with instructions
    toast({
      title: "Settings saved",
      description: "Camera settings saved. Refresh the camera view to apply changes."
    });
  };

  return (
    <div className="sticky bottom-0 pt-4 pb-6 bg-gradient-to-t from-background via-background to-transparent">
      {showRestartPrompt && (
        <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 rounded-md text-sm">
          Return to the camera view and click "Retry Connection" to apply your changes.
        </div>
      )}
      
      <div className="flex justify-end gap-3">
        <Button 
          variant="outline" 
          onClick={onReset}
          disabled={isLoading || !hasChanges}
          className="px-6"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isLoading || !hasChanges || !isValid}
          className="px-8 relative"
        >
          {isLoading ? (
            <>
              <span className="animate-pulse">Saving...</span>
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 rounded-full border-2 border-t-transparent border-white animate-spin"></span>
            </>
          ) : showSaveAnimation ? (
            <span className="flex items-center">
              <CheckCircle className="mr-2 h-4 w-4 text-primary-foreground" />
              Saved!
            </span>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SettingsActionButtons;
