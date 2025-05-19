
import React, { useEffect } from 'react';
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
  // Use progressIntervalRef to avoid recreating interval on each render
  const progressIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const [animatedProgress, setAnimatedProgress] = React.useState(savingProgress);

  // Smooth progress animation for better UX
  useEffect(() => {
    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    if (animatedProgress < savingProgress) {
      // Create smooth animation to target progress
      progressIntervalRef.current = setInterval(() => {
        setAnimatedProgress(prev => {
          const newValue = prev + 1;
          if (newValue >= savingProgress) {
            clearInterval(progressIntervalRef.current!);
            progressIntervalRef.current = null;
            return savingProgress;
          }
          return newValue;
        });
      }, 20); // Update every 20ms for smooth animation
    } else if (animatedProgress > savingProgress) {
      // Immediate reset if progress goes backward
      setAnimatedProgress(savingProgress);
    }
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [savingProgress]);

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
        <span className="text-sm text-muted-foreground">{animatedProgress}%</span>
      </div>
      
      <ProgressBar 
        value={animatedProgress} 
        className={`transition-all duration-300 ease-in-out ${savingComplete ? "bg-green-500" : ""}`} 
      />
      
      {savingComplete && (
        <div className="text-center text-sm text-green-600 mt-2 animate-fade-in">
          Camera assignment updated successfully
        </div>
      )}
      
      {showSlowWarning && !savingComplete && (
        <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-3 rounded mt-3 animate-pulse">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
            <p className="text-sm">This operation is taking longer than expected. Please wait...</p>
          </div>
        </div>
      )}
    </div>
  );
}
