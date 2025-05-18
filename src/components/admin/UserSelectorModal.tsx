
import React from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { UserData } from "@/types/admin";

interface UserSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserSelect: (user: UserData) => void;
  users: UserData[];
  loading: boolean;
}

export const UserSelectorModal: React.FC<UserSelectorModalProps> = ({
  isOpen,
  onClose,
  onUserSelect,
  users,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border rounded-lg shadow-lg p-6 w-[500px] max-w-[90vw] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Select User</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </Button>
        </div>
        
        <div className="space-y-2 mt-4">
          {users.map(user => (
            <div 
              key={user.id}
              className="p-3 border rounded-md hover:bg-accent cursor-pointer flex items-center justify-between"
              onClick={() => onUserSelect(user)}
            >
              <div>
                <p className="font-medium">{user.email || "No email"}</p>
                <p className="text-sm text-muted-foreground">{user.full_name || "No name"} • {user.role}</p>
              </div>
              <Button variant="ghost" size="sm">
                <Camera className="h-4 w-4 mr-1" />
                Assign
              </Button>
            </div>
          ))}
          
          {users.length === 0 && !loading && (
            <div className="text-center py-4 text-muted-foreground">
              No users found
            </div>
          )}
          
          {loading && (
            <div className="flex justify-center py-4">
              <div className="animate-spin h-6 w-6 border-t-2 border-b-2 border-primary rounded-full"></div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
