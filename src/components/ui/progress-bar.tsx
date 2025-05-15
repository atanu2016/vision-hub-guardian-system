
import React from "react";
import { Progress } from "@/components/ui/progress";

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  showValue?: boolean;
  max?: number;
}

export function ProgressBar({ 
  value, 
  max = 100, 
  showValue = true, 
  className,
  ...props 
}: ProgressBarProps) {
  // Calculate the percentage
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div className="space-y-2" {...props}>
      <Progress value={percentage} className={className} />
      {showValue && (
        <div className="text-xs text-muted-foreground text-right">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}
