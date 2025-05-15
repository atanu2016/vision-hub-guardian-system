
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function MigrationAlert() {
  return (
    <Alert className="mb-6 bg-yellow-500/20 border-yellow-500/50">
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="text-yellow-500">Important</AlertTitle>
      <AlertDescription>
        Migration is a one-way process and may take some time depending on the amount of data.
        Make sure to backup your data before proceeding.
      </AlertDescription>
    </Alert>
  );
}
