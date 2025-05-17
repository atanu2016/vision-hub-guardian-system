
import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Shield, UserPlus, RefreshCw } from 'lucide-react';

interface UserManagementHeaderProps {
  onRefresh: () => void;
  onCreateUser: () => void;
  loading: boolean;
  showCreateButton: boolean;
}

export function UserManagementHeader({ 
  onRefresh, 
  onCreateUser, 
  loading, 
  showCreateButton 
}: UserManagementHeaderProps) {
  return (
    <div className="flex flex-row items-center justify-between">
      <div>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <span>User Management</span>
        </CardTitle>
        <CardDescription>
          Manage user roles and security settings
        </CardDescription>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        {showCreateButton && (
          <Button 
            onClick={onCreateUser}
            size="sm"
            className="flex items-center gap-2 bg-vision-blue hover:bg-vision-blue-600"
          >
            <UserPlus className="h-4 w-4" />
            Create User
          </Button>
        )}
      </div>
    </div>
  );
}
