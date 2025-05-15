
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface MigrationStatusProps {
  status: 'idle' | 'running' | 'success' | 'error';
  progress: number;
  details: string | null;
}

export default function MigrationStatus({ status, progress, details }: MigrationStatusProps) {
  if (status === 'idle') {
    return null;
  }
  
  return (
    <>
      {status === 'running' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p>Migration in progress...</p>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {status === 'success' && (
        <Alert className="border-green-500 bg-green-500/10">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle>Migration completed</AlertTitle>
          <AlertDescription>{details}</AlertDescription>
        </Alert>
      )}

      {status === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Migration failed</AlertTitle>
          <AlertDescription>{details}</AlertDescription>
        </Alert>
      )}
    </>
  );
}
