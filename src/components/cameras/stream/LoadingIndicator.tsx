
import React from "react";

interface LoadingIndicatorProps {
  isLoading: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-vision-dark-900/70">
      <div className="flex flex-col items-center">
        <div className="h-8 w-8 border-4 border-t-primary border-vision-dark-500 rounded-full animate-spin mb-2"></div>
        <p className="text-sm">Loading stream...</p>
      </div>
    </div>
  );
};
