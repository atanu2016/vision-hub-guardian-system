
import React from 'react';
import { ProgressBar } from '@/components/ui/progress-bar';
import { CheckCircle, Loader2, AlertTriangle } from 'lucide-react';

interface SavingProgressProps {
  isSaving: boolean;
  savingStep: string;
  savingProgress: number;
  savingComplete: boolean;
  showSlowWarning?: boolean;
}

export function SavingProgress({ 
  isSaving,
  savingStep,
  savingProgress,
  savingComplete,
  showSlowWarning = false
}: SavingProgressProps) {
  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          {savingComplete ? (
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          ) : (
            <Loader2 className={`h-5 w-5 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
          )}
          <span className="font-medium">{savingStep}</span>
        </div>
        <span className="text-sm text-muted-foreground">{savingProgress}%</span>
      </div>
      
      <ProgressBar 
        value={savingProgress} 
        className={`transition-all duration-500 ease-in-out ${savingComplete ? "bg-green-500" : ""}`} 
      />
      
      {savingComplete && (
        <div className="text-center text-sm text-green-600 mt-2 animate-fade-in">
          Camera assignment updated successfully
        </div>
      )}
      
      {showSlowWarning && !savingComplete && (
        <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded mt-4 animate-pulse">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <div>
              <p className="font-medium">This operation is taking longer than expected.</p>
              <p className="text-sm">Please wait while we complete the camera assignment.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
