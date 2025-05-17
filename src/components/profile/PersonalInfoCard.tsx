import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRole } from "@/types/admin";

// Function to get role display name with proper capitalization
const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case 'superadmin': return 'Superadmin';
    case 'admin': return 'Admin';
    case 'user': return 'User';
    default: return 'User';
  }
};

interface PersonalInfoCardProps {
  formData: {
    fullName: string;
    email: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };
  role: UserRole;
  avatarPreview: string | null;
  getInitials: (name: string) => string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleProfileUpdate: (e: React.FormEvent) => void;
}

export function PersonalInfoCard({
  formData,
  role,
  avatarPreview,
  getInitials,
  handleInputChange,
  handleAvatarChange,
  handleProfileUpdate
}: PersonalInfoCardProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  
  const toggleEdit = () => {
    setIsEditingName(!isEditingName);
  };
  
  const onSubmit = (e: React.FormEvent) => {
    handleProfileUpdate(e);
    setIsEditingName(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your personal details and profile picture</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatarPreview || ''} alt={formData.fullName} />
              <AvatarFallback className="text-lg">
                {getInitials(formData.fullName || '')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-center">
                <div className="font-semibold text-lg">
                  {formData.fullName || 'Not set'}
                </div>
                {!isEditingName && (
                  <Button variant="ghost" type="button" size="sm" onClick={toggleEdit}>
                    Edit
                  </Button>
                )}
              </div>
              
              <div className="text-sm text-muted-foreground">{formData.email}</div>
            </div>
          </div>
          
          {isEditingName && (
            <div className="space-y-2 pt-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
              />
              
              <div className="mt-2">
                <Label htmlFor="avatar">Profile Picture</Label>
                <Input
                  id="avatar"
                  name="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="mt-1"
                />
              </div>
            </div>
          )}
          
          <div className="space-y-2 pt-2">
            <Label>User Role</Label>
            <div className="p-2 border rounded-md bg-muted/50">
              <div>{getRoleDisplayName(role)}</div>
            </div>
            <p className="text-xs text-muted-foreground">
              Your account role determines what actions you can perform in the system.
            </p>
          </div>
          
          {isEditingName && (
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                type="button" 
                onClick={toggleEdit}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
              >
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
