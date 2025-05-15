
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface MfaToggleProps {
  userId: string;
  isRequired: boolean;
  onToggle: (userId: string, required: boolean) => Promise<void>;
}

export function MfaToggle({ userId, isRequired, onToggle }: MfaToggleProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      await onToggle(userId, !isRequired);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Button
      variant={isRequired ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      disabled={isUpdating}
    >
      {isRequired ? "Required" : "Optional"}
    </Button>
  );
}
