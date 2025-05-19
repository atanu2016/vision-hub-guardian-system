
import React, { useEffect, useState } from 'react';
import { ProgressBar } from '@/components/ui/progress-bar';
import { CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [showSlowWarning, setShowSlowWarning] = useState(false);
  
  // Show warning if saving is taking more than 5 seconds
  useEffect(() => {
    if (isSaving && !savingComplete) {
      const timeoutId = setTimeout(() => setShowSlowWarning(true), 5000);
      return () => clearTimeout(timeoutId);
    } else {
      setShowSlowWarning(false);
    }
  }, [isSaving, savingComplete]);

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
      
      {showSlowWarning && !savingComplete && (
        <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded mt-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <div>
              <p className="font-medium">This operation is taking longer than expected.</p>
              <p className="text-sm">This may be due to a large number of cameras or network latency.</p>
              <p className="text-sm">You can wait for it to complete or try again later.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
