
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/settings/sections/LoadingSpinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EmailResetDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onEmailChange: (email: string) => void;
  onSendReset: () => Promise<void>;
  isLoading: boolean;
}

export const EmailResetDialog: React.FC<EmailResetDialogProps> = ({
  isOpen,
  onOpenChange,
  email,
  onEmailChange,
  onSendReset,
  isLoading,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Password Reset Email</DialogTitle>
          <DialogDescription>
            Send a password reset link to the user's email address. They will be able to set a new password.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="resetEmail">Email Address</Label>
            <Input
              id="resetEmail"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSendReset} disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="mr-2">
                  <LoadingSpinner />
                </div>
                Sending...
              </>
            ) : (
              'Send Reset Email'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
