
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Key } from "lucide-react";

interface MfaToggleProps {
  userId: string;
  isRequired: boolean;
  isEnrolled: boolean;
  onToggle: (userId: string, required: boolean) => Promise<void>;
  onRevoke?: (userId: string) => Promise<void>;
}

export function MfaToggle({ 
  userId, 
  isRequired, 
  isEnrolled,
  onToggle, 
  onRevoke 
}: MfaToggleProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    try {
      setIsUpdating(true);
      await onToggle(userId, !isRequired);
    } catch (error) {
      console.error('Failed to toggle MFA requirement:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRevoke = async () => {
    if (!onRevoke) return;
    
    try {
      setIsUpdating(true);
      await onRevoke(userId);
    } catch (error) {
      console.error('Failed to revoke MFA enrollment:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={isRequired ? "default" : "outline"}
          size="sm"
          disabled={isUpdating}
          className="w-28"
        >
          {isUpdating ? "Updating..." : isRequired ? "Required" : "Optional"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleToggle}>
          Make {isRequired ? "Optional" : "Required"}
        </DropdownMenuItem>
        {onRevoke && isEnrolled && (
          <DropdownMenuItem onClick={handleRevoke} className="text-destructive">
            <Key className="h-4 w-4 mr-2" />
            Revoke MFA
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
