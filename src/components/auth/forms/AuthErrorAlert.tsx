
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AuthErrorAlertProps {
  onRetry: () => void;
}

export const EmailLoginsDisabledAlert = ({ onRetry }: AuthErrorAlertProps) => {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Authentication Error</AlertTitle>
      <AlertDescription>
        <p>Email logins are disabled in your Supabase project settings.</p>
        <p className="mt-2">To enable email logins, go to your Supabase dashboard:</p>
        <ol className="list-decimal pl-5 mt-1">
          <li>Navigate to Authentication &gt; Providers</li>
          <li>Enable "Email" provider</li>
          <li>Make sure "Confirm email" is disabled for easier testing</li>
        </ol>
        <Button 
          variant="outline" 
          className="mt-3 w-full"
          onClick={onRetry}
        >
          Try Again
        </Button>
      </AlertDescription>
    </Alert>
  );
};
