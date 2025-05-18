
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

interface AdminPasswordResetDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  password: string;
  onPasswordChange: (password: string) => void;
  onResetPassword: () => Promise<void>;
  isLoading: boolean;
}

export const AdminPasswordResetDialog: React.FC<AdminPasswordResetDialogProps> = ({
  isOpen,
  onOpenChange,
  password,
  onPasswordChange,
  onResetPassword,
  isLoading,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Admin: Set New Password</DialogTitle>
          <DialogDescription>
            As an admin, you can directly set a new password for this user.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              autoComplete="new-password"
            />
            <p className="text-xs text-muted-foreground">Password must be at least 6 characters long.</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={onResetPassword} 
            disabled={isLoading || !password || password.length < 6}
          >
            {isLoading ? (
              <>
                <div className="mr-2">
                  <LoadingSpinner />
                </div>
                Resetting...
              </>
            ) : (
              'Set New Password'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
