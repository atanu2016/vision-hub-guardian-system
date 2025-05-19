
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuthenticationCheckProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthenticationCheck({ isOpen, onClose }: AuthenticationCheckProps) {
  const handleRedirect = () => {
    window.location.href = '/auth';
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <h3 className="text-xl font-semibold">Checking authentication...</h3>
          <p className="text-center text-muted-foreground">
            Verifying your session before accessing camera assignments.
          </p>
          <p className="text-center text-sm text-muted-foreground">
            If you've been logged out, you'll need to sign in again.
          </p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleRedirect}>Go to Login</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AuthenticationCheck;
