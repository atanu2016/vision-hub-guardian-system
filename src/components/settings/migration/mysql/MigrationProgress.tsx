
import { Loader2 } from "lucide-react";

interface MigrationProgressProps {
  isMigrating: boolean;
  migrationProgress: number;
}

export default function MigrationProgress({ isMigrating, migrationProgress }: MigrationProgressProps) {
  if (!isMigrating) return null;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span>Migration progress</span>
        <span>{migrationProgress}%</span>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out" 
          style={{ width: `${migrationProgress}%` }}
        ></div>
      </div>
    </div>
  );
}
