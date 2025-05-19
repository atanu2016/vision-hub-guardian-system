
import React, { useEffect } from 'react';
import { ProgressBar } from '@/components/ui/progress-bar';
import { CheckCircle, Loader2 } from 'lucide-react';

interface SavingProgressProps {
  isSaving: boolean;
  savingStep: string;
  savingProgress: number;
  savingComplete: boolean;
}

export function SavingProgress({ 
  isSaving,
  savingStep,
  savingProgress,
  savingComplete
}: SavingProgressProps) {
  // Immediately jump to 100% when complete
  useEffect(() => {
    if (savingComplete) {
      // No timeout needed, update immediately
      return;
    }
  }, [savingComplete]);
  
  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          {savingComplete ? (
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          ) : (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          )}
          <span className="font-medium">{savingStep}</span>
        </div>
        <span className="text-sm text-muted-foreground">{savingProgress}%</span>
      </div>
      
      <ProgressBar 
        value={savingProgress} 
        className={savingComplete ? "bg-green-500" : ""} 
      />
      
      {savingComplete && (
        <div className="text-center text-sm text-green-600 mt-2">
          Camera assignments updated successfully
        </div>
      )}
    </div>
  );
}
