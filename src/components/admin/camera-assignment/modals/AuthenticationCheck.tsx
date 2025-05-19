
import React from 'react';
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Loader2 } from 'lucide-react';

interface AuthenticationCheckProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthenticationCheck = ({ isOpen, onClose }: AuthenticationCheckProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader>
          <div className="text-lg font-semibold leading-none tracking-tight">Checking authentication...</div>
        </DialogHeader>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DialogContent>
    </Dialog>
  );
};
