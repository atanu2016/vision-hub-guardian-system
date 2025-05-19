
import { Loader2, Check } from 'lucide-react';

interface SavingProgressProps {
  isSaving: boolean;
  savingStep: string;
  savingProgress: number;
  savingComplete: boolean;
}

export const SavingProgress = ({ 
  isSaving, 
  savingStep, 
  savingProgress, 
  savingComplete 
}: SavingProgressProps) => {
  if (!isSaving) return null;

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      {!savingComplete ? (
        <>
          <Loader2 className="animate-spin h-8 w-8 mb-2" />
          <p className="text-center text-lg font-medium">{savingStep}</p>
          <div className="w-full max-w-md">
            <div className="h-2 w-full bg-secondary rounded-full">
              <div 
                className="h-2 bg-primary rounded-full transition-all duration-300" 
                style={{ width: `${savingProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground text-right mt-1">
              {savingProgress}%
            </p>
          </div>
        </>
      ) : (
        <div className="text-center">
          <div className="text-center py-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-500 mb-4">
              <Check className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium">Cameras assigned successfully!</h3>
          </div>
        </div>
      )}
    </div>
  );
};
