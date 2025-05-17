
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorAlertProps {
  error: string;
  onRetry: () => void;
}

export function ErrorAlert({ error, onRetry }: ErrorAlertProps) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTitle>Error loading users</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        <Button variant="outline" size="sm" onClick={onRetry} className="ml-2">
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}
