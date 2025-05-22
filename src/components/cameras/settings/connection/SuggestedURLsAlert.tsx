
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface SuggestedURLsAlertProps {
  suggestedUrls: string[];
  onSelectUrl: (url: string) => void;
  disabled?: boolean;
}

const SuggestedURLsAlert = ({ 
  suggestedUrls, 
  onSelectUrl,
  disabled = false 
}: SuggestedURLsAlertProps) => {
  if (suggestedUrls.length === 0) return null;
  
  return (
    <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="text-sm">
        <p className="font-medium">Suggested RTSP URLs for your camera:</p>
        <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
          {suggestedUrls.map((url, i) => (
            <div key={i} className="flex justify-between items-center bg-amber-100/50 dark:bg-amber-900/50 p-2 rounded text-xs">
              <code className="font-mono">{url}</code>
              <Button 
                variant="secondary" 
                size="sm" 
                className="h-6 text-xs"
                onClick={() => onSelectUrl(url)}
                disabled={disabled}
              >
                Use
              </Button>
            </div>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default SuggestedURLsAlert;
