
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MigrationProgressProps {
  isMigrating: boolean;
  migrationProgress: number;
  details?: string[];
}

const MigrationProgress: React.FC<MigrationProgressProps> = ({ 
  isMigrating, 
  migrationProgress,
  details = []
}) => {
  if (!isMigrating && migrationProgress === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Migration Progress</span>
        <span>{migrationProgress}%</span>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out" 
          style={{ width: `${migrationProgress}%` }}
        ></div>
      </div>
      
      {details && details.length > 0 && (
        <ScrollArea className="h-40 w-full rounded-md border p-2 font-mono text-xs mt-4">
          {details.map((detail, index) => (
            <div key={index} className="py-1 border-b border-muted last:border-0">
              {detail}
            </div>
          ))}
        </ScrollArea>
      )}
    </div>
  );
};

export default MigrationProgress;
