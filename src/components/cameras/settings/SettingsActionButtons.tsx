
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

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
  
  // Animation for successful save
  useEffect(() => {
    if (!isLoading && showSaveAnimation) {
      const timer = setTimeout(() => {
        setShowSaveAnimation(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, showSaveAnimation]);

  const handleSave = () => {
    onSave();
    setShowSaveAnimation(true);
  };

  return (
    <div className="sticky bottom-0 pt-4 pb-6 bg-gradient-to-t from-background via-background to-transparent">
      <div className="flex justify-end gap-3">
        <Button 
          variant="outline" 
          onClick={onReset}
          disabled={isLoading || !hasChanges}
          className="px-6"
        >
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
              <svg className="animate-fade-in w-4 h-4 mr-2 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved!
            </span>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
};

export default SettingsActionButtons;
