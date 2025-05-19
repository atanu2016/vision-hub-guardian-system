
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import RealTimeLogsViewer from "./RealTimeLogsViewer";

interface DebugLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DebugLogDialog = ({ open, onOpenChange }: DebugLogDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>System Logs</DialogTitle>
          <DialogDescription>
            Real-time system log viewer
          </DialogDescription>
        </DialogHeader>
        
        <RealTimeLogsViewer isOpen={open} />
        
        <div className="flex justify-end mt-4">
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DebugLogDialog;
