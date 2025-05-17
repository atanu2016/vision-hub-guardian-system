
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Key } from "lucide-react";
import { MfaToggleProps } from "@/types/admin";

export function MfaToggle({ 
  userId, 
  mfaRequired, 
  mfaEnrolled,
  onToggleMfaRequirement, 
  onRevokeMfaEnrollment,
  disabled = false 
}: MfaToggleProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    try {
      setIsUpdating(true);
      await onToggleMfaRequirement(userId, !mfaRequired);
    } catch (error) {
      console.error('Failed to toggle MFA requirement:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRevoke = async () => {
    if (!onRevokeMfaEnrollment) return;
    
    try {
      setIsUpdating(true);
      await onRevokeMfaEnrollment(userId);
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
          variant={mfaRequired ? "default" : "outline"}
          size="sm"
          disabled={isUpdating || disabled}
          className="w-28"
        >
          {isUpdating ? "Updating..." : mfaRequired ? "Required" : "Optional"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleToggle}>
          Make {mfaRequired ? "Optional" : "Required"}
        </DropdownMenuItem>
        {onRevokeMfaEnrollment && mfaEnrolled && (
          <DropdownMenuItem onClick={handleRevoke} className="text-destructive">
            <Key className="h-4 w-4 mr-2" />
            Revoke MFA
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
